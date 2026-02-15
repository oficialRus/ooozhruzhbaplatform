package models

type UserRole string

const (
	RoleAdmin      UserRole = "admin"
	RoleOrders     UserRole = "orders"
	RoleProduction UserRole = "production"
	RoleMaterials  UserRole = "materials"
	RolePackaging  UserRole = "packaging"
	RoleShipping   UserRole = "shipping"
	RolePayments   UserRole = "payments"
	RoleClaims     UserRole = "claims"
)

type User struct {
	ID             string     `json:"id"`
	FullName       string     `json:"fullName"`
	Email          string     `json:"email"`
	PasswordHash   string     `json:"-"`
	Role           UserRole   `json:"role"`
	Position       string     `json:"position"`
	AllowedModules []string   `json:"allowedModules"`
}
