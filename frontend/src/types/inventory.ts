/**
 * Inventory Management Types
 * Matches DATABASE_SCHEMA_V2.md
 */

export interface InventoryItem {
  id: string;
  product_id: string;
  location_id: string;

  // Stock Levels
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  ideal_stock: number; // Calculated: max × percentage

  // Restock Tracking
  last_restock_date: string | null; // ISO date
  next_restock_date: string | null; // ISO date
  restock_cycle_days: number;

  // Sales Velocity
  average_daily_sales: number;
  projected_stockout_date: string | null;
  days_until_stockout: number | null;

  // Value Calculations
  stock_value: number; // current_stock × unit_cost
  potential_revenue: number; // current_stock × retail_price

  // Settings
  ideal_stock_percentage: number; // Default 80%

  // Status
  stock_status: 'healthy' | 'low' | 'critical' | 'overstocked';
  needs_restock: boolean;
  restock_trigger_reason: string | null; // 'date_due' | 'stock_low' | 'both' | 'emergency'

  // Metadata
  created_at: string;
  updated_at: string;
  last_counted_at: string | null;

  // Joined data (from API)
  product?: ProductWithVariants;
  location?: StoreLocation;
}

export interface InventoryWithDetails extends InventoryItem {
  // Additional computed fields
  days_until_restock: number; // today - next_restock_date
  restock_urgency: 'overdue' | 'upcoming' | 'scheduled' | 'not_due';
  suggested_restock_qty: number; // Calculated suggestion
  stock_percentage: number; // (current / max) × 100
}

export interface ProductWithVariants {
  id: string;
  sku: string;
  name: string;
  description: string;

  // Product Hierarchy
  parent_product_id: string | null;
  variant_attributes: Record<string, any> | null; // {size: "500ml"}

  // Pricing (R × (1 - C) - U formula)
  retail_price: number; // R
  unit_cost: number; // U
  consignment_commission_rate: number; // C (percentage)
  purchase_commission_rate: number;
  currency: string;

  // Calculated
  profit_per_unit: number; // R × (1 - C/100) - U

  // Media
  image_url: string | null;
  image_public_id: string | null;
  thumbnail_url: string | null;

  // Inventory Defaults
  default_minimum_stock: number;
  default_maximum_stock: number;
  default_restock_cycle_days: number;

  // Status
  is_active: boolean;
  is_featured: boolean;
  status: 'active' | 'inactive' | 'discontinued';

  // Metadata
  created_at: string;
  updated_at: string;

  // Variants (if parent)
  variants?: ProductWithVariants[];
}

export interface StoreLocation {
  id: string;
  name: string;
  type: 'head_office' | 'retail_store';
  code: string; // STORE001, STORE002, etc.

  // Contact
  contact_person: string | null;
  email: string | null;
  phone: string;

  // Address
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string;

  // Geolocation
  latitude: number | null;
  longitude: number | null;
  region: string | null; // 'North', 'East', 'Inner East'

  // Restock Settings
  restock_cycle_days: number;
  minimum_stock_level: number;
  maximum_stock_level: number;
  ideal_stock_percentage: number;

  // Sales Velocity
  average_daily_sales: number;

  // Delivery Preferences
  preferred_delivery_day: string | null; // 'Monday', 'Tuesday', etc.
  preferred_delivery_time: string | null;

  // Seasonal Adjustments
  seasonal_multiplier: number; // 1.0 = normal, 1.5 = 50% increase
  seasonal_notes: string | null;

  // Relationships
  parent_location_id: string | null;
  assigned_user_id: string | null;

  // Notifications
  sms_notifications_enabled: boolean;
  email_notifications_enabled: boolean;
  emergency_restock_enabled: boolean;

  // Status
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  from_location_id: string | null;
  to_location_id: string | null;

  // Movement Details
  quantity: number;
  movement_type: 'transfer' | 'adjustment' | 'sale' | 'return' | 'wastage' | 'emergency';
  movement_date: string; // ISO date

  // Context
  reason: string | null;
  notes: string | null;
  reference_number: string | null;

  // Approval
  requires_approval: boolean;
  approved_by: string | null;
  approved_at: string | null;
  approval_status: 'pending' | 'approved' | 'rejected';

  // Stock Snapshot
  from_stock_before: number | null;
  from_stock_after: number | null;
  to_stock_before: number | null;
  to_stock_after: number | null;

  // Cost
  unit_cost_at_time: number | null;
  total_value: number;

  // User Tracking
  created_by: string;
  created_at: string;

  // Joined data
  product?: ProductWithVariants;
  from_location?: StoreLocation;
  to_location?: StoreLocation;
  created_by_user?: { id: string; full_name: string; };
}

export interface AlertQueueItem {
  id: string;
  location_id: string;
  product_id: string;

  // Alert Classification
  alert_type: 'critical' | 'low_stock' | 'upcoming_restock' | 'overdue' | 'emergency_request';
  trigger_reason: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';

  // Message Content
  sms_message: string;
  email_subject: string | null;
  email_body: string | null;

  // Recipient
  recipient_name: string | null;
  recipient_phone: string | null;
  recipient_email: string | null;

  // Approval Workflow
  status: 'pending' | 'approved' | 'sent' | 'failed' | 'rejected' | 'cancelled';
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;

  // Scheduling
  scheduled_send_at: string | null;
  sent_at: string | null;

  // Twilio Response
  provider_message_id: string | null;
  provider_status: string | null;
  provider_error: string | null;

  // Context
  context_data: {
    current_stock?: number;
    min_stock?: number;
    next_restock?: string;
    days_overdue?: number;
  } | null;

  // Metadata
  created_at: string;
  updated_at: string;

  // Joined data
  location?: StoreLocation;
  product?: ProductWithVariants;
}

export interface SMSLog {
  id: string;
  alert_id: string | null;
  location_id: string | null;
  phone_number: string;
  recipient_name: string | null;
  message_body: string;
  message_type: string | null;

  // Provider
  provider: string;
  provider_message_id: string | null;
  provider_status: string | null;
  provider_error_code: string | null;
  provider_error_message: string | null;

  // Costs
  message_segments: number;
  cost_per_segment: number | null;
  total_cost: number | null;

  // Metadata
  sent_by: string | null;
  sent_at: string;
  delivered_at: string | null;
  failed_at: string | null;
}

// Filter & Sort Options
export interface InventoryFilters {
  location_id?: string;
  product_id?: string;
  stock_status?: 'healthy' | 'low' | 'critical' | 'overstocked';
  needs_restock?: boolean;
  region?: string;
  restock_urgency?: 'overdue' | 'upcoming' | 'scheduled';
  search?: string; // Search by store name, code, contact
}

export interface InventorySortOptions {
  field: 'name' | 'code' | 'current_stock' | 'next_restock_date' | 'stock_value' | 'stock_status';
  direction: 'asc' | 'desc';
}

// Batch Operations
export interface BatchStockUpdate {
  location_ids: string[];
  product_id: string;
  new_stock_level: number;
  reason?: string;
}

export interface BatchRestockCycleUpdate {
  location_ids: string[];
  new_cycle_days: number;
}

// Restock Suggestion
export interface RestockSuggestion {
  inventory_id: string;
  location_id: string;
  location_name: string;
  product_id: string;
  current_stock: number;
  ideal_stock: number;
  minimum_stock: number;

  // Calculation methods
  deficit_from_ideal: number; // ideal - current
  projected_sales: number; // avg_daily_sales × cycle_days
  suggested_qty: number; // max(deficit, projected_sales)

  // Reasoning
  suggestion_reason: string; // "Deficit from ideal" | "Projected sales" | "Both"
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

// Dashboard Stats
export interface InventoryDashboardStats {
  total_units: number;
  total_value: number;
  total_potential_revenue: number;
  critical_stores: number;
  low_stock_stores: number;
  healthy_stores: number;
  restock_due_this_week: number;
  restock_overdue: number;
  average_stock_percentage: number; // Across all stores
  total_profit_potential: number; // Total stock × profit per unit
}
