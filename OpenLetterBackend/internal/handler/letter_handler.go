// internal/handler/letter_handler.go
package handler

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"openletters.api/v2/internal/model" // Certifique-se que o nome do módulo está correto

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// SearchLetters busca cartas com base em filtros de texto, datas customizáveis e ordenação.
// Serve como o handler principal para a rota GET /letters.
func SearchLetters(dbpool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Obter parâmetros da URL
		field := c.Query("field")
		query := c.Query("query")
		sortOrder := c.DefaultQuery("sortOrder", "desc")
		startDate := c.Query("startDate")
		endDate := c.Query("endDate")

		// 2. Validar parâmetros
		if strings.ToLower(sortOrder) != "asc" && strings.ToLower(sortOrder) != "desc" {
			sortOrder = "desc"
		}

		// 3. Montar a query SQL dinamicamente
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

		// Adiciona filtro de data de início, se for uma data válida
		if startDate != "" {
			if _, err := time.Parse("2006-01-02", startDate); err == nil {
				whereClauses = append(whereClauses, fmt.Sprintf("DATE(l.created_at) >= $%d", paramIndex))
				args = append(args, startDate)
				paramIndex++
			}
		}

		// Adiciona filtro de data de fim, se for uma data válida
		if endDate != "" {
			if _, err := time.Parse("2006-01-02", endDate); err == nil {
				whereClauses = append(whereClauses, fmt.Sprintf("DATE(l.created_at) <= $%d", paramIndex))
				args = append(args, endDate)
				paramIndex++
			}
		}

		// Adiciona filtro de busca textual, se especificado
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

		// Constrói a cláusula WHERE final
		if len(whereClauses) > 0 {
			sqlQuery += " WHERE " + strings.Join(whereClauses, " AND ")
		}

		// Adiciona o restante da query
		sqlQuery += " GROUP BY l.id, u.id"
		sqlQuery += fmt.Sprintf(" ORDER BY signature_count %s, l.created_at DESC", strings.ToUpper(sortOrder))
		sqlQuery += " LIMIT 100;"

		// 4. Executar a query
		rows, err := dbpool.Query(context.Background(), sqlQuery, args...)
		if err != nil {
			log.Printf("Erro ao executar a query: %v\n", err) // Log do erro para depuração
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao executar a busca"})
			return
		}
		defer rows.Close()

		// 5. Escanear os resultados
		letters := make([]model.LetterWithSignatureCount, 0)
		for rows.Next() {
			var letter model.LetterWithSignatureCount
			if err := rows.Scan(
				&letter.ID, &letter.SenderID, &letter.RecipientEmail,
				&letter.Subject, &letter.Body, &letter.CreatedAt,
				&letter.SenderEmail,
				&letter.SignatureCount,
			); err != nil {
				log.Printf("Erro ao escanear a linha: %v\n", err) // Log do erro para depuração
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao processar dados da carta"})
				return
			}
			letters = append(letters, letter)
		}

		c.JSON(http.StatusOK, letters)
	}
}

// GetLetterByID busca uma única carta pelo seu UUID.
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
			log.Printf("Erro ao buscar a carta: %v", err) // Log para depuração
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
			// Retirar assinatura
			_, err = tx.Exec(context.Background(), "DELETE FROM signatures WHERE user_id = $1 AND letter_id = $2", userID, letterID)
		} else {
			// Adicionar assinatura
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