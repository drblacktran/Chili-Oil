/**
 * Application Configuration
 * Centralized config for branding, theme, and business settings
 */

export interface AppConfig {
  businessName: string;
  businessShortName: string;
  primaryColor: string;
  secondaryColor: string;
  logo: string;
  currency: string;
  locale: string;
  timezone: string;
}

// Default configuration
const defaultConfig: AppConfig = {
  businessName: "Benjamin's Chili Oil Distribution",
  businessShortName: "Benjamin's",
  primaryColor: '#DC2626', // red-600
  secondaryColor: '#991B1B', // red-800
  logo: '',
  currency: 'AUD',
  locale: 'en-AU',
  timezone: 'Australia/Melbourne',
};

// Get config from localStorage or use defaults
export function getAppConfig(): AppConfig {
  if (typeof window === 'undefined') return defaultConfig;

  try {
    const stored = localStorage.getItem('app_config');
    if (stored) {
      return { ...defaultConfig, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load app config:', error);
  }

  return defaultConfig;
}

// Save config to localStorage
export function setAppConfig(config: Partial<AppConfig>): void {
  if (typeof window === 'undefined') return;

  try {
    const current = getAppConfig();
    const updated = { ...current, ...config };
    localStorage.setItem('app_config', JSON.stringify(updated));

    // Apply primary color to CSS variable
    document.documentElement.style.setProperty('--primary-color', updated.primaryColor);
  } catch (error) {
    console.error('Failed to save app config:', error);
  }
}

// Reset to defaults
export function resetAppConfig(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('app_config');
    document.documentElement.style.setProperty('--primary-color', defaultConfig.primaryColor);
  } catch (error) {
    console.error('Failed to reset app config:', error);
  }
}

// Get primary color for dynamic styling
export function getPrimaryColor(): string {
  return getAppConfig().primaryColor;
}

// Preset color options
export const colorPresets = [
  { name: 'Red (Chili)', value: '#DC2626', class: 'bg-red-600' },
  { name: 'Blue', value: '#2563EB', class: 'bg-blue-600' },
  { name: 'Green', value: '#16A34A', class: 'bg-green-600' },
  { name: 'Purple', value: '#9333EA', class: 'bg-purple-600' },
  { name: 'Orange', value: '#EA580C', class: 'bg-orange-600' },
  { name: 'Pink', value: '#DB2777', class: 'bg-pink-600' },
  { name: 'Indigo', value: '#4F46E5', class: 'bg-indigo-600' },
  { name: 'Teal', value: '#0D9488', class: 'bg-teal-600' },
];

// Common business types with suggested branding
export const businessTemplates = {
  'benjamins-chili': {
    businessName: "Benjamin's Chili Oil Distribution",
    businessShortName: "Benjamin's",
    primaryColor: '#DC2626',
    logo: '',
  },
  'food-distribution': {
    businessName: 'Food Distribution Co.',
    businessShortName: 'Food Co.',
    primaryColor: '#16A34A',
    logo: '',
  },
  'beverage': {
    businessName: 'Beverage Distribution',
    businessShortName: 'Beverages',
    primaryColor: '#2563EB',
    logo: '',
  },
  'general': {
    businessName: 'Distribution Management',
    businessShortName: 'DMS',
    primaryColor: '#6B7280',
    logo: '',
  },
};
