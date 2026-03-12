package database

import (
	"fmt"
	"strings"
	"time"

	"github.com/examlytics/server/internal/config"
	"github.com/examlytics/server/internal/domain"
	"github.com/examlytics/server/pkg/logger"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlogger "gorm.io/gorm/logger"
)

// Connect establishes a connection to the PostgreSQL database
func Connect(cfg *config.Config) (*gorm.DB, error) {
	if cfg.DatabaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}

	// Log SQL errors to help diagnose failures
	logLevel := gormlogger.Error

	// When using Neon's PgBouncer pooler (or any connection pooler), prepared statements
	// can become stale after schema changes and cause "cached plan must not change result type".
	// Using the simple query protocol disables prepared statements in pgx, avoiding this issue.
	dsn := cfg.DatabaseURL
	if !strings.Contains(dsn, "default_query_exec_mode") {
		sep := "&"
		if !strings.Contains(dsn, "?") {
			sep = "?"
		}
		dsn += sep + "default_query_exec_mode=simple_protocol"
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger:      gormlogger.Default.LogMode(logLevel),
		PrepareStmt: false,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get underlying DB: %w", err)
	}

	// Connection pool tuning for high concurrency
	sqlDB.SetMaxIdleConns(25)                  // Reduce idle connections (was 50)
	sqlDB.SetMaxOpenConns(100)                 // Cap max connections (was 200)
	sqlDB.SetConnMaxLifetime(30 * time.Minute) // Recycle connections
	sqlDB.SetConnMaxIdleTime(5 * time.Minute)  // Close idle connections faster

	// Verify connection with ping
	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	logger.Info("Connected to database with optimized pool settings")

	return db, nil
}

// runPreMigrations handles schema changes that AutoMigrate cannot perform
// safely on its own (e.g. adding NOT NULL columns to tables with existing rows).
func runPreMigrations(db *gorm.DB) error {
	type colExists struct{ Exists bool }

	// --- Drop legacy clerk_id column ---
	var clerkCol colExists
	db.Raw(`SELECT EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'users' AND column_name = 'clerk_id'
	)`).Scan(&clerkCol)

	if clerkCol.Exists {
		// Remove child rows that reference users with no password_hash equivalent
		// since those are legacy Clerk-only accounts that cannot authenticate
		childTables := []string{
			"session_answers",
			"exam_sessions",
			"user_preferences",
			"user_weak_topics",
			"user_topic_aggregates",
			"user_ai_contexts",
		}
		// Gather legacy user IDs (Clerk users that have no password_hash yet)
		var legacyIDs []string
		db.Raw(`SELECT id FROM users WHERE clerk_id IS NOT NULL`).Scan(&legacyIDs)

		if len(legacyIDs) > 0 {
			logger.Infof("Pre-migration: removing %d legacy Clerk user(s) and their data", len(legacyIDs))
			for _, table := range childTables {
				col := "user_id"
				if table == "session_answers" {
					col = "session_id"
					db.Exec(fmt.Sprintf(
						`DELETE FROM %s WHERE %s IN (SELECT id FROM exam_sessions WHERE user_id IN (?))`,
						table, col), legacyIDs)
				} else {
					db.Exec(fmt.Sprintf(`DELETE FROM %s WHERE %s IN (?)`, table, col), legacyIDs)
				}
			}
			db.Exec(`DELETE FROM users WHERE clerk_id IS NOT NULL`)
		}

		if err := db.Exec(`ALTER TABLE users DROP COLUMN IF EXISTS clerk_id`).Error; err != nil {
			return fmt.Errorf("pre-migration: drop clerk_id column: %w", err)
		}
		logger.Info("Pre-migration: dropped legacy clerk_id column")
	}

	// --- password_hash column on users table ---
	// AutoMigrate would try: ALTER TABLE users ADD COLUMN password_hash text NOT NULL
	// but existing rows would have NULL which PostgreSQL rejects.
	// Strategy: add as nullable first, delete any rows missing it, then AutoMigrate applies NOT NULL.
	var pwCol colExists
	db.Raw(`SELECT EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'users' AND column_name = 'password_hash'
	)`).Scan(&pwCol)

	if !pwCol.Exists {
		if err := db.Exec(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text`).Error; err != nil {
			return fmt.Errorf("pre-migration: add password_hash column: %w", err)
		}
		logger.Info("Pre-migration: added password_hash column (nullable)")
	}

	// Remove any users that still have no password_hash (cannot be authenticated)
	var orphans []string
	db.Raw(`SELECT id FROM users WHERE password_hash IS NULL OR password_hash = ''`).Scan(&orphans)

	if len(orphans) > 0 {
		logger.Infof("Pre-migration: removing %d user(s) with no password_hash", len(orphans))
		childTables := []string{"session_answers", "exam_sessions", "user_preferences", "user_weak_topics", "user_topic_aggregates", "user_ai_contexts"}
		for _, table := range childTables {
			col := "user_id"
			if table == "session_answers" {
				col = "session_id"
				db.Exec(fmt.Sprintf(
					`DELETE FROM %s WHERE %s IN (SELECT id FROM exam_sessions WHERE user_id IN (?))`,
					table, col), orphans)
			} else {
				db.Exec(fmt.Sprintf(`DELETE FROM %s WHERE %s IN (?)`, table, col), orphans)
			}
		}
		db.Exec(`DELETE FROM users WHERE password_hash IS NULL OR password_hash = ''`)
	}

	logger.Info("Pre-migration: schema preparation complete")
	return nil
}

// dropStaleColumns removes columns that no longer exist in the GORM model but are
// still present in the database and would cause NOT NULL violations on insert.
// After dropping columns it resets the connection pool so pgx doesn't use cached
// prepared statements that reference the old schema.
func dropStaleColumns(db *gorm.DB) error {
	type colExists struct{ Exists bool }

	var dropped bool

	// Old plain-text 'password' column — replaced by 'password_hash'
	var pwPlain colExists
	db.Raw(`SELECT EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'users' AND column_name = 'password'
	)`).Scan(&pwPlain)
	if pwPlain.Exists {
		if err := db.Exec(`ALTER TABLE users DROP COLUMN IF EXISTS "password"`).Error; err != nil {
			return fmt.Errorf("drop stale password column: %w", err)
		}
		logger.Info("Pre-migration: dropped stale 'password' column from users table")
		dropped = true
	}

	// Reset the connection pool after schema changes so pgx discards any
	// cached prepared-statement plans that reference dropped columns.
	if dropped {
		sqlDB, err := db.DB()
		if err == nil {
			// Close all idle connections immediately; pgx will open fresh ones.
			sqlDB.SetMaxIdleConns(0)
			time.Sleep(100 * time.Millisecond)
			sqlDB.SetMaxIdleConns(25)
			logger.Info("Pre-migration: connection pool reset after schema change")
		}
	}

	return nil
}

// Migrate runs database migrations
func Migrate(db *gorm.DB) error {
	logger.Info("Running database migrations...")

	if err := runPreMigrations(db); err != nil {
		return err
	}

	if err := dropStaleColumns(db); err != nil {
		return err
	}

	if err := db.AutoMigrate(
		&domain.User{},
		&domain.UserPreference{},
		&domain.Topic{},
		&domain.Question{},
		&domain.Exam{},
		&domain.ExamSession{},
		&domain.SessionAnswer{},
		&domain.UserWeakTopic{},
		&domain.UserTopicAggregate{},
		&domain.ExamTopicStats{},
		&domain.UserAIContext{},
		// Analytics & Learning Intelligence
		&domain.LearningSnapshot{},
		&domain.TopicMasteryHistory{},
		&domain.InterviewReadiness{},
		&domain.QuestionStats{},
		&domain.UserTopicSchedule{},
	); err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	// Create GIN index for UserAIContext topicMastery
	// GORM doesn't support expression indexes via tags easily
	if err := db.Exec(`CREATE INDEX IF NOT EXISTS idx_user_ai_contexts_topic_mastery
		ON user_ai_contexts USING GIN ((context_data -> 'topicMastery'))`).Error; err != nil {
		logger.Warnf("Failed to create index idx_user_ai_contexts_topic_mastery: %v", err)
		// Don't fail the entire migration for an index
	}

	logger.Info("Database migrations completed")
	return nil
}

// SeedExams populates the database with sample exams if empty
func SeedExams(db *gorm.DB) error {
	var count int64
	db.Model(&domain.Exam{}).Count(&count)

	if count > 0 {
		logger.Info("Exams already seeded, skipping...")
		return nil
	}

	logger.Info("Seeding sample exams...")

	exams := []domain.Exam{
		{
			Title:       "Software Engineering Fundamentals",
			Description: "Test your knowledge of core software engineering concepts",
			Duration:    30,
			Difficulty:  domain.DifficultyMedium,
			Type:        "TECHNICAL",
			IsPublic:    true,
		},
		{
			Title:       "Data Structures & Algorithms",
			Description: "Master the fundamentals of DSA",
			Duration:    45,
			Difficulty:  domain.DifficultyHard,
			Type:        "CODING",
			IsPublic:    true,
		},
		{
			Title:       "System Design Basics",
			Description: "Learn system design principles and patterns",
			Duration:    60,
			Difficulty:  domain.DifficultyMedium,
			Type:        "TECHNICAL",
			IsPublic:    true,
		},
		{
			Title:       "Database Fundamentals",
			Description: "SQL, NoSQL, and database design concepts",
			Duration:    40,
			Difficulty:  domain.DifficultyMedium,
			Type:        "TECHNICAL",
			IsPublic:    true,
		},
		{
			Title:       "Web Development Essentials",
			Description: "Frontend, backend, and full-stack concepts",
			Duration:    35,
			Difficulty:  domain.DifficultyEasy,
			Type:        "TECHNICAL",
			IsPublic:    true,
		},
	}

	for _, exam := range exams {
		if err := db.Create(&exam).Error; err != nil {
			return fmt.Errorf("failed to seed exam: %w", err)
		}
	}

	logger.Info("Sample exams seeded successfully")
	return nil
}

// Disconnect closes the database connection
func Disconnect(db *gorm.DB) error {
	sqlDB, err := db.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
