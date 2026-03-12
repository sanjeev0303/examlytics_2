package dto

import "github.com/examlytics/server/internal/domain"

// Auth DTOs
type RegisterRequest struct {
	Email     string  `json:"email" binding:"required,email"`
	Password  string  `json:"password" binding:"required,min=8"`
	FirstName *string `json:"firstName"`
	LastName  *string `json:"lastName"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type TokenResponse struct {
	AccessToken string `json:"access_token"`
	ExpiresIn   int    `json:"expires_in"` // seconds
}

type RefreshRequest struct {
	// refresh token comes from HttpOnly cookie; this body is empty
}

// User DTOs
type CreateUserRequest struct {
	Email        string  `json:"email" binding:"required,email"`
	PasswordHash string  `json:"passwordHash"` // pre-hashed, internal use only
	FirstName    *string `json:"firstName"`
	LastName     *string `json:"lastName"`
	ImageURL     *string `json:"imageUrl"`
}

type UserResponse struct {
	ID        string      `json:"id"`
	Email     string      `json:"email"`
	FirstName *string     `json:"firstName"`
	LastName  *string     `json:"lastName"`
	ImageURL  *string     `json:"imageUrl"`
	Role      domain.Role `json:"role"`
}

type RoleResponse struct {
	Role string `json:"role"`
}

type OnboardingRequest struct {
	TargetGoal      string   `json:"targetGoal" binding:"required"`
	PreferredTopics []string `json:"preferredTopics" binding:"required"`
}

// UpdateProfileRequest is used for PUT /users/profile
type UpdateProfileRequest struct {
	FirstName *string `json:"firstName"`
	LastName  *string `json:"lastName"`
	ImageURL  *string `json:"imageUrl"`
}

type AdminStatsResponse struct {
	TotalUsers     int64 `json:"totalUsers"`
	TotalExams     int64 `json:"totalExams"`
	TotalQuestions int64 `json:"totalQuestions"`
}
