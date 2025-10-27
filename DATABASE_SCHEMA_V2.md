# Benjamin's Chili Oil - Database Schema V2
## Updated for Phase 1 Implementation

---

## 🎯 Schema Updates Summary

**Phase 1 Features**:
- Restock cycle management (per-store configurable)
- Sales velocity tracking (average daily sales)
- Day-of-week delivery preferences
- Seasonal adjustment multipliers
- Profit calculation fields (R, C, U formula)
- Product variants (size variations)
- Emergency restock alerts
- Stock transfer audit trail
- SMS alert approval queue

**Phase 2 Features (Hub Expansion)**:
- Multi-tier distribution (Head Office → Regional Hub → Store)
- Regional hub management with partner types
- Hub expansion scenario planning with economic analysis
- Custom region management (hybrid: defaults + user-defined)
- CSV import for distributors and prospective partners
- Automated economic viability calculations
- Multi-tier stock movement tracking

---

## 📊 Core Tables

### 1. products
Product catalog with variants and profit calculation

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Product Hierarchy (for variants)
  parent_product_id UUID REFERENCES products(id), -- NULL for root products
  variant_attributes JSONB, -- {"size": "500ml", "type": "retail"}

  -- Pricing (Customizable Profit Formula: R × (1 - C) - U)
  retail_price DECIMAL(10, 2) NOT NULL DEFAULT 12.80, -- R (Retail Price)
  unit_cost DECIMAL(10, 2) NOT NULL DEFAULT 4.50, -- U (Unit Cost)
  consignment_commission_rate DECIMAL(5, 2) DEFAULT 30.00, -- C (Commission %)
  purchase_commission_rate DECIMAL(5, 2) DEFAULT 30.00,

  currency VARCHAR(3) DEFAULT 'AUD',

  -- Media
  image_url VARCHAR(500),
  image_public_id VARCHAR(255), -- Cloudinary ID
  thumbnail_url VARCHAR(500),

  -- Inventory Settings (defaults for new locations)
  default_minimum_stock INT DEFAULT 30,
  default_maximum_stock INT DEFAULT 50,
  default_restock_cycle_days INT DEFAULT 21,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'discontinued'

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Profit Calculation Helper (can be virtual/computed)
  CONSTRAINT check_profit_params CHECK (
    retail_price > 0 AND
    unit_cost >= 0 AND
    consignment_commission_rate >= 0 AND
    consignment_commission_rate <= 100
  )
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_parent ON products(parent_product_id);
CREATE INDEX idx_products_status ON products(status);
```

**Computed Profit Per Unit**:
```sql
-- Can be a VIEW or computed in application
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

---

### 2. locations
Retail stores with restock management settings

```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'retail_store', -- 'head_office', 'retail_store'
  code VARCHAR(50) UNIQUE NOT NULL, -- e.g., "STORE001", "STORE002"

  -- Contact Information
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL, -- For SMS notifications (Australian format)

  -- Address
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Australia',

  -- Geolocation (for map view)
  latitude DECIMAL(10, 8), -- e.g., -37.8136
  longitude DECIMAL(11, 8), -- e.g., 144.9631
  region VARCHAR(100), -- e.g., 'North', 'East', 'Inner East'

  -- Restock Management Settings (Per-Store Configurable)
  restock_cycle_days INT DEFAULT 21, -- Days between restocks
  minimum_stock_level INT DEFAULT 30, -- Low stock threshold
  maximum_stock_level INT DEFAULT 50, -- Max capacity
  ideal_stock_percentage DECIMAL(5, 2) DEFAULT 80.00, -- % of max (e.g., 80%)

  -- Sales Velocity (Manual Input)
  average_daily_sales DECIMAL(10, 2) DEFAULT 0, -- Units sold per day (manually updated)

  -- Delivery Preferences
  preferred_delivery_day VARCHAR(20), -- 'Monday', 'Tuesday', etc.
  preferred_delivery_time VARCHAR(50), -- 'Morning', 'Afternoon', '9AM-12PM'

  -- Seasonal Adjustments
  seasonal_multiplier DECIMAL(5, 2) DEFAULT 1.00, -- e.g., 1.5 = 50% increase
  seasonal_notes TEXT, -- "Christmas rush", "Lunar New Year"

  -- Relationships
  parent_location_id UUID REFERENCES locations(id), -- Head office reference
  assigned_user_id UUID REFERENCES users(id), -- Store manager user ID

  -- Notification Settings
  sms_notifications_enabled BOOLEAN DEFAULT true,
  email_notifications_enabled BOOLEAN DEFAULT true,
  emergency_restock_enabled BOOLEAN DEFAULT true,

  -- Status
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'suspended'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_locations_type ON locations(type);
CREATE INDEX idx_locations_code ON locations(code);
CREATE INDEX idx_locations_coordinates ON locations(latitude, longitude);
CREATE INDEX idx_locations_region ON locations(region);
CREATE INDEX idx_locations_status ON locations(status);
```

---

### 3. inventory
Current stock levels per product per location

```sql
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,

  -- Stock Levels
  current_stock INT NOT NULL DEFAULT 0,
  minimum_stock INT NOT NULL, -- Copied from location or product defaults
  maximum_stock INT NOT NULL,
  ideal_stock INT GENERATED ALWAYS AS (
    CAST(maximum_stock * ideal_stock_percentage / 100.0 AS INT)
  ) STORED, -- Auto-calculated: max × percentage

  -- Restock Tracking
  last_restock_date DATE,
  next_restock_date DATE, -- Auto-calculated: last_restock_date + cycle_days
  restock_cycle_days INT NOT NULL DEFAULT 21, -- Copied from location

  -- Sales Velocity Projection
  average_daily_sales DECIMAL(10, 2) DEFAULT 0, -- Copied from location
  projected_stockout_date DATE, -- Calculated: current / daily_sales
  days_until_stockout INT, -- today - projected_stockout_date

  -- Value Calculations
  stock_value DECIMAL(12, 2) GENERATED ALWAYS AS (
    current_stock * (SELECT unit_cost FROM products WHERE id = product_id)
  ) STORED, -- current_stock × unit_cost

  potential_revenue DECIMAL(12, 2) GENERATED ALWAYS AS (
    current_stock * (SELECT retail_price FROM products WHERE id = product_id)
  ) STORED, -- current_stock × retail_price

  -- Settings Reference (for overrides)
  ideal_stock_percentage DECIMAL(5, 2) DEFAULT 80.00,

  -- Status Indicators
  stock_status VARCHAR(20), -- 'healthy', 'low', 'critical', 'overstocked'
  needs_restock BOOLEAN DEFAULT false,
  restock_trigger_reason TEXT, -- 'date_due', 'stock_low', 'both', 'emergency'

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_counted_at TIMESTAMP, -- Last physical inventory count

  UNIQUE(product_id, location_id)
);

CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_location ON inventory(location_id);
CREATE INDEX idx_inventory_status ON inventory(stock_status);
CREATE INDEX idx_inventory_needs_restock ON inventory(needs_restock);
CREATE INDEX idx_inventory_next_restock ON inventory(next_restock_date);
```

**Inventory Update Triggers**:
```sql
-- Auto-update next_restock_date when last_restock_date changes
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

-- Auto-update stock_status based on levels
CREATE OR REPLACE FUNCTION update_stock_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Critical: 50% below minimum
  IF NEW.current_stock <= (NEW.minimum_stock * 0.5) THEN
    NEW.stock_status := 'critical';
    NEW.needs_restock := true;
    NEW.restock_trigger_reason := 'stock_critical';

  -- Low: at or below minimum
  ELSIF NEW.current_stock <= NEW.minimum_stock THEN
    NEW.stock_status := 'low';
    NEW.needs_restock := true;
    NEW.restock_trigger_reason := 'stock_low';

  -- Overstocked: above maximum
  ELSIF NEW.current_stock > NEW.maximum_stock THEN
    NEW.stock_status := 'overstocked';
    NEW.needs_restock := false;

  -- Healthy
  ELSE
    NEW.stock_status := 'healthy';

    -- Check if restock due by date
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

-- Auto-calculate projected stockout date
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

---

### 4. stock_movements
Audit trail of all stock transfers and adjustments

```sql
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),

  -- Source and Destination
  from_location_id UUID REFERENCES locations(id), -- NULL for new stock
  to_location_id UUID REFERENCES locations(id), -- NULL for wastage/loss

  -- Movement Details
  quantity INT NOT NULL,
  movement_type VARCHAR(50) NOT NULL, -- 'transfer', 'adjustment', 'sale', 'return', 'wastage', 'emergency'
  movement_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Context
  reason TEXT, -- Free-text explanation
  notes TEXT,
  reference_number VARCHAR(100), -- External reference (invoice, delivery note)

  -- Approval (for emergency restocks)
  requires_approval BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  approval_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'

  -- Stock Snapshot (before movement)
  from_stock_before INT,
  from_stock_after INT,
  to_stock_before INT,
  to_stock_after INT,

  -- User Tracking
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Cost Tracking
  unit_cost_at_time DECIMAL(10, 2), -- Historical cost
  total_value DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * unit_cost_at_time) STORED
);

CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_from_location ON stock_movements(from_location_id);
CREATE INDEX idx_stock_movements_to_location ON stock_movements(to_location_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX idx_stock_movements_date ON stock_movements(movement_date);
CREATE INDEX idx_stock_movements_approval ON stock_movements(approval_status);
```

---

### 5. alert_queue
SMS/Email alerts pending approval

```sql
CREATE TABLE alert_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES locations(id),
  product_id UUID NOT NULL REFERENCES products(id),

  -- Alert Classification
  alert_type VARCHAR(50) NOT NULL, -- 'critical', 'low_stock', 'upcoming_restock', 'overdue', 'emergency_request'
  trigger_reason TEXT, -- Explanation of why alert was created
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'

  -- Message Content
  sms_message TEXT NOT NULL,
  email_subject VARCHAR(255),
  email_body TEXT,

  -- Recipient
  recipient_name VARCHAR(255),
  recipient_phone VARCHAR(20),
  recipient_email VARCHAR(255),

  -- Approval Workflow
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'sent', 'failed', 'rejected', 'cancelled'
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  rejection_reason TEXT,

  -- Scheduling
  scheduled_send_at TIMESTAMP, -- NULL = send immediately after approval
  sent_at TIMESTAMP,

  -- Twilio Response
  provider_message_id VARCHAR(255), -- Twilio SID
  provider_status VARCHAR(50), -- 'queued', 'sent', 'delivered', 'failed'
  provider_error TEXT,

  -- Context Data (for reference)
  context_data JSONB, -- {current_stock: 10, min_stock: 30, next_restock: "2025-10-26"}

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

---

### 6. users
System users (admin and future store managers)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),

  -- Role-Based Access Control
  role VARCHAR(50) NOT NULL DEFAULT 'store_manager', -- 'admin', 'store_manager', 'viewer'
  assigned_location_id UUID REFERENCES locations(id), -- For store managers

  -- Status
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'suspended'
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

---

### 7. sms_logs
Complete history of all SMS sent

```sql
CREATE TABLE sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Alert Reference (nullable for manual SMS)
  alert_id UUID REFERENCES alert_queue(id),

  -- Recipient
  location_id UUID REFERENCES locations(id),
  phone_number VARCHAR(20) NOT NULL,
  recipient_name VARCHAR(255),

  -- Message
  message_body TEXT NOT NULL,
  message_type VARCHAR(50), -- 'low_stock', 'restock_reminder', 'manual', 'emergency'

  -- Twilio Response
  provider VARCHAR(50) DEFAULT 'twilio',
  provider_message_id VARCHAR(255), -- Twilio SID
  provider_status VARCHAR(50), -- 'queued', 'sent', 'delivered', 'failed', 'undelivered'
  provider_error_code VARCHAR(50),
  provider_error_message TEXT,

  -- Costs
  message_segments INT DEFAULT 1, -- Number of SMS segments
  cost_per_segment DECIMAL(6, 4), -- Cost in AUD
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

---

## 🔄 Sample Data Initialization

### Insert Benjamin's Chili Oil (Root Product)

```sql
INSERT INTO products (
  sku, name, description,
  retail_price, unit_cost,
  consignment_commission_rate, purchase_commission_rate,
  currency,
  default_minimum_stock, default_maximum_stock, default_restock_cycle_days,
  is_active, is_featured
) VALUES (
  'BK-CHILI-RETAIL',
  'Benjamin''s Chili Oil',
  'Premium handcrafted chili oil, perfect for any dish',
  12.80, 4.50,
  30.00, 30.00,
  'AUD',
  30, 50, 21,
  true, true
);
```

### Insert Head Office

```sql
INSERT INTO locations (
  name, type, code,
  contact_person, email, phone,
  address_line1, city, state, postal_code, country,
  latitude, longitude, region,
  restock_cycle_days, minimum_stock_level, maximum_stock_level,
  status
) VALUES (
  'Benjamin''s Kitchen', 'head_office', 'HQ001',
  'Tien Tran', 'tien@benjamins.com.au', '0466891665',
  '758 Heidelberg Road', 'Alphington', 'Victoria', '3078', 'Australia',
  -37.7851, 145.0307, 'North East',
  21, 100, 500, -- Head office holds more stock
  'active'
);
```

### Insert 10 Retail Stores (Batch)

```sql
INSERT INTO locations (
  name, type, code,
  contact_person, phone,
  address_line1, city, state, postal_code,
  latitude, longitude, region,
  restock_cycle_days, minimum_stock_level, maximum_stock_level,
  average_daily_sales, preferred_delivery_day,
  parent_location_id
) VALUES
-- Store 1
('Greenmart', 'retail_store', 'STORE002',
 'Bill', '0493360404',
 '1226 Toorak Road', 'Camberwell', 'Victoria', '3124',
 -37.8569, 145.0624, 'East',
 21, 30, 50, 2.0, 'Monday',
 (SELECT id FROM locations WHERE code = 'HQ001')),

-- Store 2
('Chat Phat Supermarket', 'retail_store', 'STORE003',
 'Victor', '0413886507',
 '162/164 Victoria St', 'Richmond', 'Victoria', '3121',
 -37.8199, 144.9976, 'Inner East',
 21, 30, 50, 1.5, 'Tuesday',
 (SELECT id FROM locations WHERE code = 'HQ001')),

-- ... (repeat for all 10 stores)
;
```

### Initialize Inventory for All Stores

```sql
INSERT INTO inventory (
  product_id, location_id,
  current_stock, minimum_stock, maximum_stock,
  last_restock_date, restock_cycle_days,
  average_daily_sales
)
SELECT
  p.id AS product_id,
  l.id AS location_id,
  30 AS current_stock, -- Starting stock
  l.minimum_stock_level,
  l.maximum_stock_level,
  CURRENT_DATE - INTERVAL '10 days' AS last_restock_date,
  l.restock_cycle_days,
  l.average_daily_sales
FROM products p
CROSS JOIN locations l
WHERE p.sku = 'BK-CHILI-RETAIL'
  AND l.type = 'retail_store';
```

---

## 📊 Useful Queries

### Get Stores Needing Restock

```sql
SELECT
  l.code,
  l.name,
  i.current_stock,
  i.minimum_stock,
  i.next_restock_date,
  i.stock_status,
  i.needs_restock,
  i.restock_trigger_reason,
  CASE
    WHEN i.next_restock_date <= CURRENT_DATE THEN 'OVERDUE'
    WHEN i.next_restock_date <= CURRENT_DATE + INTERVAL '3 days' THEN 'UPCOMING'
    ELSE 'SCHEDULED'
  END AS restock_urgency
FROM inventory i
JOIN locations l ON i.location_id = l.id
JOIN products p ON i.product_id = p.id
WHERE i.needs_restock = true
ORDER BY
  i.stock_status DESC, -- critical first
  i.next_restock_date ASC;
```

### Calculate Suggested Restock Quantity

```sql
SELECT
  l.name,
  i.current_stock,
  i.ideal_stock,
  i.average_daily_sales,
  i.restock_cycle_days,
  -- Deficit from ideal
  (i.ideal_stock - i.current_stock) AS deficit,
  -- Expected sales during cycle
  (i.average_daily_sales * i.restock_cycle_days) AS projected_sales,
  -- Suggested restock (greater of deficit or projected sales)
  GREATEST(
    i.ideal_stock - i.current_stock,
    i.average_daily_sales * i.restock_cycle_days
  )::INT AS suggested_restock_qty
FROM inventory i
JOIN locations l ON i.location_id = l.id
WHERE i.needs_restock = true;
```

### Profit Analysis by Store

```sql
SELECT
  l.name AS store,
  i.current_stock,
  p.unit_cost,
  p.retail_price,
  p.consignment_commission_rate,
  calculate_profit(p.retail_price, p.consignment_commission_rate, p.unit_cost) AS profit_per_unit,
  i.current_stock * calculate_profit(p.retail_price, p.consignment_commission_rate, p.unit_cost) AS potential_profit
FROM inventory i
JOIN locations l ON i.location_id = l.id
JOIN products p ON i.product_id = p.id
ORDER BY potential_profit DESC;
```

---

## 🔐 Database Constraints & Business Rules

```sql
-- Ensure stock levels are non-negative
ALTER TABLE inventory ADD CONSTRAINT check_stock_non_negative
CHECK (current_stock >= 0);

-- Ensure minimum <= maximum
ALTER TABLE inventory ADD CONSTRAINT check_min_max_stock
CHECK (minimum_stock <= maximum_stock);

-- Ensure cycle days is positive
ALTER TABLE inventory ADD CONSTRAINT check_cycle_days
CHECK (restock_cycle_days > 0);

-- Ensure profit formula parameters are valid
ALTER TABLE products ADD CONSTRAINT check_pricing
CHECK (
  retail_price >= unit_cost AND
  consignment_commission_rate BETWEEN 0 AND 100 AND
  purchase_commission_rate BETWEEN 0 AND 100
);

-- Ensure stock movements have valid source/destination
ALTER TABLE stock_movements ADD CONSTRAINT check_movement_locations
CHECK (
  (from_location_id IS NOT NULL OR to_location_id IS NOT NULL) AND
  (from_location_id != to_location_id OR from_location_id IS NULL OR to_location_id IS NULL)
);
```

---

## 🎯 Next Steps

### Phase 1 - Current System (Completed)
1. ✅ Create this schema in PostgreSQL database
2. ✅ Seed with Benjamin's Chili Oil product
3. ✅ Seed with 10 Melbourne retail stores
4. ✅ Initialize inventory for all stores
5. ✅ Build frontend inventory management UI
6. Build API endpoints for CRUD operations
7. Integrate Twilio for SMS alerts (or migrate to Web Push)
8. Build alert approval workflow

### Phase 2 - Hub Expansion System (In Progress)
1. Implement custom_regions table with 7 default Melbourne regions
2. Implement regional_hubs table for partner management
3. Implement hub_expansion_scenarios for economic planning
4. Build hub economics calculation engine
5. Create hub planning dashboard UI
6. Build CSV import wizard for distributors/partners
7. Implement multi-tier stock transfer system
8. Build region management interface

---

**Total Tables**: 11 core tables (7 Phase 1 + 4 Phase 2)
**Total Indexes**: ~60 indexes for query optimization
**Total Triggers**: 5 automatic update triggers
**Total Functions**: 2 (profit calculation + hub economics)
**Total Constraints**: 10 business rule constraints

---

## 📋 Phase 2: Hub Expansion Tables

### 8. custom_regions
User-defined or default geographic regions for hub planning

```sql
CREATE TABLE custom_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Region Type
  type VARCHAR(50) DEFAULT 'default', -- 'default' (system-provided), 'custom' (user-created)
  
  -- Visual
  color VARCHAR(7) DEFAULT '#6B7280', -- Hex color for UI (#DC2626)
  
  -- Boundary Definition
  boundary_type VARCHAR(50) DEFAULT 'postcode_list', 
  -- 'postcode_list', 'geographic_polygon', 'radius', 'manual_assignment'
  
  -- Method 1: Postcode List (Primary method)
  postcodes TEXT[], -- ['3000', '3002', '3004']
  
  -- Method 2: Geographic Polygon (Future - GeoJSON)
  boundary_polygon JSONB, -- GeoJSON polygon for map-based boundaries
  
  -- Method 3: Radius from Point (Future)
  center_latitude DECIMAL(10, 8),
  center_longitude DECIMAL(11, 8),
  radius_km DECIMAL(5, 2),
  
  -- Hub Planning
  hub_priority VARCHAR(50) DEFAULT 'MEDIUM', -- 'HIGH', 'MEDIUM', 'LOW', 'FUTURE'
  estimated_stores INT DEFAULT 0, -- Auto-calculated
  suggested_hub_location TEXT, -- "Brunswick - Sydney Road"
  
  -- Business Context
  rationale TEXT, -- Why this region exists
  transport_access TEXT, -- "Hume Highway, Sydney Road"
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_regions_type ON custom_regions(type);
CREATE INDEX idx_regions_active ON custom_regions(is_active);
CREATE INDEX idx_regions_postcodes ON custom_regions USING GIN(postcodes); -- Array search
```

---

### 9. regional_hubs
Regional distribution hubs (shipping companies, restaurants, warehouses)

```sql
CREATE TABLE regional_hubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES locations(id) UNIQUE, -- Links to locations table
  
  -- Hub Details
  hub_type VARCHAR(50) NOT NULL, -- 'shipping_company', 'restaurant', 'warehouse'
  partner_company_name VARCHAR(255),
  coverage_regions TEXT[], -- Region names: ['CBD & Inner City', 'Northern Corridor']
  
  -- Capacity Planning
  max_storage_capacity INT DEFAULT 1000,
  current_stock_level INT DEFAULT 0, -- Auto-updated from inventory
  ideal_buffer_stock INT DEFAULT 200, -- Emergency stock buffer
  
  -- Performance Metrics
  stores_served INT DEFAULT 0, -- Auto-calculated
  average_delivery_time_hours DECIMAL(5,2), -- 2.5 hours average
  total_monthly_shipments INT DEFAULT 0,
  
  -- Business Terms
  commission_rate DECIMAL(5, 2) DEFAULT 5.00, -- Hub takes 5% commission
  monthly_storage_fee DECIMAL(10, 2) DEFAULT 200.00,
  contract_duration_months INT DEFAULT 12,
  contract_start_date DATE,
  contract_end_date DATE,
  
  -- Financial Tracking
  total_commission_earned DECIMAL(10, 2) DEFAULT 0.00,
  total_storage_fees_paid DECIMAL(10, 2) DEFAULT 0.00,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  onboarding_date DATE,
  operational_since DATE,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hubs_type ON regional_hubs(hub_type);
CREATE INDEX idx_hubs_active ON regional_hubs(is_active);
CREATE INDEX idx_hubs_coverage ON regional_hubs USING GIN(coverage_regions);
```

---

### 10. hub_expansion_scenarios
Economic planning for potential new hubs

```sql
CREATE TABLE hub_expansion_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Scenario Details
  scenario_name VARCHAR(255) NOT NULL,
  target_regions TEXT[] NOT NULL, -- ['North', 'North-East']
  status VARCHAR(50) DEFAULT 'planning', 
  -- 'planning', 'approved', 'in_progress', 'operational', 'rejected'
  
  -- Partner Information
  proposed_hub_type VARCHAR(50), -- 'shipping_company', 'restaurant', 'warehouse'
  partner_company_name VARCHAR(255),
  partner_contact_person VARCHAR(255),
  partner_phone VARCHAR(50),
  partner_email VARCHAR(255),
  
  -- Location Details
  proposed_address TEXT,
  proposed_latitude DECIMAL(10, 8),
  proposed_longitude DECIMAL(11, 8),
  
  -- Capacity Planning
  proposed_storage_capacity INT,
  proposed_buffer_stock INT,
  
  -- Current State Analysis (Auto-calculated)
  stores_in_target_area INT,
  current_monthly_shipments INT,
  current_avg_delivery_cost DECIMAL(10, 2),
  current_total_monthly_cost DECIMAL(10, 2),
  
  -- Projected State with Hub (Auto-calculated)
  projected_monthly_bulk_shipments INT,
  projected_bulk_shipment_cost DECIMAL(10, 2),
  projected_local_delivery_cost DECIMAL(10, 2),
  projected_hub_commission DECIMAL(10, 2),
  projected_storage_fee DECIMAL(10, 2),
  projected_total_monthly_cost DECIMAL(10, 2),
  
  -- Economic Analysis (Auto-calculated)
  monthly_savings DECIMAL(10, 2), -- current - projected
  break_even_months INT, -- Setup cost / monthly_savings
  roi_percentage DECIMAL(5, 2), -- (savings * 12) / setup_cost * 100
  
  -- Setup Costs
  setup_cost DECIMAL(10, 2) DEFAULT 5000.00, -- One-time: equipment, training
  estimated_monthly_operating_cost DECIMAL(10, 2),
  
  -- Business Terms
  proposed_commission_rate DECIMAL(5, 2) DEFAULT 5.00,
  proposed_storage_fee DECIMAL(10, 2) DEFAULT 200.00,
  contract_duration_months INT DEFAULT 12,
  
  -- Decision Tracking
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  
  -- Notes
  business_case TEXT,
  risk_assessment TEXT,
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scenarios_status ON hub_expansion_scenarios(status);
CREATE INDEX idx_scenarios_target ON hub_expansion_scenarios USING GIN(target_regions);
CREATE INDEX idx_scenarios_created ON hub_expansion_scenarios(created_at DESC);
```

---

### 11. hub_csv_imports
Track CSV imports of distributors and prospective partners

```sql
CREATE TABLE hub_csv_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Import Metadata
  import_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  imported_by UUID REFERENCES users(id),
  file_name VARCHAR(255),
  total_rows INT,
  
  -- Import Type
  import_type VARCHAR(50) NOT NULL, 
  -- 'existing_distributors' (already working with us)
  -- 'prospective_partners' (potential hubs to contact)
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processed', 'failed'
  processed_rows INT DEFAULT 0,
  failed_rows INT DEFAULT 0,
  error_log JSONB,
  
  -- Preview Data
  sample_data JSONB, -- First 5 rows for review
  
  -- Processing
  processed_at TIMESTAMP,
  processing_duration_seconds INT
);

CREATE TABLE hub_csv_import_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id UUID REFERENCES hub_csv_imports(id) ON DELETE CASCADE,
  
  -- CSV Row Data
  row_number INT,
  raw_data JSONB, -- Store entire row as JSON
  
  -- Parsed Common Fields
  company_name VARCHAR(255),
  contact_person VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  region VARCHAR(100),
  
  -- For existing_distributors
  current_location_id UUID REFERENCES locations(id),
  average_monthly_orders INT,
  relationship_status VARCHAR(50), -- 'active', 'inactive', 'pending'
  
  -- For prospective_partners
  business_type VARCHAR(100), -- 'Shipping Company', 'Restaurant', 'Warehouse'
  estimated_capacity INT,
  interest_level VARCHAR(50), -- 'high', 'medium', 'low', 'cold_lead'
  
  -- Processing Status
  status VARCHAR(50) DEFAULT 'pending', 
  -- 'pending', 'converted_to_scenario', 'converted_to_hub', 'rejected', 'duplicate'
  
  converted_to_scenario_id UUID REFERENCES hub_expansion_scenarios(id),
  converted_to_hub_id UUID REFERENCES regional_hubs(id),
  
  processing_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_csv_import_rows_import ON hub_csv_import_rows(import_id);
CREATE INDEX idx_csv_import_rows_status ON hub_csv_import_rows(status);
```

---

## 📐 Phase 2: Enhanced Existing Tables

### Enhanced locations table (Multi-tier support)

```sql
-- Add columns to existing locations table
ALTER TABLE locations
ADD COLUMN location_tier VARCHAR(50) DEFAULT 'retail_store';
-- Values: 'head_office', 'regional_hub', 'retail_store'

ALTER TABLE locations
ADD COLUMN hub_capabilities JSONB;
-- Example: {
--   "warehousing": true,
--   "product_showcase": true,
--   "emergency_stock": 200,
--   "serves_regions": ["North", "North-East"]
-- }

ALTER TABLE locations
ADD COLUMN business_model VARCHAR(50) DEFAULT 'retail';
-- Values: 'manufacturer', 'logistics_partner', 'restaurant_partner', 'retail'

-- region field becomes more important (links to custom_regions.name)
-- parent_location_id now has clear meaning:
--   - NULL = Head Office
--   - HUB_ID = Retail stores under a hub
--   - HEAD_OFFICE_ID = Hubs reporting to head office

CREATE INDEX idx_locations_tier ON locations(location_tier);
CREATE INDEX idx_locations_business_model ON locations(business_model);
```

### Enhanced stock_movements table (Multi-tier tracking)

```sql
ALTER TABLE stock_movements
ADD COLUMN movement_tier VARCHAR(50);
-- Values: 
-- 'head_to_hub' (bulk shipment from HO to hub)
-- 'hub_to_store' (local distribution from hub to store)
-- 'head_to_store' (direct, legacy before hubs)
-- 'store_to_hub' (returns)

ALTER TABLE stock_movements
ADD COLUMN via_hub_id UUID REFERENCES locations(id);
-- Track which hub facilitated this transfer

ALTER TABLE stock_movements
ADD COLUMN is_bulk_shipment BOOLEAN DEFAULT false;

ALTER TABLE stock_movements
ADD COLUMN expected_delivery_date DATE;

CREATE INDEX idx_movements_tier ON stock_movements(movement_tier);
CREATE INDEX idx_movements_via_hub ON stock_movements(via_hub_id);
```

---

## ⚙️ Phase 2: Functions & Calculations

### Hub Economic Viability Calculator

```sql
CREATE OR REPLACE FUNCTION calculate_hub_economics(
  p_scenario_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_scenario hub_expansion_scenarios%ROWTYPE;
  v_stores_count INT;
  v_current_cost DECIMAL(10,2);
  v_projected_cost DECIMAL(10,2);
  v_bulk_shipment_cost DECIMAL(10,2);
  v_local_delivery_cost DECIMAL(10,2);
  v_hub_commission DECIMAL(10,2);
  v_storage_fee DECIMAL(10,2);
  v_result JSONB;
BEGIN
  -- Get scenario details
  SELECT * INTO v_scenario FROM hub_expansion_scenarios WHERE id = p_scenario_id;
  
  -- Count stores in target regions
  SELECT COUNT(*) INTO v_stores_count
  FROM locations
  WHERE region = ANY(v_scenario.target_regions)
    AND location_tier = 'retail_store'
    AND status = 'active';
  
  -- Calculate current costs (direct shipping from Head Office)
  -- Assumption: $15 per shipment, 2 shipments per store per month
  v_current_cost := v_stores_count * 2 * 15.00;
  
  -- Calculate projected costs with hub
  -- Bulk shipment from Head Office to Hub (weekly = 4 times/month)
  -- Bulk rate is 60% of individual shipping (40% discount)
  v_bulk_shipment_cost := 4 * (v_stores_count * 15.00 * 0.60);
  
  -- Local delivery from Hub to Stores (2 times/month per store)
  -- Local delivery is $5 per shipment (cheaper, shorter distance)
  v_local_delivery_cost := v_stores_count * 2 * 5.00;
  
  -- Hub commission (% of product value)
  -- Assumption: Average order value $500
  v_hub_commission := v_stores_count * 2 * 500 * 
                      (COALESCE(v_scenario.proposed_commission_rate, 5.00) / 100.0);
  
  -- Storage fee (flat monthly)
  v_storage_fee := COALESCE(v_scenario.proposed_storage_fee, 200.00);
  
  v_projected_cost := v_bulk_shipment_cost + v_local_delivery_cost + 
                      v_hub_commission + v_storage_fee;
  
  -- Build result JSON
  v_result := jsonb_build_object(
    'stores_count', v_stores_count,
    'current_monthly_cost', v_current_cost,
    'projected_costs', jsonb_build_object(
      'bulk_shipments', v_bulk_shipment_cost,
      'local_deliveries', v_local_delivery_cost,
      'hub_commission', v_hub_commission,
      'storage_fee', v_storage_fee,
      'total', v_projected_cost
    ),
    'monthly_savings', v_current_cost - v_projected_cost,
    'break_even_months', CASE 
      WHEN (v_current_cost - v_projected_cost) > 0 
      THEN CEIL(COALESCE(v_scenario.setup_cost, 5000.00) / (v_current_cost - v_projected_cost))
      ELSE NULL 
    END,
    'roi_12_months', CASE
      WHEN COALESCE(v_scenario.setup_cost, 0) > 0
      THEN ((v_current_cost - v_projected_cost) * 12 / v_scenario.setup_cost * 100)
      ELSE NULL
    END,
    'is_economical', (v_current_cost - v_projected_cost) > 0 AND v_stores_count >= 3
  );
  
  -- Update scenario with calculations
  UPDATE hub_expansion_scenarios SET
    stores_in_target_area = v_stores_count,
    current_total_monthly_cost = v_current_cost,
    projected_total_monthly_cost = v_projected_cost,
    monthly_savings = v_current_cost - v_projected_cost,
    break_even_months = (v_result->>'break_even_months')::INT,
    roi_percentage = (v_result->>'roi_12_months')::DECIMAL(5,2),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = p_scenario_id;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Usage:
-- SELECT calculate_hub_economics('scenario-uuid-here');
```

### Auto-assign Store to Region by Postcode

```sql
CREATE OR REPLACE FUNCTION auto_assign_store_region()
RETURNS TRIGGER AS $$
DECLARE
  v_postcode VARCHAR(4);
  v_region custom_regions%ROWTYPE;
BEGIN
  -- Extract 4-digit postcode from postal_code field
  v_postcode := substring(NEW.postal_code FROM '\d{4}');
  
  IF v_postcode IS NOT NULL THEN
    -- Find region that contains this postcode
    SELECT * INTO v_region
    FROM custom_regions
    WHERE v_postcode = ANY(postcodes)
      AND is_active = true
    LIMIT 1;
    
    IF FOUND THEN
      NEW.region := v_region.name;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-assign region when store is created or postal_code updated
CREATE TRIGGER trigger_auto_assign_region
BEFORE INSERT OR UPDATE OF postal_code ON locations
FOR EACH ROW
WHEN (NEW.location_tier = 'retail_store')
EXECUTE FUNCTION auto_assign_store_region();
```

---

## 🌱 Phase 2: Seed Data

### Default Melbourne Regions (7 Hub-Friendly Regions)

```sql
-- Insert 7 default Melbourne regions optimized for hub planning
INSERT INTO custom_regions (
  name, description, type, color, postcodes, hub_priority, 
  suggested_hub_location, rationale, transport_access
) VALUES
(
  'CBD & Inner City',
  'Melbourne CBD and immediate surrounds',
  'default',
  '#DC2626',
  ARRAY['3000','3002','3004','3006','3008','3010','3065','3066','3067','3121'],
  'HIGH',
  'Queen Victoria Market area',
  'Highest density, can serve on same day',
  'All major roads converge here'
),
(
  'Northern Corridor',
  'Inner and outer northern suburbs',
  'default',
  '#2563EB',
  ARRAY['3051','3053','3054','3055','3056','3057','3058','3072','3073','3074','3075','3076'],
  'HIGH',
  'Brunswick - Sydney Road',
  'Strong food scene, high Asian demographic',
  'Hume Highway, Sydney Road'
),
(
  'Eastern Suburbs',
  'Box Hill, Doncaster, eastern corridor',
  'default',
  '#16A34A',
  ARRAY['3101','3102','3103','3104','3105','3122','3123','3124','3125','3126'],
  'MEDIUM',
  'Box Hill Central',
  'Large Asian community, affluent suburbs',
  'Eastern Freeway, Maroondah Highway'
),
(
  'Bayside & South',
  'South Melbourne, Port Melbourne, St Kilda, bayside suburbs',
  'default',
  '#9333EA',
  ARRAY['3141','3142','3181','3182','3183','3184','3185','3186','3187','3188'],
  'MEDIUM',
  'Chapel Street or St Kilda',
  'Tourism + residential mix',
  'St Kilda Road, Nepean Highway'
),
(
  'Western Suburbs',
  'Footscray, Sunshine, western corridor',
  'default',
  '#EA580C',
  ARRAY['3011','3012','3013','3015','3016','3020','3021','3022','3023'],
  'MEDIUM',
  'Footscray Market',
  'Multicultural, growing food scene',
  'West Gate Freeway, Ballarat Road'
),
(
  'South East Melbourne',
  'Springvale, Dandenong, south-eastern suburbs',
  'default',
  '#CA8A04',
  ARRAY['3150','3168','3169','3170','3171','3172','3173','3174','3175'],
  'LOW',
  'Springvale or Dandenong',
  'Further out, but growing population',
  'Monash Freeway, Princes Highway'
),
(
  'Outer Growth Corridors',
  'Werribee, Cranbourne, Pakenham - future growth areas',
  'default',
  '#6B7280',
  ARRAY['3023','3029','3030','3977','3975','3810','3805'],
  'FUTURE',
  'TBD - wait for density',
  'Low density now, high growth potential',
  'Western Highway, South Gippsland Highway'
)
ON CONFLICT DO NOTHING;

-- Update estimated_stores counts based on actual locations
UPDATE custom_regions r
SET estimated_stores = (
  SELECT COUNT(*)
  FROM locations l
  WHERE l.region = r.name
    AND l.location_tier = 'retail_store'
    AND l.status = 'active'
),
updated_at = CURRENT_TIMESTAMP
WHERE type = 'default';
```
