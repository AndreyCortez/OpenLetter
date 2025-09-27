// internal/middleware/auth_middleware.go
package middleware

import (
	"errors"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Cabeçalho de autorização não encontrado"})
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Cabeçalho de autorização mal formatado"})
			return
		}

		tokenString := parts[1]
		secretKey := []byte(os.Getenv("JWT_SECRET"))

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, errors.New("método de assinatura inesperado")
			}
			return secretKey, nil
		})

		if err != nil {
			var errorMsg string
			if errors.Is(err, jwt.ErrTokenExpired) {
				errorMsg = "Token expirado"
			} else if errors.Is(err, jwt.ErrTokenSignatureInvalid) {
				errorMsg = "Assinatura do token é inválida"
			} else {
				errorMsg = "Token inválido: " + err.Error()
			}
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": errorMsg})
			return
		}

		if !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Não foi possível processar as claims do token"})
			return
		}

		userID, ok := claims["sub"].(string)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "ID do usuário inválido no token"})
			return
		}
		
		c.Set("userID", userID)
		c.Next()
	}
}