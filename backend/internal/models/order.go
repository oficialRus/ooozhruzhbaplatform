package models

import "time"

type OrderStatus string

const (
	OrderNew        OrderStatus = "new"
	OrderProcessing OrderStatus = "processing"
	OrderCompleted  OrderStatus = "completed"
	OrderCancelled  OrderStatus = "cancelled"
)

type Order struct {
	ID          string      `json:"id"`
	Number      string      `json:"number"`
	ClientName  string      `json:"clientName"`
	Description string      `json:"description"`
	Status      OrderStatus `json:"status"`
	CreatedBy   string      `json:"createdBy"`
	CreatedAt   time.Time   `json:"createdAt"`
	UpdatedAt   time.Time   `json:"updatedAt"`
}
