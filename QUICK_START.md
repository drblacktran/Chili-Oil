# 🚀 Quick Reference Guide

## Project Files Overview

| File | Purpose | When to Use |
|------|---------|-------------|
| `DATABASE_SCHEMA.md` | Complete database design with all tables, relationships, and sample data | Reference when creating models, writing queries, or understanding data structure |
| `AGENT.md` | General AI assistant instructions and project overview | Quick project overview and general development guidance |
| `docs/agents/AGENT_PROMPT.md` | Detailed development guidelines, API structure, and code patterns | Detailed reference when implementing features, API endpoints, or complex logic |
| `README.md` | Project setup, installation, and getting started guide | Initial setup and deployment |

---

## Your Project Setup Path

### 1. Start Your Project Structure

```bash
# Create your project
mkdir chili-oil-distribution-mvp
cd chili-oil-distribution-mvp

# Create folders
mkdir -p backend/src/{config,controllers,middleware,models,routes,services,utils}
mkdir -p backend/{migrations,seeds}
mkdir -p frontend/src/{components,layouts,pages,utils}
mkdir -p docs/agents

# Copy the schema and docs from this folder
```

### 2. Initialize Backend (Express.js)

```bash
cd backend
npm init -y

# Install dependencies
npm install express pg knex bcrypt jsonwebtoken twilio cloudinary multer cors dotenv express-validator

# Install dev dependencies
npm install -D nodemon @types/node

# Create .env file
touch .env
```

### 3. Initialize Frontend (Astro + React)

```bash
cd ../frontend
npm create astro@latest . 
# Choose:
# - Template: Use blog template or Empty
# - TypeScript: Yes, strict
# - Dependencies: Yes

# Install additional packages
npm install react react-dom
npm install -D @types/react @types/react-dom tailwindcss

# Initialize Tailwind
npx tailwindcss init
```

### 4. Setup Database

```bash
# Create database
createdb chili_oil_db

# Copy SQL from DATABASE_SCHEMA.md and run it
psql -U postgres -d chili_oil_db -f setup.sql

# Verify tables created
psql -U postgres -d chili_oil_db -c "\dt"
```

### 5. Configure Environment Variables

**Backend `.env`:**
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/chili_oil_db
PORT=3000
NODE_ENV=development
JWT_SECRET=change-this-to-a-random-string
JWT_EXPIRES_IN=7d
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
FRONTEND_URL=http://localhost:4321
```

**Frontend `.env`:**
```env
PUBLIC_API_URL=http://localhost:3000
```

---

## Database Quick Reference

### 10 Pre-Seeded Distributors

| Code | Name | City | State | Phone |
|------|------|------|-------|-------|
| HC001 | Main Warehouse | Kuala Lumpur | Federal Territory | +60123456789 |
| DIST001 | North Region Distributor | Penang | Penang | +60121111111 |
| DIST002 | South Region Distributor | Johor Bahru | Johor | +60122222222 |
| DIST003 | Central Region Distributor | Seremban | Negeri Sembilan | +60123333333 |
| DIST004 | East Coast Distributor | Kuantan | Pahang | +60124444444 |
| DIST005 | Sabah Distributor | Kota Kinabalu | Sabah | +60125555555 |
| DIST006 | Sarawak Distributor | Kuching | Sarawak | +60126666666 |
| DIST007 | Klang Valley Distributor | Petaling Jaya | Selangor | +60127777777 |
| DIST008 | Melaka Distributor | Melaka | Melaka | +60128888888 |
| DIST009 | Kedah Distributor | Alor Setar | Kedah | +60129999999 |
| DIST010 | Perak Distributor | Ipoh | Perak | +60120000000 |

### Core Tables

```
users           → Authentication and user management
locations       → Head office + 10 distributors
products        → Product catalog (SKU, name, price, image)
inventory       → Stock levels per location
stock_movements → Audit trail of all stock changes
sms_logs        → SMS notification history
```

### Foundation Tables (Don't Implement Yet)

```
orders          → Order management (Phase 2)
order_items     → Order line items (Phase 2)
payments        → Payment tracking (Phase 2)
```

---

## API Endpoints Quick Reference

### Auth
- `POST /api/auth/register` - Create user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `POST /api/products/:id/image` - Upload image

### Inventory
- `GET /api/inventory` - List inventory
- `POST /api/inventory/transfer` - Transfer stock
- `GET /api/inventory/low-stock` - Low stock items

### SMS
- `POST /api/sms/send` - Send SMS
- `POST /api/sms/low-stock-alerts` - Send alerts

---

## Development Order (Recommended)

### Week 1: Foundation
1. ✅ Setup project structure
2. ✅ Configure database
3. ✅ Seed 10 distributors
4. ✅ Setup Express.js server
5. ✅ Configure Astro frontend

### Week 2: Authentication
1. Create user registration/login
2. Implement JWT authentication
3. Create login page (frontend)
4. Protected route middleware
5. User profile page

### Week 3: Products
1. Product model and API endpoints
2. Image upload (Cloudinary)
3. Product list page (frontend)
4. Product creation form
5. Product detail page

### Week 4: Inventory
1. Inventory model and API endpoints
2. Inventory dashboard (frontend)
3. Stock transfer functionality
4. Inventory reports
5. Low stock indicators

### Week 5: SMS & Polish
1. Twilio SMS integration
2. Low stock alert system
3. SMS logs page
4. Dashboard overview
5. Testing and bug fixes

---

## Common Commands

### Development
```bash
# Start backend (from backend/)
npm run dev

# Start frontend (from frontend/)
npm run dev

# Database migrations (if using Knex)
npx knex migrate:latest
npx knex seed:run
```

### Database
```bash
# Connect to database
psql -U postgres -d chili_oil_db

# List tables
\dt

# Describe table
\d table_name

# Query examples
SELECT * FROM locations;
SELECT * FROM products;
SELECT * FROM inventory WHERE location_id = 'uuid';
```

### Git
```bash
# Initial commit
git init
git add .
git commit -m "Initial commit: Project setup"

# Create .gitignore
echo "node_modules/
.env
.DS_Store
dist/
build/
*.log" > .gitignore
```

---

## Testing Checklist

### Basic Functionality
- [ ] User registration works
- [ ] User login works
- [ ] Can create products
- [ ] Can upload product images
- [ ] Can view inventory
- [ ] Can transfer stock
- [ ] SMS sends successfully
- [ ] Low stock alerts trigger
- [ ] Dashboard loads correctly

### Data Integrity
- [ ] No duplicate SKUs
- [ ] Stock quantities accurate after transfer
- [ ] All stock movements logged
- [ ] Inventory never goes negative
- [ ] SMS logs created

---

## Troubleshooting Quick Fixes

### "Connection refused" (Database)
```bash
# Check if PostgreSQL is running
sudo service postgresql status

# Start if not running
sudo service postgresql start
```

### "Cannot find module" (Backend)
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### "Port already in use"
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### SMS not sending
1. Check Twilio credentials in `.env`
2. Verify Twilio account has credits
3. Check phone number format: `+60123456789`
4. Look at `sms_logs` table for errors

### Image upload failing
1. Check Cloudinary credentials
2. Verify file size (< 10MB recommended)
3. Check file type (jpg, png, webp)
4. Ensure multer middleware configured

---

## Useful Resources

### Documentation
- Express.js: https://expressjs.com/
- Astro: https://astro.build/
- PostgreSQL: https://www.postgresql.org/docs/
- Knex.js: https://knexjs.org/
- Twilio SMS: https://www.twilio.com/docs/sms
- Cloudinary: https://cloudinary.com/documentation

### Tools
- Postman: API testing
- pgAdmin: PostgreSQL GUI
- VS Code Extensions: Thunder Client, ESLint, Prettier

---

## Need Help?

1. **Database Structure**: Check `DATABASE_SCHEMA.md`
2. **Implementation Details**: Check `docs/agents/AGENT_PROMPT.md`
3. **General Overview**: Check `AGENT.md`
4. **Setup Instructions**: Check `README.md`

---

## Sample Product Data (For Testing)

```sql
INSERT INTO products (sku, name, description, category, spice_level, volume_ml, base_price, wholesale_price) VALUES
('CHILI-MILD-500ML', 'Mild Chili Oil 500ml', 'Perfect for beginners, gentle heat with rich flavor', 'Chili Oil', 'mild', 500, 25.00, 20.00),
('CHILI-MED-500ML', 'Medium Chili Oil 500ml', 'Balanced heat and flavor for everyday use', 'Chili Oil', 'medium', 500, 28.00, 23.00),
('CHILI-HOT-500ML', 'Hot Chili Oil 500ml', 'For those who love serious heat', 'Chili Oil', 'hot', 500, 30.00, 25.00),
('CHILI-EXTRA-250ML', 'Extra Hot Chili Oil 250ml', 'Extreme heat for true chili lovers', 'Chili Oil', 'extra_hot', 250, 20.00, 16.00);
```

---

## Git Workflow

```bash
# Feature branch
git checkout -b feature/product-management
# ... make changes ...
git add .
git commit -m "feat: Add product creation with image upload"
git checkout main
git merge feature/product-management

# Bug fix
git checkout -b fix/sms-sending
# ... fix bug ...
git add .
git commit -m "fix: Correct SMS phone number format"
git checkout main
git merge fix/sms-sending
```

---

## Production Checklist

Before deploying:
- [ ] Change JWT_SECRET to strong random string
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Use production database
- [ ] Add rate limiting
- [ ] Enable CORS properly
- [ ] Remove console.logs
- [ ] Add error logging (Sentry)
- [ ] Backup database regularly
- [ ] Monitor SMS usage
- [ ] Set up domain and SSL

---

**Ready to build? Start with the README.md for detailed setup instructions!** 🚀
