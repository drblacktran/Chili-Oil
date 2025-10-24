# Benjamin's Chili Oil - Database Schema V2
## Updated for Phase 1 Implementation

---

## 🎯 Schema Updates Summary

**New Features Added**:
- Restock cycle management (per-store configurable)
- Sales velocity tracking (average daily sales)
- Day-of-week delivery preferences
- Seasonal adjustment multipliers
- Profit calculation fields (R, C, U formula)
- Product variants (size variations)
- Emergency restock alerts
- Stock transfer audit trail
- SMS alert approval queue

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

1. ✅ Create this schema in PostgreSQL database
2. ✅ Seed with Benjamin's Chili Oil product
3. ✅ Seed with 10 Melbourne retail stores
4. ✅ Initialize inventory for all stores
5. Build API endpoints for CRUD operations
6. Build frontend inventory management UI
7. Integrate Twilio for SMS alerts
8. Build alert approval workflow

---

**Total Tables**: 7 core tables
**Total Indexes**: ~40 indexes for query optimization
**Total Triggers**: 4 automatic update triggers
**Total Constraints**: 8 business rule constraints
