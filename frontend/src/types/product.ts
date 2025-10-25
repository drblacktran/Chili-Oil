/**
 * Product Types
 * Support for multiple product lines and categories
 */

export type ProductCategory =
  | 'Chili Oil'
  | 'Sauce'
  | 'Condiment'
  | 'Seasoning'
  | 'Oil'
  | 'Vinegar'
  | 'Other';

export type SpiceLevel = 'none' | 'mild' | 'medium' | 'hot' | 'extra_hot';

export type ProductStatus = 'active' | 'inactive' | 'discontinued';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: ProductCategory;
  spiceLevel?: SpiceLevel;

  // Packaging
  volume_ml?: number;
  weight_g?: number;
  packagingType?: string; // e.g., 'Bottle', 'Jar', 'Pouch'

  // Pricing
  basePrice: number;
  wholesalePrice: number;
  currency: string;

  // Media
  imageUrl?: string;
  imagePublicId?: string;
  thumbnailUrl?: string;

  // Inventory settings
  minimumStockLevel: number;
  reorderQuantity: number;

  // Status
  isActive: boolean;
  isFeatured: boolean;
  status: ProductStatus;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface ProductWithInventory extends Product {
  totalStock: number;
  availableStock: number;
  reservedStock: number;
  lowStockLocations: number;
}

export interface ProductCategoryInfo {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  productCount: number;
}

export interface ProductFilters {
  category?: ProductCategory;
  status?: ProductStatus;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  lowStock?: boolean;
}
