package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

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

func GetDBURL() string {
	return os.Getenv("DATABASE_URL")
}

func GetAPIPort() string {
	port := os.Getenv("API_PORT")
	if port == "" {
		return "8080" 
	}
	return port
}