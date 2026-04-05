package usecase

import (
	"go-backend/application/dto"
	"go-backend/domain/entity"
	"go-backend/domain/repository"
)

// BookUseCase defines the business logic for book operations
type BookUseCase interface {
	GetAllBooks() ([]dto.BookDTO, error)
	GetBookByID(id uint) (*dto.BookDTO, error)
	CreateBook(title, author string, year int) (*dto.BookDTO, error)
	UpdateBook(id uint, title, author string, year int) (*dto.BookDTO, error)
	DeleteBook(id uint) error
}

type bookUseCase struct {
	repo repository.BookRepository
}

// NewBookUseCase creates a new BookUseCase instance
func NewBookUseCase(repo repository.BookRepository) BookUseCase {
	return &bookUseCase{repo: repo}
}

func (uc *bookUseCase) GetAllBooks() ([]dto.BookDTO, error) {
	books, err := uc.repo.FindAll()
	if err != nil {
		return nil, err
	}

	dtos := make([]dto.BookDTO, len(books))
	for i, book := range books {
		dtos[i] = entityToDTO(&book)
	}
	return dtos, nil
}

func (uc *bookUseCase) GetBookByID(id uint) (*dto.BookDTO, error) {
	book, err := uc.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if book == nil {
		return nil, nil
	}
	result := entityToDTO(book)
	return &result, nil
}

func (uc *bookUseCase) CreateBook(title, author string, year int) (*dto.BookDTO, error) {
	book, err := uc.repo.Create(title, author, year)
	if err != nil {
		return nil, err
	}
	result := entityToDTO(book)
	return &result, nil
}

func (uc *bookUseCase) UpdateBook(id uint, title, author string, year int) (*dto.BookDTO, error) {
	book, err := uc.repo.Update(id, title, author, year)
	if err != nil {
		return nil, err
	}
	result := entityToDTO(book)
	return &result, nil
}

func (uc *bookUseCase) DeleteBook(id uint) error {
	return uc.repo.Delete(id)
}

func entityToDTO(book *entity.Book) dto.BookDTO {
	return dto.BookDTO{
		ID:        book.ID,
		Title:     book.Title,
		Author:    book.Author,
		Year:      book.Year,
		CreatedAt: book.CreatedAt,
		UpdatedAt: book.UpdatedAt,
	}
}
