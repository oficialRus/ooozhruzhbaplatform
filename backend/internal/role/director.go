package role

// Role — тип роли пользователя в системе.
type Role string

// Директор (admin).
const Director Role = "admin"

// TaskStatus — статус задачи на дашборде.
type TaskStatus string

const (
	// TaskStatusPending — задача не выполнена.
	TaskStatusPending TaskStatus = "pending"
	// TaskStatusDone — задача выполнена.
	TaskStatusDone TaskStatus = "done"
)

// CanAssignTasks — может ли роль создавать/назначать задачи в кабинете.
// Директор, Заказы, Производство и Склад — да, остальные роли — нет.
func CanAssignTasks(r Role) bool {
	switch r {
	case Director, Orders, Production, Warehouse:
		return true
	default:
		return false
	}
}

// CanChangeTaskStatus — может ли роль менять статус задачи (Не выполнено/Выполнено).
// По требованиям это может делать только Директор.
func CanChangeTaskStatus(r Role) bool {
	return r == Director
}

// AllowedModulesForDirector — список ключей модулей, доступных роли «Директор» (все модули кабинета).
// Используется при формировании ответа API (например, GET /api/me) и для проверки доступа.
func AllowedModulesForDirector() []string {
	return []string{
		"dashboard", "orders", "production", "materials",
		"packaging", "shipping", "payments", "claims", "reports",
	}
}

// IsDirector возвращает true, если роль — Директор.
func IsDirector(r Role) bool {
	return r == Director
}

// Остальные роли в системе (Фасовка, Отгрузка, Оплата, Рекламации).
const (
	Packaging Role = "packaging"
	Shipping  Role = "shipping"
	Payments  Role = "payments"
	Claims    Role = "claims"
)
