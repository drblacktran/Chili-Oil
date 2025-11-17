/**
 * HubExpansionMap Component
 * Interactive map for visualizing stores, hubs, and regions in Melbourne
 * Uses OpenStreetMap via Leaflet library
 *
 * TODO [PHASE 2 - HUB EXPANSION]: Hub API Integration
 * - Fetch hub and region data from GET /api/hubs and /api/regions
 * - Real-time updates when hubs/stores change
 * - Implement loading states and error handling
 *
 * TODO [PHASE 2 - MAPPING]: Interactive Hub Placement
 * - Click map to propose new hub location
 * - Draw custom region boundaries with polygon tool
 * - Calculate coverage radius visualization
 * - Show estimated delivery times from hub to stores
 *
 * TODO [PHASE 2 - MAPPING]: Economic Overlay
 * - Heat map showing delivery costs by location
 * - Visualize cost savings with proposed hubs
 * - Show ROI projections on map
 * - Highlight underserved areas (high cost, low coverage)
 *
 * TODO [PHASE 3 - UX]: Enhanced Map Features
 * - Geocoding for address search
 * - Route optimization visualization
 * - Traffic-aware delivery time estimates
 * - Clustering for many stores in small area
 * - Export map view as image/PDF
 *
 * TODO [PHASE 4 - ANALYTICS]: Map Analytics
 * - Track which stores/hubs users view most
 * - Log map interactions for UX improvements
 * - Analyze region performance metrics
 *
 * TODO [PHASE 4 - TESTING]: Map Component Testing
 * - Test marker rendering and clustering
 * - Test region boundary calculations
 * - Mock Leaflet for unit tests
 * - Test mobile touch interactions
 */

import { useEffect, useRef, useState } from 'react';
import type { CustomRegion, RegionalHub } from '../types/hub';
import type { StoreLocation } from '../types/inventory';

interface HubExpansionMapProps {
  stores: StoreLocation[];
  hubs?: RegionalHub[];
  regions?: CustomRegion[];
  selectedRegion?: string | null;
  onStoreClick?: (store: StoreLocation) => void;
  onHubClick?: (hub: RegionalHub) => void;
  showRegionBoundaries?: boolean;
  height?: string;
}

export default function HubExpansionMap({
  stores,
  hubs = [],
  regions = [],
  selectedRegion = null,
  onStoreClick,
  onHubClick,
  showRegionBoundaries = true,
  height = '600px',
}: HubExpansionMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Melbourne center coordinates
  const MELBOURNE_CENTER = { lat: -37.8136, lng: 144.9631 };
  const DEFAULT_ZOOM = 11;

  useEffect(() => {
    // Dynamically import Leaflet (client-side only)
    const initMap = async () => {
      try {
        if (typeof window === 'undefined' || !mapContainerRef.current) return;

        // Import Leaflet dynamically
        const L = (await import('leaflet')).default;
        
        // Import Leaflet CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);

        // Fix for default marker icons in Leaflet with webpack
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        // Initialize map if not already created
        if (!mapRef.current && mapContainerRef.current) {
          mapRef.current = L.map(mapContainerRef.current).setView(
            [MELBOURNE_CENTER.lat, MELBOURNE_CENTER.lng],
            DEFAULT_ZOOM
          );

          // Add OpenStreetMap tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }).addTo(mapRef.current);

          setMapLoaded(true);
        }
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to load map. Please refresh the page.');
      }
    };

    initMap();

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when stores/hubs change
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;

      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Create custom icons
      const storeIcon = L.divIcon({
        className: 'custom-store-marker',
        html: `
          <div style="
            background-color: #DC2626;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: bold;
          ">🏪</div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const hubIcon = L.divIcon({
        className: 'custom-hub-marker',
        html: `
          <div style="
            background-color: #2563EB;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 4px solid white;
            box-shadow: 0 3px 12px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 16px;
            font-weight: bold;
          ">🏭</div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      // Add store markers
      stores.forEach(store => {
        if (store.latitude && store.longitude) {
          // Filter by selected region if applicable
          if (selectedRegion && store.region !== selectedRegion) return;

          const marker = L.marker([store.latitude, store.longitude], { 
            icon: storeIcon 
          }).addTo(mapRef.current);

          const stockStatus = getStoreStockStatus(store);
          const statusColor = getStatusColor(stockStatus);

          marker.bindPopup(`
            <div style="min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #111;">
                ${store.name}
              </h3>
              <p style="margin: 4px 0; font-size: 12px; color: #666;">
                <strong>Code:</strong> ${store.code}
              </p>
              <p style="margin: 4px 0; font-size: 12px; color: #666;">
                <strong>Region:</strong> ${store.region || 'N/A'}
              </p>
              <p style="margin: 4px 0; font-size: 12px; color: #666;">
                <strong>Address:</strong> ${store.address_line1 || 'N/A'}
              </p>
              <div style="margin-top: 8px; padding: 4px 8px; background-color: ${statusColor}; border-radius: 4px; text-align: center;">
                <span style="color: white; font-weight: bold; font-size: 11px;">
                  ${stockStatus.toUpperCase()}
                </span>
              </div>
            </div>
          `);

          if (onStoreClick) {
            marker.on('click', () => onStoreClick(store));
          }

          markersRef.current.push(marker);
        }
      });

      // Add hub markers
      hubs.forEach(hub => {
        if (hub.location?.latitude && hub.location?.longitude) {
          const marker = L.marker(
            [hub.location.latitude, hub.location.longitude],
            { icon: hubIcon }
          ).addTo(mapRef.current);

          marker.bindPopup(`
            <div style="min-width: 220px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #111;">
                🏭 ${hub.partner_company_name}
              </h3>
              <p style="margin: 4px 0; font-size: 12px; color: #666;">
                <strong>Type:</strong> ${formatHubType(hub.hub_type)}
              </p>
              <p style="margin: 4px 0; font-size: 12px; color: #666;">
                <strong>Coverage:</strong> ${hub.coverage_regions.join(', ')}
              </p>
              <p style="margin: 4px 0; font-size: 12px; color: #666;">
                <strong>Stores Served:</strong> ${hub.stores_served}
              </p>
              <p style="margin: 4px 0; font-size: 12px; color: #666;">
                <strong>Capacity:</strong> ${hub.current_stock_level}/${hub.max_storage_capacity}
              </p>
              <div style="margin-top: 8px; padding: 4px 8px; background-color: #2563EB; border-radius: 4px; text-align: center;">
                <span style="color: white; font-weight: bold; font-size: 11px;">
                  REGIONAL HUB
                </span>
              </div>
            </div>
          `);

          if (onHubClick) {
            marker.on('click', () => onHubClick(hub));
          }

          markersRef.current.push(marker);

          // Draw coverage circles for hubs
          const coverageCircle = L.circle(
            [hub.location.latitude, hub.location.longitude],
            {
              radius: 10000, // 10km radius
              color: '#2563EB',
              fillColor: '#2563EB',
              fillOpacity: 0.1,
              weight: 2,
              dashArray: '5, 5',
            }
          ).addTo(mapRef.current);

          markersRef.current.push(coverageCircle);
        }
      });

      // Fit bounds to show all markers
      if (markersRef.current.length > 0) {
        const group = L.featureGroup(markersRef.current.filter(m => m instanceof L.Marker));
        mapRef.current.fitBounds(group.getBounds().pad(0.1));
      }
    };

    updateMarkers();
  }, [mapLoaded, stores, hubs, selectedRegion, onStoreClick, onHubClick]);

  // Draw region boundaries
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !showRegionBoundaries) return;

    const drawRegionBoundaries = async () => {
      const L = (await import('leaflet')).default;

      // This is a placeholder - in production, you'd use actual GeoJSON boundaries
      // For now, we'll draw approximate circles/polygons based on postcode centroids
      regions.forEach(region => {
        if (!region.is_active) return;

        // Example: Draw a polygon or circle for each region
        // In production, you'd fetch actual boundary GeoJSON from OpenStreetMap
        // or use postcode boundary data
        
        // This is simplified - real implementation would geocode postcodes
        // and draw proper polygons
      });
    };

    drawRegionBoundaries();
  }, [mapLoaded, regions, showRegionBoundaries]);

  // Helper functions
  const getStoreStockStatus = (store: StoreLocation): string => {
    // This would come from actual inventory data
    // For demo, randomize based on store code
    const hash = store.code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const statuses = ['healthy', 'low', 'critical'];
    return statuses[hash % 3];
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy': return '#16A34A';
      case 'low': return '#EAB308';
      case 'critical': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const formatHubType = (type: string): string => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700 font-semibold mb-2">Map Error</p>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Map Container */}
      <div
        ref={mapContainerRef}
        style={{ height, width: '100%' }}
        className="rounded-lg border-2 border-gray-200 shadow-lg"
      />

      {/* Loading Overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600 font-semibold">Loading Map...</p>
            <p className="text-sm text-gray-500">Powered by OpenStreetMap</p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-[1000]">
        <h4 className="font-bold text-sm text-gray-900 mb-3">Legend</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs">
              🏪
            </div>
            <span className="text-xs text-gray-700">Retail Store</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
              🏭
            </div>
            <span className="text-xs text-gray-700">Regional Hub</span>
          </div>
          <div className="border-t border-gray-200 my-2"></div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span className="text-xs text-gray-700">Healthy Stock</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-xs text-gray-700">Low Stock</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span className="text-xs text-gray-700">Critical Stock</span>
          </div>
        </div>
      </div>

      {/* Stats Overlay */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-[1000]">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Total Stores</p>
            <p className="text-xl font-bold text-gray-900">{stores.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Active Hubs</p>
            <p className="text-xl font-bold text-blue-600">{hubs.length}</p>
          </div>
        </div>
        {selectedRegion && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">Filtered Region</p>
            <p className="text-sm font-semibold text-gray-900">{selectedRegion}</p>
          </div>
        )}
      </div>
    </div>
  );
}
