// internal/model/model.go
package model

import (
	"time"
	"github.com/google/uuid"
)

type Letter struct {
	ID             uuid.UUID `json:"id"`
	SenderID       uuid.UUID `json:"sender_id"`
	RecipientEmail string    `json:"recipient_email"`
	Subject        string    `json:"subject"`
	Body           string    `json:"body"`
	CreatedAt      time.Time `json:"created_at"`
}


type LetterWithSignatureCount struct {
	ID             uuid.UUID `json:"id"`
	SenderID       uuid.UUID `json:"sender_id"`
	RecipientEmail string    `json:"recipient_email"`
	SenderEmail    string    `json:"senderEmail"`
	Subject        string    `json:"subject"`
	Body           string    `json:"body"`
	CreatedAt      time.Time `json:"created_at"`
	SignatureCount int       `json:"signatureCount"`
	IsSigned       bool      `json:"isSigned"`
}

type RegisterUserInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

type LoginUserInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type User struct {
	ID           uuid.UUID
	Email        string
	PasswordHash string
}