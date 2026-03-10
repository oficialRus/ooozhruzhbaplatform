export interface Order {
  id: string;
  /** Номер заказа клиента (если у клиента он есть) */
  orderNumber?: string;
  /** Наш внутренний номер заказа */
  ourOrderNumber?: string;
  month: string;
  registrationDate: string;
  clientName: string;
  nomenclatureName: string;
  brandName: string;
  packagingGrams: string;
  packagingFormat: string;
  pricePerUnit: string;
  /** Скидка, % (влияет на итоговую цену за единицу) */
  discount: string;
  quantityPackages: string;
  quant: string;
  quantityKg: string;
  deliveryDeadline: string;
  deliveryCity: string;
  paymentDate: string;
  comments: string;
  status: 'new' | 'in_progress' | 'shipped' | 'completed';
}
