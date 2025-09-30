package handler

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"
    "database/sql" 


	"openletters.api/v2/internal/model"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func SearchLetters(dbpool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		field := c.Query("field")
		query := c.Query("query")
		sortOrder := c.DefaultQuery("sortOrder", "desc")
		startDate := c.Query("startDate")
		endDate := c.Query("endDate")

		if strings.ToLower(sortOrder) != "asc" && strings.ToLower(sortOrder) != "desc" {
			sortOrder = "desc"
		}

		sqlQuery := `
			SELECT
				l.id, l.sender_id, l.recipient_email, l.subject, l.body, l.created_at,
				u.email as sender_email,
				COUNT(s.letter_id) as signature_count
			FROM letters l
			LEFT JOIN signatures s ON l.id = s.letter_id
			LEFT JOIN users u ON l.sender_id = u.id
		`
		args := []interface{}{}
		whereClauses := []string{}
		paramIndex := 1

		if startDate != "" {
			if _, err := time.Parse("2006-01-02", startDate); err == nil {
				whereClauses = append(whereClauses, fmt.Sprintf("DATE(l.created_at) >= $%d", paramIndex))
				args = append(args, startDate)
				paramIndex++
			}
		}

		if endDate != "" {
			if _, err := time.Parse("2006-01-02", endDate); err == nil {
				whereClauses = append(whereClauses, fmt.Sprintf("DATE(l.created_at) <= $%d", paramIndex))
				args = append(args, endDate)
				paramIndex++
			}
		}

		if query != "" && field != "" {
			allowedFields := map[string]string{
				"subject": "l.subject",
				"from":    "u.email",
				"to":      "l.recipient_email",
			}
			dbField, ok := allowedFields[field]
			if !ok {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Campo de pesquisa inválido"})
				return
			}

			if field == "subject" {
				whereClauses = append(whereClauses, fmt.Sprintf("to_tsvector('portuguese', %s) @@ websearch_to_tsquery('portuguese', $%d)", dbField, paramIndex))
				args = append(args, query)
			} else {
				whereClauses = append(whereClauses, fmt.Sprintf("%s ILIKE $%d", dbField, paramIndex))
				args = append(args, "%"+query+"%")
			}
		}

		if len(whereClauses) > 0 {
			sqlQuery += " WHERE " + strings.Join(whereClauses, " AND ")
		}

		sqlQuery += " GROUP BY l.id, u.id"
		sqlQuery += fmt.Sprintf(" ORDER BY signature_count %s, l.created_at DESC", strings.ToUpper(sortOrder))
		sqlQuery += " LIMIT 100;"

		rows, err := dbpool.Query(context.Background(), sqlQuery, args...)
		if err != nil {
			log.Printf("Erro ao executar a query: %v\n", err) 
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao executar a busca"})
			return
		}
		defer rows.Close()

		letters := make([]model.LetterWithSignatureCount, 0)
		for rows.Next() {
			var letter model.LetterWithSignatureCount
			if err := rows.Scan(
				&letter.ID, &letter.SenderID, &letter.RecipientEmail,
				&letter.Subject, &letter.Body, &letter.CreatedAt,
				&letter.SenderEmail,
				&letter.SignatureCount,
			); err != nil {
				log.Printf("Erro ao escanear a linha: %v\n", err) 
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao processar dados da carta"})
				return
			}
			letters = append(letters, letter)
		}

		c.JSON(http.StatusOK, letters)
	}
}

func GetLetterByID(dbpool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		idStr := c.Param("id")
		letterID, err := uuid.Parse(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
			return
		}

		userID, _ := c.Get("userID")

		query := `
			SELECT 
				l.id, l.sender_id, l.recipient_email, l.subject, l.body, l.created_at, 
				u.email as sender_email,
				COUNT(s.letter_id) as signature_count,
				-- Esta consulta EXISTS agora receberá o userID ou NULL
				EXISTS (SELECT 1 FROM signatures WHERE letter_id = l.id AND user_id = $2) as is_signed
			FROM letters l
			LEFT JOIN signatures s ON l.id = s.letter_id
			LEFT JOIN users u ON l.sender_id = u.id
			WHERE l.id = $1
			GROUP BY l.id, u.id;
		`

		var letter model.LetterWithSignatureCount
		
		err = dbpool.QueryRow(context.Background(), query, letterID, userID).Scan(
			&letter.ID, &letter.SenderID, &letter.RecipientEmail,
			&letter.Subject, &letter.Body, &letter.CreatedAt,
			&letter.SenderEmail,
			&letter.SignatureCount,
			&letter.IsSigned,
		)

		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				c.JSON(http.StatusNotFound, gin.H{"error": "Carta não encontrada"})
				return
			}
			log.Printf("Erro ao buscar a carta: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar a carta"})
			return
		}

		c.JSON(http.StatusOK, letter)
	}
}

func ToggleSignature(dbpool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIDstr, exists := c.Get("userID")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
			return
		}

		userID, _ := uuid.Parse(userIDstr.(string))

		letterIDstr := c.Param("id")
		letterID, err := uuid.Parse(letterIDstr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID de carta inválido"})
			return
		}

		tx, err := dbpool.Begin(context.Background())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro de banco de dados"})
			return
		}
		defer tx.Rollback(context.Background())

		var isSigned bool
		err = tx.QueryRow(context.Background(), "SELECT EXISTS (SELECT 1 FROM signatures WHERE user_id = $1 AND letter_id = $2)", userID, letterID).Scan(&isSigned)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao verificar assinatura"})
			return
		}
		
		if isSigned {
			_, err = tx.Exec(context.Background(), "DELETE FROM signatures WHERE user_id = $1 AND letter_id = $2", userID, letterID)
		} else {
			_, err = tx.Exec(context.Background(), "INSERT INTO signatures (user_id, letter_id) VALUES ($1, $2)", userID, letterID)
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar assinatura"})
			return
		}

		var newSignatureCount int
		err = tx.QueryRow(context.Background(), "SELECT COUNT(*) FROM signatures WHERE letter_id = $1", letterID).Scan(&newSignatureCount)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao contar assinaturas"})
			return
		}

		if err := tx.Commit(context.Background()); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao finalizar transação"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"signed":         !isSigned,
			"signatureCount": newSignatureCount,
		})
	}

}

func CreateLetter(dbpool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIDstr, exists := c.Get("userID")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
			return
		}
		userID, _ := uuid.Parse(userIDstr.(string))

		var input model.CreateLetterInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Dados da carta inválidos: " + err.Error()})
			return
		}

		tx, err := dbpool.Begin(context.Background())
		if err != nil {
			log.Printf("Erro ao iniciar transação: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro interno do servidor"})
			return
		}
		defer tx.Rollback(context.Background())

		var lastSent sql.NullTime
		err = tx.QueryRow(context.Background(), "SELECT last_letter_sent_at FROM users WHERE id = $1 FOR UPDATE", userID).Scan(&lastSent)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao verificar usuário"})
			return
		}

		if lastSent.Valid && time.Since(lastSent.Time) < time.Minute*1 {
			remaining := (time.Minute*1 - time.Since(lastSent.Time)).Seconds()
			c.JSON(http.StatusTooManyRequests, gin.H{"error": fmt.Sprintf("Aguarde mais %.0f segundos para enviar outra carta.", remaining)})
			return
		}

		var newLetter model.Letter
		insertQuery := `
			INSERT INTO letters (sender_id, recipient_email, subject, body)
			VALUES ($1, $2, $3, $4)
			RETURNING id, sender_id, recipient_email, subject, body, created_at;
		`
		err = tx.QueryRow(context.Background(), insertQuery, userID, input.RecipientEmail, input.Subject, input.Body).Scan(
			&newLetter.ID, &newLetter.SenderID, &newLetter.RecipientEmail,
			&newLetter.Subject, &newLetter.Body, &newLetter.CreatedAt,
		)
		if err != nil {
			log.Printf("Erro ao inserir carta: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Não foi possível salvar a carta"})
			return
		}

		_, err = tx.Exec(context.Background(), "UPDATE users SET last_letter_sent_at = NOW() WHERE id = $1", userID)
		if err != nil {
			log.Printf("Erro ao atualizar o usuário: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Não foi possível atualizar o status do usuário"})
			return
		}

		if err := tx.Commit(context.Background()); err != nil {
			log.Printf("Erro ao comitar transação: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao finalizar a operação"})
			return
		}

		c.JSON(http.StatusCreated, newLetter)
	}
}