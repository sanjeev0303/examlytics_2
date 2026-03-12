package worker

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/examlytics/server/internal/adapter/redis"
	"github.com/examlytics/server/internal/dto"
	"github.com/examlytics/server/internal/service"
	"github.com/examlytics/server/pkg/logger"
)

type ExamWorker struct {
	redisClient *redis.RedisClient
	examService service.ExamService
	stop        chan struct{}
}

func NewExamWorker(redisClient *redis.RedisClient, examService service.ExamService) *ExamWorker {
	return &ExamWorker{
		redisClient: redisClient,
		examService: examService,
		stop:        make(chan struct{}),
	}
}

func (w *ExamWorker) Start() {
	// NOTE: Exam generation (queue:exam_generation) is handled by the Python AI worker
	// which has LLM integration for dynamic question generation.
	// The Go worker only handles exam submission processing.

	// Start Submission Worker
	go func() {
		logger.Info("Starting Submission Worker...")
		for {
			select {
			case <-w.stop:
				return
			default:
				w.processNextSubmissionJob()
			}
		}
	}()
}

func (w *ExamWorker) Stop() {
	close(w.stop)
}

func (w *ExamWorker) processNextSubmissionJob() {
	ctx := context.Background()
	val, err := w.redisClient.Dequeue(ctx, "queue:exam_submission", 5*time.Second)
	if err != nil {
		return
	}

	var job dto.ExamSubmissionJob
	if err := json.Unmarshal([]byte(val), &job); err != nil {
		logger.Error(err, "Failed to unmarshal submission job")
		return
	}

	w.updateStatus(ctx, job.JobID, dto.JobStatusProcessing, "", "")
	logger.Infof("Processing Submission Job: %s", job.JobID)

	result, err := w.examService.SubmitExamSync(ctx, job.UserID, job.Request)
	if err != nil {
		logger.Error(err, fmt.Sprintf("Submission Job %s Failed", job.JobID))
		w.updateStatus(ctx, job.JobID, dto.JobStatusFailed, "", err.Error())
		return
	}

	// Store result for polling
	// We can store the full result in the status "Result" field if we add it,
	// OR store it in a separate key "result:{jobID}"
	// For now, let's assume the frontend will fetch the SESSION again using sessionID
	// But `Start` returns `SessionID`. `Submit` returns `ExamResultResponse` which contains `ImprovementRecommendation` etc.
	// The `ExamResultResponse` IS the session details mostly.
	// So pointing to `result.SessionID` in status is enough?
	// The frontend polls status, sees COMPLETED, then calls GetSession(sessionID).
	// `SubmitExamSync` returns `*dto.ExamResultResponse`.
	// We should probably save this result or rely on `GetSession` being refined to return result.
	// `GetExamSession` already returns `ExamSessionResponse` which includes score, etc.
	// So we just need to link the session ID.

	w.updateStatus(ctx, job.JobID, dto.JobStatusCompleted, result.SessionID, "")
}

func (w *ExamWorker) updateStatus(ctx context.Context, jobID, status, sessionID, errorMsg string) {
	s := dto.ExamGenerationStatus{
		JobID:     jobID,
		Status:    status,
		SessionID: sessionID,
		Error:     errorMsg,
	}

	bytes, _ := json.Marshal(s)
	// Expire status after 1 hour
	w.redisClient.Set(ctx, "job:"+jobID, bytes, 1*time.Hour)
}
