package main

import (
	"log"
	"openletters.api/v2/internal/config"
	"openletters.api/v2/internal/database"
	"openletters.api/v2/internal/handler"
	"openletters.api/v2/internal/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	config.LoadConfig()
	
	dbURL := config.GetDBURL()
	if dbURL == "" {
		log.Fatal("DATABASE_URL não está definida.")
	}

	dbpool := database.Connect(dbURL)
	defer dbpool.Close()

	router := gin.Default()
    router.Use(gin.Recovery())

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	api := router.Group("/openletter-api/v2")
	{
		api.GET("/ping", func(c *gin.Context) {
			c.JSON(200, gin.H{"message": "pong"})
		})
		
		api.GET("/letters", handler.SearchLetters(dbpool))

		api.GET("/letters/:id", handler.GetLetterByID(dbpool))

        api.POST("/users/register", handler.RegisterUser(dbpool))
        api.POST("/users/login", handler.LoginUser(dbpool))

		authorized := api.Group("/")
        authorized.Use(middleware.AuthMiddleware())
        {
			authorized.POST("/letters", handler.CreateLetter(dbpool))
            
            authorized.POST("/letters/:id/toggle-signature", handler.ToggleSignature(dbpool))
        
        }
	}

	apiPort := config.GetAPIPort()

	log.Printf("Servidor iniciado na porta %s - Sáb, 27 de Set de 2025", apiPort)
	if err := router.Run(":" + apiPort); err != nil {
		log.Fatalf("Não foi possível iniciar o servidor: %v", err)
	}
}