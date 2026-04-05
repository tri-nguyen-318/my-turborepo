package entity

import "gorm.io/gorm"

// Book represents a book domain entity
type Book struct {
	gorm.Model
	Title  string
	Author string
	Year   int
}
