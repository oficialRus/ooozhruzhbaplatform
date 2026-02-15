export type UserRole =
  | 'admin'
  | 'orders'        // Приемка заказов
  | 'production'    // Сваривание
  | 'materials'     // Учет материалов
  | 'packaging'     // Фасовка
  | 'shipping'      // Отгрузка и накладные
  | 'payments'      // Оплата и дебиторка
  | 'claims';       // Рекламации

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatar?: string;
  position: string;
  allowedModules: ModuleKey[];
}

export type ModuleKey =
  | 'dashboard'
  | 'orders'
  | 'production'
  | 'materials'
  | 'packaging'
  | 'shipping'
  | 'payments'
  | 'claims';

export interface ModuleInfo {
  key: ModuleKey;
  title: string;
  description: string;
  path: string;
  icon: string;
  color: string;
}
