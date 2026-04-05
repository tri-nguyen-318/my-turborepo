package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"go-backend/application/usecase"
	_ "go-backend/docs"
	"go-backend/infrastructure/database"
	"go-backend/infrastructure/persistence"
	"go-backend/interfaces/http/handler"
	"go-backend/interfaces/http/middleware"
	"go-backend/interfaces/http/router"

	"github.com/joho/godotenv"
	"go.uber.org/zap"
)

// @title           My Go Project API
// @version         1.0
// @description     A simple Hello World API with user management
// @host            localhost:3000
// @BasePath        /
// @schemes         http https

func main() {
	// Load environment variables
	_ = godotenv.Load()

	// Logger
	logger, err := zap.NewProduction()
	if err != nil {
		log.Fatal("failed to create logger:", err)
	}
	defer func() {
		_ = logger.Sync()
	}()

	// Database setup
	db, err := database.NewDB()
	if err != nil {
		log.Fatal("failed to initialize database:", err)
	}

	// Infrastructure layer
	repo := persistence.NewPostgresBookRepository(db)

	// Application layer
	uc := usecase.NewBookUseCase(repo)

	// Interface layer
	bookHandler := handler.NewBookHandler(uc)

	// Router
	mux := http.NewServeMux()
	router.Register(mux, bookHandler)

	// Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	port = ":" + port
	fmt.Printf("Server starting on http://localhost%s\n", port)
	fmt.Printf("API docs: http://localhost%s/swagger/index.html\n", port)
	log.Fatal(http.ListenAndServe(port, middleware.CORS(middleware.Logging(logger)(mux))))
}
