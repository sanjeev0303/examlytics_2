package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/examlytics/server/internal/domain"
	"github.com/examlytics/server/internal/dto"
	"github.com/examlytics/server/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

// UserService defines the interface for user business logic
type UserService interface {
	RegisterUser(ctx context.Context, req *dto.RegisterRequest) (*domain.User, error)
	AuthenticateUser(ctx context.Context, req *dto.LoginRequest) (*domain.User, error)
	GetUsers(ctx context.Context) ([]*domain.User, error)
	GetUserByID(ctx context.Context, id string) (*domain.User, error)
	GetUserByEmail(ctx context.Context, email string) (*domain.User, error)
	GetUserRoleByID(ctx context.Context, id string) (*string, error)
	UpdateProfile(ctx context.Context, userID string, req dto.UpdateProfileRequest) (*domain.User, error)
	OnboardUser(ctx context.Context, userID string, req dto.OnboardingRequest) error
	GetAdminStats(ctx context.Context) (*dto.AdminStatsResponse, error)
	GetUserWeakTopics(ctx context.Context, userID string) ([]*domain.UserWeakTopic, error)
	GetUserAIContext(ctx context.Context, userID string) (*domain.UserAIContext, error)
}

// UserServiceImpl implements UserService
type UserServiceImpl struct {
	userRepo repository.UserRepository
	examRepo repository.ExamRepository
}

// NewUserService creates a new UserServiceImpl
func NewUserService(userRepo repository.UserRepository, examRepo repository.ExamRepository) UserService {
	return &UserServiceImpl{userRepo: userRepo, examRepo: examRepo}
}

// RegisterUser creates a new user with a hashed password
func (s *UserServiceImpl) RegisterUser(ctx context.Context, req *dto.RegisterRequest) (*domain.User, error) {
	existing, err := s.userRepo.FindByEmail(ctx, req.Email)
	if err != nil {
		return nil, fmt.Errorf("check existing user: %w", err)
	}
	if existing != nil {
		return nil, errors.New("email already registered")
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("hash password: %w", err)
	}
	return s.userRepo.Create(ctx, &dto.CreateUserRequest{
		Email:        req.Email,
		PasswordHash: string(hash),
		FirstName:    req.FirstName,
		LastName:     req.LastName,
	})
}

// AuthenticateUser verifies credentials and returns the user on success
func (s *UserServiceImpl) AuthenticateUser(ctx context.Context, req *dto.LoginRequest) (*domain.User, error) {
	user, err := s.userRepo.FindByEmail(ctx, req.Email)
	if err != nil {
		return nil, fmt.Errorf("lookup user: %w", err)
	}
	if user == nil {
		return nil, errors.New("invalid credentials")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid credentials")
	}
	return user, nil
}

// GetUsers retrieves all users
func (s *UserServiceImpl) GetUsers(ctx context.Context) ([]*domain.User, error) {
	return s.userRepo.FindAll(ctx)
}

// GetUserByID retrieves a user by their ID
func (s *UserServiceImpl) GetUserByID(ctx context.Context, id string) (*domain.User, error) {
	return s.userRepo.FindByID(ctx, id)
}

// GetUserByEmail retrieves a user by their email
func (s *UserServiceImpl) GetUserByEmail(ctx context.Context, email string) (*domain.User, error) {
	return s.userRepo.FindByEmail(ctx, email)
}

// GetUserRoleByID retrieves just the role for a user by their ID
func (s *UserServiceImpl) GetUserRoleByID(ctx context.Context, id string) (*string, error) {
	user, err := s.userRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, nil
	}
	role := string(user.Role)
	return &role, nil
}

// OnboardUser saves user preferences
func (s *UserServiceImpl) OnboardUser(ctx context.Context, userID string, req dto.OnboardingRequest) error {
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return err
	}
	if user == nil {
		return errors.New("user not found")
	}
	prefs := &domain.UserPreference{
		UserID:    user.ID,
		Goal:      req.TargetGoal,
		ExamTypes: req.PreferredTopics,
	}
	return s.userRepo.SavePreferences(ctx, prefs)
}

// GetAdminStats returns aggregate counts
func (s *UserServiceImpl) GetAdminStats(ctx context.Context) (*dto.AdminStatsResponse, error) {
	userCount, err := s.userRepo.CountUsers(ctx)
	if err != nil {
		return nil, err
	}
	examCount, err := s.examRepo.CountExams(ctx)
	if err != nil {
		return nil, err
	}
	questionCount, err := s.examRepo.CountQuestions(ctx)
	if err != nil {
		return nil, err
	}
	return &dto.AdminStatsResponse{
		TotalUsers:     userCount,
		TotalExams:     examCount,
		TotalQuestions: questionCount,
	}, nil
}

// GetUserWeakTopics returns weak topics for a user
func (s *UserServiceImpl) GetUserWeakTopics(ctx context.Context, userID string) ([]*domain.UserWeakTopic, error) {
	return s.examRepo.GetUserWeakTopics(ctx, userID)
}

// GetUserAIContext returns the AI context for a user
func (s *UserServiceImpl) GetUserAIContext(ctx context.Context, userID string) (*domain.UserAIContext, error) {
	return s.userRepo.FindAIContextByUserID(ctx, userID)
}

// UpdateProfile updates name and/or avatar for a user
func (s *UserServiceImpl) UpdateProfile(ctx context.Context, userID string, req dto.UpdateProfileRequest) (*domain.User, error) {
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("user not found")
	}
	if req.FirstName != nil {
		user.FirstName = req.FirstName
	}
	if req.LastName != nil {
		user.LastName = req.LastName
	}
	if req.ImageURL != nil {
		user.ImageURL = req.ImageURL
	}
	return s.userRepo.Update(ctx, user)
}
