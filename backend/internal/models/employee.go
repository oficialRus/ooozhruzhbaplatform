package models

type Employee struct {
	ID              string            `json:"id"`
	FullName        string            `json:"fullName"`
	PersonnelNumber string            `json:"personnelNumber"`
	AccessRights    map[string]string `json:"accessRights"`
	Login           string            `json:"login"`
	Position        string            `json:"position"`
	HireDate        string            `json:"hireDate"`
	DismissalDate   string            `json:"dismissalDate"`
}

type CreateEmployeeRequest struct {
	FullName        string            `json:"fullName"`
	PersonnelNumber string            `json:"personnelNumber"`
	AccessRights    map[string]string `json:"accessRights"`
	Login           string            `json:"login"`
	Password        string            `json:"password"`
	Position        string            `json:"position"`
	HireDate        string            `json:"hireDate"`
	DismissalDate   string            `json:"dismissalDate"`
}

type LoginRequest struct {
	Login    string `json:"login"`
	Password string `json:"password"`
}
