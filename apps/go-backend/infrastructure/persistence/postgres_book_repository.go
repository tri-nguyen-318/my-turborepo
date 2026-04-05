package persistence

import (
	"go-backend/domain/entity"
	"go-backend/domain/repository"

	"gorm.io/gorm"
)

// PostgresBookRepository is a PostgreSQL implementation of BookRepository
type postgresBookRepository struct {
	db *gorm.DB
}

// NewPostgresBookRepository creates a new PostgreSQL book repository
func NewPostgresBookRepository(db *gorm.DB) repository.BookRepository {
	return &postgresBookRepository{db: db}
}

func (r *postgresBookRepository) FindAll() ([]entity.Book, error) {
	var books []entity.Book
	if err := r.db.Find(&books).Error; err != nil {
		return nil, err
	}
	return books, nil
}

func (r *postgresBookRepository) FindByID(id uint) (*entity.Book, error) {
	var book entity.Book
	if err := r.db.First(&book, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &book, nil
}

func (r *postgresBookRepository) Create(title, author string, year int) (*entity.Book, error) {
	book := &entity.Book{
		Title:  title,
		Author: author,
		Year:   year,
	}
	if err := r.db.Create(book).Error; err != nil {
		return nil, err
	}
	return book, nil
}

func (r *postgresBookRepository) Update(id uint, title, author string, year int) (*entity.Book, error) {
	book := &entity.Book{}
	if err := r.db.Model(book).Where("id = ?", id).Updates(map[string]interface{}{
		"title":  title,
		"author": author,
		"year":   year,
	}).Error; err != nil {
		return nil, err
	}
	if err := r.db.First(&book, id).Error; err != nil {
		return nil, err
	}
	return book, nil
}

func (r *postgresBookRepository) Delete(id uint) error {
	return r.db.Delete(&entity.Book{}, id).Error
}

var _ repository.BookRepository = (*postgresBookRepository)(nil)
