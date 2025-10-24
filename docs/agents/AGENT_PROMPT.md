# Chaining Agent Prompt - Chili Oil Distribution MVP

## Project Context
You are assisting with the development of a **Chili Oil Distribution Management System** MVP. This is a web-based application for managing inventory, distributors, and stock movements for a chili oil business.

---

## Tech Stack

### Frontend
- **Astro** - Static site generation and routing
- **React** - Interactive components and admin dashboard
- **TailwindCSS** - Styling (assumed)
- **TypeScript** - Type safety

### Backend
- **Express.js** - REST API server
- **Node.js** - Runtime environment
- **PostgreSQL** - Primary database
- **Knex.js** or **Prisma** - Database ORM/query builder

### Services
- **Twilio** - SMS notifications
- **Cloudinary or AWS S3** - Image storage for product photos
- **JWT** - Authentication tokens

### Hosting (Suggested)
- **Frontend**: Vercel or Netlify
- **Backend**: Railway, Render, or AWS
- **Database**: Supabase, Neon, or AWS RDS

---

## Project Structure

```
chili-oil-distribution-mvp/
├── backend/                    # Express.js API
│   ├── src/
│   │   ├── config/            # Database, environment configs
│   │   ├── controllers/       # Route handlers
│   │   ├── middleware/        # Auth, validation, error handling
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic (SMS, inventory)
│   │   ├── utils/             # Helpers
│   │   └── server.js          # Entry point
│   ├── migrations/            # Database migrations
│   ├── seeds/                 # Seed data (10 distributors)
│   └── package.json
│
├── frontend/                   # Astro + React
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── layouts/           # Astro layouts
│   │   ├── pages/             # Astro pages (routes)
│   │   ├── utils/             # API client, helpers
│   │   └── env.d.ts
│   └── astro.config.mjs
│
├── docs/
│   └── agents/
│       └── AGENT_PROMPT.md    # This file
│
├── DATABASE_SCHEMA.md          # Full database design
├── AGENT.md                    # General agent instructions
└── README.md
```

---

## Core Features (MVP - Phase 1)

### 1. Authentication & User Management
- Admin, Head Office, and Distributor roles
- JWT-based authentication
- Login/logout functionality
- Password hashing (bcrypt)

### 2. Product Management
- Create, read, update products
- Upload product images (Cloudinary)
- SKU generation and management
- Product categorization

### 3. Location Management
- Head Centre setup
- 10 Distributor locations pre-seeded
- Distributor contact details
- SMS notification preferences

### 4. Inventory Tracking
- Real-time stock levels per location
- Stock assignment from Head Centre to Distributors
- Low stock alerts (automatic SMS)
- Inventory dashboard with charts

### 5. Stock Movements
- Transfer stock between locations
- Record all movements (purchase, transfer, sale, adjustment)
- Audit trail with timestamps
- Movement history view

### 6. SMS Notifications (via Twilio)
- Low stock alerts
- Stock assignment notifications
- Manual notifications
- SMS delivery logs

### 7. Dashboard & Reports
- Overview of total inventory
- Low stock warnings
- Recent stock movements
- Distributor performance metrics

---

## Foundation Layer (Phase 2 - Not Implemented Yet)

These tables and features are designed but NOT to be implemented in MVP:
- ❌ Order management system
- ❌ Payment tracking
- ❌ Invoice generation
- ❌ Credit terms
- ❌ Payment reminders

The database schema includes these tables for future expansion, but API endpoints and UI should NOT be built yet.

---

## API Endpoints Structure

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### Products
```
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
POST   /api/products/:id/upload-image
```

### Locations
```
GET    /api/locations
GET    /api/locations/:id
POST   /api/locations
PUT    /api/locations/:id
GET    /api/locations/:id/inventory
```

### Inventory
```
GET    /api/inventory
GET    /api/inventory/low-stock
POST   /api/inventory/transfer
POST   /api/inventory/adjust
GET    /api/inventory/location/:locationId
GET    /api/inventory/product/:productId
```

### Stock Movements
```
GET    /api/stock-movements
GET    /api/stock-movements/location/:locationId
GET    /api/stock-movements/product/:productId
POST   /api/stock-movements
```

### SMS
```
POST   /api/sms/send
GET    /api/sms/logs
POST   /api/sms/send-low-stock-alerts
```

### Dashboard
```
GET    /api/dashboard/overview
GET    /api/dashboard/low-stock
GET    /api/dashboard/recent-movements
```

---

## Development Guidelines

### When Implementing New Features

1. **Start with the Database**
   - Check DATABASE_SCHEMA.md
   - Write migration if needed
   - Seed test data

2. **Build the Backend API**
   - Create model/controller
   - Add validation middleware
   - Implement business logic
   - Write tests (if requested)

3. **Create Frontend Components**
   - React component for UI
   - API client calls
   - State management
   - Form validation

4. **Add Documentation**
   - Update API docs
   - Add code comments
   - Update README if major feature

### Code Style
- Use **async/await** for asynchronous operations
- Implement proper **error handling** with try-catch
- Use **meaningful variable names**
- Add **JSDoc comments** for functions
- Validate inputs with **express-validator** or **Zod**

### Security Considerations
- Sanitize user inputs
- Use parameterized queries (prevent SQL injection)
- Implement rate limiting on API
- Use HTTPS in production
- Store secrets in environment variables
- Hash passwords with bcrypt (10+ rounds)

---

## Common Tasks & How to Approach Them

### Task: "Add a new product with image upload"

**Backend Steps:**
1. Create POST /api/products endpoint
2. Use multer middleware for image upload
3. Upload to Cloudinary
4. Save product with image URL to database
5. Return product data with image URLs

**Frontend Steps:**
1. Create ProductForm component
2. Add file input for image
3. Handle form submission
4. Display image preview
5. Show success/error messages

---

### Task: "Send SMS when stock is low"

**Backend Steps:**
1. Create a service function `checkLowStock()`
2. Query inventory where `available_quantity < minimum_stock_level`
3. For each low stock item, get location phone number
4. Use Twilio API to send SMS
5. Log SMS in `sms_logs` table
6. Can be triggered manually or via cron job

**Code Example:**
```javascript
// services/smsService.js
async function sendLowStockAlert(product, location, currentStock) {
  const message = `Alert: ${product.name} (SKU: ${product.sku}) is low at ${location.name}. Current stock: ${currentStock} units.`;
  
  await twilioClient.messages.create({
    body: message,
    to: location.phone,
    from: process.env.TWILIO_PHONE_NUMBER
  });
  
  // Log SMS
  await db('sms_logs').insert({
    phone_number: location.phone,
    location_id: location.id,
    message_type: 'low_stock_alert',
    message_body: message,
    status: 'sent',
    product_id: product.id
  });
}
```

---

### Task: "Transfer stock from Head Centre to Distributor"

**Backend Steps:**
1. Validate: Ensure source location has enough stock
2. Create transaction:
   - Decrease quantity at source location
   - Increase quantity at destination location
   - Create stock_movement record
3. Check if destination stock was low, cancel any low stock alerts
4. Send SMS to distributor about new stock
5. Return success response

**Database Operations:**
```javascript
// Within a transaction
await db.transaction(async (trx) => {
  // Decrease from head centre
  await trx('inventory')
    .where({ product_id, location_id: fromLocationId })
    .decrement('quantity', quantity);
  
  // Increase at distributor
  await trx('inventory')
    .where({ product_id, location_id: toLocationId })
    .increment('quantity', quantity);
  
  // Record movement
  await trx('stock_movements').insert({
    product_id,
    from_location_id: fromLocationId,
    to_location_id: toLocationId,
    quantity,
    movement_type: 'transfer',
    created_by: userId
  });
});
```

---

## Testing Checklist

Before considering a feature complete:
- [ ] API endpoint works as expected
- [ ] Proper error handling implemented
- [ ] Input validation working
- [ ] Frontend displays data correctly
- [ ] Forms submit successfully
- [ ] SMS sends successfully (if applicable)
- [ ] Database updates correctly
- [ ] No console errors
- [ ] Responsive design (mobile/desktop)

---

## Environment Variables Required

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/chili_oil_db

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Twilio
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:4321
```

---

## Important Reminders

### ⚠️ DO NOT Implement (Foundation Layer Only)
- Orders system
- Payment tracking
- Invoice generation
- Payment reminders

These exist in the schema but should NOT have:
- API endpoints
- Frontend UI
- Business logic

### ✅ DO Implement (MVP)
- Product catalog with images
- Inventory tracking
- Stock transfers
- SMS notifications
- User authentication
- Dashboard with reports

---

## Agent Chaining Instructions

When the user asks for help:

1. **Clarify the Scope**: Is this an MVP feature or foundation feature?
2. **Check the Schema**: Reference DATABASE_SCHEMA.md for table structure
3. **Follow the Tech Stack**: Use Express.js, PostgreSQL, React, Astro
4. **Provide Complete Code**: Give full implementations, not just snippets
5. **Explain the Why**: Include comments and reasoning
6. **Suggest Next Steps**: What should be built next?

### Example Chain:
User: "Help me build the product creation endpoint"
→ Agent: Check DATABASE_SCHEMA.md for products table
→ Agent: Create Express route with validation
→ Agent: Add Cloudinary upload handler
→ Agent: Provide complete controller code
→ Agent: Suggest building the frontend form next

---

## Questions to Ask the User

If unclear, ask:
- "Is this for the MVP or foundation layer?"
- "Should this trigger an SMS notification?"
- "Do you want me to include validation?"
- "Would you like seed data for testing?"
- "Should we add this to the dashboard?"

---

## Getting Started Checklist

For a developer starting this project:

1. [ ] Clone/create project structure
2. [ ] Initialize backend with Express.js
3. [ ] Set up PostgreSQL database
4. [ ] Run migration scripts from DATABASE_SCHEMA.md
5. [ ] Seed 10 distributor data
6. [ ] Initialize Astro frontend
7. [ ] Set up Tailwind CSS
8. [ ] Configure environment variables
9. [ ] Set up Twilio account
10. [ ] Set up Cloudinary/S3
11. [ ] Create base authentication system
12. [ ] Build first feature: Product catalog

---

## Support and Resources

- Database Schema: See `DATABASE_SCHEMA.md`
- General Instructions: See `AGENT.md`
- Express.js Docs: https://expressjs.com/
- Astro Docs: https://astro.build/
- Twilio SMS API: https://www.twilio.com/docs/sms
- PostgreSQL Docs: https://www.postgresql.org/docs/
