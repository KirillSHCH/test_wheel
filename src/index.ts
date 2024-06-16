export const dbOptions: { host: string, user: string, password: string, database: string } = {
  host: '81.31.247.100',
  user: 'Test',
  password: 'd2a9f0370300896a22f5872d12907bd4',
  database: 'testdatabase',
};

export enum RolesEnum  {
  'attracting' = 'Менеджер по привлечению',
  'personal' = 'Персональный менеджер'
}

export interface ICustomer {
  id: number;
  city_id: number;
  first_order_date: string;
  last_order_date: string;
}

export interface IManager {
  id: number;
  fio: string;
  role: RolesEnum;
  efficiency: number;
  attached_clients_count: number;
}