package repository

import (
	"context"
	"errors"
	"time"

	"github.com/examlytics/server/internal/domain"
	"github.com/examlytics/server/internal/dto"
	"gorm.io/gorm"
)

// UserRepository defines interface for user data access
type UserRepository interface {
	Create(ctx context.Context, data *dto.CreateUserRequest) (*domain.User, error)
	FindAll(ctx context.Context) ([]*domain.User, error)
	FindByID(ctx context.Context, id string) (*domain.User, error)
	FindByEmail(ctx context.Context, email string) (*domain.User, error)
	Update(ctx context.Context, user *domain.User) (*domain.User, error)
	UpdatePassword(ctx context.Context, userID string, passwordHash string) error
	Delete(ctx context.Context, id string) error
	SavePreferences(ctx context.Context, prefs *domain.UserPreference) error
	GetPreferences(ctx context.Context, userID string) (*domain.UserPreference, error)
	CountUsers(ctx context.Context) (int64, error)
	FindAIContextByUserID(ctx context.Context, userID string) (*domain.UserAIContext, error)
	GetTopicAggregates(ctx context.Context, userID string) ([]*domain.UserTopicAggregate, error)
}

// PostgresUserRepository implements UserRepository for PostgreSQL
type PostgresUserRepository struct {
	db *gorm.DB
}

// NewPostgresUserRepository creates a new PostgresUserRepository
func NewPostgresUserRepository(db *gorm.DB) UserRepository {
	return &PostgresUserRepository{db: db}
}

// Create creates a new user
func (r *PostgresUserRepository) Create(ctx context.Context, data *dto.CreateUserRequest) (*domain.User, error) {
	user := &domain.User{
		Email:        data.Email,
		PasswordHash: data.PasswordHash,
		FirstName:    data.FirstName,
		LastName:     data.LastName,
		ImageURL:     data.ImageURL,
		Role:         domain.RoleUser,
	}
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	if err := r.db.WithContext(ctx).Create(user).Error; err != nil {
		return nil, err
	}
	return user, nil
}

// FindAll retrieves all users
func (r *PostgresUserRepository) FindAll(ctx context.Context) ([]*domain.User, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	var users []*domain.User
	if err := r.db.WithContext(ctx).Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

// FindByID retrieves a user by ID
func (r *PostgresUserRepository) FindByID(ctx context.Context, id string) (*domain.User, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	var user domain.User
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

// FindByEmail retrieves a user by email
func (r *PostgresUserRepository) FindByEmail(ctx context.Context, email string) (*domain.User, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	var user domain.User
	if err := r.db.WithContext(ctx).Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

// Update updates an existing user
func (r *PostgresUserRepository) Update(ctx context.Context, user *domain.User) (*domain.User, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	if err := r.db.WithContext(ctx).Save(user).Error; err != nil {
		return nil, err
	}
	return user, nil
}

// UpdatePassword updates the password hash for a user
func (r *PostgresUserRepository) UpdatePassword(ctx context.Context, userID string, passwordHash string) error {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	return r.db.WithContext(ctx).Model(&domain.User{}).
		Where("id = ?", userID).
		Update("password_hash", passwordHash).Error
}

// Delete removes a user
func (r *PostgresUserRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Where("id = ?", id).Delete(&domain.User{}).Error
}

// SavePreferences saves user onboarding preferences
func (r *PostgresUserRepository) SavePreferences(ctx context.Context, prefs *domain.UserPreference) error {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	var existing domain.UserPreference
	err := r.db.WithContext(ctx).Where("user_id = ?", prefs.UserID).First(&existing).Error
	if err == nil {
		prefs.ID = existing.ID
		return r.db.WithContext(ctx).Save(prefs).Error
	}
	return r.db.WithContext(ctx).Create(prefs).Error
}

// GetPreferences retrieves user preferences
func (r *PostgresUserRepository) GetPreferences(ctx context.Context, userID string) (*domain.UserPreference, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	var prefs domain.UserPreference
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).First(&prefs).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &prefs, nil
}

// CountUsers returns the total count of users
func (r *PostgresUserRepository) CountUsers(ctx context.Context) (int64, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	var count int64
	err := r.db.WithContext(ctx).Model(&domain.User{}).Count(&count).Error
	return count, err
}

// FindAIContextByUserID retrieves the AI context for a user
func (r *PostgresUserRepository) FindAIContextByUserID(ctx context.Context, userID string) (*domain.UserAIContext, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	var aiCtx domain.UserAIContext
	if err := r.db.WithContext(ctx).Where("user_id = ?", userID).First(&aiCtx).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &aiCtx, nil
}

// GetTopicAggregates retrieves all topic aggregates for a user
func (r *PostgresUserRepository) GetTopicAggregates(ctx context.Context, userID string) ([]*domain.UserTopicAggregate, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	var aggregates []*domain.UserTopicAggregate
	if err := r.db.WithContext(ctx).Where("user_id = ?", userID).Find(&aggregates).Error; err != nil {
		return nil, err
	}
	return aggregates, nil
}
