package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"go-backend/application/usecase"
	"go-backend/application/dto"
)

// BookHandler holds HTTP handlers for book-related routes
type BookHandler struct {
	useCase usecase.BookUseCase
}

// NewBookHandler creates a BookHandler wired to the given use case
func NewBookHandler(uc usecase.BookUseCase) *BookHandler {
	return &BookHandler{useCase: uc}
}

// GetBooks godoc
// @Summary Get all books with pagination
// @Description Returns a paginated list of all books with total count, current page, page size, and total pages
// @Tags books
// @Produce json
// @Param page query int false "Page number" default(1) example(1)
// @Param pageSize query int false "Page size (items per page)" default(10) example(10)
// @Success 200 {object} dto.BooksResponse "Array of books with pagination metadata (data, total, page, pageSize, totalPages)"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /api/books [get]
func (h *BookHandler) GetBooks(w http.ResponseWriter, r *http.Request) {
	pageStr := r.URL.Query().Get("page")
	if pageStr == "" {
		pageStr = "1"
	}
	pageSizeStr := r.URL.Query().Get("pageSize")
	if pageSizeStr == "" {
		pageSizeStr = "10"
	}

	page, _ := strconv.Atoi(pageStr)
	pageSize, _ := strconv.Atoi(pageSizeStr)
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}

	books, err := h.useCase.GetAllBooks()
	if err != nil {
		http.Error(w, "Failed to retrieve books", http.StatusInternalServerError)
		return
	}

	total := int64(len(books))
	totalPages := (int(total) + pageSize - 1) / pageSize

	// Slice for pagination
	start := (page - 1) * pageSize
	end := start + pageSize
	if start > len(books) {
		start = len(books)
	}
	if end > len(books) {
		end = len(books)
	}

	response := dto.BooksResponse{
		Data:       books[start:end],
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

// GetBookByID godoc
// @Summary Get book by ID
// @Description Returns a specific book by their ID with all attributes (id, title, author, year, created_at, updated_at)
// @Tags books
// @Produce json
// @Param id path int true "Book ID" example(1)
// @Success 200 {object} dto.BookDTO "Book object with id, title, author, year, created_at, updated_at"
// @Failure 404 {object} map[string]string "Book not found"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /api/books/{id} [get]
func (h *BookHandler) GetBookByID(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	if idStr == "" {
		http.Error(w, "Missing book ID", http.StatusBadRequest)
		return
	}

	idVal, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		http.Error(w, "Invalid book ID", http.StatusBadRequest)
		return
	}
	id := uint(idVal)

	book, err := h.useCase.GetBookByID(id)
	if err != nil {
		http.Error(w, "Failed to retrieve book", http.StatusInternalServerError)
		return
	}
	if book == nil {
		http.Error(w, "Book not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(book); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

// CreateBook godoc
// @Summary Create a new book
// @Description Create a new book with required fields: title, author, year. Returns created book object with id, created_at, updated_at
// @Tags books
// @Accept json
// @Produce json
// @Param input body dto.CreateBookRequest true "Book creation request"
// @Success 201 {object} dto.BookDTO "Book created with auto-generated id, created_at, updated_at"
// @Failure 400 {object} map[string]string "Invalid request: missing title, author, or year"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /api/books [post]
func (h *BookHandler) CreateBook(w http.ResponseWriter, r *http.Request) {
	var req map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	title, ok := req["title"].(string)
	if !ok || title == "" {
		http.Error(w, "Title is required", http.StatusBadRequest)
		return
	}

	author, ok := req["author"].(string)
	if !ok || author == "" {
		http.Error(w, "Author is required", http.StatusBadRequest)
		return
	}

	year, ok := req["year"].(float64)
	if !ok {
		http.Error(w, "Year is required", http.StatusBadRequest)
		return
	}

	book, err := h.useCase.CreateBook(title, author, int(year))
	if err != nil {
		http.Error(w, "Failed to create book", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(book); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

// UpdateBook godoc
// @Summary Update a book
// @Description Update an existing book by ID. Required fields: title, author, year. Updates the updated_at timestamp
// @Tags books
// @Accept json
// @Produce json
// @Param id path int true "Book ID to update" example(1)
// @Param input body dto.UpdateBookRequest true "Book update request"
// @Success 200 {object} dto.BookDTO "Updated book object with modified title, author, year, and updated_at"
// @Failure 400 {object} map[string]string "Invalid request: missing title, author, or year"
// @Failure 404 {object} map[string]string "Book not found"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /api/books/{id} [put]
func (h *BookHandler) UpdateBook(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	if idStr == "" {
		http.Error(w, "Missing book ID", http.StatusBadRequest)
		return
	}

	idVal, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		http.Error(w, "Invalid book ID", http.StatusBadRequest)
		return
	}
	id := uint(idVal)

	var req map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	title, ok := req["title"].(string)
	if !ok || title == "" {
		http.Error(w, "Title is required", http.StatusBadRequest)
		return
	}

	author, ok := req["author"].(string)
	if !ok || author == "" {
		http.Error(w, "Author is required", http.StatusBadRequest)
		return
	}

	year, ok := req["year"].(float64)
	if !ok {
		http.Error(w, "Year is required", http.StatusBadRequest)
		return
	}

	book, err := h.useCase.UpdateBook(id, title, author, int(year))
	if err != nil {
		http.Error(w, "Failed to update book", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(book); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

// DeleteBook godoc
// @Summary Delete a book
// @Description Delete a book by ID. Returns 204 No Content on success
// @Tags books
// @Param id path int true "Book ID to delete" example(1)
// @Success 204 "Book deleted successfully (no response body)"
// @Failure 400 {object} map[string]string "Invalid book ID format"
// @Failure 500 {object} map[string]string "Internal server error"
// @Router /api/books/{id} [delete]
func (h *BookHandler) DeleteBook(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	if idStr == "" {
		http.Error(w, "Missing book ID", http.StatusBadRequest)
		return
	}

	idVal, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		http.Error(w, "Invalid book ID", http.StatusBadRequest)
		return
	}
	id := uint(idVal)

	if err := h.useCase.DeleteBook(id); err != nil {
		http.Error(w, "Failed to delete book", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
