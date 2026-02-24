export interface Order {
  id: string;
  month: string;
  registrationDate: string;
  clientName: string;
  nomenclatureName: string;
  brandName: string;
  packagingGrams: string;
  pricePerUnit: string;
  quantityPackages: string;
  quant: string;
  quantityKg: string;
  deliveryDeadline: string;
  deliveryCity: string;
  paymentDate: string;
  comments: string;
  status: 'new' | 'in_progress' | 'shipped' | 'completed';
}
