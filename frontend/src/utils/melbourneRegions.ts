/**
 * Melbourne Default Regions Configuration
 * 7 hub-friendly regions optimized for distribution planning
 */

import type { CustomRegion } from '../types/hub';

export const MELBOURNE_DEFAULT_REGIONS: Omit<CustomRegion, 'id' | 'created_by' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'CBD & Inner City',
    description: 'Melbourne CBD and immediate inner suburbs',
    type: 'default',
    color: '#DC2626', // red-600
    boundary_type: 'postcode_list',
    postcodes: ['3000', '3002', '3004', '3006', '3008', '3010', '3065', '3066', '3067', '3121'],
    boundary_polygon: null,
    center_latitude: null,
    center_longitude: null,
    radius_km: null,
    hub_priority: 'HIGH',
    estimated_stores: 15,
    suggested_hub_location: 'Queen Victoria Market area - Central warehouse with excellent access',
    rationale: 'Highest density retail area, can enable same-day delivery to stores. Strong foot traffic and tourism.',
    transport_access: 'All major roads converge here - Elizabeth St, Lonsdale St, arterial roads',
    is_active: true,
  },
  
  {
    name: 'Northern Corridor',
    description: 'Inner and outer northern suburbs along Sydney Road corridor',
    type: 'default',
    color: '#2563EB', // blue-600
    boundary_type: 'postcode_list',
    postcodes: [
      '3051', '3053', '3054', '3055', '3056', '3057', '3058', // Inner North
      '3072', '3073', '3074', '3075', '3076' // Outer North
    ],
    boundary_polygon: null,
    center_latitude: null,
    center_longitude: null,
    radius_km: null,
    hub_priority: 'HIGH',
    estimated_stores: 12,
    suggested_hub_location: 'Brunswick - Sydney Road (high visibility, food hub)',
    rationale: 'Strong multicultural food scene, high Asian demographic. Growing retail density.',
    transport_access: 'Hume Highway (major north route), Sydney Road, Tullamarine Freeway',
    is_active: true,
  },
  
  {
    name: 'Eastern Suburbs',
    description: 'Box Hill, Doncaster, and eastern corridor suburbs',
    type: 'default',
    color: '#16A34A', // green-600
    boundary_type: 'postcode_list',
    postcodes: [
      '3101', '3102', '3103', '3104', '3105', // Inner East
      '3122', '3123', '3124', '3125', '3126' // Outer East
    ],
    boundary_polygon: null,
    center_latitude: null,
    center_longitude: null,
    radius_km: null,
    hub_priority: 'MEDIUM',
    estimated_stores: 10,
    suggested_hub_location: 'Box Hill Central - Major Asian shopping precinct',
    rationale: 'Large Asian community with high demand for specialty products. Affluent suburbs with strong purchasing power.',
    transport_access: 'Eastern Freeway, Maroondah Highway, Whitehorse Road',
    is_active: true,
  },
  
  {
    name: 'Bayside & South',
    description: 'South Melbourne, Port Melbourne, St Kilda, and bayside suburbs',
    type: 'default',
    color: '#9333EA', // purple-600
    boundary_type: 'postcode_list',
    postcodes: [
      '3141', '3142', '3181', '3182', '3183', // Inner South
      '3184', '3185', '3186', '3187', '3188' // Bayside
    ],
    boundary_polygon: null,
    center_latitude: null,
    center_longitude: null,
    radius_km: null,
    hub_priority: 'MEDIUM',
    estimated_stores: 8,
    suggested_hub_location: 'Chapel Street precinct or St Kilda area',
    rationale: 'Mix of tourism (St Kilda) and residential affluence. High foot traffic on weekends.',
    transport_access: 'St Kilda Road, Nepean Highway, Beach Road',
    is_active: true,
  },
  
  {
    name: 'Western Suburbs',
    description: 'Footscray, Sunshine, and western corridor',
    type: 'default',
    color: '#EA580C', // orange-600
    boundary_type: 'postcode_list',
    postcodes: [
      '3011', '3012', '3013', '3015', '3016', // Inner West
      '3020', '3021', '3022', '3023' // Outer West
    ],
    boundary_polygon: null,
    center_latitude: null,
    center_longitude: null,
    radius_km: null,
    hub_priority: 'MEDIUM',
    estimated_stores: 9,
    suggested_hub_location: 'Footscray Market area - Central to Asian community',
    rationale: 'Multicultural hub with growing food scene. Vietnamese/Asian communities with demand for specialty products.',
    transport_access: 'West Gate Freeway, Ballarat Road, Geelong Road',
    is_active: true,
  },
  
  {
    name: 'South East Melbourne',
    description: 'Springvale, Dandenong, and south-eastern suburbs',
    type: 'default',
    color: '#CA8A04', // yellow-600
    boundary_type: 'postcode_list',
    postcodes: [
      '3150', '3168', '3169', '3170', '3171', // Inner SE
      '3172', '3173', '3174', '3175' // Outer SE
    ],
    boundary_polygon: null,
    center_latitude: null,
    center_longitude: null,
    radius_km: null,
    hub_priority: 'LOW',
    estimated_stores: 6,
    suggested_hub_location: 'Springvale or Dandenong Market precinct',
    rationale: 'Further from CBD but large Asian population (Vietnamese, Chinese). Growing demand.',
    transport_access: 'Monash Freeway, Princes Highway, Dandenong Road',
    is_active: true,
  },
  
  {
    name: 'Outer Growth Corridors',
    description: 'Werribee, Cranbourne, Pakenham - future growth areas',
    type: 'default',
    color: '#6B7280', // gray-500
    boundary_type: 'postcode_list',
    postcodes: [
      '3023', '3029', '3030', // West (Werribee)
      '3977', '3975', // South East (Cranbourne)
      '3810', '3805' // East (Pakenham)
    ],
    boundary_polygon: null,
    center_latitude: null,
    center_longitude: null,
    radius_km: null,
    hub_priority: 'FUTURE',
    estimated_stores: 4,
    suggested_hub_location: 'TBD - wait for store density to increase',
    rationale: 'Low current density but highest population growth in Melbourne. Future opportunity.',
    transport_access: 'Western Highway, South Gippsland Highway, Princes Freeway',
    is_active: true,
  },
];

/**
 * Get region by postcode
 * @param postcode 4-digit Australian postcode (e.g., '3000')
 * @returns Region name or null if not found
 */
export function getRegionByPostcode(postcode: string): string | null {
  // Normalize postcode (extract 4 digits)
  const normalizedPostcode = postcode.match(/\d{4}/)?.[0];
  if (!normalizedPostcode) return null;
  
  for (const region of MELBOURNE_DEFAULT_REGIONS) {
    if (region.postcodes?.includes(normalizedPostcode)) {
      return region.name;
    }
  }
  
  return null;
}

/**
 * Get all postcodes for a region
 * @param regionName Name of the region
 * @returns Array of postcodes or empty array
 */
export function getPostcodesByRegion(regionName: string): string[] {
  const region = MELBOURNE_DEFAULT_REGIONS.find(r => r.name === regionName);
  return region?.postcodes || [];
}

/**
 * Get region metadata
 * @param regionName Name of the region
 * @returns Region object or undefined
 */
export function getRegionMetadata(regionName: string) {
  return MELBOURNE_DEFAULT_REGIONS.find(r => r.name === regionName);
}

/**
 * Get all region names
 * @returns Array of region names
 */
export function getAllRegionNames(): string[] {
  return MELBOURNE_DEFAULT_REGIONS.map(r => r.name);
}

/**
 * Get regions by hub priority
 * @param priority Hub priority level
 * @returns Array of regions matching priority
 */
export function getRegionsByPriority(priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'FUTURE') {
  return MELBOURNE_DEFAULT_REGIONS.filter(r => r.hub_priority === priority);
}

/**
 * Validate if a postcode is in Melbourne
 * @param postcode 4-digit postcode
 * @returns true if postcode is in any Melbourne region
 */
export function isValidMelbournePostcode(postcode: string): boolean {
  return getRegionByPostcode(postcode) !== null;
}

/**
 * Color presets matching region colors
 */
export const REGION_COLOR_PRESETS = [
  { name: 'Red (CBD)', value: '#DC2626' },
  { name: 'Blue (North)', value: '#2563EB' },
  { name: 'Green (East)', value: '#16A34A' },
  { name: 'Purple (South)', value: '#9333EA' },
  { name: 'Orange (West)', value: '#EA580C' },
  { name: 'Yellow (SE)', value: '#CA8A04' },
  { name: 'Gray (Outer)', value: '#6B7280' },
  { name: 'Pink', value: '#DB2777' },
  { name: 'Indigo', value: '#4F46E5' },
  { name: 'Teal', value: '#0D9488' },
];

/**
 * Hub priority descriptions
 */
export const HUB_PRIORITY_INFO = {
  HIGH: {
    label: 'High Priority',
    description: '10+ stores, immediate hub opportunity',
    color: 'text-green-700 bg-green-100',
    minStores: 10,
  },
  MEDIUM: {
    label: 'Medium Priority',
    description: '6-9 stores, viable with right partner',
    color: 'text-blue-700 bg-blue-100',
    minStores: 6,
  },
  LOW: {
    label: 'Low Priority',
    description: '3-5 stores, marginal economics',
    color: 'text-yellow-700 bg-yellow-100',
    minStores: 3,
  },
  FUTURE: {
    label: 'Future Opportunity',
    description: '<3 stores, wait for growth',
    color: 'text-gray-700 bg-gray-100',
    minStores: 0,
  },
};
