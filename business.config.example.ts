/**
 * Business Configuration Template
 *
 * Copy this file to business.config.local.ts and fill in your actual values.
 * The .local.ts file is gitignored and will not be committed.
 *
 * DO NOT put real values in this example file.
 */

export const BUSINESS_CONFIG = {
  // Company Information
  company: {
    name: "Your Company Name",
    legalName: "Your Legal Business Name",
    businessAddress: "Street Address City State PostalCode",
    ownerName: "Owner Name",
    ownerEmail: "owner@example.com",
    ownerPhone: "04XXXXXXXX",
  },

  // Product Pricing (Currency: AUD)
  pricing: {
    retailPrice: 0.00,           // Retail price per unit
    unitCost: 0.00,               // Cost per unit
    consignmentCommissionRate: 0.00,  // Commission percentage
    purchaseCommissionRate: 0.00,
    profitPerUnit: 0.00,          // Calculated profit
  },

  // Inventory Parameters
  inventory: {
    restockCycleDays: 21,         // Default restock cycle
    defaultMinimumStock: 30,      // Default minimum stock level
    defaultMaximumStock: 50,      // Default maximum stock level
    idealStockPercentage: 80,     // Ideal stock as % of maximum
  },

  // Store Locations
  locations: [
    {
      id: 1,
      name: "Head Office",
      type: "head_office",
      code: "HQ001",
      contactPerson: "Contact Name",
      phone: "04XXXXXXXX",
      address: "Address Line 1",
      city: "City",
      state: "State",
      postalCode: "0000",
      region: "Region",
      latitude: 0.0000,
      longitude: 0.0000,
    },
    // Add more locations as needed...
  ],
};
