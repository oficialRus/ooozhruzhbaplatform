export type UserRole =
  | 'admin'
  | 'orders'        // Коммерческие заказы
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
  | 'cheeseMaking'
  | 'cheeseWarehouse'
  | 'materials'
  | 'packaging'
  | 'shipping'
  | 'payments'
  | 'claims'
  | 'reports'
  | 'employees';

export interface ModuleInfoChild {
  key: ModuleKey;
  title: string;
  path: string;
  icon: string;
}

export interface ModuleInfo {
  key: ModuleKey;
  title: string;
  description: string;
  path: string;
  icon: string;
  color: string;
  children?: ModuleInfoChild[];
}
