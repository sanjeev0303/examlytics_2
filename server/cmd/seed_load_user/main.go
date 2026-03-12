package main

import (
	"fmt"
	"log"
	"time"

	"github.com/examlytics/server/internal/config"
	"github.com/examlytics/server/internal/database"
	"github.com/examlytics/server/internal/domain"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	fmt.Println("🌱 Seeding Load Test User...")

	// Load config
	cfg := config.Load()

	// Connect to database
	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	const loadTestEmail = "loadtest@examlytics.com"
	const loadTestPassword = "LoadTest@123456!"

	// Check if load test user already exists
	var existingUser domain.User
	result := db.Where("email = ?", loadTestEmail).First(&existingUser)

	if result.Error == nil {
		fmt.Println("✅ Load test user already exists:")
		fmt.Printf("   ID: %s\n", existingUser.ID)
		fmt.Printf("   Email: %s\n", existingUser.Email)
		fmt.Println("\n💡 Login with POST /auth/login { email, password } to get a JWT token")
		return
	}

	// Hash the password
	hash, err := bcrypt.GenerateFromPassword([]byte(loadTestPassword), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}

	// Create load test user
	firstName := "Load"
	lastName := "Tester"
	imageURL := "https://example.com/avatar.jpg"

	user := domain.User{
		ID:           uuid.New().String(),
		Email:        loadTestEmail,
		PasswordHash: string(hash),
		FirstName:    &firstName,
		LastName:     &lastName,
		ImageURL:     &imageURL,
		Role:         domain.RoleUser,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := db.Create(&user).Error; err != nil {
		log.Fatalf("❌ Failed to create load test user: %v", err)
	}

	fmt.Println("✅ Successfully seeded load test user!")
	fmt.Printf("   ID: %s\n", user.ID)
	fmt.Printf("   Email: %s\n", user.Email)
	fmt.Printf("   Password: %s\n", loadTestPassword)
	fmt.Println("\n💡 Login with POST /auth/login { email, password } to get a JWT token")
}
