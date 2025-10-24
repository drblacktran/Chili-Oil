# AI Agent Instructions - Benjamin's Chili Oil Distribution MVP

## Project Overview
This is a **web-based inventory and distribution management system** for **Benjamin's Chili Oil**, a retail chili oil business operating in Melbourne, Victoria, Australia with plans to expand Australia-wide.

### Business Model
- **Company**: Benjamin's Chili Oil
- **Type**: Manufacturer → Retail Stores Distribution
- **Product**: Primarily Benjamin's Chili Oil (retail)
- **Primary Market**: Melbourne, Victoria, Australia
- **Expansion Plan**: Australia-wide as business grows
- **Head Office**: Benjamin's Kitchen, 758 Heidelberg Road Alphington VIC 3078
- **Current Stores**: 10 retail locations across Melbourne metro area:
  1. Benjamin's Kitchen (Head Office) - Alphington VIC 3078
  2. Greenmart - Camberwell VIC 3124
  3. Chat Phat Supermarket - Richmond VIC 3121
  4. Minh Phat Supermarket - Abbotsford VIC 3067
  5. Circle G Richmond Supermarket - Richmond VIC 3121
  6. Son Butcher & Frozen Seafood - Richmond VIC 3121
  7. Fu Lin Asian Grocery Supermarket - Camberwell VIC 3124
  8. Hokkien Market - Burwood East VIC 3151
  9. Oasis - Fairfield VIC 3078
  10. Talad Thai Melbourne - Abbotsford VIC 3067
- **Contact Persons**: New, Bill, Victor, Kim, Harry, My, Richard, Ming, George, Lisa
- **Pricing Model**: Commission-based retail (80% retail purchase commission)
- **Restock Cycle**: 21-day automatic restock calculation
- **Stock Tracking**: Current stock (10-40 units), minimum stock threshold (10-30 units), unit cost, retail price
- **Currency**: AUD (Australian Dollars)
- **Phone Format**: Australian (+61 or 04xx xxx xxx)

### System Capabilities
- Product catalog with SKU and image upload
- Inventory tracking across 10 retail store locations
- Stock level monitoring with automatic restock date calculation (21-day cycle)
- Low stock SMS alerts to store contacts via Twilio
- Stock movement audit trail
- Commission and pricing management
- Dashboard with inventory overview across all stores

---

## Your Role as an AI Assistant

You are here to help the developer build this system efficiently. Your responsibilities:

1. **Provide accurate code** based on the tech stack
2. **Reference the database schema** when building features
3. **Follow best practices** for security and performance
4. **Explain your reasoning** so the developer learns
5. **Stay within scope** - MVP only, no foundation features yet

---

## Quick Reference

### 📁 Key Files
- `DATABASE_SCHEMA.md` - Complete database design with 10 distributors
- `docs/agents/AGENT_PROMPT.md` - Detailed development guidelines and API structure
- `README.md` - Project setup and installation instructions

### 🛠 Tech Stack
- **Frontend**: Astro + React + TailwindCSS
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL
- **Services**: Twilio (SMS), Cloudinary/S3 (images)

### 📦 MVP Features (Build These)
✅ Product catalog with SKU and image upload  
✅ User authentication (admin, head office, distributor)  
✅ Inventory tracking across 10 distributor locations  
✅ Stock transfer between locations  
✅ Low stock SMS alerts via Twilio  
✅ Stock movement audit trail  
✅ Dashboard with inventory overview  

### 🚫 Foundation Features (DO NOT Build Yet)
❌ Order management  
❌ Payment tracking  
❌ Invoice generation  
❌ Credit terms  

---

## How to Assist the Developer

### When Asked to Build a Feature

1. **Check Scope**: Is it MVP or foundation layer?
2. **Review Schema**: Look at `DATABASE_SCHEMA.md` for table structure
3. **Provide Full Code**: Complete implementations, not snippets
4. **Include Validation**: Input validation and error handling
5. **Add Comments**: Explain complex logic
6. **Suggest Tests**: Propose test cases if relevant

### When Asked About Design Decisions

- Reference the database schema
- Consider scalability (10 distributors now, more later)
- Prioritize security (authentication, input validation)
- Think about user experience
- Suggest improvements while respecting MVP scope

### When Uncertain

Ask clarifying questions:
- "Is this part of the MVP or foundation layer?"
- "Should this feature send SMS notifications?"
- "Do you want real-time updates or periodic checks?"
- "What role(s) should have access to this feature?"

---

## Code Quality Standards

### Backend (Express.js)
```javascript
// ✅ Good: Proper error handling, validation, comments
async function createProduct(req, res) {
  try {
    const { sku, name, price } = req.body;
    
    // Validate input
    if (!sku || !name || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check for duplicate SKU
    const existing = await db('products').where({ sku }).first();
    if (existing) {
      return res.status(409).json({ error: 'SKU already exists' });
    }
    
    // Create product
    const [product] = await db('products').insert({
      sku,
      name,
      base_price: price
    }).returning('*');
    
    res.status(201).json({ product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

### Frontend (React)
```jsx
// ✅ Good: Loading states, error handling, user feedback
function ProductForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create product');
      }
      
      // Success handling
      toast.success('Product created successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {error && <div className="error">{error}</div>}
      <button disabled={loading}>
        {loading ? 'Creating...' : 'Create Product'}
      </button>
    </form>
  );
}
```

---

## Common Patterns

### Database Queries (Knex.js)
```javascript
// Select with joins
const inventory = await db('inventory')
  .join('products', 'inventory.product_id', 'products.id')
  .join('locations', 'inventory.location_id', 'locations.id')
  .select('products.name', 'locations.name', 'inventory.quantity')
  .where('inventory.quantity', '<', 'inventory.minimum_stock_level');

// Transaction for stock transfer
await db.transaction(async (trx) => {
  await trx('inventory')
    .where({ product_id, location_id: fromLocation })
    .decrement('quantity', amount);
    
  await trx('inventory')
    .where({ product_id, location_id: toLocation })
    .increment('quantity', amount);
    
  await trx('stock_movements').insert({
    product_id,
    from_location_id: fromLocation,
    to_location_id: toLocation,
    quantity: amount,
    movement_type: 'transfer'
  });
});
```

### SMS with Twilio
```javascript
const twilio = require('twilio');
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendSMS(to, message) {
  try {
    const result = await client.messages.create({
      body: message,
      to: to,
      from: process.env.TWILIO_PHONE_NUMBER
    });
    
    // Log the SMS
    await db('sms_logs').insert({
      phone_number: to,
      message_body: message,
      status: 'sent',
      provider_message_id: result.sid
    });
    
    return result;
  } catch (error) {
    console.error('SMS Error:', error);
    throw error;
  }
}
```

### Image Upload with Cloudinary
```javascript
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload handler
async function uploadProductImage(file) {
  const result = await cloudinary.uploader.upload(file.path, {
    folder: 'chili-oil-products',
    transformation: [
      { width: 800, height: 800, crop: 'limit' },
      { quality: 'auto' }
    ]
  });
  
  return {
    url: result.secure_url,
    public_id: result.public_id
  };
}
```

---

## Development Workflow

### Building a New Feature

1. **Plan** 
   - Review requirements
   - Check database schema
   - Identify affected tables

2. **Backend**
   - Create/update migration if needed
   - Build API endpoint
   - Add validation middleware
   - Implement business logic
   - Handle errors

3. **Frontend**
   - Create React components
   - Add API client functions
   - Implement UI/UX
   - Handle loading/error states

4. **Integration**
   - Test API endpoints
   - Test UI flows
   - Check SMS notifications (if applicable)
   - Verify database updates

5. **Documentation**
   - Update API docs
   - Add code comments
   - Update README if needed

---

## Security Checklist

- [ ] Use parameterized queries (prevent SQL injection)
- [ ] Validate and sanitize all user inputs
- [ ] Hash passwords with bcrypt (10+ rounds)
- [ ] Use JWT for authentication
- [ ] Implement rate limiting
- [ ] Use HTTPS in production
- [ ] Store secrets in environment variables
- [ ] Validate file uploads (type, size)
- [ ] Implement role-based access control
- [ ] Log security events

---

## Performance Considerations

- Use database indexes (already defined in schema)
- Paginate large result sets
- Cache frequently accessed data
- Optimize images before upload
- Use connection pooling for database
- Implement debouncing for search inputs
- Lazy load components
- Minify and bundle frontend code

---

## Database Relationships Quick View

```
users ──┬─→ locations (assigned_user_id)
        └─→ stock_movements (created_by)

locations ──┬─→ inventory
            ├─→ stock_movements (from/to)
            ├─→ sms_logs
            └─→ locations (parent_location_id, self-reference)

products ──┬─→ inventory
           ├─→ stock_movements
           └─→ sms_logs

inventory ──┬─→ products
            └─→ locations
```

---

## Environment Setup

### Required Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/chili_oil_db

# Server
PORT=3000
NODE_ENV=development

# Authentication
JWT_SECRET=your-secret-key-change-me
JWT_EXPIRES_IN=7d

# Twilio SMS
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1234567890

# Cloudinary (or AWS S3)
CLOUDINARY_CLOUD_NAME=xxxxx
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_API_SECRET=xxxxx

# CORS
FRONTEND_URL=http://localhost:4321
```

---

## API Response Format Standards

### Success Response
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "uuid",
      "sku": "CHILI-MILD-500ML",
      "name": "Mild Chili Oil"
    }
  },
  "message": "Product created successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_SKU",
    "message": "A product with this SKU already exists",
    "field": "sku"
  }
}
```

### Pagination Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

---

## Testing Approach

### Manual Testing Checklist
- [ ] Can create products with images
- [ ] Can view inventory across locations
- [ ] Can transfer stock between locations
- [ ] SMS notifications send successfully
- [ ] Low stock alerts trigger correctly
- [ ] Dashboard loads with accurate data
- [ ] Authentication works (login/logout)
- [ ] Role-based access enforced

### Sample Test Data
Use the 10 distributor locations pre-seeded in the database. Create sample products:
- CHILI-MILD-500ML (Mild Chili Oil 500ml)
- CHILI-HOT-500ML (Hot Chili Oil 500ml)
- CHILI-EXTRA-250ML (Extra Hot Chili Oil 250ml)

---

## Troubleshooting Guide

### Database Connection Issues
```javascript
// Check connection
const db = require('knex')({
  client: 'postgresql',
  connection: process.env.DATABASE_URL
});

db.raw('SELECT 1')
  .then(() => console.log('✅ Database connected'))
  .catch(err => console.error('❌ Database error:', err));
```

### SMS Not Sending
1. Check Twilio credentials
2. Verify phone number format (+60xxxxxxxxx)
3. Check Twilio account balance
4. Review `sms_logs` table for errors

### Image Upload Failing
1. Check Cloudinary credentials
2. Verify file size limits
3. Check file type restrictions
4. Ensure multer middleware is configured

---

## Next Steps After MVP

Once MVP is complete and working:
1. Add automated tests (Jest, Supertest)
2. Implement order management (foundation layer)
3. Add payment tracking
4. Create invoice generation
5. Build mobile app (React Native)
6. Add analytics and reporting
7. Implement real-time updates (WebSockets)

---

## Current Project Structure

```
Chili Oil Distribution/
├── .git/                          # Git repository
├── .gitignore                     # Comprehensive gitignore
│
├── frontend/                      # Astro + React + TailwindCSS
│   ├── src/
│   │   ├── components/           # React components
│   │   │   └── AGENT.md          # Component-specific guidelines
│   │   ├── layouts/              # Astro layouts
│   │   │   └── AGENT.md          # Layout-specific guidelines
│   │   ├── pages/                # File-based routing
│   │   │   ├── index.astro       # Landing page
│   │   │   └── AGENT.md          # Page-specific guidelines
│   │   ├── styles/
│   │   │   └── global.css        # TailwindCSS imports
│   │   ├── utils/                # Helper functions
│   │   │   └── AGENT.md          # Utils-specific guidelines
│   │   └── types/                # TypeScript definitions
│   │       └── AGENT.md          # Types-specific guidelines
│   ├── public/                   # Static assets
│   ├── astro.config.mjs          # Astro configuration
│   ├── package.json              # Dependencies
│   └── tsconfig.json             # TypeScript config
│
├── backend/                       # Express.js API (not created yet)
│   └── (to be created)
│
├── docs/
│   └── agents/
│       └── AGENT_PROMPT.md       # Detailed dev guidelines
│
├── AGENT.md                       # This file - Main agent guide
├── ASTRO_INTRODUCTION.md          # Astro framework introduction
├── DATABASE_SCHEMA.md             # Complete database design
├── PROJECT_SUMMARY.md             # Project overview
├── QUICK_START.md                 # Quick reference guide
├── README.md                      # Setup and installation
└── TODO.md                        # Development checklist
```

---

## Workflow Updates & Git History

### 2025-10-25: Initial Frontend Setup

**Completed:**
1. ✅ Git repository initialized
   - Configured with user: Tien Tran (tgtien286@gmail.com)
   - Comprehensive .gitignore created

2. ✅ Frontend setup with Astro
   - Astro 5.15.1 with React 19 integration
   - TailwindCSS v4 configured via Vite plugin
   - TypeScript strict mode enabled
   - File-based routing ready

3. ✅ Project structure created
   - Components, layouts, pages, utils, types directories
   - AGENT.md files in each subdirectory for context-specific guidance

4. ✅ Documentation created
   - ASTRO_INTRODUCTION.md - Comprehensive Astro guide for developer
   - Updated AGENT.md with current structure

**Tech Stack Confirmed:**
- Frontend: Astro 5.15.1 + React 19 + TailwindCSS v4 + TypeScript
- Build Tool: Vite
- Package Manager: npm

**Next Steps:**
1. Create MainLayout.astro with TailwindCSS imports
2. Update index.astro with proper structure
3. Set up backend Express.js structure
4. Create database with schema
5. Begin feature development (authentication → products → inventory)

---

## Agent-Specific Guidelines

### Frontend Development
Each subdirectory in `/frontend/src/` has its own `AGENT.md` file:

- **`/components/AGENT.md`**: React component guidelines, patterns, and examples
- **`/layouts/AGENT.md`**: Astro layout structure, meta tags, SEO
- **`/pages/AGENT.md`**: File-based routing, data fetching, API routes
- **`/utils/AGENT.md`**: API client, formatters, validators, helpers
- **`/types/AGENT.md`**: TypeScript type definitions and interfaces

**Before working on any frontend code:**
1. Read the relevant AGENT.md file in that directory
2. Follow the patterns and conventions documented
3. Update the AGENT.md file after significant changes

### Backend Development (When Started)
Will create similar structure:
- `/backend/src/controllers/AGENT.md`
- `/backend/src/services/AGENT.md`
- `/backend/src/models/AGENT.md`

---

## Commit Strategy

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Build process, dependencies, etc.

**Examples:**
```bash
feat(frontend): initialize Astro with React and TailwindCSS

- Astro 5.15.1 with minimal template
- React 19 integration with @astrojs/react
- TailwindCSS v4 via Vite plugin
- TypeScript strict mode
- Created directory structure (components, layouts, pages, utils, types)
- Added AGENT.md files for each subdirectory

git commit -m "feat(frontend): initialize Astro with React and TailwindCSS" -m "Details..."
```

```bash
docs: add comprehensive Astro introduction and agent guides

- Created ASTRO_INTRODUCTION.md for developer onboarding
- Added AGENT.md files in all frontend subdirectories
- Updated root AGENT.md with project structure and workflow
- Documented component, layout, page, utils, and types patterns
```

### Before Each Commit
1. Review changes: `git status` and `git diff`
2. Update relevant AGENT.md files to reflect workflow changes
3. Add git history notes to AGENT.md files
4. Write descriptive commit message
5. Commit grouped changes logically

---

## Getting Help

If the developer needs more detail on:
- **Database structure**: Direct them to `DATABASE_SCHEMA.md`
- **API design & development flow**: Direct them to `docs/agents/AGENT_PROMPT.md`
- **Astro framework**: Direct them to `ASTRO_INTRODUCTION.md`
- **Frontend subdirectories**: Direct them to relevant `/src/[directory]/AGENT.md`
- **Specific implementation**: Provide code examples
- **Best practices**: Reference this file and industry standards

---

## Summary

**Your Mission**: Help build a robust, secure, and scalable inventory management system for a chili oil distribution business. Focus on the MVP features, follow the tech stack, reference the schema, and write clean, maintainable code.

**Core Principle**: Build features that work reliably, are secure, and provide real value to the business. The developer should be able to understand and maintain your code.

**Current Status**: Frontend initialized with Astro + React + TailwindCSS. Directory structure created with agent-specific documentation. Ready for backend setup and feature development.

Good luck! 🌶️🔥
