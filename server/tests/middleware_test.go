package tests

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/examlytics/server/internal/config"
	"github.com/examlytics/server/internal/domain"
	"github.com/examlytics/server/internal/dto"
	"github.com/examlytics/server/internal/middleware"
	"github.com/gin-gonic/gin"
)

// Manual Mock matching internal/service/UserService (JWT-based)
type MockUserService struct {
	MockGetRole func(userID string) (*string, error)
}

func (m *MockUserService) RegisterUser(ctx context.Context, req *dto.RegisterRequest) (*domain.User, error) {
	return nil, nil
}
func (m *MockUserService) AuthenticateUser(ctx context.Context, req *dto.LoginRequest) (*domain.User, error) {
	return nil, nil
}
func (m *MockUserService) GetUsers(ctx context.Context) ([]*domain.User, error) { return nil, nil }
func (m *MockUserService) GetUserByID(ctx context.Context, userID string) (*domain.User, error) {
	return nil, nil
}
func (m *MockUserService) GetUserByEmail(ctx context.Context, email string) (*domain.User, error) {
	return nil, nil
}
func (m *MockUserService) GetUserRoleByID(ctx context.Context, userID string) (*string, error) {
	if m.MockGetRole != nil {
		return m.MockGetRole(userID)
	}
	return nil, nil
}
func (m *MockUserService) OnboardUser(ctx context.Context, userID string, req dto.OnboardingRequest) error {
	return nil
}
func (m *MockUserService) GetAdminStats(ctx context.Context) (*dto.AdminStatsResponse, error) {
	return nil, nil
}
func (m *MockUserService) GetUserWeakTopics(ctx context.Context, userID string) ([]*domain.UserWeakTopic, error) {
	return nil, nil
}
func (m *MockUserService) GetUserAIContext(ctx context.Context, userID string) (*domain.UserAIContext, error) {
	return nil, nil
}
func (m *MockUserService) UpdateProfile(ctx context.Context, userID string, req dto.UpdateProfileRequest) (*domain.User, error) {
	return nil, nil
}

func TestRateLimiter(t *testing.T) {
	gin.SetMode(gin.TestMode)
	limiter := middleware.NewRateLimiter(60000, 2)

	r := gin.New()
	r.Use(limiter.Limit())
	r.GET("/test", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	w1 := httptest.NewRecorder()
	r.ServeHTTP(w1, httptest.NewRequest("GET", "/test", nil))
	if w1.Code != http.StatusOK {
		t.Errorf("Expected 200, got %d", w1.Code)
	}

	w2 := httptest.NewRecorder()
	r.ServeHTTP(w2, httptest.NewRequest("GET", "/test", nil))
	if w2.Code != http.StatusOK {
		t.Errorf("Expected 200, got %d", w2.Code)
	}

	w3 := httptest.NewRecorder()
	r.ServeHTTP(w3, httptest.NewRequest("GET", "/test", nil))
	if w3.Code != http.StatusTooManyRequests {
		t.Errorf("Expected 429, got %d", w3.Code)
	}
}

func TestRequireLogin(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockService := &MockUserService{}
	cfg := &config.Config{JWTSecret: "test_jwt_secret_32_characters_long!"}
	jwtAuth := middleware.NewJWTAuth(cfg, mockService)

	// Case 1: Unauthorized (no userID in context)
	w1 := httptest.NewRecorder()
	c1, _ := gin.CreateTestContext(w1)
	c1.Request = httptest.NewRequest("GET", "/protected", nil)
	jwtAuth.RequireLogin()(c1)
	if w1.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401, got %d", w1.Code)
	}

	// Case 2: Authorized (userID set in context)
	w2 := httptest.NewRecorder()
	c2, _ := gin.CreateTestContext(w2)
	c2.Request = httptest.NewRequest("GET", "/protected", nil)
	c2.Set("userID", "user_123")
	jwtAuth.RequireLogin()(c2)
	if w2.Code != http.StatusOK {
		t.Errorf("Expected 200 (Next called), got %d", w2.Code)
	}
}

func TestRequireAdmin(t *testing.T) {
	gin.SetMode(gin.TestMode)
	cfg := &config.Config{JWTSecret: "test_jwt_secret_32_characters_long!"}

	// Case 1: Not Admin
	mockService1 := &MockUserService{
		MockGetRole: func(id string) (*string, error) {
			role := "USER"
			return &role, nil
		},
	}
	jwtAuth1 := middleware.NewJWTAuth(cfg, mockService1)
	w1 := httptest.NewRecorder()
	c1, _ := gin.CreateTestContext(w1)
	c1.Request = httptest.NewRequest("GET", "/admin", nil)
	c1.Set("userID", "user_normal")
	jwtAuth1.RequireAdmin()(c1)
	if w1.Code != http.StatusForbidden {
		t.Errorf("Expected 403, got %d", w1.Code)
	}

	// Case 2: Admin
	mockService2 := &MockUserService{
		MockGetRole: func(id string) (*string, error) {
			role := "ADMIN"
			return &role, nil
		},
	}
	jwtAuth2 := middleware.NewJWTAuth(cfg, mockService2)
	w2 := httptest.NewRecorder()
	c2, _ := gin.CreateTestContext(w2)
	c2.Request = httptest.NewRequest("GET", "/admin", nil)
	c2.Set("userID", "admin_user")
	jwtAuth2.RequireAdmin()(c2)
	if w2.Code != http.StatusOK {
		t.Errorf("Expected 200, got %d", w2.Code)
	}
}
