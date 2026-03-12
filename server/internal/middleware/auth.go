package middleware

import (
	"net/http"
	"strings"
	"time"

	"github.com/examlytics/server/internal/config"
	"github.com/examlytics/server/internal/domain"
	"github.com/examlytics/server/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

const (
	contextUserID = "userID"
	contextRole   = "userRole"
	contextEmail  = "userEmail"
)

// Claims defines the JWT payload structure
type Claims struct {
	UserID    string      `json:"uid"`
	Email     string      `json:"email"`
	Role      domain.Role `json:"role"`
	FirstName string      `json:"first_name,omitempty"`
	LastName  string      `json:"last_name,omitempty"`
	ImageURL  string      `json:"image_url,omitempty"`
	jwt.RegisteredClaims
}

// JWTAuth provides JWT-based auth middleware
type JWTAuth struct {
	cfg         *config.Config
	userService service.UserService
}

// NewJWTAuth creates a new JWTAuth middleware
func NewJWTAuth(cfg *config.Config, userService service.UserService) *JWTAuth {
	return &JWTAuth{cfg: cfg, userService: userService}
}

// Authenticate parses the JWT if present. Does NOT block unauthenticated requests.
func (j *JWTAuth) Authenticate() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenStr := j.extractToken(c)
		if tokenStr != "" {
			if claims, err := j.parseToken(tokenStr, j.cfg.JWTSecret); err == nil {
				c.Set(contextUserID, claims.UserID)
				c.Set(contextRole, string(claims.Role))
				c.Set(contextEmail, claims.Email)
			}
		}
		c.Next()
	}
}

// RequireLogin aborts with 401 if no user is in context.
func (j *JWTAuth) RequireLogin() gin.HandlerFunc {
	return func(c *gin.Context) {
		if _, ok := c.Get(contextUserID); !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "authentication required"})
			return
		}
		c.Next()
	}
}

// RequireAdmin aborts with 403 if user does not hold ADMIN role.
func (j *JWTAuth) RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		roleVal, ok := c.Get(contextRole)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "authentication required"})
			return
		}
		if roleVal.(string) != string(domain.RoleAdmin) {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "admin access required"})
			return
		}
		c.Next()
	}
}

func (j *JWTAuth) extractToken(c *gin.Context) string {
	auth := c.GetHeader("Authorization")
	if strings.HasPrefix(auth, "Bearer ") {
		return strings.TrimPrefix(auth, "Bearer ")
	}
	if cookie, err := c.Cookie("accessToken"); err == nil {
		return cookie
	}
	return ""
}

func (j *JWTAuth) parseToken(tokenStr, secret string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return []byte(secret), nil
	}, jwt.WithExpirationRequired())
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, jwt.ErrTokenInvalidClaims
	}
	return claims, nil
}

// GenerateAccessToken creates a 15-min JWT signed with JWTSecret
func (j *JWTAuth) GenerateAccessToken(user *domain.User) (string, error) {
	firstName, lastName, imageURL := "", "", ""
	if user.FirstName != nil {
		firstName = *user.FirstName
	}
	if user.LastName != nil {
		lastName = *user.LastName
	}
	if user.ImageURL != nil {
		imageURL = *user.ImageURL
	}
	claims := &Claims{
		UserID:    user.ID,
		Email:     user.Email,
		Role:      user.Role,
		FirstName: firstName,
		LastName:  lastName,
		ImageURL:  imageURL,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   user.ID,
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)),
		},
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(j.cfg.JWTSecret))
}

// GenerateRefreshToken creates a 7-day JWT signed with JWTRefreshSecret
func (j *JWTAuth) GenerateRefreshToken(user *domain.User) (string, error) {
	claims := &Claims{
		UserID: user.ID,
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   user.ID,
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
		},
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(j.cfg.JWTRefreshSecret))
}

// ParseRefreshToken validates and decodes a refresh token
func (j *JWTAuth) ParseRefreshToken(tokenStr string) (string, error) {
	claims, err := j.parseToken(tokenStr, j.cfg.JWTRefreshSecret)
	if err != nil {
		return "", err
	}
	return claims.UserID, nil
}
