/**
 * MapView Component - Placeholder
 *
 * This component will display distributors on an interactive map
 *
 * Future Implementation:
 * - Use Google Maps API or Mapbox GL JS
 * - Show distributor markers with color-coded status
 * - Click markers to show distributor details
 * - Filter by region, status, stock level
 * - Cluster markers when zoomed out
 * - Show heatmap of distribution density
 *
 * Installation Required:
 * npm install @vis.gl/react-google-maps
 * OR
 * npm install mapbox-gl react-map-gl
 */

import { useState } from 'react';
import type { DistributorOverview } from '../types/dashboard';

interface MapViewProps {
  distributors: DistributorOverview[];
  onDistributorClick?: (distributor: DistributorOverview) => void;
}

export default function MapView({ distributors, onDistributorClick }: MapViewProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>('All');

  // Filter distributors by region
  const filteredDistributors =
    selectedRegion === 'All'
      ? distributors
      : distributors.filter((d) => d.region === selectedRegion);

  // Get unique regions for filter
  const regions = ['All', ...Array.from(new Set(distributors.map((d) => d.region)))];

  // Status color mapping for markers
  const statusColors = {
    healthy: '#10b981', // green
    low_stock: '#f59e0b', // yellow
    critical: '#ef4444', // red
    inactive: '#6b7280', // gray
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      {/* Map Header with Controls */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">📍 Distribution Map</h3>
            <p className="text-sm text-gray-600">Melbourne & Victoria region</p>
          </div>

          {/* Region Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600 font-medium">Filter by region:</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center space-x-4 text-sm">
          <span className="text-gray-600 font-medium">Status:</span>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-700">Healthy</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-gray-700">Low Stock</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-700">Critical</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span className="text-gray-700">Inactive</span>
          </div>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="relative h-[600px] bg-gray-100">
        {/* Placeholder with instructions */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-md text-center p-8">
            <div className="text-6xl mb-4">🗺️</div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">
              Interactive Map View
            </h4>
            <p className="text-gray-600 mb-4">
              Map integration will display {filteredDistributors.length} distributors
              across Melbourne
            </p>

            {/* Implementation instructions */}
            <div className="bg-white rounded-lg shadow p-4 text-left text-sm">
              <p className="font-semibold text-gray-900 mb-2">
                To implement:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>Choose: Google Maps or Mapbox GL JS</li>
                <li>Install dependencies</li>
                <li>Get API key</li>
                <li>Add map component</li>
                <li>Plot {filteredDistributors.length} distributor markers</li>
              </ol>
            </div>

            {/* Quick stats for filtered distributors */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="bg-green-50 rounded p-2">
                <p className="text-lg font-bold text-green-700">
                  {filteredDistributors.filter((d) => d.status === 'healthy').length}
                </p>
                <p className="text-xs text-gray-600">Healthy</p>
              </div>
              <div className="bg-yellow-50 rounded p-2">
                <p className="text-lg font-bold text-yellow-700">
                  {filteredDistributors.filter((d) => d.status === 'low_stock').length}
                </p>
                <p className="text-xs text-gray-600">Low Stock</p>
              </div>
              <div className="bg-red-50 rounded p-2">
                <p className="text-lg font-bold text-red-700">
                  {filteredDistributors.filter((d) => d.status === 'critical').length}
                </p>
                <p className="text-xs text-gray-600">Critical</p>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <p className="text-lg font-bold text-gray-700">
                  {filteredDistributors.filter((d) => d.status === 'inactive').length}
                </p>
                <p className="text-xs text-gray-600">Inactive</p>
              </div>
            </div>
          </div>
        </div>

        {/* Simulated map markers (visual placeholder) */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          {filteredDistributors.map((distributor, index) => {
            const left = 10 + (index % 4) * 22;
            const top = 15 + Math.floor(index / 4) * 25;
            return (
              <div
                key={distributor.id}
                className="absolute"
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                <div
                  className="w-8 h-8 rounded-full border-2 border-white shadow-lg"
                  style={{ backgroundColor: statusColors[distributor.status] }}
                  title={distributor.name}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Distributor List (fallback) */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-2">
          <strong>Showing:</strong> {filteredDistributors.length} distributor(s)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
          {filteredDistributors.map((distributor) => (
            <button
              key={distributor.id}
              onClick={() => onDistributorClick?.(distributor)}
              className="text-left p-2 bg-white rounded border border-gray-200 hover:border-red-500 hover:bg-red-50 transition-colors text-sm"
            >
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: statusColors[distributor.status] }}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 truncate">
                    {distributor.code}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {distributor.city} • {distributor.region}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
