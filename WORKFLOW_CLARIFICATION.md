# Benjamin's Chili Oil - Workflow Clarification

## 🔄 Current Business Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                   BENJAMIN'S KITCHEN                         │
│                    (Head Office)                             │
│                                                              │
│  • Manufactures Benjamin's Chili Oil                        │
│  • Holds main stock inventory                               │
│  • Distributes to 10 retail stores                          │
│  • Monitors stock levels via system                         │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Stock Transfer (Delivery)
                   │
         ┌─────────┼─────────┐
         │         │         │
         ▼         ▼         ▼
    ┌────────┐ ┌────────┐ ┌────────┐
    │ Store 1│ │ Store 2│ │ Store 3│  ... (10 stores total)
    │        │ │        │ │        │
    │ Stock: │ │ Stock: │ │ Stock: │
    │   30   │ │   10   │ │   40   │
    │ Min:30 │ │ Min:30 │ │ Min:30 │
    │        │ │        │ │        │
    │ Next:  │ │ Next:  │ │ Next:  │
    │ 11/15  │ │ 10/26  │ │ 11/14  │
    └────────┘ └────────┘ └────────┘
         │         │         │
         └─────────┼─────────┘
                   │
                   ▼ Sells to Customers
              💰 Commission Model
```

## 📊 Stock Restock Logic

### Triggers (BOTH conditions checked):

```javascript
// Condition 1: Date-based
const daysSinceRestock = today - lastRestockDate;
const needsRestockByDate = daysSinceRestock >= restockCycleDays; // 21 days default

// Condition 2: Stock-based
const needsRestockByStock = currentStock <= minimumStock;

// Visual Status
if (currentStock <= minimumStock * 0.5) {
  return '🚨 CRITICAL'; // 50% below minimum
} else if (needsRestockByStock || needsRestockByDate) {
  return '⚠️ LOW/DUE'; // Either trigger activated
} else if (daysUntilRestock <= 3) {
  return '🔔 UPCOMING'; // Within 3-day warning
} else {
  return '✅ HEALTHY';
}

// Suggested Restock Quantity
const idealStock = maxStock * 0.80; // 80% of max
const currentDeficit = idealStock - currentStock;
const salesVelocity = averageDailySales * restockCycleDays;
const suggested = Math.max(currentDeficit, salesVelocity);
```

## 💰 Pricing & Commission Models

### Product Economics:
```
Unit Cost:            $4.50 AUD  (your cost to produce)
Retail Price:        $12.80 AUD  (end customer pays)
Gross Margin:         $8.30 AUD  (if you sell at full retail)
```

### Commission Option 1: Consignment (30%)
```
┌──────────────────────────────────────────────┐
│ Store sells on YOUR behalf                   │
│                                              │
│ Customer pays:        $12.80                 │
│ Store keeps (30%):     $3.84                 │
│ You receive (70%):     $8.96                 │
│ Your profit:           $8.96 - $4.50 = $4.46│
└──────────────────────────────────────────────┘
```

### Commission Option 2: Retail Purchase (30% discount)
```
┌──────────────────────────────────────────────┐
│ Store BUYS from you at discount              │
│                                              │
│ Store pays you:       $8.96 (30% off retail)│
│ Your profit:          $8.96 - $4.50 = $4.46 │
│                                              │
│ Store sells at:       $12.80                 │
│ Store profit:         $12.80 - $8.96 = $3.84│
└──────────────────────────────────────────────┘
```

**Question**: Both models give same profit ($4.46). Is this correct? Or did I misunderstand?

---

## 📱 SMS Alert Workflow

```
┌─────────────────────────────────────────────────────┐
│ SYSTEM AUTO-DETECTS LOW STOCK                      │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│ ALERT QUEUE (Pending Approval)                      │
│                                                      │
│  📋 Chat Phat - Stock: 10/30 - Critical             │
│  📋 Minh Phat - Stock: 10/30 - Critical             │
│  📋 Greenmart - Restock Due: Oct 26                 │
│                                                      │
│  Preview SMS:                                        │
│  "Hi Kim, Minh Phat stock is low: 10/30 units.     │
│   Next delivery due 2025-10-26. - Benjamin's"      │
│                                                      │
│  [✓ Approve] [✗ Reject] [📝 Edit] [⏰ Schedule]    │
└──────────────┬──────────────────────────────────────┘
               │
               │ You click "Approve"
               ▼
┌─────────────────────────────────────────────────────┐
│ SMS SENT VIA TWILIO                                 │
│                                                      │
│  To: 0402785608 (Kim at Minh Phat)                 │
│  Status: Delivered ✓                                │
│  Sent: 2025-10-25 14:30                             │
└─────────────────────────────────────────────────────┘
```

**Confirmation**: SMS requires YOUR approval before sending? ✓

---

## 👥 User Roles & Access

### Admin (You - Head Office)
```
┌──────────────────────────────────────────────┐
│ ✅ View ALL stores                           │
│ ✅ Manage products                           │
│ ✅ Create stock transfers                    │
│ ✅ Approve/send SMS alerts                   │
│ ✅ View all reports                          │
│ ✅ Configure system settings                 │
│ ✅ Manage users                              │
└──────────────────────────────────────────────┘
```

### Store Manager (10 individual accounts)
```
┌──────────────────────────────────────────────┐
│ ✅ View OWN store inventory only             │
│ ✅ Update stock after sales                  │
│ ✅ Request emergency restock                 │
│ ✅ View delivery schedule                    │
│ ✅ Update contact info                       │
│ ❌ Cannot see other stores                   │
│ ❌ Cannot create transfers                   │
│ ❌ Cannot send SMS                           │
└──────────────────────────────────────────────┘
```

**Question**: Should store managers have login access in Phase 1, or Phase 2?

---

## 🗄️ Database Structure (Proposed)

### Core Tables:

```sql
products
├── id (UUID)
├── parent_product_id (UUID) -- For variants
├── sku (VARCHAR)
├── name (VARCHAR)
├── variant_attributes (JSONB) -- {"size": "500ml"}
├── unit_cost (DECIMAL) -- $4.50
├── retail_price (DECIMAL) -- $12.80
├── consignment_commission_rate (DECIMAL) -- 30.00
├── purchase_commission_rate (DECIMAL) -- 30.00
└── ...

locations
├── id (UUID)
├── name (VARCHAR)
├── type (ENUM: 'head_office', 'retail_store')
├── restock_cycle_days (INT DEFAULT 21)
├── minimum_stock_level (INT)
├── maximum_stock_level (INT)
├── ideal_stock_percentage (DECIMAL DEFAULT 80.00)
├── latitude (DECIMAL)
├── longitude (DECIMAL)
└── ...

inventory
├── id (UUID)
├── product_id (UUID) → products
├── location_id (UUID) → locations
├── current_stock (INT)
├── last_restock_date (DATE)
├── next_restock_date (DATE) -- Auto-calculated
├── stock_value (DECIMAL) -- Stock × Unit Cost
└── ...

stock_movements
├── id (UUID)
├── product_id (UUID) → products
├── from_location_id (UUID) → locations
├── to_location_id (UUID) → locations
├── quantity (INT)
├── movement_type (ENUM: 'transfer', 'adjustment', 'sale')
├── transfer_date (DATE)
├── notes (TEXT)
├── created_by (UUID) → users
└── ...

alert_queue
├── id (UUID)
├── location_id (UUID) → locations
├── product_id (UUID) → products
├── alert_type (ENUM: 'critical', 'low_stock', 'upcoming_restock', 'overdue')
├── trigger_reason (TEXT)
├── sms_message (TEXT)
├── status (ENUM: 'pending', 'approved', 'sent', 'failed', 'rejected')
├── approved_by (UUID) → users
├── scheduled_send_at (TIMESTAMP)
└── ...

sales (FUTURE)
├── id (UUID)
├── product_id (UUID) → products
├── location_id (UUID) → locations
├── units_sold (INT)
├── revenue (DECIMAL)
├── commission_amount (DECIMAL)
├── sale_date (DATE)
└── ...
```

---

## 🎯 Pages to Build (Phase 1)

### 1. Inventory Dashboard (`/inventory`)
```
┌────────────────────────────────────────────────────────────┐
│ 📊 Inventory Overview                                      │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Total Units: 160  │  Total Value: $720  │  Critical: 7   │
│                                                             │
│  [All Stores ▼] [Critical Only] [Restock This Week]       │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │Store          Stock  Min  Max  Next     Status    💰 │  │
│ ├──────────────────────────────────────────────────────┤  │
│ │Chat Phat       10   30   50  Oct 26  🚨 CRITICAL  $45│  │
│ │├─ Date Due     ✓                                     │  │
│ │└─ Low Stock    ✓                                     │  │
│ │                                                       │  │
│ │Minh Phat       10   30   50  Oct 26  🚨 CRITICAL  $45│  │
│ │Benjamin's Kit  30   30   50  Nov 15  ✅ HEALTHY $135│  │
│ │Greenmart       30   30   50  Nov 15  ✅ HEALTHY $135│  │
│ │Talad Thai      40   30   50  Nov 14  ✅ HEALTHY $180│  │
│ │                                                       │  │
│ │ [🚚 Create Transfer] [📱 Send Alerts]                │  │
│ └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### 2. Stock Transfer (`/transfers/new`)
```
┌────────────────────────────────────────────────────────────┐
│ 🚚 New Stock Transfer                                      │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  From Location:  [Benjamin's Kitchen (HQ)    ▼]           │
│  To Location:    [Chat Phat Supermarket       ▼]           │
│  Product:        [Benjamin's Chili Oil        ▼]           │
│                                                             │
│  Current Stock (Chat Phat):     10 units                   │
│  Minimum Required:              30 units                   │
│  Ideal Stock (80% of 50):       40 units                   │
│                                                             │
│  💡 Suggested Quantity:         30 units                   │
│     (Brings stock to ideal level)                          │
│                                                             │
│  Transfer Quantity:  [30      ] units                      │
│  Transfer Date:      [Oct 25, 2025]                        │
│  Notes:              [Urgent restock - critical level]     │
│                                                             │
│  [Cancel] [Create Transfer]                                │
└────────────────────────────────────────────────────────────┘
```

### 3. Alert Approval (`/alerts/pending`)
```
┌────────────────────────────────────────────────────────────┐
│ 📱 Pending SMS Alerts                      [Approve All]  │
├────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ 🚨 Chat Phat Supermarket - Critical Stock           │  │
│ │                                                       │  │
│ │ To: Kim (0413886507)                                 │  │
│ │ Trigger: Stock 10 ≤ Min 30 (Critical)               │  │
│ │                                                       │  │
│ │ Message Preview:                                      │  │
│ │ ┌───────────────────────────────────────────────┐   │  │
│ │ │ Hi Kim, Chat Phat stock is critically low:   │   │  │
│ │ │ 10/30 units. Urgent restock needed by Oct 26.│   │  │
│ │ │ - Benjamin's Chili Oil                        │   │  │
│ │ └───────────────────────────────────────────────┘   │  │
│ │                                                       │  │
│ │ [✓ Approve] [✗ Reject] [📝 Edit] [⏰ Schedule Later]│  │
│ └──────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ 🔔 Greenmart - Restock Reminder                     │  │
│ │                                                       │  │
│ │ To: Bill (0493360404)                                │  │
│ │ Trigger: Restock due in 3 days (Oct 26)             │  │
│ │                                                       │  │
│ │ Message Preview:                                      │  │
│ │ ┌───────────────────────────────────────────────┐   │  │
│ │ │ Hi Bill, Greenmart restock scheduled for     │   │  │
│ │ │ Oct 26 (3 days). Current stock: 30/30 units. │   │  │
│ │ │ - Benjamin's Chili Oil                        │   │  │
│ │ └───────────────────────────────────────────────┘   │  │
│ │                                                       │  │
│ │ [✓ Approve] [✗ Reject] [📝 Edit] [⏰ Schedule Later]│  │
│ └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

## ❓ Final Questions Before I Start Building

### 1. **Sales Velocity & Stock Suggestion**
- Do you have historical sales data I should import?
- OR should I start with manual "average daily sales" field per store?
- Example: If Chat Phat sells 2 units/day, suggested restock = 2 × 21 = 42 units

### 2. **Maximum Stock Capacity**
- What's the max stock each store can hold?
- Is it the same for all stores (e.g., 50 units)?
- OR varies by store size?

### 3. **Commission Model Clarity**
Please confirm my understanding:

**Consignment (30%)**:
- You own the stock
- Store sells on your behalf
- Store keeps 30% of $12.80 = $3.84 per sale
- You get 70% = $8.96 per sale
- Your profit: $8.96 - $4.50 = $4.46 ✅

**Retail Purchase (30%)**:
- Store buys from you at 30% discount
- Purchase price: $12.80 × 0.70 = $8.96
- You get $8.96 per unit sold TO store
- Your profit: $8.96 - $4.50 = $4.46 ✅
- Store sells at $12.80, makes $3.84 profit ✅

**Both give same profit?** Is this intentional, or did I misunderstand the math?

### 4. **Restock Cycle Customization**
- Should I build the "Edit Restock Cycle" feature in Phase 1?
- OR hardcode 21 days for now and add customization later?

### 5. **Store Manager Portal Priority**
- Build store login/portal in Phase 1 (this sprint)?
- OR Phase 2 (after core inventory is working)?

### 6. **Additional Restock Conditions**
Besides date and stock level, should we add:
- [ ] Sales velocity projection (stock will run out in X days)
- [ ] Day-of-week preference (e.g., "always restock on Mondays")
- [ ] Holiday/season adjustments (e.g., "double stock before Christmas")
- [ ] Weather/events (future: "concert nearby, increase stock")

### 7. **Emergency Restock Workflow**
When store requests emergency restock:
- Do they SMS you directly?
- OR click button in system (if they have login)?
- Should it auto-create a transfer, or just alert you?

---

## ✅ What I'll Start Building (Pending Your Confirmation)

**Phase 1A - This Session (3-4 hours)**:
1. ✅ Database schema design
2. ✅ Inventory dashboard page
3. ✅ Stock transfer page
4. ✅ Alert approval page
5. ✅ Store settings (restock cycle config)

**Phase 1B - Next Session**:
6. Backend API for inventory, transfers, alerts
7. Twilio SMS integration
8. User authentication (admin only first)

**Phase 2 - Future**:
9. Store manager portal
10. Sales tracking
11. Commission calculations
12. Logistics integration

---

**Please confirm the answers to the 7 questions above, and I'll start building immediately!** 🚀
