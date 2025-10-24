# Chili Oil Distribution System - Database Schema

## Overview
This schema supports a multi-level distribution system with head office, distributors, inventory tracking, and foundation for payment/order management.

---

## Core Tables

### 1. users
Manages all system users (head office staff, distributors, admins)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('admin', 'head_office', 'distributor') NOT NULL,
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

---

### 2. locations
Represents head centres and distributor locations

```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type ENUM('head_centre', 'distributor') NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL, -- e.g., "HC001", "DIST001"
  
  -- Contact Information
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL, -- For SMS notifications
  
  -- Address
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Malaysia',
  
  -- Business Details
  business_license VARCHAR(100),
  tax_id VARCHAR(100),
  
  -- Relationships
  parent_location_id UUID REFERENCES locations(id), -- For hierarchy
  assigned_user_id UUID REFERENCES users(id), -- Distributor user
  
  -- Settings
  sms_notifications_enabled BOOLEAN DEFAULT true,
  email_notifications_enabled BOOLEAN DEFAULT true,
  
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_locations_type ON locations(type);
CREATE INDEX idx_locations_code ON locations(code);
CREATE INDEX idx_locations_parent ON locations(parent_location_id);
```

---

### 3. products
Product catalog with SKUs and variants

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(100) UNIQUE NOT NULL, -- e.g., "CHILI-MILD-500ML"
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Product Details
  category VARCHAR(100), -- e.g., "Chili Oil", "Sauce"
  spice_level ENUM('mild', 'medium', 'hot', 'extra_hot'),
  volume_ml INTEGER, -- Size in ml
  weight_g INTEGER, -- Weight in grams
  
  -- Pricing
  base_price DECIMAL(10, 2) NOT NULL,
  wholesale_price DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'MYR',
  
  -- Media
  image_url VARCHAR(500),
  image_public_id VARCHAR(255), -- Cloudinary public ID
  thumbnail_url VARCHAR(500),
  
  -- Inventory Settings
  minimum_stock_level INTEGER DEFAULT 50,
  reorder_quantity INTEGER DEFAULT 100,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);
```

---

### 4. inventory
Tracks stock levels at each location

```sql
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  
  -- Stock Levels
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0, -- Allocated but not shipped
  available_quantity INTEGER GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
  
  -- Thresholds
  minimum_stock_level INTEGER DEFAULT 50,
  reorder_point INTEGER DEFAULT 100,
  
  -- Tracking
  last_restocked_at TIMESTAMP,
  last_stock_check_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(product_id, location_id)
);

CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_location ON inventory(location_id);
CREATE INDEX idx_inventory_low_stock ON inventory(available_quantity, minimum_stock_level);
```

---

### 5. stock_movements
Audit trail for all inventory changes

```sql
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What moved
  product_id UUID NOT NULL REFERENCES products(id),
  
  -- Where
  from_location_id UUID REFERENCES locations(id),
  to_location_id UUID REFERENCES locations(id),
  
  -- How much
  quantity INTEGER NOT NULL,
  
  -- Why
  movement_type ENUM(
    'purchase', -- Initial stock from supplier
    'transfer', -- Between locations
    'sale', -- Sold to customer
    'adjustment', -- Manual correction
    'damage', -- Damaged goods
    'return' -- Returns from distributor
  ) NOT NULL,
  
  -- Details
  reference_number VARCHAR(100), -- PO#, Invoice#, etc.
  notes TEXT,
  
  -- Who
  created_by UUID REFERENCES users(id),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_from ON stock_movements(from_location_id);
CREATE INDEX idx_stock_movements_to ON stock_movements(to_location_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX idx_stock_movements_date ON stock_movements(created_at);
```

---

### 6. sms_logs
Track all SMS notifications sent

```sql
CREATE TABLE sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Recipient
  phone_number VARCHAR(20) NOT NULL,
  location_id UUID REFERENCES locations(id),
  user_id UUID REFERENCES users(id),
  
  -- Message
  message_type ENUM(
    'low_stock_alert',
    'stock_assignment',
    'order_confirmation',
    'payment_reminder',
    'general_notification'
  ) NOT NULL,
  message_body TEXT NOT NULL,
  
  -- Status
  status ENUM('pending', 'sent', 'delivered', 'failed') DEFAULT 'pending',
  provider_response TEXT, -- Twilio response
  provider_message_id VARCHAR(255), -- Twilio SID
  
  -- Metadata
  product_id UUID REFERENCES products(id), -- If related to product
  related_entity_type VARCHAR(50), -- 'order', 'transfer', etc.
  related_entity_id UUID, -- ID of related entity
  
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sms_logs_phone ON sms_logs(phone_number);
CREATE INDEX idx_sms_logs_location ON sms_logs(location_id);
CREATE INDEX idx_sms_logs_status ON sms_logs(status);
CREATE INDEX idx_sms_logs_created ON sms_logs(created_at);
```

---

## Foundation Tables (For Future Implementation)

### 7. orders (Foundation Layer - Not Implemented Yet)

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(100) UNIQUE NOT NULL,
  
  -- Parties
  from_location_id UUID NOT NULL REFERENCES locations(id), -- Source
  to_location_id UUID NOT NULL REFERENCES locations(id), -- Destination
  created_by UUID REFERENCES users(id),
  
  -- Financials
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'MYR',
  
  -- Status
  status ENUM(
    'draft',
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
  ) DEFAULT 'draft',
  
  -- Dates
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP,
  shipped_at TIMESTAMP,
  delivered_at TIMESTAMP,
  
  -- Additional Info
  notes TEXT,
  shipping_tracking_number VARCHAR(100),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_from_location ON orders(from_location_id);
CREATE INDEX idx_orders_to_location ON orders(to_location_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(order_date);
```

### 8. order_items (Foundation Layer - Not Implemented Yet)

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
```

### 9. payments (Foundation Layer - Not Implemented Yet)

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  location_id UUID REFERENCES locations(id), -- Payer
  
  -- Amount
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'MYR',
  
  -- Payment Details
  payment_method ENUM(
    'bank_transfer',
    'cash',
    'check',
    'online',
    'credit_terms'
  ) NOT NULL,
  
  payment_status ENUM(
    'pending',
    'completed',
    'failed',
    'refunded'
  ) DEFAULT 'pending',
  
  -- References
  transaction_id VARCHAR(255), -- Bank/payment gateway reference
  receipt_url VARCHAR(500),
  
  -- Dates
  payment_date TIMESTAMP,
  due_date TIMESTAMP,
  
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_location ON payments(location_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
```

---

## Initial Data Setup

### Sample SQL for 10 Distributors

```sql
-- Insert Head Centre
INSERT INTO locations (name, type, code, contact_person, email, phone, city, state) VALUES
('Main Warehouse', 'head_centre', 'HC001', 'Admin User', 'admin@chilioil.com', '+60123456789', 'Kuala Lumpur', 'Federal Territory');

-- Insert 10 Distributors
INSERT INTO locations (name, type, code, contact_person, email, phone, city, state, parent_location_id) VALUES
('North Region Distributor', 'distributor', 'DIST001', 'Ahmad bin Ali', 'ahmad@dist1.com', '+60121111111', 'Penang', 'Penang', (SELECT id FROM locations WHERE code = 'HC001')),
('South Region Distributor', 'distributor', 'DIST002', 'Lee Wei Ming', 'lee@dist2.com', '+60122222222', 'Johor Bahru', 'Johor', (SELECT id FROM locations WHERE code = 'HC001')),
('Central Region Distributor', 'distributor', 'DIST003', 'Siti Nurhaliza', 'siti@dist3.com', '+60123333333', 'Seremban', 'Negeri Sembilan', (SELECT id FROM locations WHERE code = 'HC001')),
('East Coast Distributor', 'distributor', 'DIST004', 'Kumar Selvam', 'kumar@dist4.com', '+60124444444', 'Kuantan', 'Pahang', (SELECT id FROM locations WHERE code = 'HC001')),
('Sabah Distributor', 'distributor', 'DIST005', 'David Tan', 'david@dist5.com', '+60125555555', 'Kota Kinabalu', 'Sabah', (SELECT id FROM locations WHERE code = 'HC001')),
('Sarawak Distributor', 'distributor', 'DIST006', 'Jessica Wong', 'jessica@dist6.com', '+60126666666', 'Kuching', 'Sarawak', (SELECT id FROM locations WHERE code = 'HC001')),
('Klang Valley Distributor', 'distributor', 'DIST007', 'Raj Patel', 'raj@dist7.com', '+60127777777', 'Petaling Jaya', 'Selangor', (SELECT id FROM locations WHERE code = 'HC001')),
('Melaka Distributor', 'distributor', 'DIST008', 'Fatimah Hassan', 'fatimah@dist8.com', '+60128888888', 'Melaka', 'Melaka', (SELECT id FROM locations WHERE code = 'HC001')),
('Kedah Distributor', 'distributor', 'DIST009', 'Chen Li Hua', 'chen@dist9.com', '+60129999999', 'Alor Setar', 'Kedah', (SELECT id FROM locations WHERE code = 'HC001')),
('Perak Distributor', 'distributor', 'DIST010', 'Ravi Kumar', 'ravi@dist10.com', '+60120000000', 'Ipoh', 'Perak', (SELECT id FROM locations WHERE code = 'HC001'));
```

---

## Relationships Diagram

```
users (1) -----> (1) locations (distributor)
                      |
                      | parent_location_id
                      ↓
                  locations (head_centre)

products (1) -----> (M) inventory
locations (1) -----> (M) inventory

stock_movements (M) -----> (1) products
stock_movements (M) -----> (1) locations (from)
stock_movements (M) -----> (1) locations (to)

sms_logs (M) -----> (1) locations
sms_logs (M) -----> (1) products (optional)

-- Future Implementation
orders (M) -----> (1) locations (from)
orders (M) -----> (1) locations (to)
order_items (M) -----> (1) orders
order_items (M) -----> (1) products
payments (M) -----> (1) orders
```

---

## Key Features Enabled by This Schema

### MVP (Phase 1)
✅ Product catalog with SKU and images
✅ 10 distributor locations setup
✅ Real-time inventory tracking
✅ Stock movements and transfers
✅ Low stock SMS alerts
✅ Multi-user access (admin, head office, distributor roles)
✅ Audit trail for all stock changes

### Foundation for Future (Phase 2)
🔲 Order management system
🔲 Payment tracking
🔲 Credit terms management
🔲 Invoice generation
🔲 Payment reminders via SMS
🔲 Detailed financial reporting

---

## Notes for Development

1. **PostgreSQL Recommended**: Use PostgreSQL for ENUM types and UUID support
2. **Use Migrations**: Set up with a migration tool (e.g., Knex, TypeORM, Prisma)
3. **Indexes**: Already included for query optimization
4. **Soft Deletes**: Consider adding `deleted_at` columns for important tables
5. **Timestamps**: All tables have `created_at` and `updated_at` for auditing
