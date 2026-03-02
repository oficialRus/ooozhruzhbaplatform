package models

import "backend/internal/role"

// UserRole оставлен как алиас для совместимости (например, с API).
type UserRole = role.Role

type User struct {
	ID             string   `json:"id"`
	FullName       string   `json:"fullName"`
	Email          string   `json:"email"`
	PasswordHash   string   `json:"-"`
	Role           role.Role `json:"role"`
	Position       string   `json:"position"`
	AllowedModules []string `json:"allowedModules"`
}
