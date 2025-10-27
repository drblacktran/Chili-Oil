/**
 * Mock System Activity Logs
 * Stock updates, transfers, restocks, and system changes
 */

export interface SystemLog {
  id: string;
  timestamp: string;
  log_type: 'stock_update' | 'transfer' | 'restock' | 'alert_sent' | 'settings_change' | 'user_action';
  severity: 'info' | 'warning' | 'success' | 'error';
  title: string;
  description: string;
  store_name?: string;
  product_name?: string;
  quantity_change?: number;
  old_value?: string | number;
  new_value?: string | number;
  triggered_by: string;
  metadata?: Record<string, any>;
}

export const mockSystemLogs: SystemLog[] = [
  // Recent stock updates
  {
    id: 'log-001',
    timestamp: '2024-10-26T14:30:00Z',
    log_type: 'stock_update',
    severity: 'success',
    title: 'Stock Level Increased',
    description: 'Manual stock adjustment after physical count',
    store_name: 'CBD Central Grocer',
    product_name: "Benjamin's Chili Oil (250ml)",
    quantity_change: 5,
    old_value: 38,
    new_value: 43,
    triggered_by: 'John Smith (Store Manager)',
    metadata: {
      reason: 'Physical inventory count correction',
      counted_by: 'John Smith',
    },
  },
  
  {
    id: 'log-002',
    timestamp: '2024-10-26T13:15:00Z',
    log_type: 'transfer',
    severity: 'info',
    title: 'Stock Transfer Completed',
    description: 'Emergency stock transfer from Head Office',
    store_name: 'Brunswick Asian Mart',
    product_name: "Benjamin's Chili Oil (250ml)",
    quantity_change: 15,
    old_value: 12,
    new_value: 27,
    triggered_by: 'System (Auto-Transfer)',
    metadata: {
      from_location: 'Head Office Warehouse',
      to_location: 'Brunswick Asian Mart',
      transfer_id: 'TRF-20241026-001',
      delivery_status: 'delivered',
    },
  },
  
  {
    id: 'log-003',
    timestamp: '2024-10-26T11:45:00Z',
    log_type: 'stock_update',
    severity: 'warning',
    title: 'Low Stock Detected',
    description: 'Stock fell below minimum threshold',
    store_name: 'Box Hill Asian Grocers',
    product_name: "Benjamin's Chili Oil (250ml)",
    quantity_change: -8,
    old_value: 18,
    new_value: 10,
    triggered_by: 'System (Daily Sales)',
    metadata: {
      minimum_stock: 15,
      current_stock: 10,
      status_change: 'healthy → low',
    },
  },
  
  {
    id: 'log-004',
    timestamp: '2024-10-26T10:00:00Z',
    log_type: 'restock',
    severity: 'success',
    title: 'Scheduled Restock Completed',
    description: 'Weekly restock delivery arrived on schedule',
    store_name: 'St Kilda Fine Foods',
    product_name: "Benjamin's Chili Oil (250ml)",
    quantity_change: 30,
    old_value: 25,
    new_value: 55,
    triggered_by: 'Head Office Distribution',
    metadata: {
      delivery_day: 'Thursday',
      delivery_time: '10:00 AM',
      restock_id: 'RST-20241026-001',
      next_restock: '2024-11-02',
    },
  },
  
  {
    id: 'log-005',
    timestamp: '2024-10-26T09:30:00Z',
    log_type: 'alert_sent',
    severity: 'info',
    title: 'Low Stock Alert Sent',
    description: 'Email alert sent to store manager',
    store_name: 'Coburg Village Market',
    product_name: "Benjamin's Chili Oil (250ml)",
    triggered_by: 'System (Alert Queue)',
    metadata: {
      alert_type: 'low_stock',
      recipient: 'mike@coburgmarket.com',
      current_stock: 8,
      minimum_stock: 12,
    },
  },
  
  // Yesterday's activity
  {
    id: 'log-006',
    timestamp: '2024-10-25T16:20:00Z',
    log_type: 'settings_change',
    severity: 'info',
    title: 'Store Settings Updated',
    description: 'Minimum stock level adjusted based on sales trends',
    store_name: 'Footscray Market Store',
    old_value: 35,
    new_value: 42,
    triggered_by: 'Sarah Lee (Regional Manager)',
    metadata: {
      setting: 'minimum_stock_level',
      reason: 'Increased foot traffic observed',
    },
  },
  
  {
    id: 'log-007',
    timestamp: '2024-10-25T15:00:00Z',
    log_type: 'stock_update',
    severity: 'error',
    title: 'Critical Stock Level',
    description: 'Stock depleted to critical levels',
    store_name: 'Brunswick Asian Mart',
    product_name: "Benjamin's Chili Oil (250ml)",
    quantity_change: -15,
    old_value: 27,
    new_value: 12,
    triggered_by: 'System (Daily Sales)',
    metadata: {
      status_change: 'low → critical',
      emergency_restock_triggered: true,
    },
  },
  
  {
    id: 'log-008',
    timestamp: '2024-10-25T14:30:00Z',
    log_type: 'transfer',
    severity: 'success',
    title: 'Hub Transfer Initiated',
    description: 'Bulk transfer from Head Office to regional hub',
    store_name: 'Melbourne Fast Logistics Warehouse',
    product_name: "Benjamin's Chili Oil (250ml)",
    quantity_change: 200,
    old_value: 650,
    new_value: 850,
    triggered_by: 'Head Office Operations',
    metadata: {
      transfer_type: 'bulk_shipment',
      from_location: 'Head Office',
      to_hub: 'Melbourne Fast Logistics',
      shipment_id: 'SHP-20241025-003',
    },
  },
  
  {
    id: 'log-009',
    timestamp: '2024-10-25T11:00:00Z',
    log_type: 'restock',
    severity: 'success',
    title: 'Hub-to-Store Delivery',
    description: 'Local delivery from regional hub completed',
    store_name: 'CBD Central Grocer',
    product_name: "Benjamin's Chili Oil (250ml)",
    quantity_change: 20,
    old_value: 33,
    new_value: 53,
    triggered_by: 'Melbourne Fast Logistics',
    metadata: {
      delivery_method: 'hub_distribution',
      delivery_time_hours: 2.5,
      hub_name: 'Melbourne Fast Logistics Warehouse',
    },
  },
  
  {
    id: 'log-010',
    timestamp: '2024-10-25T09:45:00Z',
    log_type: 'user_action',
    severity: 'info',
    title: 'Delivery Preference Updated',
    description: 'Changed preferred delivery day for better logistics',
    store_name: 'Box Hill Asian Grocers',
    old_value: 'Tuesday',
    new_value: 'Wednesday',
    triggered_by: 'Linda Wang (Store Manager)',
    metadata: {
      setting: 'preferred_delivery_day',
      reason: 'Staff availability on Wednesdays',
    },
  },
  
  // Earlier this week
  {
    id: 'log-011',
    timestamp: '2024-10-24T16:00:00Z',
    log_type: 'stock_update',
    severity: 'success',
    title: 'Stock Replenished to Healthy Level',
    description: 'After restock, stock status returned to healthy',
    store_name: 'Coburg Village Market',
    product_name: "Benjamin's Chili Oil (250ml)",
    quantity_change: 25,
    old_value: 8,
    new_value: 33,
    triggered_by: 'System (Scheduled Restock)',
    metadata: {
      status_change: 'critical → healthy',
      restock_cycle_completed: true,
    },
  },
  
  {
    id: 'log-012',
    timestamp: '2024-10-24T13:20:00Z',
    log_type: 'settings_change',
    severity: 'warning',
    title: 'Restock Cycle Adjusted',
    description: 'Extended restock cycle due to slower sales',
    store_name: 'St Kilda Fine Foods',
    old_value: 7,
    new_value: 10,
    triggered_by: 'Emma Rodriguez (Store Manager)',
    metadata: {
      setting: 'restock_cycle_days',
      reason: 'Lower winter foot traffic',
      seasonal_adjustment: true,
    },
  },
  
  {
    id: 'log-013',
    timestamp: '2024-10-23T15:45:00Z',
    log_type: 'transfer',
    severity: 'info',
    title: 'Inter-Store Transfer',
    description: 'Stock transferred between nearby stores',
    store_name: 'Brunswick Asian Mart',
    product_name: "Benjamin's Chili Oil (250ml)",
    quantity_change: -10,
    old_value: 45,
    new_value: 35,
    triggered_by: 'Sarah Lee (Regional Manager)',
    metadata: {
      transfer_type: 'inter_store',
      to_store: 'Coburg Village Market',
      reason: 'Balance stock levels in region',
    },
  },
  
  {
    id: 'log-014',
    timestamp: '2024-10-23T12:00:00Z',
    log_type: 'stock_update',
    severity: 'info',
    title: 'Daily Sales Recorded',
    description: 'Normal daily sales activity',
    store_name: 'Footscray Market Store',
    product_name: "Benjamin's Chili Oil (250ml)",
    quantity_change: -6,
    old_value: 48,
    new_value: 42,
    triggered_by: 'System (POS Integration)',
    metadata: {
      average_daily_sales: 5.8,
      sales_date: '2024-10-23',
    },
  },
  
  {
    id: 'log-015',
    timestamp: '2024-10-22T10:30:00Z',
    log_type: 'alert_sent',
    severity: 'warning',
    title: 'Approaching Restock Date',
    description: 'Reminder sent 3 days before scheduled restock',
    store_name: 'CBD Central Grocer',
    triggered_by: 'System (Auto-Alert)',
    metadata: {
      alert_type: 'upcoming_restock',
      days_until_restock: 3,
      next_restock_date: '2024-10-25',
    },
  },
];

// Helper function to filter logs by date range
export function getLogsByDateRange(
  logs: SystemLog[],
  startDate: Date,
  endDate: Date
): SystemLog[] {
  return logs.filter((log) => {
    const logDate = new Date(log.timestamp);
    return logDate >= startDate && logDate <= endDate;
  });
}

// Helper function to filter logs by type
export function getLogsByType(
  logs: SystemLog[],
  type: SystemLog['log_type']
): SystemLog[] {
  return logs.filter((log) => log.log_type === type);
}

// Helper function to filter logs by severity
export function getLogsBySeverity(
  logs: SystemLog[],
  severity: SystemLog['severity']
): SystemLog[] {
  return logs.filter((log) => log.severity === severity);
}

// Helper function to filter logs by store
export function getLogsByStore(
  logs: SystemLog[],
  storeName: string
): SystemLog[] {
  return logs.filter((log) => log.store_name === storeName);
}
