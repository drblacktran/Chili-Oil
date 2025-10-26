# Benjamin's Chili Oil - Distribution Management System

A web-based inventory and distribution management system for managing chili oil products across retail store locations in Melbourne, Australia.

---

## Current Status

### Frontend: Completed (Phase 1A)
Progressive Web App with comprehensive inventory management UI built with Astro + React + TypeScript.

### Backend: Architecture Pending
Backend implementation requires further consulting and strategic planning. Current focus is on frontend development.

---

## Implemented Features (Frontend)

**Inventory Management**
- Real-time stock dashboard across 10 Melbourne retail stores
- Advanced filtering by status, region, restock needs
- Batch stock updates with audit trail
- Restock suggestions with urgency levels
- Stock status indicators (Critical, Low, Healthy)

**Stock Transfer System**
- Transfer flow between locations
- Smart quantity suggestions
- Transfer types (Scheduled, Emergency, Adjustment)
- Stock level preview and value calculations

**Alert Management**
- Alert approval queue system
- Priority filtering and message preview
- Bulk approval functionality
- Alert types (Critical, Low Stock, Upcoming, Overdue, Emergency)

**Store Settings**
- Per-store restock configuration
- Cycle days, min/max/ideal stock levels
- Sales velocity tracking
- Delivery preferences and seasonal adjustments
- Real-time calculation previews

**Product Catalog**
- Product grid with category filtering
- Product cards with pricing information

**Progressive Web App**
- Offline support with service worker
- Install prompt for mobile devices
- API and image caching
- App-like experience on mobile

**CI/CD Pipeline**
- GitHub Actions type checking
- Pre-commit hooks
- Automated PR validation

---

## Tech Stack

### Frontend (Current)
- **Astro 5.15.1** - SSR/SSG framework
- **React 19** - Interactive components
- **TypeScript 5.9.3** - Type safety
- **TailwindCSS 4.1.16** - Utility-first styling
- **@vite-pwa/astro** - PWA support
- **workbox-window** - Service worker management

### Backend (Planned - Architecture TBD)
Backend architecture requires additional consulting to determine optimal approach for:
- API design patterns
- Database ORM selection
- Authentication strategy
- Notification system (Web Push vs SMS)
- Deployment architecture

### Database (Design Complete)
- **PostgreSQL** - Database schema V2 ready
- 7 core tables with application-layer constraints
- Automated triggers for restock calculations
- Profit calculation functions

---

## Project Structure

```
Chili Oil/
├── frontend/                    # Astro + React frontend (COMPLETED)
│   ├── src/
│   │   ├── components/         # 18 React components
│   │   ├── layouts/            # MainLayout
│   │   ├── pages/              # 8 Astro pages (file-based routing)
│   │   ├── types/              # TypeScript definitions
│   │   └── utils/              # Mock data and helpers
│   ├── public/
│   ├── astro.config.mjs        # Astro + PWA configuration
│   ├── package.json
│   └── AGENT.md                # Complete frontend documentation
│
├── .github/
│   └── workflows/
│       └── typecheck.yml       # CI/CD pipeline
│
├── .githooks/
│   └── pre-commit              # Local type checking
│
├── DATABASE_SCHEMA_V2.md       # PostgreSQL schema (application-layer constraints)
├── CI_SETUP.md                 # CI/CD documentation
└── README.md                   # This file
```

---

## Getting Started (Frontend Development)

### Prerequisites
- Node.js 20+
- npm

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at `http://localhost:4321`

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run typecheck  # Run TypeScript type checking
```

### Type Checking

The project uses strict TypeScript with automated validation:

```bash
# Run locally
npm run typecheck

# Pre-commit hook runs automatically
# GitHub Actions runs on push/PR
```

---

## Database Schema

Complete PostgreSQL schema available in `DATABASE_SCHEMA_V2.md`.

**Core Tables:**
1. **products** - Product catalog with pricing and profit calculations
2. **locations** - Head office + 10 retail stores with restock settings
3. **inventory** - Stock levels per product per location
4. **stock_movements** - Complete audit trail of transfers
5. **alert_queue** - Notification approval queue
6. **users** - Authentication and role management
7. **sms_logs** - Notification history (future: notification_logs for Web Push)

**Key Features:**
- Application-layer constraints (no database constraints)
- Automated restock date calculations (21-day cycle)
- Stock status triggers (Critical, Low, Healthy)
- Profit calculation function
- Sales velocity projections

---

## Frontend Routes

```
/                           Home dashboard
/inventory                  Inventory management with filtering
/products                   Product catalog
/settings                   Application settings
/alerts/pending             Alert approval queue
/alerts/history             Sent alerts history
/stores/[id]/settings       Per-store configuration (dynamic route)
/transfers                  Transfer history
/transfers/new              New stock transfer
```

---

## Documentation

**Comprehensive Guide:** `frontend/AGENT.md` (1,500+ lines)
- Complete frontend architecture
- Full database schema V2
- Component documentation
- TypeScript type system
- Development workflow
- Deployment guide
- Troubleshooting

**Database Schema:** `DATABASE_SCHEMA_V2.md`
- 7 tables with detailed schemas
- Triggers and functions
- Sample queries
- Initialization scripts

**CI/CD Setup:** `CI_SETUP.md`
- GitHub Actions workflow
- Pre-commit hook setup
- Type checking process

---

## Development Workflow

### Code Quality
- **TypeScript:** Strict mode with full type coverage
- **React:** Functional components with hooks
- **Styling:** TailwindCSS utility-first approach
- **Testing:** Type checking (0 errors, 0 warnings)

### CI/CD Pipeline
1. Local pre-commit hook validates TypeScript
2. GitHub Actions runs on push/PR
3. Type check must pass before merge
4. Automated PR comments on failures

### Git Workflow
```bash
# Make changes
git add .

# Pre-commit hook runs automatically
# If type errors exist, commit is blocked

# Commit with descriptive message
git commit -m "feat: add new feature"

# Push to remote
git push origin branch-name
```

---

## Environment Variables

Frontend (`.env` in `/frontend`):

```env
# API endpoint (when backend is implemented)
PUBLIC_API_URL=http://localhost:3000
```

Backend environment variables to be determined during architecture planning.

---

## Deployment

### Frontend (Vercel/Netlify)

```bash
cd frontend
npm install
npm run build

# Deploy dist/ directory
# Set environment variable: PUBLIC_API_URL
```

### Backend (TBD)

Backend deployment strategy will be determined during architecture planning phase.

---

## Next Steps

### Immediate Priorities
1. **Push Notifications Infrastructure**
   - Replace SMS approval with Web Push API
   - Notification settings page
   - Permission flow

2. **Offline Data Strategy**
   - IndexedDB implementation
   - Queue offline actions
   - Background sync

### Future Phases

**Phase 2: Store Manager Portal**
- Authentication system
- Role-based access control
- Mobile-optimized dashboard for store managers
- Quick stock adjustment interface

**Phase 3: Backend Implementation**
- Architecture consulting and planning
- API design and implementation
- Database setup and migrations
- Authentication endpoints

**Phase 4: Production Launch**
- Performance optimization
- Security hardening
- User acceptance testing
- Deployment and monitoring

---

## Business Configuration

Business-specific parameters (pricing, store locations, contacts, etc.) are stored in `business.config.local.ts` which is gitignored for security.

**Setup:**
```bash
# Copy the template
cp business.config.example.ts business.config.local.ts

# Edit with your actual values
# This file is gitignored and will not be committed
```

The configuration includes:
- Company information
- Product pricing and profit margins
- Inventory parameters (restock cycles, stock levels)
- Store locations and contact details
- Commission rates

See `business.config.example.ts` for the structure.

---

## Browser Compatibility

**Tested:**
- Chrome/Edge (latest)
- Safari (latest)
- Firefox (latest)
- iOS Safari (PWA install)
- Chrome Android (PWA install)

**PWA Features:**
- Installable on mobile devices
- Offline mode with cached data
- App-like standalone display
- Service worker auto-updates

---

## Performance

**Metrics:**
- Lighthouse score target: >90
- Type checking: 0 errors, 0 warnings
- Bundle size: Optimized with code splitting
- Image loading: Lazy loading implemented

---

## Troubleshooting

### Type Errors
```bash
cd frontend
npm run typecheck
# Fix reported errors
```

### PWA Not Installing
- Verify HTTPS in production
- Check manifest.json accessibility
- Verify service worker registration in DevTools

### Build Failures
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Dev Server Issues
```bash
# Check for multiple dev servers
lsof -i :4321
# Kill process if needed
kill -9 <PID>
# Restart
npm run dev
```

---

## Resources

**Documentation:**
- Astro: https://docs.astro.build
- React: https://react.dev
- TailwindCSS: https://tailwindcss.com/docs
- TypeScript: https://www.typescriptlang.org/docs

**Internal Docs:**
- Frontend Guide: `frontend/AGENT.md`
- Database Schema: `DATABASE_SCHEMA_V2.md`
- CI/CD Setup: `CI_SETUP.md`

---

## Contributing

1. Follow TypeScript strict mode
2. Use TailwindCSS for styling
3. Write functional React components
4. Add type definitions for all props
5. Run type check before committing
6. Write descriptive commit messages

---

## License

MIT License

---

**Note:** Backend architecture is currently under consultation. This README focuses on the implemented frontend. Backend documentation will be added once architectural decisions are finalized.

**Business Configuration:** Sensitive business information (pricing, contacts, locations) is stored in `business.config.local.ts` (gitignored). See `business.config.example.ts` for setup instructions.
