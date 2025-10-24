# 🌶️ Chili Oil Distribution Management System - MVP

A web-based inventory and distribution management system for managing chili oil products across multiple distributor locations, with real-time inventory tracking and SMS notifications.

---

## 🚀 Features (MVP - Phase 1)

### ✅ Implemented Features
- **Product Management**: Create and manage products with SKU codes and images
- **Multi-Location Inventory**: Track stock across 1 head office + 10 distributor locations
- **Stock Transfers**: Move inventory between locations with audit trail
- **SMS Notifications**: Automatic low stock alerts via Twilio
- **User Authentication**: Role-based access (Admin, Head Office, Distributor)
- **Dashboard**: Real-time overview of inventory and stock movements
- **Image Upload**: Cloudinary/S3 integration for product photos

### 🔲 Foundation Layer (Phase 2 - Not Implemented)
- Order management system
- Payment tracking
- Invoice generation
- Credit terms management

---

## 🛠 Tech Stack

### Frontend
- **Astro** - Static site generation and routing
- **React** - Interactive components and UI
- **TailwindCSS** - Styling
- **TypeScript** - Type safety

### Backend
- **Express.js** - REST API server
- **Node.js** - Runtime environment
- **PostgreSQL** - Database
- **Knex.js** or **Prisma** - Database ORM

### Services
- **Twilio** - SMS notifications
- **Cloudinary** - Image storage
- **JWT** - Authentication

---

## 📁 Project Structure

```
chili-oil-distribution-mvp/
├── backend/
│   ├── src/
│   │   ├── config/           # Database, env configs
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/       # Auth, validation
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic (SMS, inventory)
│   │   ├── utils/            # Helper functions
│   │   └── server.js         # Entry point
│   ├── migrations/           # Database migrations
│   ├── seeds/                # Seed data (10 distributors)
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── layouts/          # Astro layouts
│   │   ├── pages/            # Astro pages/routes
│   │   ├── utils/            # API client, helpers
│   │   └── env.d.ts
│   ├── public/               # Static assets
│   ├── astro.config.mjs
│   └── package.json
│
├── docs/
│   └── agents/
│       └── AGENT_PROMPT.md   # Detailed dev guidelines
│
├── DATABASE_SCHEMA.md        # Complete database design
├── AGENT.md                  # AI assistant instructions
└── README.md                 # This file
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Twilio account (for SMS)
- Cloudinary account (for images) or AWS S3

### 1. Clone and Install

```bash
# Create project directory
mkdir chili-oil-distribution-mvp
cd chili-oil-distribution-mvp

# Initialize backend
mkdir backend && cd backend
npm init -y
npm install express pg knex bcrypt jsonwebtoken twilio cloudinary multer cors dotenv
npm install -D nodemon

# Initialize frontend
cd ..
npm create astro@latest frontend
cd frontend
npm install react react-dom @types/react @types/react-dom
npm install -D tailwindcss
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb chili_oil_db

# Or using psql
psql -U postgres
CREATE DATABASE chili_oil_db;
\q
```

Copy the SQL from `DATABASE_SCHEMA.md` and run it:

```bash
psql -U postgres -d chili_oil_db -f setup.sql
```

### 3. Environment Variables

Create `backend/.env`:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/chili_oil_db

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS
FRONTEND_URL=http://localhost:4321
```

Create `frontend/.env`:

```env
PUBLIC_API_URL=http://localhost:3000
```

### 4. Seed Initial Data

The database schema includes SQL to seed 10 distributors. Run this after creating tables:

```sql
-- Already included in DATABASE_SCHEMA.md
-- Creates 1 head centre + 10 distributors
```

### 5. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Backend will run on `http://localhost:3000`  
Frontend will run on `http://localhost:4321`

---

## 📋 Database Schema Overview

### Core Tables (MVP)
- **users** - Authentication and user management
- **locations** - Head office and 10 distributors
- **products** - Product catalog with SKUs
- **inventory** - Stock levels per location
- **stock_movements** - Audit trail of all stock changes
- **sms_logs** - SMS notification history

### Foundation Tables (Not Implemented)
- **orders** - Order management (Phase 2)
- **order_items** - Order line items (Phase 2)
- **payments** - Payment tracking (Phase 2)

See `DATABASE_SCHEMA.md` for complete details.

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register      # Create new user
POST   /api/auth/login         # Login user
POST   /api/auth/logout        # Logout user
GET    /api/auth/me            # Get current user
```

### Products
```
GET    /api/products           # List all products
GET    /api/products/:id       # Get single product
POST   /api/products           # Create product
PUT    /api/products/:id       # Update product
DELETE /api/products/:id       # Delete product
POST   /api/products/:id/image # Upload product image
```

### Locations
```
GET    /api/locations          # List all locations
GET    /api/locations/:id      # Get single location
POST   /api/locations          # Create location
PUT    /api/locations/:id      # Update location
GET    /api/locations/:id/inventory  # Get location inventory
```

### Inventory
```
GET    /api/inventory          # List all inventory
GET    /api/inventory/low-stock # Get low stock items
POST   /api/inventory/transfer  # Transfer stock between locations
POST   /api/inventory/adjust    # Adjust inventory
GET    /api/inventory/location/:id  # Get inventory by location
GET    /api/inventory/product/:id   # Get inventory by product
```

### Stock Movements
```
GET    /api/stock-movements    # List all movements
GET    /api/stock-movements/location/:id  # Movements by location
GET    /api/stock-movements/product/:id   # Movements by product
POST   /api/stock-movements    # Create movement record
```

### SMS
```
POST   /api/sms/send           # Send SMS manually
GET    /api/sms/logs           # Get SMS logs
POST   /api/sms/low-stock-alerts # Send low stock alerts
```

### Dashboard
```
GET    /api/dashboard/overview # Dashboard overview stats
GET    /api/dashboard/low-stock # Low stock summary
GET    /api/dashboard/recent-movements # Recent stock movements
```

---

## 🔐 Authentication Flow

1. User registers/logs in via `/api/auth/login`
2. Server returns JWT token
3. Client stores token (localStorage/cookie)
4. Client includes token in Authorization header: `Bearer <token>`
5. Server verifies token on protected routes

```javascript
// Example: Protected route middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

---

## 📱 SMS Notifications

### Automatic Triggers
- **Low Stock Alert**: When inventory falls below minimum level
- **Stock Assignment**: When stock is transferred to a distributor

### Manual Triggers
- Admin can send custom SMS to any distributor
- Bulk notifications to all distributors

### Example SMS Messages

```
Low Stock Alert:
"Alert: Mild Chili Oil (SKU: CHILI-MILD-500ML) is low at North Region Distributor. Current stock: 15 units. Minimum: 50 units."

Stock Assignment:
"Stock Update: 200 units of Hot Chili Oil (CHILI-HOT-500ML) have been assigned to you. Ready for pickup at Main Warehouse."
```

---

## 🖼 Image Upload Flow

1. User selects image file in frontend
2. File sent to `/api/products/:id/image`
3. Backend validates file (type, size)
4. Upload to Cloudinary
5. Save image URL to database
6. Return image URLs to frontend

```javascript
// Example: Cloudinary upload
const result = await cloudinary.uploader.upload(file.path, {
  folder: 'chili-oil-products',
  transformation: [
    { width: 800, height: 800, crop: 'limit' },
    { quality: 'auto' }
  ]
});
```

---

## 🎯 User Roles & Permissions

| Feature | Admin | Head Office | Distributor |
|---------|-------|-------------|-------------|
| View all inventory | ✅ | ✅ | Own location only |
| Create products | ✅ | ✅ | ❌ |
| Transfer stock | ✅ | ✅ | Request only |
| View all locations | ✅ | ✅ | Own location only |
| Send SMS | ✅ | ✅ | ❌ |
| View dashboard | ✅ | ✅ | Limited view |

---

## 🧪 Testing

### Manual Testing Steps

1. **Create Products**
   - Add products with images
   - Verify SKU uniqueness
   - Check image upload

2. **Inventory Management**
   - View inventory across locations
   - Transfer stock between locations
   - Verify stock levels update

3. **SMS Notifications**
   - Trigger low stock alert
   - Send manual notification
   - Check SMS logs

4. **Authentication**
   - Register new users
   - Login with different roles
   - Test protected routes

### Test Data

Use the 10 pre-seeded distributors:
- DIST001 (North Region)
- DIST002 (South Region)
- DIST003 (Central Region)
- ... (see DATABASE_SCHEMA.md)

Create sample products:
- CHILI-MILD-500ML (Mild Chili Oil 500ml) - RM 25.00
- CHILI-HOT-500ML (Hot Chili Oil 500ml) - RM 30.00
- CHILI-EXTRA-250ML (Extra Hot Chili Oil 250ml) - RM 20.00

---

## 🔧 Development Guidelines

### Code Style
- Use **async/await** for asynchronous operations
- Implement proper **error handling**
- Add **meaningful comments**
- Use **meaningful variable names**
- Validate all inputs

### Security
- Sanitize user inputs
- Use parameterized queries
- Hash passwords (bcrypt, 10+ rounds)
- Implement rate limiting
- Use HTTPS in production
- Store secrets in `.env`

### Database
- Use transactions for multiple operations
- Add indexes for frequently queried fields
- Use foreign keys for relationships
- Implement soft deletes where appropriate

---

## 📚 Documentation

- **DATABASE_SCHEMA.md**: Complete database design with relationships
- **AGENT.md**: AI assistant instructions for development
- **docs/agents/AGENT_PROMPT.md**: Detailed development guidelines

---

## 🚀 Deployment

### Backend (Railway/Render/AWS)

```bash
# Build
npm run build

# Environment variables
# Set all .env variables in hosting platform

# Database
# Use managed PostgreSQL (Supabase, Neon, AWS RDS)
```

### Frontend (Vercel/Netlify)

```bash
# Build
npm run build

# Set environment variables
PUBLIC_API_URL=https://your-backend.com
```

---

## 🛠 Troubleshooting

### Database connection issues
- Check `DATABASE_URL` format
- Ensure PostgreSQL is running
- Verify credentials

### SMS not sending
- Check Twilio credentials
- Verify phone number format (+60xxxxxxxxx)
- Check Twilio balance
- Review `sms_logs` table

### Image upload failing
- Verify Cloudinary credentials
- Check file size limits
- Ensure multer is configured

---

## 📈 Future Enhancements (Phase 2)

- [ ] Order management system
- [ ] Payment tracking
- [ ] Invoice generation
- [ ] Credit terms management
- [ ] Mobile app (React Native)
- [ ] Real-time updates (WebSockets)
- [ ] Analytics and reporting
- [ ] Barcode scanning
- [ ] Multi-currency support

---

## 🤝 Contributing

1. Follow the code style guidelines
2. Write meaningful commit messages
3. Add comments for complex logic
4. Update documentation when needed
5. Test thoroughly before committing

---

## 📄 License

MIT License - feel free to use for your business

---

## 📞 Support

For questions or issues:
1. Check `DATABASE_SCHEMA.md` for database structure
2. Review `AGENT.md` and `docs/agents/AGENT_PROMPT.md` for development guidelines
3. Check API documentation above
4. Review code comments

---

## 🎯 Quick Start Checklist

- [ ] Install Node.js 18+
- [ ] Install PostgreSQL 14+
- [ ] Clone repository
- [ ] Install dependencies (backend & frontend)
- [ ] Create database
- [ ] Run database migrations
- [ ] Seed 10 distributors
- [ ] Set up environment variables
- [ ] Configure Twilio account
- [ ] Configure Cloudinary account
- [ ] Start development servers
- [ ] Create first product
- [ ] Test stock transfer
- [ ] Test SMS notification

---

**Built with ❤️ for the chili oil business** 🌶️🔥
