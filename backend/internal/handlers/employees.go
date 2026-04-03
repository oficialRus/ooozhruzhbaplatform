package handlers

import (
	"backend/internal/models"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"sort"
	"strings"
	"time"

	"github.com/google/uuid"
	bolt "go.etcd.io/bbolt"
)

type EmployeesHandler struct {
	db *bolt.DB
}

const employeesBucket = "employees"

type storedEmployee struct {
	models.Employee
	PasswordHash string `json:"passwordHash"`
	CreatedAt    string `json:"createdAt"`
}

func NewEmployeesHandler(db *bolt.DB) *EmployeesHandler {
	return &EmployeesHandler{db: db}
}

func (h *EmployeesHandler) Register(mux *http.ServeMux) {
	mux.HandleFunc("/api/employees", h.handleEmployees)
	mux.HandleFunc("/api/employees/", h.handleEmployeeByID)
	mux.HandleFunc("/api/auth/login", h.handleLogin)
}

func (h *EmployeesHandler) handleEmployees(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		h.listEmployees(w, r)
	case http.MethodPost:
		h.createEmployee(w, r)
	default:
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	}
}

func (h *EmployeesHandler) handleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}

	req.Login = strings.TrimSpace(req.Login)
	if req.Login == "" || req.Password == "" {
		http.Error(w, "login and password are required", http.StatusBadRequest)
		return
	}

	var matched *storedEmployee
	err := h.db.View(func(tx *bolt.Tx) error {
		return tx.Bucket([]byte(employeesBucket)).ForEach(func(_, value []byte) error {
			var employee storedEmployee
			if err := json.Unmarshal(value, &employee); err != nil {
				return err
			}
			if strings.EqualFold(employee.Login, req.Login) {
				matched = &employee
				return errEmployeeFound
			}
			return nil
		})
	})
	if err != nil && err != errEmployeeFound {
		http.Error(w, "failed to process login", http.StatusInternalServerError)
		return
	}
	if matched == nil {
		http.Error(w, "invalid login or password", http.StatusUnauthorized)
		return
	}
	if matched.PasswordHash != hashPassword(req.Password) {
		http.Error(w, "invalid login or password", http.StatusUnauthorized)
		return
	}

	writeJSON(w, http.StatusOK, matched.Employee)
}

func (h *EmployeesHandler) handleEmployeeByID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id := strings.TrimPrefix(r.URL.Path, "/api/employees/")
	if id == "" {
		http.Error(w, "employee id is required", http.StatusBadRequest)
		return
	}

	err := h.db.Update(func(tx *bolt.Tx) error {
		return tx.Bucket([]byte(employeesBucket)).Delete([]byte(id))
	})
	if err != nil {
		http.Error(w, "failed to delete employee", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *EmployeesHandler) listEmployees(w http.ResponseWriter, _ *http.Request) {
	employees := make([]storedEmployee, 0)
	err := h.db.View(func(tx *bolt.Tx) error {
		return tx.Bucket([]byte(employeesBucket)).ForEach(func(_, value []byte) error {
			var employee storedEmployee
			if err := json.Unmarshal(value, &employee); err != nil {
				return err
			}
			employees = append(employees, employee)
			return nil
		})
	})
	if err != nil {
		http.Error(w, "failed to iterate employees", http.StatusInternalServerError)
		return
	}

	sort.Slice(employees, func(i, j int) bool {
		return employees[i].CreatedAt > employees[j].CreatedAt
	})

	result := make([]models.Employee, 0, len(employees))
	for _, employee := range employees {
		result = append(result, employee.Employee)
	}

	writeJSON(w, http.StatusOK, result)
}

func (h *EmployeesHandler) createEmployee(w http.ResponseWriter, r *http.Request) {
	var req models.CreateEmployeeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}

	req.FullName = strings.TrimSpace(req.FullName)
	req.PersonnelNumber = strings.TrimSpace(req.PersonnelNumber)
	req.Login = strings.TrimSpace(req.Login)
	req.Position = strings.TrimSpace(req.Position)

	if req.FullName == "" || req.Login == "" || req.Password == "" || req.Position == "" || req.HireDate == "" {
		http.Error(w, "fullName, login, password, position, hireDate are required", http.StatusBadRequest)
		return
	}

	id := uuid.NewString()
	record := storedEmployee{
		Employee: models.Employee{
			ID:              id,
			FullName:        req.FullName,
			PersonnelNumber: req.PersonnelNumber,
			AccessRights:    normalizeAccessRights(req.AccessRights),
			Login:           req.Login,
			Position:        req.Position,
			HireDate:        req.HireDate,
			DismissalDate:   req.DismissalDate,
		},
		PasswordHash: hashPassword(req.Password),
		CreatedAt:    time.Now().UTC().Format(time.RFC3339Nano),
	}

	payload, err := json.Marshal(record)
	if err != nil {
		http.Error(w, "failed to prepare employee", http.StatusInternalServerError)
		return
	}

	err = h.db.Update(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(employeesBucket))
		// Проверка уникальности логина.
		err := bucket.ForEach(func(_, value []byte) error {
			var existing storedEmployee
			if unmarshalErr := json.Unmarshal(value, &existing); unmarshalErr != nil {
				return unmarshalErr
			}
			if strings.EqualFold(existing.Login, req.Login) {
				return errEmployeeLoginExists
			}
			return nil
		})
		if err != nil {
			return err
		}
		return bucket.Put([]byte(id), payload)
	})
	if err != nil {
		if err == errEmployeeLoginExists {
			http.Error(w, "employee with this login already exists", http.StatusConflict)
			return
		}
		http.Error(w, "failed to create employee", http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusCreated, record.Employee)
}

func writeJSON(w http.ResponseWriter, statusCode int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	_ = json.NewEncoder(w).Encode(payload)
}

func hashPassword(raw string) string {
	sum := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(sum[:])
}

func normalizeAccessRights(input map[string]string) map[string]string {
	if len(input) == 0 {
		return map[string]string{}
	}
	result := make(map[string]string, len(input))
	for key, value := range input {
		moduleKey := strings.TrimSpace(key)
		if moduleKey == "" {
			continue
		}
		level := strings.ToLower(strings.TrimSpace(value))
		if level == "edit" {
			result[moduleKey] = "edit"
		} else if level == "read" {
			result[moduleKey] = "read"
		} else {
			result[moduleKey] = "none"
		}
	}
	return result
}

var errEmployeeLoginExists = &appError{message: "employee login exists"}
var errEmployeeFound = &appError{message: "employee found"}

type appError struct {
	message string
}

func (e *appError) Error() string { return e.message }
