package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	fmt.Println("ООО Жрушба — ERP Platform Backend")
	fmt.Println("Сервер запускается на :8080...")

	mux := http.NewServeMux()
	mux.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok"}`))
	})

	log.Fatal(http.ListenAndServe(":8080", mux))
}
