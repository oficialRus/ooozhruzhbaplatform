import type { User, ModuleKey } from '@/types';

const ALL_MODULES: ModuleKey[] = [
  'dashboard', 'orders', 'production', 'materials',
  'packaging', 'shipping', 'payments', 'claims', 'reports',
];

export const MOCK_USERS: User[] = [
  {
    id: '1',
    fullName: 'Иванов Иван Иванович',
    email: 'admin@zhruzhba.ru',
    role: 'admin',
    position: 'Директор',
    allowedModules: ALL_MODULES,
  },
  {
    id: '2',
    fullName: 'Петрова Екатерина Сергеевна',
    email: 'orders@zhruzhba.ru',
    role: 'orders',
    position: 'Менеджер по заказам',
    allowedModules: ['dashboard', 'orders'],
  },
  {
    id: '3',
    fullName: 'Сидорова Екатерина Викторовна',
    email: 'production@zhruzhba.ru',
    role: 'production',
    position: 'Начальник производства',
    allowedModules: ['dashboard', 'production', 'materials'],
  },
  {
    id: '4',
    fullName: 'Козлов Дмитрий Андреевич',
    email: 'warehouse@zhruzhba.ru',
    role: 'materials',
    position: 'Кладовщик',
    allowedModules: ['dashboard', 'materials'],
  },
  {
    id: '5',
    fullName: 'Новикова Елена Павловна',
    email: 'packaging@zhruzhba.ru',
    role: 'packaging',
    position: 'Начальник фасовки',
    allowedModules: ['dashboard', 'packaging'],
  },
  {
    id: '6',
    fullName: 'Морозов Андрей Николаевич',
    email: 'shipping@zhruzhba.ru',
    role: 'shipping',
    position: 'Логист',
    allowedModules: ['dashboard', 'shipping'],
  },
  {
    id: '7',
    fullName: 'Волкова Ольга Игоревна',
    email: 'payments@zhruzhba.ru',
    role: 'payments',
    position: 'Бухгалтер',
    allowedModules: ['dashboard', 'payments'],
  },
  {
    id: '8',
    fullName: 'Лебедев Артем Владимирович',
    email: 'claims@zhruzhba.ru',
    role: 'claims',
    position: 'Менеджер по рекламациям',
    allowedModules: ['dashboard', 'claims', 'orders'],
  },
];
