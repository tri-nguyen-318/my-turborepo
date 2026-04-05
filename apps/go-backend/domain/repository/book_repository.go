package repository

import "go-backend/domain/entity"

// BookRepository defines the interface for book data access
type BookRepository interface {
	FindAll() ([]entity.Book, error)
	FindByID(id uint) (*entity.Book, error)
	Create(title, author string, year int) (*entity.Book, error)
	Update(id uint, title, author string, year int) (*entity.Book, error)
	Delete(id uint) error
}
