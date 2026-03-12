package handler

import (
	"net/http"

	"github.com/examlytics/server/internal/service"
	"github.com/examlytics/server/pkg/logger"
	"github.com/gin-gonic/gin"
)

// AnalyticsHandler handles analytics-related HTTP requests
type AnalyticsHandler struct {
	analyticsService service.AnalyticsService
}

// NewAnalyticsHandler creates a new AnalyticsHandler
func NewAnalyticsHandler(analyticsService service.AnalyticsService) *AnalyticsHandler {
	return &AnalyticsHandler{analyticsService: analyticsService}
}

func getUserID(c *gin.Context) (string, bool) {
	val, exists := c.Get("userID")
	if !exists {
		return "", false
	}
	id, ok := val.(string)
	return id, ok && id != ""
}

// GetLearningCurve GET /analytics/learning-curve
func (h *AnalyticsHandler) GetLearningCurve(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	response, err := h.analyticsService.GetLearningCurve(c.Request.Context(), userID)
	if err != nil {
		logger.Errorf("Failed to get learning curve: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get learning curve"})
		return
	}
	c.JSON(http.StatusOK, response)
}

// GetTopicCurve GET /analytics/topic-curve/:topic
func (h *AnalyticsHandler) GetTopicCurve(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	topic := c.Param("topic")
	if topic == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Topic parameter required"})
		return
	}
	response, err := h.analyticsService.GetTopicCurve(c.Request.Context(), userID, topic)
	if err != nil {
		logger.Errorf("Failed to get topic curve: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get topic curve"})
		return
	}
	c.JSON(http.StatusOK, response)
}

// GetInterviewReadiness GET /analytics/readiness-score
func (h *AnalyticsHandler) GetInterviewReadiness(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	response, err := h.analyticsService.GetInterviewReadiness(c.Request.Context(), userID)
	if err != nil {
		logger.Errorf("Failed to get interview readiness: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get interview readiness"})
		return
	}
	c.JSON(http.StatusOK, response)
}

// GetDueTopics GET /analytics/due-topics
func (h *AnalyticsHandler) GetDueTopics(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	response, err := h.analyticsService.GetDueTopics(c.Request.Context(), userID)
	if err != nil {
		logger.Errorf("Failed to get due topics: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get due topics"})
		return
	}
	c.JSON(http.StatusOK, response)
}

// RecalculateReadiness POST /analytics/recalculate-readiness
func (h *AnalyticsHandler) RecalculateReadiness(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	if err := h.analyticsService.RecalculateReadiness(c.Request.Context(), userID); err != nil {
		logger.Errorf("Failed to recalculate readiness: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to recalculate readiness"})
		return
	}
	response, err := h.analyticsService.GetInterviewReadiness(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get updated readiness"})
		return
	}
	c.JSON(http.StatusOK, response)
}

// GetStreakData GET /analytics/streaks
func (h *AnalyticsHandler) GetStreakData(c *gin.Context) {
	userID, ok := getUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	response, err := h.analyticsService.GetStreakData(c.Request.Context(), userID)
	if err != nil {
		logger.Errorf("Failed to get streak data: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get streak data"})
		return
	}
	c.JSON(http.StatusOK, response)
}
