package handler

import (
	"context"
	"errors"
	"net/http"
	"os"
	"time"

	"openletters.api/v2/internal/model"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

func RegisterUser(dbpool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input model.RegisterUserInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
			return
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao processar senha"})
			return
		}

		query := `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id;`
		var userID uuid.UUID
		err = dbpool.QueryRow(context.Background(), query, input.Email, string(hashedPassword)).Scan(&userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Não foi possível criar o usuário"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"message": "Usuário criado com sucesso", "userID": userID})
	}
}

func LoginUser(dbpool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input model.LoginUserInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
			return
		}

		var user model.User
		query := `SELECT id, email, password_hash FROM users WHERE email = $1;`
		err := dbpool.QueryRow(context.Background(), query, input.Email).Scan(&user.ID, &user.Email, &user.PasswordHash)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Email ou senha inválidos"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro no servidor"})
			return
		}

		err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password))
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Email ou senha inválidos"})
			return
		}

		claims := jwt.MapClaims{
			"sub":   user.ID, 
			"email": user.Email,
			"exp":   time.Now().Add(time.Hour * 24).Unix(),
			"iat":   time.Now().Unix(),                      
		}
		
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Não foi possível gerar o token"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"token": tokenString})
	}
}