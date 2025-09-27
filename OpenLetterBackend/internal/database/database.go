// internal/database/database.go
package database

import (
	"context"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

func Connect(dbURL string) *pgxpool.Pool {
	pool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Não foi possível conectar ao banco de dados: %v\n", err)
		os.Exit(1)
	}

	// Testa a conexão
	if err := pool.Ping(context.Background()); err != nil {
		log.Fatalf("Não foi possível pingar o banco de dados: %v\n", err)
		os.Exit(1)
	}

	log.Println("Conectado ao banco de dados com sucesso!")
	return pool
}