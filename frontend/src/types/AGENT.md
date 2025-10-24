# Frontend Types Agent Guide

## Location
`/frontend/src/types/`

## Purpose
TypeScript type definitions and interfaces shared across the frontend application. Ensures type safety and consistency.

## Type Organization

### 1. Domain Types
Business entities (Product, User, Location, etc.)

### 2. API Types
Request/response shapes for API calls

### 3. UI Types
Component props and UI-specific types

### 4. Utility Types
Helper types and generic utilities

## Domain Types

### Product Types
`/types/product.ts`
```typescript
export type SpiceLevel = 'mild' | 'medium' | 'hot' | 'extra_hot';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  spice_level: SpiceLevel;
  volume_ml: number;
  weight_g?: number;
  base_price: number;
  wholesale_price: number;
  currency: string;
  image_url?: string;
  image_public_id?: string;
  thumbnail_url?: string;
  minimum_stock_level: number;
  reorder_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export type ProductFormData = Omit<Product, 'id' | 'created_at' | 'updated_at'>;

export type ProductUpdateData = Partial<ProductFormData>;
```

### User Types
`/types/user.ts`
```typescript
export type UserRole = 'admin' | 'head_office' | 'distributor';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  full_name: string;
  phone?: string;
}
```

### Location Types
`/types/location.ts`
```typescript
export type LocationType = 'head_centre' | 'distributor';
export type LocationStatus = 'active' | 'inactive' | 'suspended';

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  code: string;
  contact_person?: string;
  email?: string;
  phone: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country: string;
  business_license?: string;
  tax_id?: string;
  parent_location_id?: string;
  assigned_user_id?: string;
  sms_notifications_enabled: boolean;
  email_notifications_enabled: boolean;
  status: LocationStatus;
  created_at: string;
  updated_at: string;
}
```

### Inventory Types
`/types/inventory.ts`
```typescript
export interface Inventory {
  id: string;
  product_id: string;
  location_id: string;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  minimum_stock_level: number;
  reorder_point: number;
  last_restocked_at?: string;
  last_stock_check_at?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryWithDetails extends Inventory {
  product: Product;
  location: Location;
}

export interface StockTransferRequest {
  product_id: string;
  from_location_id: string;
  to_location_id: string;
  quantity: number;
  notes?: string;
}
```

### Stock Movement Types
`/types/stock-movement.ts`
```typescript
export type MovementType =
  | 'purchase'
  | 'transfer'
  | 'sale'
  | 'adjustment'
  | 'damage'
  | 'return';

export interface StockMovement {
  id: string;
  product_id: string;
  from_location_id?: string;
  to_location_id?: string;
  quantity: number;
  movement_type: MovementType;
  reference_number?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
}

export interface StockMovementWithDetails extends StockMovement {
  product: Product;
  from_location?: Location;
  to_location?: Location;
  creator?: User;
}
```

### SMS Types
`/types/sms.ts`
```typescript
export type SMSType =
  | 'low_stock_alert'
  | 'stock_assignment'
  | 'order_confirmation'
  | 'payment_reminder'
  | 'general_notification';

export type SMSStatus = 'pending' | 'sent' | 'delivered' | 'failed';

export interface SMSLog {
  id: string;
  phone_number: string;
  location_id?: string;
  user_id?: string;
  message_type: SMSType;
  message_body: string;
  status: SMSStatus;
  provider_response?: string;
  provider_message_id?: string;
  product_id?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  sent_at?: string;
  delivered_at?: string;
  created_at: string;
}

export interface SendSMSRequest {
  phone_number: string;
  message: string;
  message_type: SMSType;
  location_id?: string;
  product_id?: string;
}
```

## API Types

### API Response Types
`/types/api.ts`
```typescript
export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface APIError {
  success: false;
  error: {
    code: string;
    message: string;
    field?: string;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export type APIResult<T> = APIResponse<T> | APIError;
```

### Auth API Types
`/types/auth-api.ts`
```typescript
import type { User } from './user';

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
  message: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

## UI Types

### Component Props Types
`/types/component-props.ts`
```typescript
import type { Product, Location, Inventory } from './';

export interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export interface InventoryTableProps {
  inventory: Inventory[];
  locations: Location[];
  onTransfer?: (inventory: Inventory) => void;
  isLoading?: boolean;
}

export interface LocationSelectorProps {
  locations: Location[];
  value: string;
  onChange: (locationId: string) => void;
  placeholder?: string;
  excludeIds?: string[];
}
```

### Form Types
`/types/forms.ts`
```typescript
export interface FormField<T = string> {
  value: T;
  error?: string;
  touched: boolean;
}

export interface ProductFormState {
  sku: FormField;
  name: FormField;
  description: FormField;
  base_price: FormField<number>;
  spice_level: FormField<string>;
  category: FormField;
  volume_ml: FormField<number>;
}

export interface FormErrors {
  [key: string]: string;
}

export interface FormState<T> {
  values: T;
  errors: FormErrors;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}
```

### Table Types
`/types/table.ts`
```typescript
export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  column: string;
  direction: SortDirection;
}
```

## Utility Types

### Generic Utilities
`/types/utils.ts`
```typescript
// Make all properties optional
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Make specific properties required
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// Extract only the specified keys
export type PickRequired<T, K extends keyof T> = Required<Pick<T, K>>;

// Omit and make optional
export type OmitAndPartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Nullable type
export type Nullable<T> = T | null;

// Optional type
export type Optional<T> = T | undefined;

// ID type (can be string or number)
export type ID = string | number;
```

### Action Types (for state management)
`/types/actions.ts`
```typescript
export interface Action<T = any> {
  type: string;
  payload?: T;
}

export type AsyncAction<T = any> = Action<T> & {
  loading?: boolean;
  error?: string;
};
```

## Index File

### Main Types Export
`/types/index.ts`
```typescript
// Domain types
export * from './product';
export * from './user';
export * from './location';
export * from './inventory';
export * from './stock-movement';
export * from './sms';

// API types
export * from './api';
export * from './auth-api';

// UI types
export * from './component-props';
export * from './forms';
export * from './table';

// Utility types
export * from './utils';
export * from './actions';
```

## Best Practices

1. **Keep Types DRY**: Reuse base types
2. **Use Discriminated Unions**: For variants of the same type
3. **Avoid `any`**: Always provide specific types
4. **Use Generics**: For reusable type patterns
5. **Document Complex Types**: Add JSDoc comments
6. **Co-locate When Possible**: Keep types near their usage
7. **Export from Index**: Central export point

## Type Guards

### Example Type Guards
`/types/guards.ts`
```typescript
import type { APIResponse, APIError } from './api';

export function isAPIError(response: any): response is APIError {
  return response?.success === false && 'error' in response;
}

export function isAPIResponse<T>(response: any): response is APIResponse<T> {
  return response?.success === true && 'data' in response;
}
```

## Workflow Update
**Last Updated**: 2025-10-25
**Status**: Types directory created
- Directory structure ready
- Type patterns documented
- Ready for type definitions

## Next Steps
1. Create domain type files (Product, User, Location, etc.)
2. Define API response types
3. Create component prop types
4. Implement utility types
5. Add type guards
6. Export from index
