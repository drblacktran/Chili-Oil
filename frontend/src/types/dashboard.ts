/**
 * Dashboard Types
 * Type definitions for dashboard components and data
 */

export interface DashboardStats {
  totalInventory: number;
  activeDistributors: number;
  totalDistributors: number;
  lowStockAlerts: number;
  pendingTransfers: number;
}

export interface LowStockAlert {
  id: string;
  productName: string;
  sku: string;
  locationName: string;
  locationCode: string;
  currentStock: number;
  minimumStock: number;
  severity: 'critical' | 'warning' | 'info';
}

export type DistributorStatus = 'healthy' | 'low_stock' | 'critical' | 'inactive';

export interface DistributorOverview {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  status: DistributorStatus;
  totalStock: number;
  lowStockItems: number;
  lastRestocked?: string;
  phone: string;
}

export interface RecentActivity {
  id: string;
  type: 'transfer' | 'sms' | 'product' | 'adjustment';
  description: string;
  timestamp: string;
  user?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  href?: string;
  onClick?: () => void;
  color: 'red' | 'blue' | 'green' | 'yellow' | 'gray';
}
