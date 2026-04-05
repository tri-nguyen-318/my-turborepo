package dto

import "time"

// BookDTO is the API representation of a Book
type BookDTO struct {
	ID        uint      `json:"id"`
	Title     string    `json:"title"`
	Author    string    `json:"author"`
	Year      int       `json:"year"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// CreateBookRequest is the request body for creating a new book
type CreateBookRequest struct {
	Title  string `json:"title" example:"The Go Programming Language"`
	Author string `json:"author" example:"Alan Donovan"`
	Year   int    `json:"year" example:"2015"`
}

// UpdateBookRequest is the request body for updating a book
type UpdateBookRequest struct {
	Title  string `json:"title" example:"The Go Programming Language 2nd Ed"`
	Author string `json:"author" example:"Alan Donovan"`
	Year   int    `json:"year" example:"2024"`
}

// BooksResponse is the paginated response for books list
type BooksResponse struct {
	Data       []BookDTO `json:"data"`
	Total      int64     `json:"total"`
	Page       int       `json:"page"`
	PageSize   int       `json:"pageSize"`
	TotalPages int       `json:"totalPages"`
}
