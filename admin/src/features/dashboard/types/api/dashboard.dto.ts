export interface SalesTodayDto {
  total: number;
  change_pct?: number;
  cash_balance?: number;
}

export interface OrderDto {
  id: number;
  order_number?: string;
  customer_name?: string;
  vehicle_description?: string;
  mechanic_name?: string;
  status?: string;
  total?: number;
  priority?: string;
  updated_at?: string;
}

export interface ActivityDto {
  id: string;
  activity_type: string;
  message: string;
  created_at?: string;
  order_number?: string;
  customer_name?: string;
}

export interface AlertDto {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  action?: string;
}
