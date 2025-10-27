/**
 * Hub Expansion & Region Management Types
 * Supports multi-tier distribution network (Head Office → Regional Hubs → Stores)
 */

export interface CustomRegion {
  id: string;
  name: string;
  description: string;
  
  // Region Type
  type: 'default' | 'custom'; // System-provided vs user-created
  
  // Visual
  color: string; // Hex color for UI (#DC2626)
  
  // Boundary Definition
  boundary_type: 'postcode_list' | 'geographic_polygon' | 'radius' | 'manual_assignment';
  
  // Method 1: Postcode List (Primary)
  postcodes: string[] | null; // ['3000', '3002', '3004']
  
  // Method 2: Geographic Polygon (Future)
  boundary_polygon: Record<string, any> | null; // GeoJSON
  
  // Method 3: Radius (Future)
  center_latitude: number | null;
  center_longitude: number | null;
  radius_km: number | null;
  
  // Hub Planning
  hub_priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'FUTURE';
  estimated_stores: number; // Auto-calculated
  suggested_hub_location: string | null; // "Brunswick - Sydney Road"
  
  // Business Context
  rationale: string | null; // Why this region exists
  transport_access: string | null; // "Hume Highway, Sydney Road"
  
  // Status
  is_active: boolean;
  
  // Metadata
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegionalHub {
  id: string;
  location_id: string; // Links to locations table
  
  // Hub Details
  hub_type: 'shipping_company' | 'restaurant' | 'warehouse';
  partner_company_name: string;
  coverage_regions: string[]; // Region names
  
  // Capacity Planning
  max_storage_capacity: number;
  current_stock_level: number; // Auto-updated
  ideal_buffer_stock: number; // Emergency stock
  
  // Performance Metrics
  stores_served: number; // Auto-calculated
  average_delivery_time_hours: number | null;
  total_monthly_shipments: number;
  
  // Business Terms
  commission_rate: number; // Percentage (5.00 = 5%)
  monthly_storage_fee: number; // Dollar amount
  contract_duration_months: number;
  contract_start_date: string | null;
  contract_end_date: string | null;
  
  // Financial Tracking
  total_commission_earned: number;
  total_storage_fees_paid: number;
  
  // Status
  is_active: boolean;
  onboarding_date: string | null;
  operational_since: string | null;
  
  // Metadata
  created_at: string;
  updated_at: string;
  
  // Joined data
  location?: {
    id: string;
    name: string;
    code: string;
    address_line1: string;
    city: string;
    region: string;
    latitude: number | null;
    longitude: number | null;
  };
}

export interface HubExpansionScenario {
  id: string;
  
  // Scenario Details
  scenario_name: string;
  target_regions: string[];
  status: 'planning' | 'approved' | 'in_progress' | 'operational' | 'rejected';
  
  // Partner Information
  proposed_hub_type: 'shipping_company' | 'restaurant' | 'warehouse';
  partner_company_name: string | null;
  partner_contact_person: string | null;
  partner_phone: string | null;
  partner_email: string | null;
  
  // Location Details
  proposed_address: string | null;
  proposed_latitude: number | null;
  proposed_longitude: number | null;
  
  // Capacity Planning
  proposed_storage_capacity: number | null;
  proposed_buffer_stock: number | null;
  
  // Current State Analysis (Auto-calculated)
  stores_in_target_area: number;
  current_monthly_shipments: number | null;
  current_avg_delivery_cost: number | null;
  current_total_monthly_cost: number;
  
  // Projected State with Hub (Auto-calculated)
  projected_monthly_bulk_shipments: number | null;
  projected_bulk_shipment_cost: number | null;
  projected_local_delivery_cost: number | null;
  projected_hub_commission: number | null;
  projected_storage_fee: number | null;
  projected_total_monthly_cost: number;
  
  // Economic Analysis (Auto-calculated)
  monthly_savings: number; // current - projected
  break_even_months: number | null; // Setup cost / monthly_savings
  roi_percentage: number | null; // (savings * 12) / setup_cost * 100
  
  // Setup Costs
  setup_cost: number; // One-time: equipment, training
  estimated_monthly_operating_cost: number | null;
  
  // Business Terms
  proposed_commission_rate: number; // Default 5%
  proposed_storage_fee: number; // Default $200
  contract_duration_months: number; // Default 12
  
  // Decision Tracking
  created_by: string | null;
  created_at: string;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  
  // Notes
  business_case: string | null;
  risk_assessment: string | null;
  
  updated_at: string;
}

export interface HubCSVImport {
  id: string;
  
  // Import Metadata
  import_date: string;
  imported_by: string | null;
  file_name: string;
  total_rows: number;
  
  // Import Type
  import_type: 'existing_distributors' | 'prospective_partners';
  
  // Status
  status: 'pending' | 'processed' | 'failed';
  processed_rows: number;
  failed_rows: number;
  error_log: Record<string, any> | null;
  
  // Preview Data
  sample_data: Record<string, any> | null; // First 5 rows
  
  // Processing
  processed_at: string | null;
  processing_duration_seconds: number | null;
}

export interface HubCSVImportRow {
  id: string;
  import_id: string;
  
  // CSV Row Data
  row_number: number;
  raw_data: Record<string, any>; // Entire row as JSON
  
  // Parsed Common Fields
  company_name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  region: string | null;
  
  // For existing_distributors
  current_location_id: string | null;
  average_monthly_orders: number | null;
  relationship_status: 'active' | 'inactive' | 'pending' | null;
  
  // For prospective_partners
  business_type: string | null; // 'Shipping Company', 'Restaurant', 'Warehouse'
  estimated_capacity: number | null;
  interest_level: 'high' | 'medium' | 'low' | 'cold_lead' | null;
  
  // Processing Status
  status: 'pending' | 'converted_to_scenario' | 'converted_to_hub' | 'rejected' | 'duplicate';
  
  converted_to_scenario_id: string | null;
  converted_to_hub_id: string | null;
  
  processing_notes: string | null;
  created_at: string;
}

// Hub Economics Calculation Result
export interface HubEconomicsResult {
  stores_count: number;
  current_monthly_cost: number;
  projected_costs: {
    bulk_shipments: number;
    local_deliveries: number;
    hub_commission: number;
    storage_fee: number;
    total: number;
  };
  monthly_savings: number;
  break_even_months: number | null;
  roi_12_months: number | null;
  is_economical: boolean;
}

// Hub Viability Criteria
export interface HubViabilityCriteria {
  // Hard Constraints
  minimum_stores: number;           // Need at least 3 stores
  minimum_monthly_savings: number;  // Must save at least $100/month
  maximum_break_even_months: number; // Must break even within 2 years
  
  // Soft Constraints (warnings, not blockers)
  ideal_stores: number;              // 5+ stores is ideal
  ideal_monthly_savings: number;     // $500+/month is strong case
  ideal_break_even_months: number;   // Break even within 1 year is ideal
}

// Cost Assumptions for Calculations
export interface HubCostAssumptions {
  // Current State (Direct Shipping)
  DIRECT_SHIPPING_COST_PER_SHIPMENT: number;
  SHIPMENTS_PER_STORE_PER_MONTH: number;
  
  // With Hub
  BULK_SHIPPING_DISCOUNT_RATE: number; // 0.40 = 40% cheaper
  LOCAL_DELIVERY_COST_PER_SHIPMENT: number;
  AVERAGE_ORDER_VALUE: number;
  
  // Setup Costs
  DEFAULT_SETUP_COST: number;
  
  // Operating Costs
  DEFAULT_STORAGE_FEE: number;
  DEFAULT_COMMISSION_RATE: number; // percentage
}

// Enhanced Location with Hub Support
export interface LocationWithHub extends Location {
  location_tier: 'head_office' | 'regional_hub' | 'retail_store';
  hub_capabilities: {
    warehousing?: boolean;
    product_showcase?: boolean;
    emergency_stock?: number;
    serves_regions?: string[];
  } | null;
  business_model: 'manufacturer' | 'logistics_partner' | 'restaurant_partner' | 'retail';
}

// Enhanced Stock Movement with Multi-Tier Support
export interface StockMovementWithTier extends StockMovement {
  movement_tier: 'head_to_hub' | 'hub_to_store' | 'head_to_store' | 'store_to_hub';
  via_hub_id: string | null;
  is_bulk_shipment: boolean;
  expected_delivery_date: string | null;
}

// Form Data Types
export interface NewHubScenarioForm {
  scenario_name: string;
  target_regions: string[];
  proposed_hub_type: 'shipping_company' | 'restaurant' | 'warehouse';
  partner_company_name?: string;
  partner_contact_person?: string;
  partner_phone?: string;
  partner_email?: string;
  proposed_commission_rate: number;
  proposed_storage_fee: number;
  setup_cost: number;
  business_case?: string;
}

export interface EditRegionForm {
  name: string;
  description: string;
  color: string;
  postcodes: string[];
  hub_priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'FUTURE';
  suggested_hub_location: string;
  rationale: string;
}

// Re-export for convenience
import type { StockMovement } from './inventory';
import type { StoreLocation as Location } from './inventory';
