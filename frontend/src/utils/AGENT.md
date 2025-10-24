# Frontend Utils Agent Guide

## Location
`/frontend/src/utils/`

## Purpose
Utility functions and helpers used throughout the frontend application. Keep code DRY and maintainable.

## Utility Categories

### 1. API Client (`/api/`)
Centralized API communication functions

### 2. Formatters (`/formatters/`)
Data formatting and display helpers

### 3. Validators (`/validators/`)
Input validation functions

### 4. Constants (`/constants/`)
Shared constants and configuration

### 5. Helpers (`/helpers/`)
General-purpose utility functions

## API Client

### Base API Client
`/utils/api/client.ts`
```typescript
const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';

interface RequestOptions extends RequestInit {
  token?: string;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}
```

### Products API
`/utils/api/products.ts`
```typescript
import { apiRequest } from './client';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  base_price: number;
  image_url?: string;
  category: string;
  spice_level: 'mild' | 'medium' | 'hot' | 'extra_hot';
}

export async function getProducts(token?: string): Promise<Product[]> {
  return apiRequest<Product[]>('/api/products', { token });
}

export async function getProduct(id: string, token?: string): Promise<Product> {
  return apiRequest<Product>(`/api/products/${id}`, { token });
}

export async function createProduct(data: Partial<Product>, token: string): Promise<Product> {
  return apiRequest<Product>('/api/products', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

export async function updateProduct(
  id: string,
  data: Partial<Product>,
  token: string
): Promise<Product> {
  return apiRequest<Product>(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    token,
  });
}

export async function deleteProduct(id: string, token: string): Promise<void> {
  return apiRequest<void>(`/api/products/${id}`, {
    method: 'DELETE',
    token,
  });
}
```

### Auth API
`/utils/api/auth.ts`
```typescript
import { apiRequest } from './client';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'head_office' | 'distributor';
  phone?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(data: {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getCurrentUser(token: string): Promise<User> {
  return apiRequest<User>('/api/auth/me', { token });
}
```

## Formatters

### Currency Formatter
`/utils/formatters/currency.ts`
```typescript
export function formatCurrency(amount: number, currency: string = 'MYR'): string {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

// Usage: formatCurrency(25.50) → "RM25.50"
```

### Date Formatter
`/utils/formatters/date.ts`
```typescript
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}
```

### SKU Formatter
`/utils/formatters/sku.ts`
```typescript
export function generateSKU(name: string, variant: string, size: number): string {
  const namePrefix = name.toUpperCase().replace(/\s+/g, '-').slice(0, 10);
  const variantPrefix = variant.toUpperCase().slice(0, 4);
  const sizeStr = `${size}ML`;

  return `${namePrefix}-${variantPrefix}-${sizeStr}`;
}

// Usage: generateSKU('Chili Oil', 'Mild', 500) → "CHILI-OIL-MILD-500ML"
```

## Validators

### Email Validator
`/utils/validators/email.ts`
```typescript
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

### Phone Validator
`/utils/validators/phone.ts`
```typescript
export function isValidMalaysianPhone(phone: string): boolean {
  // Malaysian phone: +60 followed by 9-10 digits
  const phoneRegex = /^\+60\d{9,10}$/;
  return phoneRegex.test(phone);
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');

  // Add +60 prefix if not present
  if (!cleaned.startsWith('60')) {
    return `+60${cleaned}`;
  }

  return `+${cleaned}`;
}
```

### Form Validators
`/utils/validators/forms.ts`
```typescript
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateProductForm(data: {
  sku: string;
  name: string;
  price: number;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.sku || data.sku.trim().length === 0) {
    errors.sku = 'SKU is required';
  }

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Product name is required';
  }

  if (!data.price || data.price <= 0) {
    errors.price = 'Price must be greater than 0';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
```

## Constants

### API Routes
`/utils/constants/routes.ts`
```typescript
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
    LOGOUT: '/api/auth/logout',
  },
  PRODUCTS: {
    LIST: '/api/products',
    DETAIL: (id: string) => `/api/products/${id}`,
    CREATE: '/api/products',
    UPDATE: (id: string) => `/api/products/${id}`,
    DELETE: (id: string) => `/api/products/${id}`,
  },
  INVENTORY: {
    LIST: '/api/inventory',
    LOW_STOCK: '/api/inventory/low-stock',
    TRANSFER: '/api/inventory/transfer',
  },
};
```

### UI Constants
`/utils/constants/ui.ts`
```typescript
export const SPICE_LEVELS = {
  mild: { label: 'Mild', color: 'green' },
  medium: { label: 'Medium', color: 'yellow' },
  hot: { label: 'Hot', color: 'orange' },
  extra_hot: { label: 'Extra Hot', color: 'red' },
} as const;

export const USER_ROLES = {
  admin: 'Administrator',
  head_office: 'Head Office',
  distributor: 'Distributor',
} as const;

export const PAGINATION_LIMIT = 20;
```

## Helpers

### Local Storage Helper
`/utils/helpers/storage.ts`
```typescript
export function getItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

export function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function removeItem(key: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(key);
}
```

### Token Helper
`/utils/helpers/token.ts`
```typescript
import { getItem, setItem, removeItem } from './storage';

const TOKEN_KEY = 'auth_token';

export function getAuthToken(): string | null {
  return getItem<string>(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  setItem(TOKEN_KEY, token);
}

export function removeAuthToken(): void {
  removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}
```

### Class Names Helper
`/utils/helpers/classnames.ts`
```typescript
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Usage:
// cn('base-class', isActive && 'active', 'another-class')
```

## Testing Utils

### Mock Data
`/utils/testing/mockData.ts`
```typescript
export const mockProducts = [
  {
    id: '1',
    sku: 'CHILI-MILD-500ML',
    name: 'Mild Chili Oil 500ml',
    base_price: 25.00,
    spice_level: 'mild' as const,
  },
  // More mock data...
];
```

## Utils Checklist

When creating utilities:
- [ ] Pure functions (no side effects where possible)
- [ ] TypeScript types/interfaces
- [ ] Error handling
- [ ] JSDoc comments
- [ ] Unit tests (if applicable)
- [ ] Consistent naming
- [ ] Export from index file

## File Structure

```
utils/
├── api/
│   ├── client.ts         # Base API client
│   ├── auth.ts           # Auth endpoints
│   ├── products.ts       # Product endpoints
│   ├── inventory.ts      # Inventory endpoints
│   └── index.ts          # Exports
├── formatters/
│   ├── currency.ts
│   ├── date.ts
│   └── index.ts
├── validators/
│   ├── email.ts
│   ├── phone.ts
│   ├── forms.ts
│   └── index.ts
├── constants/
│   ├── routes.ts
│   ├── ui.ts
│   └── index.ts
├── helpers/
│   ├── storage.ts
│   ├── token.ts
│   ├── classnames.ts
│   └── index.ts
└── AGENT.md             # This file
```

## Workflow Update
**Last Updated**: 2025-10-25
**Status**: Utils directory created
- Directory structure ready
- Guidelines documented
- API client patterns defined
- Ready for implementation

## Next Steps
1. Create base API client
2. Implement auth API functions
3. Create formatters (currency, date)
4. Implement validators
5. Add constants file
6. Create helper functions
