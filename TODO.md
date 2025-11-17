# Benjamin's Chili Oil - Comprehensive TODO List

This document tracks all planned features, improvements, and missing infrastructure across the entire project.

> **Note:** Individual files also contain inline TODO comments. This document provides a high-level overview organized by phase and category.

---

## 📋 Table of Contents

- [Phase 2: PWA & Hub Expansion](#phase-2-pwa--hub-expansion)
- [Phase 3: Backend Implementation](#phase-3-backend-implementation)
- [Phase 4: Optimization & Scale](#phase-4-optimization--scale)
- [Missing Infrastructure](#missing-infrastructure)
- [Technical Debt](#technical-debt)

---

## Phase 2: PWA & Hub Expansion

### Push Notifications (Priority: HIGH)

**Status:** Not Started
**Effort:** 2-3 weeks
**Dependencies:** Service worker, backend API

- [ ] Replace SMS-based alerts with Web Push API
- [ ] Implement service worker push event handlers
- [ ] Create notification preferences UI
- [ ] Build push notification subscription management
- [ ] Add notification permission request flow
- [ ] Support multiple notification channels (Push, SMS, Email)
- [ ] Implement notification scheduling and batching
- [ ] Add rich notifications with actions
- [ ] Track notification delivery and open rates

**Files to Create:**
- `frontend/src/services/pushNotifications.ts`
- `frontend/src/components/NotificationSettings.tsx`
- `frontend/src/pages/notifications/settings.astro`

---

### Offline-First Features (Priority: HIGH)

**Status:** Not Started
**Effort:** 2-3 weeks
**Dependencies:** IndexedDB, Service worker

- [ ] Implement IndexedDB for local data storage
- [ ] Queue offline actions (transfers, stock updates)
- [ ] Background sync when connection restored
- [ ] Conflict resolution for concurrent updates
- [ ] Offline indicator with queued actions count
- [ ] Selective sync (only changed data)
- [ ] Offline-first form submissions
- [ ] Local-first optimistic UI updates

**Files to Create:**
- `frontend/src/services/db.ts` (IndexedDB wrapper)
- `frontend/src/services/syncService.ts`
- `frontend/src/components/OfflineQueue.tsx`
- `frontend/src/hooks/useOfflineSync.ts`

---

### Hub Expansion System (Priority: MEDIUM)

**Status:** Foundation Complete (UI only)
**Effort:** 4-6 weeks
**Dependencies:** Backend API, database

- [ ] Hub management API (CRUD operations)
- [ ] Economic viability calculator backend
- [ ] Region management system (custom regions)
- [ ] Multi-tier stock movement tracking (HQ → Hub → Store)
- [ ] CSV import for bulk partner upload
- [ ] Hub performance metrics dashboard
- [ ] Interactive hub placement on map
- [ ] Heat map of delivery costs
- [ ] Route optimization algorithms

**API Endpoints Needed:**
- `GET /api/hubs` - List all hubs
- `POST /api/hubs` - Create hub partnership
- `PUT /api/hubs/:id` - Update hub
- `DELETE /api/hubs/:id` - Deactivate hub
- `GET /api/regions` - List regions
- `POST /api/regions` - Create custom region
- `POST /api/hubs/scenarios/calculate` - Economic analysis
- `POST /api/hubs/import` - CSV import

**Database Tables:**
- `regional_hubs` ✓ (schema exists)
- `custom_regions` ✓ (schema exists)
- `hub_expansion_scenarios` ✓ (schema exists)
- `hub_csv_imports` ✓ (schema exists)

---

### PWA Enhancements (Priority: MEDIUM)

**Status:** Basic PWA Complete
**Effort:** 1-2 weeks

- [ ] Generate production PNG icons (192x192, 512x512)
- [ ] Add Apple Touch icons for iOS
- [ ] Create app screenshots for install prompt
- [ ] Implement smart install prompt timing
- [ ] Add welcome screen after first install
- [ ] Onboarding tour for new users
- [ ] Track install analytics
- [ ] Platform-specific install flows (iOS, Android, Desktop)
- [ ] Offline fallback page
- [ ] Update notification when new version available

**Files to Update:**
- `frontend/public/` (add PNG icons)
- `frontend/astro.config.mjs` (manifest updates)
- `frontend/public/sw.js` (advanced caching)

---

## Phase 3: Backend Implementation

### Backend Architecture (Priority: CRITICAL)

**Status:** Not Started
**Effort:** 6-8 weeks
**Decision Required:** Framework selection

**Options to Evaluate:**
1. **Node.js (Express/Fastify) + Prisma**
   - Pros: TypeScript sharing, fast development
   - Cons: Single-threaded, scaling complexity

2. **Python (FastAPI) + SQLAlchemy**
   - Pros: Strong ML/analytics support, async
   - Cons: Different language from frontend

3. **Go (Gin/Fiber) + GORM**
   - Pros: Performance, concurrency, single binary
   - Cons: Steeper learning curve

4. **Supabase (Backend-as-a-Service)**
   - Pros: Instant APIs, auth, real-time, PostgreSQL
   - Cons: Vendor lock-in, limited customization

**Recommendation:** Supabase for rapid MVP, migrate to custom backend later if needed

**Core Backend Tasks:**
- [ ] Framework selection and setup
- [ ] Database migration scripts
- [ ] API endpoint implementation (see API list below)
- [ ] Authentication system (JWT)
- [ ] Authorization middleware (RBAC)
- [ ] Error handling and logging
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Rate limiting
- [ ] CORS configuration
- [ ] Environment configuration

---

### Authentication & Authorization (Priority: CRITICAL)

**Status:** Not Started
**Effort:** 2-3 weeks

- [ ] User registration and login
- [ ] JWT token generation and validation
- [ ] Password hashing (bcrypt/argon2)
- [ ] Password reset flow (email-based)
- [ ] Session management
- [ ] Role-based access control (Admin, Manager, Viewer)
- [ ] Store-specific permissions
- [ ] OAuth integration (Google, Microsoft)
- [ ] Multi-factor authentication (optional)
- [ ] Login attempt rate limiting

**Database Tables:**
- `users` ✓ (schema exists)
- `user_sessions` (add)
- `password_reset_tokens` (add)
- `user_roles` (add)

**API Endpoints:**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`

---

### API Implementation (Priority: CRITICAL)

**Status:** Not Started
**Effort:** 8-12 weeks

#### Inventory APIs
- [ ] `GET /api/inventory` - List inventory with filters
- [ ] `GET /api/inventory/:id` - Get inventory item
- [ ] `PUT /api/inventory/:id` - Update stock level
- [ ] `POST /api/inventory/batch-update` - Batch update
- [ ] `GET /api/inventory/restock-suggestions` - Restock suggestions

#### Stock Transfer APIs
- [ ] `GET /api/transfers` - List transfers
- [ ] `POST /api/transfers` - Create transfer
- [ ] `GET /api/transfers/:id` - Get transfer details
- [ ] `PUT /api/transfers/:id/status` - Update status
- [ ] `DELETE /api/transfers/:id` - Cancel transfer

#### Alert APIs
- [ ] `GET /api/alerts/queue` - Pending alerts
- [ ] `GET /api/alerts/history` - Sent alerts
- [ ] `POST /api/alerts/:id/approve` - Approve alert
- [ ] `POST /api/alerts/:id/reject` - Reject alert
- [ ] `POST /api/alerts/bulk-approve` - Bulk approve

#### Dashboard APIs
- [ ] `GET /api/dashboard/stats` - Dashboard statistics
- [ ] `GET /api/dashboard/activities` - Recent activities
- [ ] `GET /api/dashboard/charts` - Chart data

#### Product APIs
- [ ] `GET /api/products` - List products
- [ ] `POST /api/products` - Create product
- [ ] `PUT /api/products/:id` - Update product
- [ ] `DELETE /api/products/:id` - Delete product
- [ ] `POST /api/products/:id/upload-image` - Upload image

#### Store/Location APIs
- [ ] `GET /api/stores` - List stores
- [ ] `GET /api/stores/:id` - Get store
- [ ] `PUT /api/stores/:id` - Update store
- [ ] `PUT /api/stores/:id/settings` - Update settings

#### System Logs API
- [ ] `GET /api/logs` - Activity logs with filters

---

### Database Setup (Priority: CRITICAL)

**Status:** Schema Complete, DB Not Deployed
**Effort:** 1-2 weeks

- [ ] Setup PostgreSQL database (production)
- [ ] Run migration scripts from DATABASE_SCHEMA_V2.md
- [ ] Create database indexes (60+ defined in schema)
- [ ] Implement triggers (stock status, restock calculations)
- [ ] Create functions (profit calculation)
- [ ] Seed initial data (default regions, products)
- [ ] Setup database backups
- [ ] Configure connection pooling
- [ ] Setup read replicas (for scale)

**Database Tasks:**
- [ ] Convert schema from .md to migration files (SQL or Prisma)
- [ ] Test all triggers and functions
- [ ] Optimize query performance
- [ ] Add database monitoring

---

### Notification Providers (Priority: HIGH)

**Status:** Not Started
**Effort:** 1-2 weeks

- [ ] Twilio integration for SMS
- [ ] SendGrid/AWS SES for email
- [ ] Web Push API for push notifications
- [ ] Implement retry logic for failures
- [ ] Track delivery status
- [ ] Handle unsubscribes
- [ ] Notification templates
- [ ] Multi-language support

**Files to Create:**
- `backend/src/services/sms.ts`
- `backend/src/services/email.ts`
- `backend/src/services/push.ts`
- `backend/src/templates/` (notification templates)

---

## Phase 4: Optimization & Scale

### Testing Infrastructure (Priority: HIGH)

**Status:** Not Started
**Effort:** Ongoing (start early)

#### Frontend Testing
- [ ] Setup Vitest for unit tests
- [ ] React Testing Library for component tests
- [ ] Playwright for E2E tests
- [ ] Mock service worker (MSW) for API mocking
- [ ] Test coverage targets (>80%)
- [ ] Visual regression tests (Percy/Chromatic)
- [ ] Accessibility testing (axe-core)

#### Backend Testing
- [ ] Unit tests for business logic
- [ ] Integration tests for API endpoints
- [ ] Database test fixtures
- [ ] Load testing (k6, Artillery)
- [ ] Security testing (OWASP ZAP)

#### CI/CD Testing
- [ ] Automated test runs on PR
- [ ] Parallel test execution
- [ ] Test result reporting
- [ ] Coverage reports

**Files to Create:**
- `frontend/vitest.config.ts`
- `frontend/playwright.config.ts`
- `frontend/src/**/*.test.tsx`
- `backend/tests/**/*.test.ts`

---

### Monitoring & Observability (Priority: MEDIUM)

**Status:** Not Started
**Effort:** 2-3 weeks

- [ ] Sentry for error tracking (frontend + backend)
- [ ] Application Performance Monitoring (APM)
- [ ] Logging infrastructure (structured logs)
- [ ] Analytics (Google Analytics or Plausible)
- [ ] Custom event tracking
- [ ] Web Vitals monitoring
- [ ] Uptime monitoring
- [ ] Alert on critical errors
- [ ] Performance budgets

**Tools:**
- Sentry (errors)
- Datadog/New Relic (APM)
- LogDNA/Papertrail (logs)
- Plausible/GA4 (analytics)

---

### Performance Optimization (Priority: MEDIUM)

**Status:** Partially Implemented
**Effort:** Ongoing

- [ ] Redis caching for frequent queries
- [ ] Database query optimization
- [ ] CDN for static assets
- [ ] Image optimization (WebP, AVIF)
- [ ] Code splitting and lazy loading
- [ ] Server-side rendering (SSR) for critical pages
- [ ] Edge caching (Cloudflare, Vercel Edge)
- [ ] Bundle size optimization
- [ ] Lighthouse score >90

**Current Status:**
- ✓ Code splitting (Astro native)
- ✓ PWA caching
- ✗ CDN
- ✗ Database caching
- ✗ Image optimization

---

### Security Hardening (Priority: HIGH)

**Status:** Basic Security Only
**Effort:** 2-3 weeks

- [ ] HTTPS enforcement
- [ ] Content Security Policy (CSP)
- [ ] CORS configuration
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] Rate limiting
- [ ] Input validation (Zod/Joi)
- [ ] Secrets management (Vault, AWS Secrets Manager)
- [ ] Security headers (Helmet.js)
- [ ] Regular dependency audits
- [ ] Penetration testing

---

## Missing Infrastructure

### Development Tools

- [ ] **API Client Service Layer**
  - Centralized API service (`src/services/api.ts`)
  - Request/response interceptors
  - Error handling
  - Type-safe API calls
  - Retry logic

- [ ] **State Management**
  - Evaluate: React Query, SWR, Zustand, or Redux
  - Global state for user, auth, notifications
  - Persistent state (localStorage)

- [ ] **Form Management**
  - React Hook Form or Formik
  - Form validation library (Zod)
  - Reusable form components

- [ ] **Date/Time Utilities**
  - date-fns or Day.js
  - Timezone handling
  - Date formatting utilities

- [ ] **Error Boundaries**
  - React error boundaries for crash recovery
  - Fallback UI components
  - Error reporting to Sentry

---

### DevOps & Deployment

- [ ] **CI/CD Pipeline**
  - ✓ TypeScript checking (done)
  - [ ] Automated testing
  - [ ] Build and deploy on merge
  - [ ] Preview deployments
  - [ ] Rollback mechanism

- [ ] **Environment Management**
  - Development, staging, production
  - Environment-specific configs
  - Feature flags

- [ ] **Database Migrations**
  - Migration tool (Prisma, Knex, Flyway)
  - Version control for schema changes
  - Rollback support

- [ ] **Deployment Infrastructure**
  - Frontend: Vercel, Netlify, or Cloudflare Pages
  - Backend: Railway, Render, Fly.io, or AWS
  - Database: Supabase, PlanetScale, or self-hosted
  - Object storage: Cloudinary, AWS S3 (for images)

---

### Documentation

- [ ] **API Documentation**
  - OpenAPI/Swagger spec
  - API endpoint documentation
  - Request/response examples
  - Postman collection

- [ ] **Developer Guide**
  - Setup instructions
  - Architecture overview
  - Coding standards
  - Git workflow

- [ ] **User Guide**
  - Feature documentation
  - Screenshots/videos
  - FAQ
  - Troubleshooting

- [ ] **Deployment Guide**
  - Production deployment steps
  - Environment variables
  - Database setup
  - SSL certificate setup

---

## Technical Debt

### Code Quality

- [ ] Add ESLint for frontend
- [ ] Add Prettier for code formatting
- [ ] Setup pre-commit hooks (Husky)
- [ ] Remove console.logs from production
- [ ] Add JSDoc comments to complex functions
- [ ] TypeScript strict mode fixes (if any)

---

### Component Refactoring

- [ ] Extract common patterns into hooks
- [ ] Create reusable UI component library
- [ ] Standardize form components
- [ ] Consolidate similar components
- [ ] Improve component prop types

---

### Data Layer

- [ ] Replace all mock data with API calls
- [ ] Implement data caching strategy
- [ ] Add loading skeletons
- [ ] Error state handling
- [ ] Empty state handling

---

## Progress Tracking

### Phase Summary

| Phase | Status | Completion |
|-------|--------|-----------|
| Phase 1 (Frontend) | ✅ Complete | 100% |
| Phase 2 (PWA + Hubs) | 🟡 In Progress | 20% |
| Phase 3 (Backend) | ⚪ Not Started | 0% |
| Phase 4 (Optimization) | ⚪ Not Started | 0% |

### Priority Items (Next 30 Days)

1. **Backend Architecture Decision** (Week 1)
   - Evaluate frameworks
   - Select tech stack
   - Plan API structure

2. **Authentication System** (Week 2-3)
   - User login/registration
   - JWT implementation
   - RBAC setup

3. **Core API Implementation** (Week 4+)
   - Inventory APIs
   - Transfer APIs
   - Dashboard APIs

---

## Notes

- All TODO items in this file are also referenced in individual source files
- See inline `// TODO [PHASE X]:` comments throughout the codebase
- Priority levels: CRITICAL > HIGH > MEDIUM > LOW
- Effort estimates are rough and may change
- Some tasks can be parallelized

---

**Last Updated:** 2025-11-17
**Next Review:** Weekly during active development
