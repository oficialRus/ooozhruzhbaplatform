package main

import (
	"backend/internal/database"
	"backend/internal/handlers"
	"fmt"
	"log"
	"net/http"
)

func main() {
	db, err := database.Open()
	if err != nil {
		log.Fatalf("database init failed: %v", err)
	}
	defer db.Close()

	fmt.Println("ООО Дружба — ERP Platform Backend")
	fmt.Println("Сервер запускается на :8080...")

	mux := http.NewServeMux()
	mux.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok"}`))
	})
	handlers.NewEmployeesHandler(db).Register(mux)

	log.Fatal(http.ListenAndServe(":8080", withCORS(mux)))
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
