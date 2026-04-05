package persistence

import (
	"errors"
	"go-backend/domain/entity"
	"go-backend/domain/repository"
	"sync"
	"time"

	"gorm.io/gorm"
)

// InMemoryBookRepository is an in-memory implementation of BookRepository
type InMemoryBookRepository struct {
	books map[uint]*entity.Book
	mu    sync.RWMutex
	id    uint
}

// NewInMemoryBookRepository creates a new in-memory book repository with sample data
func NewInMemoryBookRepository() repository.BookRepository {
	repo := &InMemoryBookRepository{
		books: make(map[uint]*entity.Book),
		id:    1,
	}
	// Seed with sample books
	repo.books[1] = &entity.Book{
		Model:  gorm.Model{ID: 1, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		Title:  "Go in Action",
		Author: "William Kennedy",
		Year:   2015,
	}
	repo.books[2] = &entity.Book{
		Model:  gorm.Model{ID: 2, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		Title:  "Clean Code",
		Author: "Robert C. Martin",
		Year:   2008,
	}
	repo.books[3] = &entity.Book{
		Model:  gorm.Model{ID: 3, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		Title:  "Design Patterns",
		Author: "Gang of Four",
		Year:   1994,
	}
	repo.id = 4
	return repo
}

func (r *InMemoryBookRepository) FindAll() ([]entity.Book, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	books := make([]entity.Book, 0, len(r.books))
	for _, book := range r.books {
		books = append(books, *book)
	}
	return books, nil
}

func (r *InMemoryBookRepository) FindByID(id uint) (*entity.Book, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	if book, ok := r.books[id]; ok {
		return book, nil
	}
	return nil, nil
}

func (r *InMemoryBookRepository) Create(title, author string, year int) (*entity.Book, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	book := &entity.Book{
		Model:  gorm.Model{ID: r.id, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		Title:  title,
		Author: author,
		Year:   year,
	}
	r.books[r.id] = book
	r.id++
	return book, nil
}

func (r *InMemoryBookRepository) Update(id uint, title, author string, year int) (*entity.Book, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	book, ok := r.books[id]
	if !ok {
		return nil, errors.New("book not found")
	}
	book.Title = title
	book.Author = author
	book.Year = year
	book.UpdatedAt = time.Now()
	return book, nil
}

func (r *InMemoryBookRepository) Delete(id uint) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, ok := r.books[id]; !ok {
		return errors.New("book not found")
	}
	delete(r.books, id)
	return nil
}

var _ repository.BookRepository = (*InMemoryBookRepository)(nil)
