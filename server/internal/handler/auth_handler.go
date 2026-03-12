package handler

import (
	"net/http"
	"time"

	"github.com/examlytics/server/internal/dto"
	"github.com/examlytics/server/internal/middleware"
	"github.com/examlytics/server/internal/service"
	"github.com/gin-gonic/gin"
)

// AuthHandler handles authentication routes
type AuthHandler struct {
	userService service.UserService
	jwtAuth     *middleware.JWTAuth
}

// NewAuthHandler creates a new AuthHandler
func NewAuthHandler(userService service.UserService, jwtAuth *middleware.JWTAuth) *AuthHandler {
	return &AuthHandler{userService: userService, jwtAuth: jwtAuth}
}

// Register POST /auth/register
func (h *AuthHandler) Register(c *gin.Context) {
	var req dto.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	user, err := h.userService.RegisterUser(c.Request.Context(), &req)
	if err != nil {
		if err.Error() == "email already registered" {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "registration failed"})
		return
	}
	accessToken, err := h.jwtAuth.GenerateAccessToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "token generation failed"})
		return
	}
	refreshToken, err := h.jwtAuth.GenerateRefreshToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "token generation failed"})
		return
	}
	h.setRefreshCookie(c, refreshToken)
	c.JSON(http.StatusCreated, dto.TokenResponse{AccessToken: accessToken, ExpiresIn: 900})
}

// Login POST /auth/login
func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	user, err := h.userService.AuthenticateUser(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
		return
	}
	accessToken, err := h.jwtAuth.GenerateAccessToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "token generation failed"})
		return
	}
	refreshToken, err := h.jwtAuth.GenerateRefreshToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "token generation failed"})
		return
	}
	h.setRefreshCookie(c, refreshToken)
	c.JSON(http.StatusOK, dto.TokenResponse{AccessToken: accessToken, ExpiresIn: 900})
}

// Refresh POST /auth/refresh
func (h *AuthHandler) Refresh(c *gin.Context) {
	refreshToken, err := c.Cookie("refreshToken")
	if err != nil || refreshToken == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "refresh token missing"})
		return
	}
	userID, err := h.jwtAuth.ParseRefreshToken(refreshToken)
	if err != nil {
		h.clearRefreshCookie(c)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired refresh token"})
		return
	}
	user, err := h.userService.GetUserByID(c.Request.Context(), userID)
	if err != nil || user == nil {
		h.clearRefreshCookie(c)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
		return
	}
	accessToken, err := h.jwtAuth.GenerateAccessToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "token generation failed"})
		return
	}
	newRefreshToken, err := h.jwtAuth.GenerateRefreshToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "token generation failed"})
		return
	}
	h.setRefreshCookie(c, newRefreshToken)
	c.JSON(http.StatusOK, dto.TokenResponse{AccessToken: accessToken, ExpiresIn: 900})
}

// Logout POST /auth/logout
func (h *AuthHandler) Logout(c *gin.Context) {
	h.clearRefreshCookie(c)
	c.JSON(http.StatusOK, gin.H{"message": "logged out"})
}

// GetMe GET /auth/me (requires RequireLogin)
func (h *AuthHandler) GetMe(c *gin.Context) {
	userID, _ := c.Get("userID")
	user, err := h.userService.GetUserByID(c.Request.Context(), userID.(string))
	if err != nil || user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	c.JSON(http.StatusOK, dto.UserResponse{
		ID:        user.ID,
		Email:     user.Email,
		FirstName: user.FirstName,
		LastName:  user.LastName,
		ImageURL:  user.ImageURL,
		Role:      user.Role,
	})
}

// GetRole GET /auth/role (requires RequireLogin)
func (h *AuthHandler) GetRole(c *gin.Context) {
	userID, _ := c.Get("userID")
	role, err := h.userService.GetUserRoleByID(c.Request.Context(), userID.(string))
	if err != nil || role == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	c.JSON(http.StatusOK, dto.RoleResponse{Role: *role})
}

func (h *AuthHandler) setRefreshCookie(c *gin.Context, token string) {
	c.SetCookie("refreshToken", token, int((7 * 24 * time.Hour).Seconds()), "/auth/refresh", "", false, true)
}

func (h *AuthHandler) clearRefreshCookie(c *gin.Context) {
	c.SetCookie("refreshToken", "", -1, "/auth/refresh", "", false, true)
}
