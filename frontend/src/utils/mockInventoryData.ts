/**
 * Mock Inventory Data for Development
 * Benjamin's Chili Oil - Inventory Tracking with Restock Management
 */

import type { InventoryItem, InventoryDashboardStats, RestockSuggestion } from '../types/inventory';

/**
 * Calculate next restock date based on last restock + cycle days
 */
function calculateNextRestockDate(lastRestock: string, cycleDays: number): string {
  const date = new Date(lastRestock);
  date.setDate(date.getDate() + cycleDays);
  return date.toISOString().split('T')[0];
}

/**
 * Calculate days until next restock
 */
function calculateDaysUntilRestock(nextRestockDate: string): number {
  const today = new Date();
  const nextDate = new Date(nextRestockDate);
  const diffTime = nextDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Calculate stock status based on current stock and minimum
 */
function calculateStockStatus(
  current: number,
  minimum: number,
  maximum: number
): 'healthy' | 'low' | 'critical' | 'overstocked' {
  if (current <= minimum * 0.5) return 'critical';
  if (current <= minimum) return 'low';
  if (current > maximum) return 'overstocked';
  return 'healthy';
}

/**
 * Determine restock trigger reason
 */
function calculateRestockTriggerReason(
  currentStock: number,
  minimumStock: number,
  daysUntilRestock: number
): string | null {
  const stockLow = currentStock <= minimumStock;
  const dateDue = daysUntilRestock <= 0;
  const critical = currentStock <= minimumStock * 0.5;

  if (critical) return 'emergency';
  if (stockLow && dateDue) return 'both';
  if (stockLow) return 'stock_low';
  if (dateDue) return 'date_due';
  return null;
}

/**
 * Calculate suggested restock quantity
 */
function calculateSuggestedRestock(
  currentStock: number,
  idealStock: number,
  averageDailySales: number,
  restockCycleDays: number
): number {
  const deficitFromIdeal = idealStock - currentStock;
  const projectedSales = averageDailySales * restockCycleDays;
  return Math.max(deficitFromIdeal, projectedSales, 0);
}

/**
 * Mock Inventory Items - Benjamin's Chili Oil across all stores
 */
export const mockInventoryItems: InventoryItem[] = [
  {
    id: 'inv-001',
    product_id: 'prod-001',
    location_id: 'loc-001',
    current_stock: 30,
    minimum_stock: 30,
    maximum_stock: 50,
    ideal_stock: 40, // 80% of 50
    last_restock_date: '2025-10-25',
    next_restock_date: calculateNextRestockDate('2025-10-25', 21),
    restock_cycle_days: 21,
    average_daily_sales: 1.5,
    projected_stockout_date: null,
    days_until_stockout: 20,
    stock_value: 135.00, // 30 × $4.50
    potential_revenue: 384.00, // 30 × $12.80
    ideal_stock_percentage: 80.0,
    stock_status: 'healthy',
    needs_restock: false,
    restock_trigger_reason: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-10-25T00:00:00Z',
    last_counted_at: '2025-10-25T00:00:00Z',
    product: {
      id: 'prod-001',
      sku: 'BK-CHILI-RETAIL',
      name: "Benjamin's Chili Oil",
      description: 'Artisan chili oil with premium ingredients',
      parent_product_id: null,
      variant_attributes: null,
      retail_price: 12.80,
      unit_cost: 4.50,
      consignment_commission_rate: 30.0,
      purchase_commission_rate: 30.0,
      currency: 'AUD',
      profit_per_unit: 4.46, // 12.80 × (1 - 0.30) - 4.50
      image_url: null,
      image_public_id: null,
      thumbnail_url: null,
      default_minimum_stock: 30,
      default_maximum_stock: 50,
      default_restock_cycle_days: 21,
      is_active: true,
      is_featured: true,
      status: 'active',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-10-25T00:00:00Z',
    },
    location: {
      id: 'loc-001',
      name: "Benjamin's Kitchen",
      type: 'head_office',
      code: 'STORE001',
      contact_person: 'Benjamin',
      email: 'benjamin@chili.com.au',
      phone: '0466891665',
      address_line1: '758 Heidelberg Road',
      address_line2: null,
      city: 'Alphington',
      state: 'Victoria',
      postal_code: '3078',
      country: 'Australia',
      latitude: -37.7851,
      longitude: 145.0307,
      region: 'North East',
      restock_cycle_days: 21,
      minimum_stock_level: 30,
      maximum_stock_level: 50,
      ideal_stock_percentage: 80.0,
      average_daily_sales: 1.5,
      preferred_delivery_day: null,
      preferred_delivery_time: null,
      seasonal_multiplier: 1.0,
      seasonal_notes: null,
      parent_location_id: null,
      assigned_user_id: null,
      sms_notifications_enabled: true,
      email_notifications_enabled: true,
      emergency_restock_enabled: true,
      status: 'active',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-10-25T00:00:00Z',
    },
  },
  {
    id: 'inv-002',
    product_id: 'prod-001',
    location_id: 'loc-002',
    current_stock: 30,
    minimum_stock: 30,
    maximum_stock: 50,
    ideal_stock: 40,
    last_restock_date: '2025-10-25',
    next_restock_date: calculateNextRestockDate('2025-10-25', 21),
    restock_cycle_days: 21,
    average_daily_sales: 1.8,
    projected_stockout_date: null,
    days_until_stockout: 16,
    stock_value: 135.00,
    potential_revenue: 384.00,
    ideal_stock_percentage: 80.0,
    stock_status: 'healthy',
    needs_restock: false,
    restock_trigger_reason: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-10-25T00:00:00Z',
    last_counted_at: '2025-10-25T00:00:00Z',
    product: {
      id: 'prod-001',
      sku: 'BK-CHILI-RETAIL',
      name: "Benjamin's Chili Oil",
      description: 'Artisan chili oil with premium ingredients',
      parent_product_id: null,
      variant_attributes: null,
      retail_price: 12.80,
      unit_cost: 4.50,
      consignment_commission_rate: 30.0,
      purchase_commission_rate: 30.0,
      currency: 'AUD',
      profit_per_unit: 4.46,
      image_url: null,
      image_public_id: null,
      thumbnail_url: null,
      default_minimum_stock: 30,
      default_maximum_stock: 50,
      default_restock_cycle_days: 21,
      is_active: true,
      is_featured: true,
      status: 'active',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-10-25T00:00:00Z',
    },
    location: {
      id: 'loc-002',
      name: 'Greenmart',
      type: 'retail_store',
      code: 'STORE002',
      contact_person: 'Bill',
      email: null,
      phone: '0493360404',
      address_line1: '1226 Toorak Road',
      address_line2: null,
      city: 'Camberwell',
      state: 'Victoria',
      postal_code: '3124',
      country: 'Australia',
      latitude: -37.8569,
      longitude: 145.0624,
      region: 'East',
      restock_cycle_days: 21,
      minimum_stock_level: 30,
      maximum_stock_level: 50,
      ideal_stock_percentage: 80.0,
      average_daily_sales: 1.8,
      preferred_delivery_day: 'Monday',
      preferred_delivery_time: '10:00 AM',
      seasonal_multiplier: 1.0,
      seasonal_notes: null,
      parent_location_id: null,
      assigned_user_id: null,
      sms_notifications_enabled: true,
      email_notifications_enabled: false,
      emergency_restock_enabled: true,
      status: 'active',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-10-25T00:00:00Z',
    },
  },
  // Critical stores (stock = 10, min = 30, last restock = Oct 5)
  ...['Chat Phat Supermarket', 'Minh Phat Supermarket', 'Circle G Richmond Supermarket', 'Son Butcher & Frozen Seafood', 'Fu Lin Asian Grocery Supermarket', 'Hokkien Market', 'Oasis'].map((storeName, idx) => {
    const locationId = `loc-${String(idx + 3).padStart(3, '0')}`;
    const inventoryId = `inv-${String(idx + 3).padStart(3, '0')}`;
    const storeCode = `STORE${String(idx + 3).padStart(3, '0')}`;
    const lastRestock = '2025-10-05';
    const nextRestock = calculateNextRestockDate(lastRestock, 21);
    const daysUntil = calculateDaysUntilRestock(nextRestock);

    return {
      id: inventoryId,
      product_id: 'prod-001',
      location_id: locationId,
      current_stock: 10,
      minimum_stock: 30,
      maximum_stock: 50,
      ideal_stock: 40,
      last_restock_date: lastRestock,
      next_restock_date: nextRestock,
      restock_cycle_days: 21,
      average_daily_sales: 2.0,
      projected_stockout_date: '2025-10-30',
      days_until_stockout: 5,
      stock_value: 45.00,
      potential_revenue: 128.00,
      ideal_stock_percentage: 80.0,
      stock_status: 'critical' as const,
      needs_restock: true,
      restock_trigger_reason: 'both',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-10-25T00:00:00Z',
      last_counted_at: '2025-10-25T00:00:00Z',
      product: {
        id: 'prod-001',
        sku: 'BK-CHILI-RETAIL',
        name: "Benjamin's Chili Oil",
        description: 'Artisan chili oil with premium ingredients',
        parent_product_id: null,
        variant_attributes: null,
        retail_price: 12.80,
        unit_cost: 4.50,
        consignment_commission_rate: 30.0,
        purchase_commission_rate: 30.0,
        currency: 'AUD',
        profit_per_unit: 4.46,
        image_url: null,
        image_public_id: null,
        thumbnail_url: null,
        default_minimum_stock: 30,
        default_maximum_stock: 50,
        default_restock_cycle_days: 21,
        is_active: true,
        is_featured: true,
        status: 'active',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-10-25T00:00:00Z',
      },
      location: {
        id: locationId,
        name: storeName,
        type: 'retail_store' as const,
        code: storeCode,
        contact_person: 'Manager',
        email: null,
        phone: '04xxxxxxxx',
        address_line1: 'Store Address',
        address_line2: null,
        city: 'Melbourne',
        state: 'Victoria',
        postal_code: '3000',
        country: 'Australia',
        latitude: -37.8136,
        longitude: 144.9631,
        region: 'Inner East',
        restock_cycle_days: 21,
        minimum_stock_level: 30,
        maximum_stock_level: 50,
        ideal_stock_percentage: 80.0,
        average_daily_sales: 2.0,
        preferred_delivery_day: 'Tuesday',
        preferred_delivery_time: null,
        seasonal_multiplier: 1.0,
        seasonal_notes: null,
        parent_location_id: null,
        assigned_user_id: null,
        sms_notifications_enabled: true,
        email_notifications_enabled: false,
        emergency_restock_enabled: true,
        status: 'active',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-10-25T00:00:00Z',
      },
    } as InventoryItem;
  }),
  // Talad Thai Melbourne (healthy, stock = 40)
  {
    id: 'inv-010',
    product_id: 'prod-001',
    location_id: 'loc-010',
    current_stock: 40,
    minimum_stock: 30,
    maximum_stock: 50,
    ideal_stock: 40,
    last_restock_date: '2025-10-24',
    next_restock_date: calculateNextRestockDate('2025-10-24', 21),
    restock_cycle_days: 21,
    average_daily_sales: 1.6,
    projected_stockout_date: null,
    days_until_stockout: 25,
    stock_value: 180.00,
    potential_revenue: 512.00,
    ideal_stock_percentage: 80.0,
    stock_status: 'healthy',
    needs_restock: false,
    restock_trigger_reason: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-10-25T00:00:00Z',
    last_counted_at: '2025-10-25T00:00:00Z',
    product: {
      id: 'prod-001',
      sku: 'BK-CHILI-RETAIL',
      name: "Benjamin's Chili Oil",
      description: 'Artisan chili oil with premium ingredients',
      parent_product_id: null,
      variant_attributes: null,
      retail_price: 12.80,
      unit_cost: 4.50,
      consignment_commission_rate: 30.0,
      purchase_commission_rate: 30.0,
      currency: 'AUD',
      profit_per_unit: 4.46,
      image_url: null,
      image_public_id: null,
      thumbnail_url: null,
      default_minimum_stock: 30,
      default_maximum_stock: 50,
      default_restock_cycle_days: 21,
      is_active: true,
      is_featured: true,
      status: 'active',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-10-25T00:00:00Z',
    },
    location: {
      id: 'loc-010',
      name: 'Talad Thai Melbourne',
      type: 'retail_store',
      code: 'STORE010',
      contact_person: 'Thai Manager',
      email: null,
      phone: '0421871175',
      address_line1: '1-5 Ferguson St',
      address_line2: null,
      city: 'Abbotsford',
      state: 'Victoria',
      postal_code: '3067',
      country: 'Australia',
      latitude: -37.8052,
      longitude: 144.9976,
      region: 'Inner East',
      restock_cycle_days: 21,
      minimum_stock_level: 30,
      maximum_stock_level: 50,
      ideal_stock_percentage: 80.0,
      average_daily_sales: 1.6,
      preferred_delivery_day: 'Wednesday',
      preferred_delivery_time: '2:00 PM',
      seasonal_multiplier: 1.0,
      seasonal_notes: null,
      parent_location_id: null,
      assigned_user_id: null,
      sms_notifications_enabled: true,
      email_notifications_enabled: false,
      emergency_restock_enabled: true,
      status: 'active',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-10-25T00:00:00Z',
    },
  },
];

/**
 * Calculate dashboard statistics from inventory
 */
export const mockInventoryDashboardStats: InventoryDashboardStats = {
  total_units: mockInventoryItems.reduce((sum, item) => sum + item.current_stock, 0),
  total_value: mockInventoryItems.reduce((sum, item) => sum + item.stock_value, 0),
  total_potential_revenue: mockInventoryItems.reduce((sum, item) => sum + item.potential_revenue, 0),
  critical_stores: mockInventoryItems.filter(item => item.stock_status === 'critical').length,
  low_stock_stores: mockInventoryItems.filter(item => item.stock_status === 'low').length,
  healthy_stores: mockInventoryItems.filter(item => item.stock_status === 'healthy').length,
  restock_due_this_week: mockInventoryItems.filter(item => {
    if (!item.next_restock_date) return false;
    const daysUntil = calculateDaysUntilRestock(item.next_restock_date);
    return daysUntil >= 0 && daysUntil <= 7;
  }).length,
  restock_overdue: mockInventoryItems.filter(item => {
    if (!item.next_restock_date) return false;
    return calculateDaysUntilRestock(item.next_restock_date) < 0;
  }).length,
  average_stock_percentage: mockInventoryItems.reduce((sum, item) => {
    return sum + (item.current_stock / item.maximum_stock) * 100;
  }, 0) / mockInventoryItems.length,
  total_profit_potential: mockInventoryItems.reduce((sum, item) => {
    return sum + (item.current_stock * (item.product?.profit_per_unit || 0));
  }, 0),
};

/**
 * Generate restock suggestions for stores that need restocking
 */
export const mockRestockSuggestions: RestockSuggestion[] = mockInventoryItems
  .filter(item => item.needs_restock)
  .map(item => {
    const deficitFromIdeal = item.ideal_stock - item.current_stock;
    const projectedSales = item.average_daily_sales * item.restock_cycle_days;
    const suggestedQty = Math.max(deficitFromIdeal, projectedSales);

    let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (item.stock_status === 'critical') urgency = 'critical';
    else if (item.stock_status === 'low' && item.restock_trigger_reason === 'both') urgency = 'high';
    else if (item.stock_status === 'low') urgency = 'medium';

    return {
      inventory_id: item.id,
      location_id: item.location_id,
      location_name: item.location?.name || 'Unknown',
      product_id: item.product_id,
      current_stock: item.current_stock,
      ideal_stock: item.ideal_stock,
      minimum_stock: item.minimum_stock,
      deficit_from_ideal: deficitFromIdeal,
      projected_sales: projectedSales,
      suggested_qty: Math.round(suggestedQty),
      suggestion_reason: deficitFromIdeal > projectedSales ? 'Deficit from ideal' : 'Projected sales',
      urgency,
    };
  });
