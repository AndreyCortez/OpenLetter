// internal/config/config.go
package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// LoadConfig carrega as variáveis de ambiente do arquivo .env apropriado.
func LoadConfig() {
	env := os.Getenv("GO_ENV")
	if env == "" {
		env = "development"
	}

	err := godotenv.Load(".env." + env)
	if err != nil {
		log.Printf("Aviso: Não foi possível encontrar o arquivo .env.%s. Usando variáveis de ambiente do sistema, se disponíveis.", env)
	}

	log.Printf("Configuração para o ambiente '%s' carregada.", env)
}

// GetDBURL retorna a string de conexão com o banco de dados.
func GetDBURL() string {
	return os.Getenv("DATABASE_URL")
}

// GetAPIPort retorna a porta em que a API deve rodar.
func GetAPIPort() string {
	port := os.Getenv("API_PORT")
	if port == "" {
		return "8080" 
	}
	return port
}