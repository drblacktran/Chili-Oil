/**
 * Hub Economics Calculator
 * Calculate cost savings, ROI, and break-even for regional hubs
 */

import type { HubCostAssumptions, HubEconomicsResult, HubViabilityCriteria } from '../types/hub';

/**
 * Cost assumptions for hub economics calculations
 * These can be adjusted based on actual business data
 */
export const HUB_COST_ASSUMPTIONS: HubCostAssumptions = {
  // Current State (Direct Shipping from Head Office)
  DIRECT_SHIPPING_COST_PER_SHIPMENT: 15.00, // $ per shipment
  SHIPMENTS_PER_STORE_PER_MONTH: 2, // Bi-weekly deliveries
  
  // With Hub
  BULK_SHIPPING_DISCOUNT_RATE: 0.40, // 40% discount for bulk shipments
  LOCAL_DELIVERY_COST_PER_SHIPMENT: 5.00, // Local hub-to-store delivery
  AVERAGE_ORDER_VALUE: 500.00, // Average product value per order
  
  // Setup Costs (One-time)
  DEFAULT_SETUP_COST: 5000.00, // Equipment, training, signage, etc.
  
  // Operating Costs (Monthly)
  DEFAULT_STORAGE_FEE: 200.00, // Monthly storage/rent fee
  DEFAULT_COMMISSION_RATE: 5.00, // Hub commission percentage
};

/**
 * Minimum viability criteria for hub approval
 */
export const HUB_VIABILITY_CRITERIA: HubViabilityCriteria = {
  // Hard Constraints (must meet all)
  minimum_stores: 3, // Need at least 3 stores for economies of scale
  minimum_monthly_savings: 100, // Must save at least $100/month
  maximum_break_even_months: 24, // Must break even within 2 years
  
  // Soft Constraints (ideal targets)
  ideal_stores: 5, // 5+ stores is strong case
  ideal_monthly_savings: 500, // $500+/month is excellent
  ideal_break_even_months: 12, // Break even within 1 year is ideal
};

/**
 * Calculate hub economics for a given scenario
 * 
 * @param storeCount Number of stores in target region
 * @param commissionRate Hub commission percentage (default 5%)
 * @param storageFee Monthly storage fee (default $200)
 * @param setupCost One-time setup cost (default $5000)
 * @returns Detailed economics breakdown
 */
export function calculateHubEconomics(
  storeCount: number,
  commissionRate: number = HUB_COST_ASSUMPTIONS.DEFAULT_COMMISSION_RATE,
  storageFee: number = HUB_COST_ASSUMPTIONS.DEFAULT_STORAGE_FEE,
  setupCost: number = HUB_COST_ASSUMPTIONS.DEFAULT_SETUP_COST
): HubEconomicsResult {
  // Current costs (direct shipping from Head Office to each store)
  const currentMonthly = 
    storeCount * 
    HUB_COST_ASSUMPTIONS.SHIPMENTS_PER_STORE_PER_MONTH * 
    HUB_COST_ASSUMPTIONS.DIRECT_SHIPPING_COST_PER_SHIPMENT;
  
  // Projected costs with hub
  
  // 1. Bulk shipments from Head Office to Hub (weekly = 4 times/month)
  //    Bulk rate is 60% of individual shipping (40% discount)
  const weeklyBulkShipments = 4;
  const bulkShipmentCost = 
    weeklyBulkShipments * 
    (storeCount * HUB_COST_ASSUMPTIONS.DIRECT_SHIPPING_COST_PER_SHIPMENT * 
    (1 - HUB_COST_ASSUMPTIONS.BULK_SHIPPING_DISCOUNT_RATE));
  
  // 2. Local delivery from Hub to Stores (bi-weekly = 2 times/month per store)
  //    Much cheaper as it's short distance
  const localDeliveryCost = 
    storeCount * 
    HUB_COST_ASSUMPTIONS.SHIPMENTS_PER_STORE_PER_MONTH * 
    HUB_COST_ASSUMPTIONS.LOCAL_DELIVERY_COST_PER_SHIPMENT;
  
  // 3. Hub commission (percentage of product value)
  const hubCommission = 
    storeCount * 
    HUB_COST_ASSUMPTIONS.SHIPMENTS_PER_STORE_PER_MONTH * 
    HUB_COST_ASSUMPTIONS.AVERAGE_ORDER_VALUE * 
    (commissionRate / 100);
  
  // 4. Storage fee (flat monthly fee)
  const storageFeeCost = storageFee;
  
  // Total projected monthly cost
  const projectedMonthly = 
    bulkShipmentCost + localDeliveryCost + hubCommission + storageFeeCost;
  
  // Savings calculation
  const monthlySavings = currentMonthly - projectedMonthly;
  
  // Break-even calculation (months to recover setup cost)
  const breakEvenMonths = monthlySavings > 0 
    ? Math.ceil(setupCost / monthlySavings)
    : null;
  
  // ROI calculation (12-month return on investment)
  const roi12Months = setupCost > 0
    ? ((monthlySavings * 12) / setupCost) * 100
    : null;
  
  // Economic viability check
  const isEconomical = 
    monthlySavings >= HUB_VIABILITY_CRITERIA.minimum_monthly_savings &&
    storeCount >= HUB_VIABILITY_CRITERIA.minimum_stores &&
    (breakEvenMonths !== null && breakEvenMonths <= HUB_VIABILITY_CRITERIA.maximum_break_even_months);
  
  return {
    stores_count: storeCount,
    current_monthly_cost: currentMonthly,
    projected_costs: {
      bulk_shipments: bulkShipmentCost,
      local_deliveries: localDeliveryCost,
      hub_commission: hubCommission,
      storage_fee: storageFeeCost,
      total: projectedMonthly,
    },
    monthly_savings: monthlySavings,
    break_even_months: breakEvenMonths,
    roi_12_months: roi12Months,
    is_economical: isEconomical,
  };
}

/**
 * Get viability rating based on economics
 * 
 * @param economics Economics calculation result
 * @returns Viability rating and message
 */
export function getViabilityRating(economics: HubEconomicsResult): {
  rating: 'excellent' | 'good' | 'marginal' | 'poor';
  color: string;
  label: string;
  message: string;
} {
  const { stores_count, monthly_savings, break_even_months, is_economical } = economics;
  
  if (!is_economical) {
    return {
      rating: 'poor',
      color: 'red',
      label: 'Not Viable',
      message: 'Does not meet minimum viability criteria',
    };
  }
  
  // Excellent: Meets all ideal criteria
  if (
    stores_count >= HUB_VIABILITY_CRITERIA.ideal_stores &&
    monthly_savings >= HUB_VIABILITY_CRITERIA.ideal_monthly_savings &&
    break_even_months !== null &&
    break_even_months <= HUB_VIABILITY_CRITERIA.ideal_break_even_months
  ) {
    return {
      rating: 'excellent',
      color: 'green',
      label: 'Excellent Opportunity',
      message: `Strong case: ${stores_count} stores, $${monthly_savings.toFixed(0)}/mo savings, ${break_even_months}mo break-even`,
    };
  }
  
  // Good: Meets 2/3 ideal criteria
  const idealCriteriaMet = [
    stores_count >= HUB_VIABILITY_CRITERIA.ideal_stores,
    monthly_savings >= HUB_VIABILITY_CRITERIA.ideal_monthly_savings,
    break_even_months !== null && break_even_months <= HUB_VIABILITY_CRITERIA.ideal_break_even_months,
  ].filter(Boolean).length;
  
  if (idealCriteriaMet >= 2) {
    return {
      rating: 'good',
      color: 'blue',
      label: 'Good Opportunity',
      message: `Viable: ${stores_count} stores, $${monthly_savings.toFixed(0)}/mo savings, ${break_even_months}mo break-even`,
    };
  }
  
  // Marginal: Meets minimum but not ideal
  return {
    rating: 'marginal',
    color: 'yellow',
    label: 'Marginal Case',
    message: `Review needed: ${stores_count} stores, $${monthly_savings.toFixed(0)}/mo savings, ${break_even_months}mo break-even`,
  };
}

/**
 * Calculate total savings over period
 * 
 * @param monthlyovings Monthly cost savings
 * @param months Number of months
 * @returns Total savings
 */
export function calculateTotalSavings(monthlySavings: number, months: number): number {
  return monthlySavings * months;
}

/**
 * Calculate payback period in years
 * 
 * @param setupCost One-time setup cost
 * @param monthlySavings Monthly savings
 * @returns Payback period in years (rounded to 1 decimal)
 */
export function calculatePaybackYears(setupCost: number, monthlySavings: number): number | null {
  if (monthlySavings <= 0) return null;
  return Math.round((setupCost / monthlySavings / 12) * 10) / 10;
}

/**
 * Estimate hub commission for a region
 * 
 * @param storeCount Number of stores
 * @param averageOrderValue Average order value per shipment
 * @param shipmentsPerMonth Shipments per store per month
 * @param commissionRate Commission percentage
 * @returns Total monthly commission
 */
export function estimateMonthlyCommission(
  storeCount: number,
  averageOrderValue: number = HUB_COST_ASSUMPTIONS.AVERAGE_ORDER_VALUE,
  shipmentsPerMonth: number = HUB_COST_ASSUMPTIONS.SHIPMENTS_PER_STORE_PER_MONTH,
  commissionRate: number = HUB_COST_ASSUMPTIONS.DEFAULT_COMMISSION_RATE
): number {
  return storeCount * shipmentsPerMonth * averageOrderValue * (commissionRate / 100);
}

/**
 * Format currency for display
 * 
 * @param amount Dollar amount
 * @param includeCents Include cents in display
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, includeCents: boolean = false): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: includeCents ? 2 : 0,
    maximumFractionDigits: includeCents ? 2 : 0,
  }).format(amount);
}

/**
 * Format percentage for display
 * 
 * @param percentage Percentage value
 * @param decimals Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(percentage: number, decimals: number = 0): string {
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Get recommendation based on economics
 * 
 * @param economics Economics result
 * @returns Recommendation object
 */
export function getHubRecommendation(economics: HubEconomicsResult): {
  shouldApprove: boolean;
  priority: 'high' | 'medium' | 'low';
  reasons: string[];
  concerns: string[];
} {
  const viability = getViabilityRating(economics);
  const shouldApprove = viability.rating === 'excellent' || viability.rating === 'good';
  
  const reasons: string[] = [];
  const concerns: string[] = [];
  
  // Store count analysis
  if (economics.stores_count >= HUB_VIABILITY_CRITERIA.ideal_stores) {
    reasons.push(`Strong store density (${economics.stores_count} stores)`);
  } else if (economics.stores_count >= HUB_VIABILITY_CRITERIA.minimum_stores) {
    concerns.push(`Low store count (${economics.stores_count}, ideal: ${HUB_VIABILITY_CRITERIA.ideal_stores}+)`);
  } else {
    concerns.push(`Insufficient stores (${economics.stores_count}, minimum: ${HUB_VIABILITY_CRITERIA.minimum_stores})`);
  }
  
  // Savings analysis
  if (economics.monthly_savings >= HUB_VIABILITY_CRITERIA.ideal_monthly_savings) {
    reasons.push(`Excellent savings (${formatCurrency(economics.monthly_savings)}/month)`);
  } else if (economics.monthly_savings >= HUB_VIABILITY_CRITERIA.minimum_monthly_savings) {
    concerns.push(`Moderate savings (${formatCurrency(economics.monthly_savings)}/month, ideal: ${formatCurrency(HUB_VIABILITY_CRITERIA.ideal_monthly_savings)}+)`);
  } else {
    concerns.push(`Low savings (${formatCurrency(economics.monthly_savings)}/month, minimum: ${formatCurrency(HUB_VIABILITY_CRITERIA.minimum_monthly_savings)})`);
  }
  
  // Break-even analysis
  if (economics.break_even_months && economics.break_even_months <= HUB_VIABILITY_CRITERIA.ideal_break_even_months) {
    reasons.push(`Fast payback (${economics.break_even_months} months)`);
  } else if (economics.break_even_months && economics.break_even_months <= HUB_VIABILITY_CRITERIA.maximum_break_even_months) {
    concerns.push(`Longer payback period (${economics.break_even_months} months, ideal: ${HUB_VIABILITY_CRITERIA.ideal_break_even_months} months)`);
  } else {
    concerns.push(`Very long payback (${economics.break_even_months || 'never'}, maximum: ${HUB_VIABILITY_CRITERIA.maximum_break_even_months} months)`);
  }
  
  // ROI analysis
  if (economics.roi_12_months && economics.roi_12_months >= 100) {
    reasons.push(`Strong ROI (${formatPercentage(economics.roi_12_months)})`);
  }
  
  // Determine priority
  let priority: 'high' | 'medium' | 'low';
  if (viability.rating === 'excellent') {
    priority = 'high';
  } else if (viability.rating === 'good') {
    priority = 'medium';
  } else {
    priority = 'low';
  }
  
  return {
    shouldApprove,
    priority,
    reasons,
    concerns,
  };
}
