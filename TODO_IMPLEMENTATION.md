# Benjamin's Chili Oil - Implementation Roadmap

## 📊 Business Context Summary

**Product**: Benjamin's Chili Oil (retail)
**Pricing**:
- Unit Cost: $4.50 AUD
- Retail Price: $12.80 AUD
- Retail Consignment Commission: 30%
- Retail Purchase Commission: 30%
- ⚠️ All pricing metrics are **configurable** and can change

**Stock Management**:
- Default Restock Cycle: 21 days (configurable per store)
- Current Stock Levels: 10-40 units per store
- Minimum Stock: 10-30 units (configurable per location)
- Ideal Stock Level: 80% of max capacity (default)
- Restock Triggers: **Both** minimum stock level AND restock date
- Restock Quantity: Auto-suggested based on sales velocity

**Stores**: 10 retail locations across Melbourne
- All locations have geocoding
- Each location has unique metrics (min/max stock, restock cycle)

---

## 🎯 Phase 1: Core Inventory Management (CURRENT SPRINT)

### 1.1 Inventory Dashboard Page ✅ PRIORITY 1

**Route**: `/inventory`

**Features**:
- [ ] View all stores in table format
- [ ] Columns:
  - Store Name
  - Current Stock
  - Minimum Stock
  - Maximum Stock (configurable)
  - Ideal Stock (80% of max)
  - Last Restock Date
  - Next Restock Date (Last + Cycle Days)
  - Days Until Restock
  - Stock Status (🚨 Critical / ⚠️ Low / ✅ Healthy)
  - Stock Value (Stock × Unit Cost)
- [ ] **Auto-calculate next restock date** based on configurable cycle
- [ ] **Restock condition visualization**:
  - Show which condition triggered: Date-based OR Stock-level based OR Both
  - Visual indicators (badges/icons)
- [ ] Summary cards:
  - Total Units Across All Stores
  - Total Inventory Value
  - Critical Stores Count
  - Stores Needing Restock This Week
- [ ] Filters:
  - By Status (Critical / Low / Healthy)
  - By Region (North, East, Inner East, etc.)
  - Restock Due This Week
- [ ] Sort by: Stock Level, Restock Date, Value, Store Name

**Restock Condition Logic** (to visualize):
```javascript
const needsRestock = {
  dateTriggered: daysUntilRestock <= 0,
  stockTriggered: currentStock <= minimumStock,
  critical: currentStock <= minimumStock * 0.5, // 50% below minimum
  upcoming: daysUntilRestock <= 3 && daysUntilRestock > 0, // 3-day warning
}
```

**Questions to Clarify**:
- [ ] What additional conditions should we visualize?
- [ ] Should we show "stock runway" (days until stock runs out based on avg daily sales)?
- [ ] Any store-specific restock rules? (e.g., "Chat Phat always restocks on Mondays")

---

### 1.2 Product Management Enhancement ✅ PRIORITY 2

**Route**: `/products`

**Current**: Multi-category product system
**Update Needed**: Adapt for Benjamin's single-product model

**Features**:
- [ ] Main Product: Benjamin's Chili Oil (Retail)
  - SKU: BK-CHILI-RETAIL
  - Unit Cost: $4.50 (editable)
  - Retail Price: $12.80 (editable)
  - Commission Rates: 30% consignment, 30% purchase (editable)
  - Image upload (Cloudinary)
  - Description
- [ ] **Product Variants** (size variations):
  - Link to root product (parent_product_id)
  - Variant attributes: Size (e.g., 250ml, 500ml, 1L)
  - Each variant has own SKU, pricing, inventory
  - Display as expandable tree in product list
- [ ] **Future-ready**: Add New Product button for expansion
- [ ] Bulk pricing updates
- [ ] Commission calculator preview

**Database Schema Additions**:
```sql
ALTER TABLE products ADD COLUMN parent_product_id UUID REFERENCES products(id);
ALTER TABLE products ADD COLUMN variant_attributes JSONB; -- {"size": "500ml"}
ALTER TABLE products ADD COLUMN unit_cost DECIMAL(10,2) DEFAULT 4.50;
ALTER TABLE products ADD COLUMN consignment_commission_rate DECIMAL(5,2) DEFAULT 30.00;
ALTER TABLE products ADD COLUMN purchase_commission_rate DECIMAL(5,2) DEFAULT 30.00;
```

---

### 1.3 Stock Transfer System ✅ PRIORITY 3

**Route**: `/transfers/new`, `/transfers`

**Purpose**: Record deliveries from Benjamin's Kitchen (head office) to stores

**Features**:
- [ ] **New Transfer Form**:
  - From Location: Benjamin's Kitchen (default)
  - To Location: Dropdown (10 stores)
  - Product: Benjamin's Chili Oil
  - Quantity: Number input with validation
  - Transfer Date: Date picker (default: today)
  - Notes: Optional text
  - Transfer Type: Restock / Emergency / Adjustment
- [ ] **Auto-update stock levels**:
  - Deduct from source (Benjamin's Kitchen)
  - Add to destination (selected store)
  - Update "Last Restock Date" at destination
  - Recalculate "Next Restock Date"
- [ ] **Transfer History**:
  - Filterable table of all transfers
  - Export to CSV
  - Audit trail (who, when, what, why)
- [ ] **Suggested Restock Quantities**:
  - System calculates: `Ideal Stock - Current Stock`
  - Considers sales velocity (if data available)
  - Shows suggestion but allows manual override

**Future**: Integration with logistics company (trigger delivery order)

---

### 1.4 Store-Specific Configuration ✅ PRIORITY 4

**Route**: `/stores/:id/settings`

**Configurable Per Store**:
- [ ] Restock Cycle Days (default: 21)
- [ ] Minimum Stock Level
- [ ] Maximum Stock Level
- [ ] Ideal Stock Percentage (default: 80%)
- [ ] Contact Person & Phone (for SMS)
- [ ] Preferred Delivery Day (future: for logistics)
- [ ] Custom restock conditions/rules

**UI**: Edit form accessible from distributor card or inventory row

---

## 🚨 Phase 2: SMS Alert System (CURRENT SPRINT)

### 2.1 Alert Configuration & Approval ✅ PRIORITY 5

**Route**: `/alerts`, `/alerts/pending`

**Features**:
- [ ] **Automatic Alert Triggers**:
  - Critical Stock: Current <= Minimum × 0.5
  - Low Stock: Current <= Minimum
  - Upcoming Restock: 3 days before restock date
  - Overdue Restock: Past restock date
- [ ] **Alert Queue** (requires approval):
  - Pending Alerts table
  - Preview SMS message before sending
  - Bulk approve/reject
  - Schedule send time
- [ ] **SMS Templates**:
  - Template variables: {StoreName}, {ContactName}, {CurrentStock}, {MinStock}, {RestockDate}
  - Example: "Hi {ContactName}, {StoreName} stock is low: {CurrentStock}/{MinStock} units. Next delivery due {RestockDate}. - Benjamin's Chili Oil"
  - Editable templates
- [ ] **Alert History**:
  - Sent alerts log
  - Delivery status (via Twilio)
  - Response tracking (future)
- [ ] **Restock Reminders**:
  - Auto-generate 3 days before restock date
  - Option to send weekly summary to all stores

**Database Schema**:
```sql
CREATE TABLE alert_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES locations(id),
  product_id UUID REFERENCES products(id),
  alert_type VARCHAR(50), -- 'critical', 'low_stock', 'upcoming_restock', 'overdue'
  trigger_reason TEXT,
  sms_message TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'sent', 'failed', 'rejected'
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  scheduled_send_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 👥 Phase 3: User Management & Store Portal (CURRENT SPRINT)

### 3.1 Store Manager Accounts ✅ PRIORITY 6

**Purpose**: Store managers can view/update their own inventory

**User Roles**:
1. **Admin** (Head Office - You)
   - Full access to all features
   - View all stores
   - Manage products, transfers, alerts
   - Configure system settings

2. **Store Manager** (10 store contacts)
   - View own store inventory only
   - Update stock after sales
   - Request emergency restock
   - View restock schedule
   - Cannot see other stores

**Features**:
- [ ] User registration/invitation system
- [ ] Role-based access control (RBAC)
- [ ] Store manager login page
- [ ] Store manager dashboard (single-store view)
- [ ] Store manager can:
  - View current stock
  - Record sales (deduct stock)
  - Request restock (creates transfer request)
  - Update contact info
  - View delivery history

**Database Schema**:
```sql
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'store_manager'; -- 'admin', 'store_manager'
ALTER TABLE users ADD COLUMN assigned_location_id UUID REFERENCES locations(id);
```

---

### 3.2 Distributor Communication Page ✅ FUTURE

**Route**: `/distributors/:id/communicate`

**Purpose**: Unique SMS links for stores to communicate with head office

**Features** (TODO - Future Implementation):
- [ ] Generate unique SMS link per store
- [ ] Store sends SMS to head office number
- [ ] System identifies store by unique code/number
- [ ] Two-way SMS conversation
- [ ] SMS inbox in admin dashboard
- [ ] Auto-responses for common queries

**Technical Approach**:
- Twilio phone number for head office
- Unique identifier in SMS (e.g., "Reply STORE003 to confirm")
- Webhook to receive inbound SMS
- Link SMS to location by phone number or code

---

## 📈 Phase 4: Restock Conditions & Visualization (NEXT SPRINT)

### 4.1 Advanced Restock Conditions

**What Triggers Restock**:
1. ✅ **Date-based**: Days since last restock >= Cycle Days
2. ✅ **Stock-based**: Current Stock <= Minimum Stock
3. 🔄 **Sales velocity-based**: Projected stock-out date within X days
4. 🔄 **Combined conditions**: Date AND Stock (both must be true)
5. 🔄 **Conditional overrides**: "If holiday season, increase frequency"

**Visualization Ideas**:
- [ ] Timeline view: When each store needs restock (calendar)
- [ ] Traffic light indicators: 🔴 Critical, 🟡 Low, 🟢 Healthy
- [ ] Progress bars: Stock level vs. Min/Max
- [ ] Trend arrows: ↗️ Increasing, ↘️ Decreasing, → Stable
- [ ] Condition badges:
  - "📅 Date Due" (restock date passed)
  - "📉 Low Stock" (below minimum)
  - "⚡ Critical" (both conditions)
  - "🔔 Reminder Sent" (3-day warning sent)

**Proposed Condition Builder UI**:
```
┌─────────────────────────────────────────────┐
│ Restock Conditions for Chat Phat           │
├─────────────────────────────────────────────┤
│ ✓ Trigger when Stock <= 30 units           │
│ ✓ Trigger when Days Since Restock >= 21    │
│ □ Trigger when Projected Stockout <= 7 days│
│ □ Send reminder 3 days before date         │
│                                             │
│ Combine Conditions: [AND ▼] [OR ▼]         │
└─────────────────────────────────────────────┘
```

**User Question**: What other conditions should we support?

---

## 💰 Phase 5: Sales & Commission Tracking (FUTURE)

### 5.1 Sales Recording

**Route**: `/sales/new`, `/sales`

**Features** (TODO - Future Implementation):
- [ ] Store managers record daily/weekly sales
- [ ] Auto-deduct from inventory
- [ ] Track units sold per store
- [ ] Revenue calculation (Units × Retail Price)
- [ ] Sales trends/charts

### 5.2 Commission Management

**Commission Models**:
1. **Consignment (30%)**: Store sells on behalf, keeps 30% commission
2. **Purchase (30%)**: Store buys from you at 30% discount

**Features** (TODO):
- [ ] Toggle commission model per store
- [ ] Calculate commission owed
- [ ] Payment tracking
- [ ] Commission reports
- [ ] Settlement history

**Calculations**:
```javascript
// Consignment Model
const revenue = unitsSold × retailPrice; // $12.80
const storeCommission = revenue × 0.30; // $3.84
const yourRevenue = revenue × 0.70; // $8.96

// Purchase Model
const retailPrice = $12.80;
const purchasePrice = retailPrice × 0.70; // $8.96 (30% discount)
const yourProfit = purchasePrice - unitCost; // $8.96 - $4.50 = $4.46
```

---

## 📊 Phase 6: Reporting & Analytics (FUTURE)

### 6.1 Reports

**Features** (TODO):
- [ ] Inventory Summary Report
- [ ] Restock Calendar (Weekly/Monthly)
- [ ] Sales Report by Store
- [ ] Commission Report
- [ ] Low Stock Forecast
- [ ] Stock Turnover Rate
- [ ] Best/Worst Performing Stores
- [ ] Export all reports to PDF/Excel

### 6.2 Dashboard Enhancements

**Additional Metrics**:
- [ ] Revenue Potential: Total Stock × Retail Price
- [ ] Inventory Days (avg days to sell current stock)
- [ ] Restock Accuracy (on-time vs late)
- [ ] Store Ranking by Sales

---

## 🚚 Phase 7: Logistics Integration (FUTURE)

### 7.1 Delivery Management

**Features** (TODO):
- [ ] Integration with logistics company API
- [ ] Trigger delivery order on transfer approval
- [ ] Track delivery status
- [ ] Delivery confirmation (stores mark as received)
- [ ] POD (Proof of Delivery) upload
- [ ] Delivery cost tracking

---

## 📱 Phase 8: Mobile App (FUTURE)

### 8.1 Progressive Web App (PWA)

**Features** (TODO):
- [ ] Mobile-optimized UI
- [ ] Offline mode
- [ ] Push notifications
- [ ] Barcode scanning for stock counts
- [ ] Photo capture for delivery proof

---

## 🔧 Technical Debt & Infrastructure

### Database Schema Updates Needed

**Priority**:
1. ✅ Add `inventory` table with store-specific stock levels
2. ✅ Add `stock_movements` table for transfer audit trail
3. ✅ Add `alert_queue` table for SMS approval workflow
4. ✅ Add restock cycle fields to `locations` table
5. ✅ Add pricing/commission fields to `products` table
6. 🔄 Add `sales` table (future)
7. 🔄 Add `commissions` table (future)

### Environment Variables Needed

```env
# SMS (Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Image Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Database
DATABASE_URL=postgresql://...

# JWT Auth
JWT_SECRET=
JWT_EXPIRES_IN=7d
```

---

## ✅ Confirmation Checklist

Before I start building, please confirm:

- [ ] **Pricing**: Unit Cost $4.50, Retail $12.80, both configurable? ✓
- [ ] **Commission**: 30% for both models, configurable? ✓
- [ ] **Restock Cycle**: 21 days default, configurable per store? ✓
- [ ] **Restock Triggers**: Both date AND stock level? ✓
- [ ] **SMS Approval**: Required before sending? ✓
- [ ] **Store Portal**: Build login for store managers? ✓
- [ ] **Product Variants**: Treat sizes as separate linked products? ✓
- [ ] **Sales Velocity**: Auto-suggest restock qty based on sales? ✓
- [ ] **Ideal Stock**: 80% of max by default? ✓

---

## 🎯 Immediate Next Steps (This Session)

### What I'll Build Now:

1. **Update DATABASE_SCHEMA.md** with new tables
2. **Create Inventory Page** with:
   - Stock levels per store
   - Next restock date calculation
   - Restock condition visualization
   - Suggested restock quantities
3. **Create Stock Transfer Page** with audit trail
4. **Create Alert Approval Page** with SMS preview
5. **Update AGENT.md** with complete workflow

### Estimated Build Order:
1. Database schema design (30 min)
2. Inventory page UI (1 hour)
3. Stock transfer system (1 hour)
4. Alert approval workflow (45 min)
5. Store settings page (30 min)

**Total Estimated Time**: ~3.5-4 hours of focused work

---

## 📋 Questions for Final Clarification

1. **Sales Velocity**: Do you have historical sales data I should import? Or start tracking from now?
2. **Max Stock Capacity**: What's the maximum stock each store can hold? (For calculating ideal 80%)
3. **Commission Clarification**:
   - Consignment 30%: Store keeps 30% of $12.80 = $3.84, you get $8.96?
   - Purchase 30%: Store buys at $8.96 (30% off $12.80), sells at $12.80?
4. **Restock Conditions**: Any other triggers besides date and stock level?
5. **Store Manager Portal**: Should they log in immediately, or Phase 2?

---

**Ready to start building?** Let me know if you want to adjust priorities or add/remove features!
