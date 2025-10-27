# Benjamin's Chili Oil - Frontend Development Guide

**Last Updated:** 2025-10-26
**Architecture:** Hybrid (Admin SSR + Store Manager PWA)
**Location:** Melbourne, Victoria, Australia

---

## Project Overview

This is a web-based inventory and distribution management system for Benjamin's Chili Oil, a retail chili oil business operating in Melbourne with plans for Australia-wide expansion.

### Business Model

- **Type:** Manufacturer to Retail Stores Distribution (evolving to multi-tier)
- **Primary Market:** Melbourne, Victoria, Australia
- **Expansion Plan:** Australia-wide via regional hubs
- **Current Stores:** 10 retail locations across Melbourne (see business.config.local.ts)
- **Distribution Model:** Transitioning from star topology (Head Office → Stores) to multi-tier network (Head Office → Regional Hubs → Stores)

### Business Configuration

Sensitive business information is stored in `business.config.local.ts` (gitignored):
- Company details and contact information
- Store locations and contact persons
- Pricing and commission rates
- Profit margins
- Restock cycle parameters

**Setup:**
```bash
# Copy template and configure
cp business.config.example.ts business.config.local.ts
# Edit with actual values (file is gitignored)
```

### General Parameters

- **Pricing Model:** Commission-based retail
- **Restock Cycle:** Configurable per store (default: 21 days)
- **Stock Tracking:** Current stock, minimum/maximum thresholds
- **Currency:** AUD (Australian Dollars)
- **Phone Format:** Australian (+61 or 04xx xxx xxx)

### System Capabilities

**Phase 1: Current System**
- Product catalog with SKU tracking
- Inventory tracking across 10 retail store locations
- Stock level monitoring with automatic restock date calculation (21-day cycle)
- Alert queue system with approval workflow
- Stock movement audit trail
- Commission and pricing management
- Dashboard with inventory overview across all stores
- Progressive Web App (PWA) support for offline access

**Phase 2: Hub Expansion System (In Progress)**
- Regional hub management (shipping companies, restaurants, warehouses)
- Multi-tier distribution network (Head Office → Hubs → Stores)
- Hub expansion scenario planning with economic viability analysis
- Custom region management (hybrid: 7 default Melbourne regions + user-defined)
- CSV import for existing distributors and prospective partners
- Automated break-even and ROI calculations
- Hub performance analytics and coverage visualization
- Multi-tier stock movement tracking (head-to-hub, hub-to-store)

---

## Tech Stack

### Frontend
- **Astro 5.15.1** - SSR/SSG framework with islands architecture
- **React 19** - Client-side components
- **TypeScript 5.9.3** - Full type safety
- **TailwindCSS 4.1.16** - Utility-first styling via Vite plugin
- **@vite-pwa/astro 1.1.1** - Progressive Web App support
- **workbox-window 7.3.0** - Service worker management

### Backend (Future)
- **Express.js** - REST API
- **PostgreSQL** - Database
- **Knex.js or Prisma** - ORM (to be decided)
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Services (Future)
- **Cloudinary or AWS S3** - Image storage
- **Web Push API** - Browser notifications (replacing Twilio SMS)

### Development Tools
- **@astrojs/check** - TypeScript type checking
- **Git hooks** - Pre-commit validation
- **GitHub Actions** - CI/CD pipeline

---

## Database Schema V2

### Overview

The database uses PostgreSQL with application-layer constraints instead of database-level constraints for flexibility. All business logic is handled in the application code.

**Total Tables:** 11 core tables (7 Phase 1 + 4 Phase 2 hub expansion)
**Total Indexes:** ~60 indexes for query optimization
**Total Triggers:** 5 automatic update triggers
**Total Functions:** 2 (profit calculation + hub economics calculation)

### Table 1: products

Product catalog with variants and profit calculation.

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Product Hierarchy (for variants)
  parent_product_id UUID REFERENCES products(id),
  variant_attributes JSONB,

  -- Pricing (Customizable Profit Formula: R × (1 - C) - U)
  retail_price DECIMAL(10, 2) NOT NULL DEFAULT 12.80,
  unit_cost DECIMAL(10, 2) NOT NULL DEFAULT 4.50,
  consignment_commission_rate DECIMAL(5, 2) DEFAULT 30.00,
  purchase_commission_rate DECIMAL(5, 2) DEFAULT 30.00,
  currency VARCHAR(3) DEFAULT 'AUD',

  -- Media
  image_url VARCHAR(500),
  image_public_id VARCHAR(255),
  thumbnail_url VARCHAR(500),

  -- Inventory Settings (defaults for new locations)
  default_minimum_stock INT DEFAULT 30,
  default_maximum_stock INT DEFAULT 50,
  default_restock_cycle_days INT DEFAULT 21,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'active',

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_parent ON products(parent_product_id);
CREATE INDEX idx_products_status ON products(status);
```

**Profit Calculation Function:**

```sql
CREATE OR REPLACE FUNCTION calculate_profit(
  p_retail_price DECIMAL,
  p_commission_rate DECIMAL,
  p_unit_cost DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
  RETURN (p_retail_price * (1 - p_commission_rate / 100.0)) - p_unit_cost;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### Table 2: locations

Retail stores with restock management settings.

```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'retail_store',
  code VARCHAR(50) UNIQUE NOT NULL,

  -- Contact Information
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,

  -- Address
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Australia',

  -- Geolocation
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  region VARCHAR(100),

  -- Restock Management Settings
  restock_cycle_days INT DEFAULT 21,
  minimum_stock_level INT DEFAULT 30,
  maximum_stock_level INT DEFAULT 50,
  ideal_stock_percentage DECIMAL(5, 2) DEFAULT 80.00,

  -- Sales Velocity
  average_daily_sales DECIMAL(10, 2) DEFAULT 0,

  -- Delivery Preferences
  preferred_delivery_day VARCHAR(20),
  preferred_delivery_time VARCHAR(50),

  -- Seasonal Adjustments
  seasonal_multiplier DECIMAL(5, 2) DEFAULT 1.00,
  seasonal_notes TEXT,

  -- Relationships
  parent_location_id UUID REFERENCES locations(id),
  assigned_user_id UUID REFERENCES users(id),

  -- Notification Settings
  sms_notifications_enabled BOOLEAN DEFAULT true,
  email_notifications_enabled BOOLEAN DEFAULT true,
  emergency_restock_enabled BOOLEAN DEFAULT true,

  -- Status
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_locations_type ON locations(type);
CREATE INDEX idx_locations_code ON locations(code);
CREATE INDEX idx_locations_coordinates ON locations(latitude, longitude);
CREATE INDEX idx_locations_region ON locations(region);
CREATE INDEX idx_locations_status ON locations(status);
```

### Table 3: inventory

Current stock levels per product per location.

```sql
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,

  -- Stock Levels
  current_stock INT NOT NULL DEFAULT 0,
  minimum_stock INT NOT NULL,
  maximum_stock INT NOT NULL,
  ideal_stock INT GENERATED ALWAYS AS (
    CAST(maximum_stock * ideal_stock_percentage / 100.0 AS INT)
  ) STORED,

  -- Restock Tracking
  last_restock_date DATE,
  next_restock_date DATE,
  restock_cycle_days INT NOT NULL DEFAULT 21,

  -- Sales Velocity Projection
  average_daily_sales DECIMAL(10, 2) DEFAULT 0,
  projected_stockout_date DATE,
  days_until_stockout INT,

  -- Value Calculations
  stock_value DECIMAL(12, 2) GENERATED ALWAYS AS (
    current_stock * (SELECT unit_cost FROM products WHERE id = product_id)
  ) STORED,

  potential_revenue DECIMAL(12, 2) GENERATED ALWAYS AS (
    current_stock * (SELECT retail_price FROM products WHERE id = product_id)
  ) STORED,

  -- Settings Reference
  ideal_stock_percentage DECIMAL(5, 2) DEFAULT 80.00,

  -- Status Indicators
  stock_status VARCHAR(20),
  needs_restock BOOLEAN DEFAULT false,
  restock_trigger_reason TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_counted_at TIMESTAMP,

  UNIQUE(product_id, location_id)
);

CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_location ON inventory(location_id);
CREATE INDEX idx_inventory_status ON inventory(stock_status);
CREATE INDEX idx_inventory_needs_restock ON inventory(needs_restock);
CREATE INDEX idx_inventory_next_restock ON inventory(next_restock_date);
```

**Inventory Triggers:**

```sql
-- Auto-update next_restock_date
CREATE OR REPLACE FUNCTION update_next_restock_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_restock_date IS NOT NULL THEN
    NEW.next_restock_date := NEW.last_restock_date + (NEW.restock_cycle_days || ' days')::INTERVAL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_next_restock_date
BEFORE INSERT OR UPDATE OF last_restock_date, restock_cycle_days ON inventory
FOR EACH ROW
EXECUTE FUNCTION update_next_restock_date();

-- Auto-update stock_status
CREATE OR REPLACE FUNCTION update_stock_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_stock <= (NEW.minimum_stock * 0.5) THEN
    NEW.stock_status := 'critical';
    NEW.needs_restock := true;
    NEW.restock_trigger_reason := 'stock_critical';
  ELSIF NEW.current_stock <= NEW.minimum_stock THEN
    NEW.stock_status := 'low';
    NEW.needs_restock := true;
    NEW.restock_trigger_reason := 'stock_low';
  ELSIF NEW.current_stock > NEW.maximum_stock THEN
    NEW.stock_status := 'overstocked';
    NEW.needs_restock := false;
  ELSE
    NEW.stock_status := 'healthy';
    IF NEW.next_restock_date <= CURRENT_DATE THEN
      NEW.needs_restock := true;
      NEW.restock_trigger_reason := 'date_due';
    ELSE
      NEW.needs_restock := false;
      NEW.restock_trigger_reason := NULL;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock_status
BEFORE INSERT OR UPDATE OF current_stock, minimum_stock, maximum_stock, next_restock_date ON inventory
FOR EACH ROW
EXECUTE FUNCTION update_stock_status();

-- Auto-calculate projected stockout
CREATE OR REPLACE FUNCTION update_projected_stockout()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.average_daily_sales > 0 THEN
    NEW.days_until_stockout := CEIL(NEW.current_stock::DECIMAL / NEW.average_daily_sales);
    NEW.projected_stockout_date := CURRENT_DATE + (NEW.days_until_stockout || ' days')::INTERVAL;
  ELSE
    NEW.days_until_stockout := NULL;
    NEW.projected_stockout_date := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_projected_stockout
BEFORE INSERT OR UPDATE OF current_stock, average_daily_sales ON inventory
FOR EACH ROW
EXECUTE FUNCTION update_projected_stockout();
```

### Table 4: stock_movements

Audit trail of all stock transfers and adjustments.

```sql
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),

  -- Source and Destination
  from_location_id UUID REFERENCES locations(id),
  to_location_id UUID REFERENCES locations(id),

  -- Movement Details
  quantity INT NOT NULL,
  movement_type VARCHAR(50) NOT NULL,
  movement_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Context
  reason TEXT,
  notes TEXT,
  reference_number VARCHAR(100),

  -- Approval
  requires_approval BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  approval_status VARCHAR(20) DEFAULT 'pending',

  -- Stock Snapshot
  from_stock_before INT,
  from_stock_after INT,
  to_stock_before INT,
  to_stock_after INT,

  -- User Tracking
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Cost Tracking
  unit_cost_at_time DECIMAL(10, 2),
  total_value DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * unit_cost_at_time) STORED
);

CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_from_location ON stock_movements(from_location_id);
CREATE INDEX idx_stock_movements_to_location ON stock_movements(to_location_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX idx_stock_movements_date ON stock_movements(movement_date);
CREATE INDEX idx_stock_movements_approval ON stock_movements(approval_status);
```

### Table 5: alert_queue

Alert queue pending approval (future: Web Push notifications).

```sql
CREATE TABLE alert_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES locations(id),
  product_id UUID NOT NULL REFERENCES products(id),

  -- Alert Classification
  alert_type VARCHAR(50) NOT NULL,
  trigger_reason TEXT,
  priority VARCHAR(20) DEFAULT 'normal',

  -- Message Content
  sms_message TEXT NOT NULL,
  email_subject VARCHAR(255),
  email_body TEXT,

  -- Recipient
  recipient_name VARCHAR(255),
  recipient_phone VARCHAR(20),
  recipient_email VARCHAR(255),

  -- Approval Workflow
  status VARCHAR(20) DEFAULT 'pending',
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  rejection_reason TEXT,

  -- Scheduling
  scheduled_send_at TIMESTAMP,
  sent_at TIMESTAMP,

  -- Provider Response
  provider_message_id VARCHAR(255),
  provider_status VARCHAR(50),
  provider_error TEXT,

  -- Context Data
  context_data JSONB,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alert_queue_location ON alert_queue(location_id);
CREATE INDEX idx_alert_queue_product ON alert_queue(product_id);
CREATE INDEX idx_alert_queue_status ON alert_queue(status);
CREATE INDEX idx_alert_queue_type ON alert_queue(alert_type);
CREATE INDEX idx_alert_queue_scheduled ON alert_queue(scheduled_send_at);
CREATE INDEX idx_alert_queue_created ON alert_queue(created_at);
```

### Table 6: users

System users (admin and store managers).

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),

  -- Role-Based Access Control
  role VARCHAR(50) NOT NULL DEFAULT 'store_manager',
  assigned_location_id UUID REFERENCES locations(id),

  -- Status
  status VARCHAR(20) DEFAULT 'active',
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,

  -- Security
  last_login TIMESTAMP,
  login_count INT DEFAULT 0,
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_location ON users(assigned_location_id);
CREATE INDEX idx_users_status ON users(status);
```

### Table 7: sms_logs

Complete history of all SMS sent (future: notification_logs for Web Push).

```sql
CREATE TABLE sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Alert Reference
  alert_id UUID REFERENCES alert_queue(id),

  -- Recipient
  location_id UUID REFERENCES locations(id),
  phone_number VARCHAR(20) NOT NULL,
  recipient_name VARCHAR(255),

  -- Message
  message_body TEXT NOT NULL,
  message_type VARCHAR(50),

  -- Provider Response
  provider VARCHAR(50) DEFAULT 'twilio',
  provider_message_id VARCHAR(255),
  provider_status VARCHAR(50),
  provider_error_code VARCHAR(50),
  provider_error_message TEXT,

  -- Costs
  message_segments INT DEFAULT 1,
  cost_per_segment DECIMAL(6, 4),
  total_cost DECIMAL(8, 4),

  -- Metadata
  sent_by UUID REFERENCES users(id),
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivered_at TIMESTAMP,
  failed_at TIMESTAMP
);

CREATE INDEX idx_sms_logs_alert ON sms_logs(alert_id);
CREATE INDEX idx_sms_logs_location ON sms_logs(location_id);
CREATE INDEX idx_sms_logs_phone ON sms_logs(phone_number);
CREATE INDEX idx_sms_logs_status ON sms_logs(provider_status);
CREATE INDEX idx_sms_logs_sent_at ON sms_logs(sent_at);
```

### Sample Data Initialization

**Note:** Actual business data (products, locations, pricing) should be loaded from `business.config.local.ts`.

**Example Product Structure:**

```sql
INSERT INTO products (
  sku, name, description,
  retail_price, unit_cost,
  consignment_commission_rate, purchase_commission_rate,
  currency,
  default_minimum_stock, default_maximum_stock, default_restock_cycle_days,
  is_active, is_featured
) VALUES (
  'SKU-CODE',
  'Product Name',
  'Product description',
  0.00, 0.00,  -- Use actual values from config
  0.00, 0.00,  -- Commission rates from config
  'AUD',
  30, 50, 21,
  true, true
);
```

**Example Location Structure:**

```sql
INSERT INTO locations (
  name, type, code,
  contact_person, email, phone,
  address_line1, city, state, postal_code, country,
  latitude, longitude, region,
  restock_cycle_days, minimum_stock_level, maximum_stock_level,
  status
) VALUES (
  'Location Name', 'head_office', 'CODE',
  'Contact Person', 'email@example.com', '04XXXXXXXX',
  'Address Line 1', 'City', 'State', '0000', 'Australia',
  0.0000, 0.0000, 'Region',
  21, 100, 500,
  'active'
);
```

---

## Phase 2: Hub Expansion System

### Architecture Overview

The hub expansion system evolves the distribution model from **star topology** to a **multi-tier network**:

```
Current (Star):                    Future (Multi-Tier):
    [Head Office]                        [Head Office]
         |                                      |
   +-----+-----+                    +-----------+-----------+
   |     |     |                    |                       |
[Store][Store][Store]         [Regional Hub]          [Regional Hub]
                                    |                       |
                                +---+---+               +---+---+
                                |       |               |       |
                            [Store] [Store]         [Store] [Store]
```

**Benefits:**
- **Cost savings**: 30-40% reduction through bulk shipments to hubs
- **Faster restocks**: Local hubs deliver in 2-4 hours vs 2-3 days from head office
- **Market expansion**: Partner with shipping companies/restaurants to showcase products
- **Scalability**: Add stores in new regions without increasing head office workload

### Region Management (Hybrid Approach)

**7 Default Melbourne Regions:**

```typescript
// utils/melbourneRegions.ts
export const MELBOURNE_DEFAULT_REGIONS = [
  {
    name: 'CBD & Inner City',
    postcodes: ['3000','3002','3004','3006','3008','3010','3065','3066','3067','3121'],
    hub_priority: 'HIGH',
    estimated_stores: 15,
    suggested_hub_location: 'Queen Victoria Market area',
    color: '#DC2626'
  },
  {
    name: 'Northern Corridor',
    postcodes: ['3051','3053','3054','3055','3056','3057','3058','3072','3073','3074'],
    hub_priority: 'HIGH',
    estimated_stores: 12,
    suggested_hub_location: 'Brunswick - Sydney Road',
    color: '#2563EB'
  },
  {
    name: 'Eastern Suburbs',
    postcodes: ['3101','3102','3103','3104','3105','3122','3123','3124'],
    hub_priority: 'MEDIUM',
    estimated_stores: 10,
    color: '#16A34A'
  },
  {
    name: 'Bayside & South',
    postcodes: ['3141','3142','3181','3182','3183','3184','3185'],
    hub_priority: 'MEDIUM',
    estimated_stores: 8,
    color: '#9333EA'
  },
  {
    name: 'Western Suburbs',
    postcodes: ['3011','3012','3013','3015','3016','3020','3021'],
    hub_priority: 'MEDIUM',
    estimated_stores: 9,
    color: '#EA580C'
  },
  {
    name: 'South East Melbourne',
    postcodes: ['3150','3168','3169','3170','3171','3172'],
    hub_priority: 'LOW',
    estimated_stores: 6,
    color: '#CA8A04'
  },
  {
    name: 'Outer Growth Corridors',
    postcodes: ['3023','3029','3030','3977','3975'],
    hub_priority: 'FUTURE',
    estimated_stores: 4,
    color: '#6B7280'
  }
];
```

**Region Features:**
- **Auto-assignment**: Stores automatically assigned to regions by postcode
- **Customizable**: Users can edit default regions or create new ones
- **Visual**: Each region has a color for dashboard visualization
- **Hub planning**: Regions tagged with hub priority (HIGH, MEDIUM, LOW, FUTURE)

### Hub Expansion Economics

**Economic Viability Calculator:**

```typescript
// utils/hubEconomics.ts
export const HUB_COST_ASSUMPTIONS = {
  // Current Direct Shipping
  DIRECT_SHIPPING_COST_PER_SHIPMENT: 15.00,
  SHIPMENTS_PER_STORE_PER_MONTH: 2,
  
  // With Hub
  BULK_SHIPPING_DISCOUNT_RATE: 0.40,  // 40% cheaper for bulk
  LOCAL_DELIVERY_COST_PER_SHIPMENT: 5.00,
  AVERAGE_ORDER_VALUE: 500.00,
  
  // Costs
  DEFAULT_SETUP_COST: 5000.00,
  DEFAULT_STORAGE_FEE: 200.00,
  DEFAULT_COMMISSION_RATE: 5.00,  // percentage
};

export function calculateHubEconomics(
  storeCount: number,
  commissionRate: number,
  storageFee: number,
  setupCost: number
) {
  const currentMonthly = 
    storeCount * 
    HUB_COST_ASSUMPTIONS.SHIPMENTS_PER_STORE_PER_MONTH * 
    HUB_COST_ASSUMPTIONS.DIRECT_SHIPPING_COST_PER_SHIPMENT;
  
  const bulkShipments = 4; // Weekly to hub
  const bulkCost = 
    bulkShipments * 
    (storeCount * 15.00 * (1 - 0.40));
  
  const localDeliveries = 
    storeCount * 2 * 5.00;
  
  const hubCommission = 
    storeCount * 2 * 500.00 * (commissionRate / 100);
  
  const projectedMonthly = 
    bulkCost + localDeliveries + hubCommission + storageFee;
  
  const monthlySavings = currentMonthly - projectedMonthly;
  const breakEvenMonths = monthlySavings > 0 
    ? Math.ceil(setupCost / monthlySavings)
    : null;
  const roi12Months = setupCost > 0
    ? ((monthlySavings * 12) / setupCost) * 100
    : null;
  
  return {
    current: currentMonthly,
    projected: projectedMonthly,
    savings: monthlySavings,
    breakEven: breakEvenMonths,
    roi: roi12Months,
    isViable: monthlySavings > 100 && storeCount >= 3 && breakEvenMonths <= 24
  };
}
```

**Minimum Viability Criteria:**
- **Minimum stores**: 3 stores in target region
- **Minimum savings**: $100/month
- **Maximum break-even**: 24 months
- **Ideal**: 5+ stores, $500+/month savings, 12-month break-even

### Hub Types & Partners

**Three Hub Partner Types:**

1. **Shipping Companies** (Logistics Focus)
   - Primary capability: Warehousing and fast delivery
   - Commission: 5% of product value
   - Best for: High-volume, time-sensitive distribution
   
2. **Restaurants** (Marketing + Distribution)
   - Primary capability: Product showcase to customers
   - Secondary: Local distribution to nearby stores
   - Commission: 7% (higher due to marketing value)
   - Best for: Brand building, new market entry
   
3. **Dedicated Warehouses**
   - Primary capability: Large storage capacity
   - Best for: Mature regions with high volume

### New Database Tables

**Phase 2 adds 4 tables:**

1. **custom_regions** - Geographic regions for hub planning
2. **regional_hubs** - Hub partner management
3. **hub_expansion_scenarios** - Economic planning for new hubs
4. **hub_csv_imports** - Import distributors/partners from CSV

**Enhanced existing tables:**
- `locations` - Added `location_tier`, `hub_capabilities`, `business_model`
- `stock_movements` - Added `movement_tier`, `via_hub_id`, `is_bulk_shipment`

### New Types

```typescript
// types/hub.ts
export interface CustomRegion {
  id: string;
  name: string;
  description: string;
  type: 'default' | 'custom';
  color: string;
  boundary_type: 'postcode_list' | 'geographic_polygon' | 'radius';
  postcodes: string[];
  hub_priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'FUTURE';
  estimated_stores: number;
  suggested_hub_location: string;
  rationale: string;
  is_active: boolean;
}

export interface RegionalHub {
  id: string;
  location_id: string;
  hub_type: 'shipping_company' | 'restaurant' | 'warehouse';
  partner_company_name: string;
  coverage_regions: string[];
  max_storage_capacity: number;
  current_stock_level: number;
  ideal_buffer_stock: number;
  stores_served: number;
  average_delivery_time_hours: number;
  commission_rate: number;
  monthly_storage_fee: number;
  is_active: boolean;
  onboarding_date: string;
}

export interface HubExpansionScenario {
  id: string;
  scenario_name: string;
  target_regions: string[];
  status: 'planning' | 'approved' | 'in_progress' | 'operational' | 'rejected';
  proposed_hub_type: 'shipping_company' | 'restaurant' | 'warehouse';
  partner_company_name?: string;
  
  // Economic Analysis
  stores_in_target_area: number;
  current_total_monthly_cost: number;
  projected_total_monthly_cost: number;
  monthly_savings: number;
  break_even_months: number;
  roi_percentage: number;
  
  // Costs
  setup_cost: number;
  proposed_commission_rate: number;
  proposed_storage_fee: number;
  
  business_case?: string;
  created_at: string;
}

export interface HubCSVImport {
  id: string;
  import_type: 'existing_distributors' | 'prospective_partners';
  file_name: string;
  total_rows: number;
  processed_rows: number;
  failed_rows: number;
  status: 'pending' | 'processed' | 'failed';
  import_date: string;
}
```

### New Routes (Phase 2)

```
/hubs                       → Hub management dashboard
/hubs/expansion/planning    → Hub expansion scenario planning
/hubs/[id]/dashboard        → Individual hub performance
/hubs/csv/import            → CSV import wizard
/settings/regions           → Region management
```

### New Components (Phase 2)

**Hub Management:**
- `HubCard.tsx` - Display hub status and coverage
- `HubScenarioCard.tsx` - Show expansion scenario with economics
- `CreateHubScenarioModal.tsx` - Form for new scenario with preview
- `CSVImportWizard.tsx` - Multi-step CSV import
- `RegionCard.tsx` - Display region with stores and hubs

**Visualizations:**
- `StockFlowDiagram.tsx` - Visualize Head Office → Hub → Store flow
- `EconomicAnalysisChart.tsx` - Break-even and ROI charts
- `RegionHeatMap.tsx` - Map view of regions with store density
- `MelbourneRegionMap.tsx` - Interactive Melbourne region map

**Enhanced Components:**
- `InventoryTable.tsx` - Add "Via Hub" column, tier badges
- `TransferForm.tsx` - Add multi-tier transfer support

### Workflow: Creating a New Hub

1. **Navigate** to `/hubs/expansion/planning`
2. **Click** "Plan New Hub"
3. **Select** target regions (multi-select from 7 defaults)
4. **Choose** hub type (shipping company, restaurant, warehouse)
5. **Enter** partner details (optional at planning stage)
6. **Configure** economic parameters:
   - Commission rate (default 5%)
   - Monthly storage fee (default $200)
   - Setup cost (default $5,000)
7. **Preview** economics - system calculates:
   - Stores in target regions
   - Current monthly cost
   - Projected cost with hub
   - Monthly savings
   - Break-even months
   - 12-month ROI
8. **Viability check**:
   - ✅ Green: ≥3 stores, positive savings, ≤24mo break-even
   - ⚠️ Yellow: Marginal economics, review needed
   - ❌ Red: Not viable
9. **Create** scenario for review
10. **Approve** → Converts to operational hub
11. **Migrate** stores to hub-based distribution

### CSV Import Workflow

**Import Existing Distributors:**
```csv
company_name,contact_person,phone,email,address,region,current_monthly_orders
"ABC Grocery Store","John Smith","0412345678","john@abc.com","123 Main St","CBD",50
```

**Import Prospective Partners:**
```csv
company_name,contact_person,phone,email,address,region,business_type,estimated_capacity,interest_level
"XYZ Shipping Co","Jane Doe","0498765432","jane@xyz.com","456 Hub Rd","North","Shipping Company",1000,"high"
```

**Process:**
1. Upload CSV file
2. System previews first 5 rows
3. Confirm import
4. System processes all rows
5. Creates scenarios or flags for review
6. Show summary: X created, Y duplicates, Z errors

### Multi-Tier Stock Movements

**Movement Types:**

```typescript
type MovementTier = 
  | 'head_to_hub'     // Bulk shipment from HO to hub
  | 'hub_to_store'    // Local delivery from hub to store
  | 'head_to_store'   // Direct (legacy, before hubs)
  | 'store_to_hub';   // Returns

// Enhanced stock_movements record
interface StockMovement {
  // ... existing fields
  movement_tier: MovementTier;
  via_hub_id?: string;
  is_bulk_shipment: boolean;
  expected_delivery_date: string;
}
```

**Restock Logic with Hubs:**

```typescript
// OLD: Direct from Head Office
next_restock_date = last_restock_date + 21 days
source = 'head_office'

// NEW: Via Regional Hub (faster cycle)
if (store.parent_location_id === hub_id) {
  next_restock_date = last_restock_date + 7 days
  source = hub_id
  
  // Hub itself restocks from Head Office every 21 days
  hub.next_bulk_shipment = hub.last_shipment + 21 days
}
```

---

## Frontend Architecture

### Project Structure

```
frontend/
├── src/
│   ├── components/          # React components (18 files)
│   │   ├── AlertApprovalList.tsx
│   │   ├── AlertCard.tsx
│   │   ├── BarChart.tsx
│   │   ├── BatchUpdateModal.tsx
│   │   ├── CategoryFilter.tsx
│   │   ├── DistributorCard.tsx
│   │   ├── DonutChart.tsx
│   │   ├── InventoryDashboard.tsx
│   │   ├── InventoryFilters.tsx
│   │   ├── InventoryTable.tsx
│   │   ├── MapView.tsx
│   │   ├── OfflineIndicator.tsx
│   │   ├── ProductCard.tsx
│   │   ├── PWAInstallPrompt.tsx
│   │   ├── SettingsForm.tsx
│   │   ├── StatCard.tsx
│   │   ├── StoreSettingsForm.tsx
│   │   ├── TransferForm.tsx
│   │   └── ViewToggle.tsx
│   │
│   ├── layouts/             # Astro layouts (1 file)
│   │   └── MainLayout.astro
│   │
│   ├── pages/               # File-based routing (8 files)
│   │   ├── index.astro
│   │   ├── inventory.astro
│   │   ├── products.astro
│   │   ├── settings.astro
│   │   ├── alerts/
│   │   │   ├── pending.astro
│   │   │   └── history.astro
│   │   ├── stores/
│   │   │   └── [id]/
│   │   │       └── settings.astro
│   │   └── transfers/
│   │       ├── index.astro
│   │       └── new.astro
│   │
│   ├── types/               # TypeScript definitions (3 files)
│   │   ├── dashboard.ts
│   │   ├── inventory.ts
│   │   └── product.ts
│   │
│   ├── utils/               # Helper functions (4 files)
│   │   ├── appConfig.ts
│   │   ├── mockAlertsData.ts
│   │   ├── mockData.ts
│   │   ├── mockInventoryData.ts
│   │   └── mockProducts.ts
│   │
│   └── styles/
│       └── global.css       # TailwindCSS imports
│
├── public/
│   ├── pwa-icon.svg
│   └── PWA_ICONS_README.md
│
├── .github/
│   └── workflows/
│       └── typecheck.yml    # CI/CD type checking
│
├── .githooks/
│   ├── pre-commit           # Local type checking
│   └── README.md
│
├── astro.config.mjs         # Astro + PWA config
├── package.json
├── tsconfig.json
└── README.md
```

### Routing

Astro uses file-based routing:

```
/                           → src/pages/index.astro
/inventory                  → src/pages/inventory.astro
/products                   → src/pages/products.astro
/settings                   → src/pages/settings.astro
/alerts/pending             → src/pages/alerts/pending.astro
/alerts/history             → src/pages/alerts/history.astro
/stores/[id]/settings       → src/pages/stores/[id]/settings.astro (dynamic)
/transfers                  → src/pages/transfers/index.astro
/transfers/new              → src/pages/transfers/new.astro
```

### Component Architecture

**Component Types:**

1. **UI Components** - Reusable presentational components
   - StatCard, AlertCard, ProductCard, DistributorCard
   - Charts: BarChart, DonutChart
   - UI Elements: ViewToggle

2. **Feature Components** - Business logic components
   - InventoryDashboard, InventoryTable, InventoryFilters
   - BatchUpdateModal
   - TransferForm
   - AlertApprovalList
   - StoreSettingsForm, SettingsForm
   - CategoryFilter

3. **PWA Components**
   - PWAInstallPrompt - Install prompt for adding to home screen
   - OfflineIndicator - Shows offline status

4. **Layout Components**
   - MainLayout - Primary page layout with navigation

**Client Directives:**

```astro
<!-- Load immediately for critical interactive components -->
<Component client:load prop="value" />

<!-- Load when visible (lazy load) -->
<Component client:visible prop="value" />

<!-- Load when browser idle -->
<Component client:idle prop="value" />

<!-- Only render in browser -->
<Component client:only="react" prop="value" />
```

### State Management

Currently using React's built-in state management:
- `useState` for local component state
- Props drilling for data flow
- No global state management (Zustand or Context API to be added when needed)

---

## TypeScript Type System

### Type Files

**1. product.ts** - Product and category types

```typescript
export type ProductCategory =
  | 'Chili Oil'
  | 'Sauce'
  | 'Condiment'
  | 'Seasoning'
  | 'Oil'
  | 'Vinegar'
  | 'Other';

export interface ProductCategoryInfo {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  productCount: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: ProductCategory;
  retail_price: number;
  unit_cost: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

**2. inventory.ts** - Inventory and stock types

```typescript
export type StockStatus = 'healthy' | 'low' | 'critical' | 'overstocked';
export type RestockTrigger = 'date_due' | 'stock_low' | 'both' | 'emergency' | null;

export interface InventoryItem {
  id: string;
  product_id: string;
  location_id: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  ideal_stock: number;
  stock_status: StockStatus;
  needs_restock: boolean;
  restock_trigger_reason: RestockTrigger;
  last_restock_date?: string;
  next_restock_date?: string;
  restock_cycle_days: number;
  average_daily_sales: number;
  product?: Product;
  location?: Location;
}
```

**3. dashboard.ts** - Dashboard statistics

```typescript
export interface DashboardStats {
  total_units: number;
  total_value: number;
  total_potential_revenue: number;
  total_profit_potential: number;
  low_stock_stores: number;
  critical_stores: number;
  healthy_stores: number;
  restock_overdue: number;
  average_stock_percentage: number;
}
```

### Type Naming Conventions

- **Interfaces:** PascalCase (e.g., `Product`, `InventoryItem`)
- **Type Aliases:** PascalCase (e.g., `StockStatus`, `ProductCategory`)
- **Enums:** Avoid enums, use string literal unions instead
- **Generics:** Single uppercase letter or descriptive (e.g., `<T>`, `<TData>`)

---

## Utility Functions

### Mock Data Files

**appConfig.ts** - Application configuration

```typescript
export const APP_CONFIG = {
  name: "Benjamin's Chili Oil",
  version: '1.0.0',
  currency: 'AUD',
  timezone: 'Australia/Melbourne',
};
```

**mockData.ts** - Location and distributor data

**mockProducts.ts** - Product catalog mock data

**mockInventoryData.ts** - Inventory and dashboard statistics

**mockAlertsData.ts** - Alert queue data

### Future Utilities

When integrating with backend, create:

```
utils/
├── api/
│   ├── client.ts           # Base API client
│   ├── auth.ts             # Authentication
│   ├── products.ts         # Product endpoints
│   └── inventory.ts        # Inventory endpoints
├── formatters/
│   ├── currency.ts         # AUD formatting
│   └── date.ts             # Date/time formatting
├── validators/
│   ├── forms.ts            # Form validation
│   └── phone.ts            # Australian phone validation
└── helpers/
    ├── storage.ts          # LocalStorage wrapper
    └── token.ts            # JWT token management
```

---

## Styling with TailwindCSS

### Configuration

TailwindCSS v4 configured via Vite plugin in `astro.config.mjs`:

```javascript
vite: {
  plugins: [tailwindcss()]
}
```

### Common Patterns

**Color Palette:**
- Primary: Red (`red-600`, `red-700`)
- Secondary: Gray (`gray-50` to `gray-900`)
- Success: Green (`green-600`)
- Warning: Yellow (`yellow-500`)
- Danger: Red (`red-600`)

**Component Patterns:**

```tsx
// Card
<div className="bg-white rounded-lg shadow p-4">

// Button Primary
<button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">

// Input
<input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />

// Container
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

### Responsive Design

Mobile-first approach:

```tsx
<div className="text-sm md:text-base lg:text-lg">
  // Small on mobile, larger on desktop
</div>

<div className="flex flex-col lg:flex-row">
  // Column on mobile, row on desktop
</div>
```

---

## Progressive Web App (PWA)

### Configuration

PWA configured using `@vite-pwa/astro` in `astro.config.mjs`:

```javascript
AstroPWA({
  registerType: 'autoUpdate',
  manifest: {
    name: "Benjamin's Chili Oil - Inventory Management",
    short_name: "BK Chili",
    description: "Inventory and distribution management for Benjamin's Chili Oil",
    theme_color: "#DC2626",
    background_color: "#FFFFFF",
    display: "standalone",
    scope: "/",
    start_url: "/",
    icons: [
      {
        src: "/pwa-icon.svg",
        sizes: "192x192 512x512",
        type: "image/svg+xml",
        purpose: "any maskable"
      }
    ],
    categories: ["business", "productivity"]
  },
  workbox: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\/api\/.*/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 3600
          }
        }
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'image-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 2592000
          }
        }
      }
    ]
  }
})
```

### PWA Features

1. **Offline Support** - Service worker caches API responses and images
2. **Install Prompt** - `PWAInstallPrompt.tsx` component
3. **Offline Indicator** - `OfflineIndicator.tsx` shows connection status
4. **App-like Experience** - Standalone display mode
5. **Auto-update** - Service worker auto-updates on new deployment

### Testing PWA

```bash
npm run build
npm run preview
# Open DevTools > Application > Service Workers
# Test offline mode in DevTools > Network > Offline
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

**File:** `.github/workflows/typecheck.yml`

```yaml
name: Type Check

on:
  push:
    branches: [ main, master, develop ]
  pull_request:
    branches: [ main, master, develop ]

jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: './frontend/package-lock.json'

      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Run type check
        working-directory: ./frontend
        run: npm run typecheck

      - name: Comment on PR (if failed)
        if: failure() && github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: 'Type check failed! Please fix TypeScript errors before merging.'
            })
```

### Local Pre-commit Hook

**File:** `.githooks/pre-commit`

```bash
#!/bin/sh
echo "Running TypeScript type check..."

cd frontend
npm run typecheck

if [ $? -ne 0 ]; then
  echo "Type check failed! Fix TypeScript errors before committing."
  exit 1
fi

echo "Type check passed!"
exit 0
```

### Setup

```bash
# Configure git to use .githooks
git config core.hooksPath .githooks

# Make hook executable
chmod +x .githooks/pre-commit
```

### Type Checking

```bash
# Run manually
cd frontend
npm run typecheck

# Result: 0 errors, 0 warnings, 15 hints (informational)
```

---

## Development Workflow

### Starting Development

```bash
# Install dependencies
cd frontend
npm install

# Start dev server
npm run dev
# Server runs at http://localhost:4321
```

### Building for Production

```bash
# Type check
npm run typecheck

# Build
npm run build

# Preview production build
npm run preview
```

### Common Tasks

**Creating a New Page:**

1. Create file in `src/pages/`
2. Import `MainLayout`
3. Add components with appropriate `client:*` directive
4. Update navigation in `MainLayout.astro`

**Creating a New Component:**

1. Create `.tsx` file in `src/components/`
2. Define TypeScript interface for props
3. Use functional component pattern
4. Export as default
5. Import and use with `client:load` or `client:visible`

**Adding a New Type:**

1. Create/update file in `src/types/`
2. Export interface or type alias
3. Import in components: `import type { Product } from '../types/product';`

### Code Quality

**TypeScript:**
- Strict mode enabled
- No implicit any
- Null checks enabled

**React:**
- Functional components only
- Hooks for state management
- Props interfaces required

**Styling:**
- TailwindCSS utility classes
- Mobile-first responsive design
- Consistent color palette (red primary, gray neutrals)

---

## Current Implementation Status

### Completed (Phase 1A - Admin UI)

**Core Features:**

1. **Inventory Dashboard** (`/inventory`)
   - Real-time stock levels across 10 stores
   - Dashboard statistics (total units, value, revenue, profit)
   - Advanced filtering (status, region, search, restock need)
   - Sortable table with comprehensive columns
   - Visual status indicators (Critical, Low, Healthy)
   - Restock suggestions with urgency levels
   - Batch selection capability

2. **Batch Stock Update**
   - Modal for updating multiple stores
   - Three modes: Set To, Add, Subtract
   - Impact preview before applying
   - Audit trail with reason tracking

3. **Stock Transfer System** (`/transfers/new`)
   - From/To location selection
   - Smart quantity suggestions
   - Transfer types (Scheduled, Emergency, Adjustment)
   - Stock level preview
   - Value calculations
   - Delivery notes

4. **Alert Approval System** (`/alerts/pending`)
   - Pending alerts queue with priority filtering
   - Message preview with character count
   - Context data display
   - Individual actions (Approve, Reject, Edit, Schedule)
   - Bulk approve functionality
   - Alert types (Critical, Low Stock, Upcoming, Overdue, Emergency)

5. **Store Settings** (`/stores/[id]/settings`)
   - Restock settings (cycle days, min/max/ideal stock)
   - Sales velocity input
   - Delivery preferences
   - Seasonal adjustments
   - Notification toggles
   - Contact information management
   - Real-time calculations

6. **Product Catalog** (`/products`)
   - Product grid with filtering by category
   - Product cards with image, SKU, price
   - Category filtering

7. **Dashboard** (`/`)
   - Overview statistics
   - Quick actions
   - Recent activity

8. **PWA Foundation**
   - Service worker configured
   - Manifest.json with app metadata
   - Offline indicator component
   - Install prompt component
   - API and image caching

9. **CI/CD**
   - GitHub Actions workflow for type checking
   - Pre-commit hook for local validation
   - Automated PR comments on failures

### In Progress / Next Steps

**Phase 1B: PWA Enhancement**

1. Push Notifications Infrastructure
   - Web Push API integration
   - Notification permission flow
   - Replace SMS alert approval with Push approval
   - Notification settings page
   - Test notification feature

2. Offline Data Strategy
   - IndexedDB for local storage
   - Queue offline actions
   - Background sync
   - Conflict resolution

**Phase 2: Hub Expansion System (In Progress)**

✅ Completed:
- Database schema with 4 new tables (custom_regions, regional_hubs, hub_expansion_scenarios, hub_csv_imports)
- Interactive map component with OpenStreetMap/Leaflet
- Distributors page (`/distributors`) with hub visualization
- Activity logs page (`/logs`) replacing SMS logs concept
- Hub economics calculator with ROI analysis
- 7 default Melbourne regions with postcode mappings
- Mock data for stores, hubs, and system logs
- Comprehensive documentation (OPENSTREETMAP_INTEGRATION.md, HUB_EXPANSION_IMPLEMENTATION.md)

⏳ Pending (Ready to Build):
1. **Hub Scenario Planning Components**
   - [ ] HubScenarioCard.tsx - Display scenario with economic metrics
   - [ ] CreateHubScenarioModal.tsx - Form with real-time economic preview
   - [ ] `/hubs/expansion/planning` page - Main scenario planning dashboard
   - [ ] Economic calculator integration in UI

2. **CSV Import Wizard**
   - [ ] CSVImportWizard.tsx - Multi-step import workflow
   - [ ] CSV validation logic (headers, data types, required fields)
   - [ ] Preview table before import
   - [ ] Error handling and row-level validation feedback
   - [ ] Success confirmation with imported data summary

3. **Region Management**
   - [ ] `/settings/regions` page - View and manage regions
   - [ ] Custom region creation modal
   - [ ] Postcode assignment interface
   - [ ] Region priority editing
   - [ ] Visual region boundaries on map (future: GeoJSON)

4. **Geocoding Implementation**
   - [ ] Batch geocoding script for existing stores
   - [ ] Address → coordinates conversion via Nominatim API
   - [ ] Rate limiting (1 req/sec) with progress tracking
   - [ ] Store coordinates in database
   - [ ] Manual override for failed geocodes

🔄 Backend Integration Required:
- [ ] `GET /api/stores/locations` - Stores with coordinates
- [ ] `GET /api/hubs/with-coverage` - Hubs with coverage areas
- [ ] `POST /api/hubs/scenarios` - Create expansion scenario
- [ ] `PUT /api/hubs/scenarios/:id` - Update scenario
- [ ] `POST /api/hubs/scenarios/:id/calculate` - Run economics
- [ ] `GET /api/logs` - System activity logs with filters
- [ ] `POST /api/hubs/csv-import` - Bulk import distributors
- [ ] `GET /api/regions` - Custom regions list
- [ ] `POST /api/regions` - Create custom region

**Phase 2B: Store Manager Portal**

1. Authentication System
   - Login/logout flow
   - JWT token management
   - Role-based access control

2. Store Manager Dashboard (Mobile-First)
   - Single-store inventory view
   - Quick stock adjustment
   - Emergency restock button
   - Delivery schedule view

3. PWA-Optimized UX
   - Bottom navigation
   - Pull-to-refresh
   - Swipe gestures
   - Dark mode

**Phase 3: Backend Integration**

1. Replace mock data with real API calls
2. Database setup with PostgreSQL
3. Express.js REST API
4. Authentication endpoints
5. Web Push server setup

**Phase 4: UI Polish**

1. Loading states and skeleton screens
2. Error handling and retry logic
3. Animations and transitions
4. Accessibility improvements
5. Performance optimization

---

## Common Queries and Formulas

### Restock Logic

**Critical Status:** `current_stock <= (minimum_stock * 0.5)`

**Low Stock:** `current_stock <= minimum_stock`

**Needs Restock:**
- Stock is critical OR low
- OR `next_restock_date <= TODAY`

**Next Restock Date:** `last_restock_date + restock_cycle_days`

**Suggested Restock Quantity:**

```sql
GREATEST(
  ideal_stock - current_stock,  -- Deficit from ideal
  average_daily_sales * restock_cycle_days  -- Projected sales
)
```

**Ideal Stock:** `maximum_stock * ideal_stock_percentage / 100`

**Days Until Stockout:** `CEIL(current_stock / average_daily_sales)`

### Profit Calculation

**Profit Per Unit:** `retail_price * (1 - commission_rate / 100) - unit_cost`

**Total Profit Potential:** `current_stock * profit_per_unit`

**Formula:**
```
Profit = (Retail Price × (1 - Commission %)) - Unit Cost
```

Actual values are configured in `business.config.local.ts`.

---

## Testing

### Manual Testing Checklist

- [ ] Inventory dashboard loads with all stores
- [ ] Filtering by status, region works
- [ ] Sorting by columns works
- [ ] Batch update modal opens and updates multiple stores
- [ ] Stock transfer form validates and previews correctly
- [ ] Alert approval list shows pending alerts
- [ ] Store settings form saves and calculates correctly
- [ ] Product filtering by category works
- [ ] PWA installs on mobile device
- [ ] Offline mode works (displays cached data)
- [ ] Type checking passes (`npm run typecheck`)

### Browser Compatibility

- Chrome/Edge (latest)
- Safari (latest)
- Firefox (latest)
- iOS Safari (PWA install)
- Chrome Android (PWA install)

### Type Checking

```bash
cd frontend
npm run typecheck
# Expected: 0 errors, 0 warnings, 15 hints
```

---

## Deployment

### Prerequisites

- Node.js 20+
- npm or yarn
- Git repository

### Environment Variables

Create `.env` file:

```env
# Frontend
PUBLIC_API_URL=https://api.example.com

# Backend (future)
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-secret-key
NODE_ENV=production
```

### Build and Deploy

**Frontend (Vercel/Netlify):**

```bash
cd frontend
npm install
npm run build
# Deploy dist/ directory
```

**Backend (Railway/Render - future):**

```bash
cd backend
npm install
npm run build
npm start
```

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificate active
- [ ] PWA manifest correct
- [ ] Service worker registered
- [ ] Type checking passes
- [ ] Build completes without errors
- [ ] Performance tested (Lighthouse >90)

---

## Troubleshooting

### Common Issues

**Issue:** Type errors in components

**Solution:** Run `npm run typecheck` to see all errors. Fix type mismatches, add proper type annotations.

**Issue:** PWA not installing

**Solution:** Ensure HTTPS in production, check manifest.json is accessible, verify service worker registration.

**Issue:** Offline mode not working

**Solution:** Check service worker in DevTools > Application. Verify caching strategy in `astro.config.mjs`.

**Issue:** Build fails

**Solution:** Delete `node_modules` and `package-lock.json`, run `npm install`, then `npm run build`.

### Debug Mode

```bash
# Enable verbose logging
DEBUG=* npm run dev

# Check build output
npm run build -- --verbose
```

---

## Best Practices

### Component Design

1. Keep components small and focused
2. Use TypeScript interfaces for props
3. Handle loading and error states
4. Make responsive (mobile-first)
5. Add ARIA labels for accessibility

### Code Style

1. Use functional components
2. Prefer `const` over `let`
3. Use destructuring for props
4. Add JSDoc comments for complex logic
5. Follow naming conventions (PascalCase for components, camelCase for functions)

### Performance

1. Use `client:visible` for below-fold components
2. Optimize images (WebP, proper sizing)
3. Lazy load heavy components
4. Use React.memo for expensive renders
5. Monitor bundle size

### Accessibility

1. Use semantic HTML
2. Add alt text to images
3. Ensure keyboard navigation works
4. Test with screen readers
5. Maintain color contrast (WCAG AA)

---

## Resources

### Documentation

- **Astro:** https://docs.astro.build
- **React:** https://react.dev
- **TailwindCSS:** https://tailwindcss.com/docs
- **TypeScript:** https://www.typescriptlang.org/docs
- **PWA:** https://web.dev/progressive-web-apps/

### Tools

- **TypeScript Playground:** https://www.typescriptlang.org/play
- **TailwindCSS Cheat Sheet:** https://nerdcave.com/tailwind-cheat-sheet
- **PWA Builder:** https://www.pwabuilder.com/

---

---

**End of Frontend Development Guide**

This document is the single source of truth for frontend development. All subfolder AGENT.md files are now deprecated and consolidated here.

**Note:** Business-specific information (company details, pricing, store locations, contacts) is stored in `business.config.local.ts` which is gitignored for security. See `business.config.example.ts` for configuration structure.
