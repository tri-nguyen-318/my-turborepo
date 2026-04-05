package router

import (
	"net/http"
	"strings"

	_ "go-backend/docs"
	"go-backend/interfaces/http/handler"

	httpSwagger "github.com/swaggo/http-swagger"
)

// Register wires all routes onto the given mux.
func Register(mux *http.ServeMux, bookHandler *handler.BookHandler) {
	swaggerHandler := httpSwagger.Handler()

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/swagger") {
			swaggerHandler(w, r)
			return
		}
		handleHome(w, r)
	})

	mux.HandleFunc("GET /api/books", bookHandler.GetBooks)
	mux.HandleFunc("POST /api/books", bookHandler.CreateBook)
	mux.HandleFunc("GET /api/books/{id}", bookHandler.GetBookByID)
	mux.HandleFunc("PUT /api/books/{id}", bookHandler.UpdateBook)
	mux.HandleFunc("DELETE /api/books/{id}", bookHandler.DeleteBook)
}

// handleHome godoc
// @Summary Redirect to API documentation
// @Description Redirects root path to Swagger API documentation
// @Tags root
// @Router / [get]
func handleHome(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	http.Redirect(w, r, "/swagger/index.html", http.StatusMovedPermanently)
}
