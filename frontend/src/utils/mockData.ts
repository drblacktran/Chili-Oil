/**
 * Mock Data for Development - Benjamin's Chili Oil
 * Real store locations from inventory tracker
 * 10 retail stores across Melbourne metro area
 *
 * TODO [PHASE 3 - BACKEND]: Replace all mock data with real API calls
 * - Create API service layer (e.g., src/services/api.ts)
 * - Implement REST/GraphQL endpoints for dashboard data
 * - Add error handling and loading states
 * - Implement data caching strategy (React Query, SWR, or similar)
 * - Add TypeScript response types matching API contracts
 * - Replace static exports with async API fetchers
 *
 * TODO [PHASE 3 - BACKEND]: Dashboard Stats API
 * - Endpoint: GET /api/dashboard/stats
 * - Should aggregate real-time data from inventory table
 * - Include: total inventory, active distributors, alerts, transfers
 *
 * TODO [PHASE 3 - BACKEND]: Distributors API
 * - Endpoint: GET /api/distributors
 * - Support filtering by region, status
 * - Include pagination for large datasets
 * - Return location coordinates for map visualization
 *
 * TODO [PHASE 3 - BACKEND]: Activity Feed API
 * - Endpoint: GET /api/activities/recent
 * - Real-time activity stream from stock_movements, alert_queue
 * - Support pagination and filtering by type
 * - Consider WebSocket/SSE for real-time updates
 */
import type {
  DashboardStats,
  LowStockAlert,
  DistributorOverview,
  RecentActivity,
  QuickAction,
} from '../types/dashboard';

export const mockDashboardStats: DashboardStats = {
  totalInventory: 160, // Total: 30+30+10+10+10+10+10+10+10+40 = 160 units
  activeDistributors: 10,
  totalDistributors: 10,
  lowStockAlerts: 7, // 7 stores need restocking
  pendingTransfers: 0,
};

export const mockLowStockAlerts: LowStockAlert[] = [
  {
    id: '1',
    productName: "Benjamin's Chili Oil",
    sku: 'BK-CHILI-RETAIL',
    locationName: 'Chat Phat Supermarket',
    locationCode: 'STORE003',
    currentStock: 10,
    minimumStock: 30,
    severity: 'critical',
  },
  {
    id: '2',
    productName: "Benjamin's Chili Oil",
    sku: 'BK-CHILI-RETAIL',
    locationName: 'Minh Phat Supermarket',
    locationCode: 'STORE004',
    currentStock: 10,
    minimumStock: 30,
    severity: 'critical',
  },
  {
    id: '3',
    productName: "Benjamin's Chili Oil",
    sku: 'BK-CHILI-RETAIL',
    locationName: 'Circle G Richmond Supermarket',
    locationCode: 'STORE005',
    currentStock: 10,
    minimumStock: 30,
    severity: 'critical',
  },
  {
    id: '4',
    productName: "Benjamin's Chili Oil",
    sku: 'BK-CHILI-RETAIL',
    locationName: 'Son Butcher & Frozen Seafood',
    locationCode: 'STORE006',
    currentStock: 10,
    minimumStock: 30,
    severity: 'critical',
  },
  {
    id: '5',
    productName: "Benjamin's Chili Oil",
    sku: 'BK-CHILI-RETAIL',
    locationName: 'Fu Lin Asian Grocery Supermarket',
    locationCode: 'STORE007',
    currentStock: 10,
    minimumStock: 30,
    severity: 'critical',
  },
  {
    id: '6',
    productName: "Benjamin's Chili Oil",
    sku: 'BK-CHILI-RETAIL',
    locationName: 'Hokkien Market',
    locationCode: 'STORE008',
    currentStock: 10,
    minimumStock: 30,
    severity: 'critical',
  },
  {
    id: '7',
    productName: "Benjamin's Chili Oil",
    sku: 'BK-CHILI-RETAIL',
    locationName: 'Oasis',
    locationCode: 'STORE009',
    currentStock: 10,
    minimumStock: 30,
    severity: 'critical',
  },
];

/**
 * Benjamin's Chili Oil - Actual Store Locations
 * Real data from BK_Inventory_Stock_Tracker spreadsheet
 * Head office + 9 retail stores across Melbourne
 */
export const mockDistributors: DistributorOverview[] = [
  {
    id: '1',
    name: "Benjamin's Kitchen",
    code: 'STORE001',
    city: 'Alphington',
    state: 'Victoria',
    region: 'North East',
    status: 'healthy',
    totalStock: 30,
    lowStockItems: 0,
    lastRestocked: '2025-10-25',
    phone: '0466891665',
    latitude: -37.7851,
    longitude: 145.0307,
    address: '758 Heidelberg Road Alphington',
    postcode: '3078',
  },
  {
    id: '2',
    name: 'Greenmart',
    code: 'STORE002',
    city: 'Camberwell',
    state: 'Victoria',
    region: 'East',
    status: 'healthy',
    totalStock: 30,
    lowStockItems: 0,
    lastRestocked: '2025-10-25',
    phone: '0493360404',
    latitude: -37.8569,
    longitude: 145.0624,
    address: '1226 Toorak Road Camberwell',
    postcode: '3124',
  },
  {
    id: '3',
    name: 'Chat Phat Supermarket',
    code: 'STORE003',
    city: 'Richmond',
    state: 'Victoria',
    region: 'Inner East',
    status: 'critical',
    totalStock: 10,
    lowStockItems: 1,
    lastRestocked: '2025-10-05',
    phone: '0413886507',
    latitude: -37.8199,
    longitude: 144.9976,
    address: '162/164 Victoria St, Richmond',
    postcode: '3121',
  },
  {
    id: '4',
    name: 'Minh Phat Supermarket',
    code: 'STORE004',
    city: 'Abbotsford',
    state: 'Victoria',
    region: 'Inner East',
    status: 'critical',
    totalStock: 10,
    lowStockItems: 1,
    lastRestocked: '2025-10-05',
    phone: '0402785608',
    latitude: -37.8052,
    longitude: 144.9976,
    address: '2-8 Nicholson St, Abbotsford',
    postcode: '3067',
  },
  {
    id: '5',
    name: 'Circle G Richmond Supermarket',
    code: 'STORE005',
    city: 'Richmond',
    state: 'Victoria',
    region: 'Inner East',
    status: 'critical',
    totalStock: 10,
    lowStockItems: 1,
    lastRestocked: '2025-10-05',
    phone: '0451579979',
    latitude: -37.8199,
    longitude: 144.9976,
    address: '7/200 Victoria St, Richmond',
    postcode: '3121',
  },
  {
    id: '6',
    name: 'Son Butcher & Frozen Seafood',
    code: 'STORE006',
    city: 'Richmond',
    state: 'Victoria',
    region: 'Inner East',
    status: 'critical',
    totalStock: 10,
    lowStockItems: 1,
    lastRestocked: '2025-10-05',
    phone: '0433795369',
    latitude: -37.8199,
    longitude: 144.9976,
    address: 'Victoria St, Richmond',
    postcode: '3121',
  },
  {
    id: '7',
    name: 'Fu Lin Asian Grocery Supermarket',
    code: 'STORE007',
    city: 'Camberwell',
    state: 'Victoria',
    region: 'East',
    status: 'critical',
    totalStock: 10,
    lowStockItems: 1,
    lastRestocked: '2025-10-05',
    phone: '0433788157',
    latitude: -37.8569,
    longitude: 145.0624,
    address: '1397 Toorak Rd, Camberwell',
    postcode: '3124',
  },
  {
    id: '8',
    name: 'Hokkien Market',
    code: 'STORE008',
    city: 'Burwood East',
    state: 'Victoria',
    region: 'East',
    status: 'critical',
    totalStock: 10,
    lowStockItems: 1,
    lastRestocked: '2025-10-05',
    phone: '0401200505',
    latitude: -37.8524,
    longitude: 145.1625,
    address: 'hop G1/172-210 Burwood Hwy, Burwood East',
    postcode: '3151',
  },
  {
    id: '9',
    name: 'Oasis',
    code: 'STORE009',
    city: 'Fairfield',
    state: 'Victoria',
    region: 'North',
    status: 'critical',
    totalStock: 10,
    lowStockItems: 1,
    lastRestocked: '2025-10-05',
    phone: '0409412947',
    latitude: -37.7778,
    longitude: 145.0199,
    address: '92-96 Station St, Fairfield',
    postcode: '3078',
  },
  {
    id: '10',
    name: 'Talad Thai Melbourne',
    code: 'STORE010',
    city: 'Abbotsford',
    state: 'Victoria',
    region: 'Inner East',
    status: 'healthy',
    totalStock: 40,
    lowStockItems: 0,
    lastRestocked: '2025-10-24',
    phone: '0421871175',
    latitude: -37.8052,
    longitude: 144.9976,
    address: '1-5 Ferguson St, Abbotsford',
    postcode: '3067',
  },
];

export const mockRecentActivity: RecentActivity[] = [
  {
    id: '1',
    type: 'transfer',
    description: 'Transferred 200 units of CHILI-MILD-500ML to North Melbourne',
    timestamp: '2025-10-25T10:30:00Z',
    user: 'Tien Tran',
  },
  {
    id: '2',
    type: 'sms',
    description: 'Sent low stock alerts to 5 distributors',
    timestamp: '2025-10-25T09:15:00Z',
    user: 'Tien Tran',
  },
  {
    id: '3',
    type: 'product',
    description: 'Added new product: CHILI-GARLIC-500ML',
    timestamp: '2025-10-25T08:45:00Z',
    user: 'Tien Tran',
  },
  {
    id: '4',
    type: 'transfer',
    description: 'Transferred 150 units of CHILI-HOT-500ML to Glen Waverley',
    timestamp: '2025-10-24T16:20:00Z',
    user: 'Tien Tran',
  },
  {
    id: '5',
    type: 'adjustment',
    description: 'Inventory adjustment: +50 units at Main Warehouse',
    timestamp: '2025-10-24T14:10:00Z',
    user: 'Tien Tran',
  },
];

export const mockQuickActions: QuickAction[] = [
  {
    id: '1',
    label: 'Transfer Stock',
    icon: '🚚',
    href: '/transfers/new',
    color: 'red',
  },
  {
    id: '2',
    label: 'Add Product',
    icon: '📦',
    href: '/products/new',
    color: 'blue',
  },
  {
    id: '3',
    label: 'Send SMS',
    icon: '📱',
    href: '/sms/send',
    color: 'green',
  },
  {
    id: '4',
    label: 'View Reports',
    icon: '📊',
    href: '/reports',
    color: 'yellow',
  },
  {
    id: '5',
    label: 'Manage Distributors',
    icon: '👥',
    href: '/distributors',
    color: 'gray',
  },
];

/**
 * Melbourne Region Boundaries
 * For map view filtering and regional analysis
 */
export const melbourneRegions = {
  CBD: {
    name: 'Melbourne CBD',
    center: { lat: -37.8136, lng: 144.9631 },
    zoom: 15,
  },
  North: {
    name: 'Northern Suburbs',
    center: { lat: -37.7645, lng: 144.9602 },
    zoom: 12,
  },
  South: {
    name: 'Southern Suburbs',
    center: { lat: -37.8677, lng: 144.9807 },
    zoom: 12,
  },
  East: {
    name: 'Eastern Suburbs',
    center: { lat: -37.8780, lng: 145.1629 },
    zoom: 12,
  },
  West: {
    name: 'Western Suburbs',
    center: { lat: -37.7985, lng: 144.9007 },
    zoom: 12,
  },
  'South East': {
    name: 'South Eastern Suburbs',
    center: { lat: -37.9871, lng: 145.2154 },
    zoom: 12,
  },
};
