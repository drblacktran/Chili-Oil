/**
 * Inventory Filters Component
 * Filter inventory by status, region, and search
 */

import { useState } from 'react';
import type { InventoryFilters } from '../types/inventory';

interface InventoryFiltersProps {
  onFilterChange: (filters: InventoryFilters) => void;
  regions: string[];
}

export default function InventoryFilters({ onFilterChange, regions }: InventoryFiltersProps) {
  const [filters, setFilters] = useState<InventoryFilters>({});

  const handleFilterChange = (key: keyof InventoryFilters, value: any) => {
    const newFilters = { ...filters };

    if (value === '' || value === undefined) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }

    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-900">
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-red-600 hover:text-red-700 font-semibold"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Search Store
          </label>
          <input
            type="text"
            placeholder="Name, code, city..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Stock Status */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Stock Status
          </label>
          <select
            value={filters.stock_status || ''}
            onChange={(e) => handleFilterChange('stock_status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="critical">Critical</option>
            <option value="low">Low</option>
            <option value="healthy">Healthy</option>
            <option value="overstocked">Overstocked</option>
          </select>
        </div>

        {/* Region */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Region
          </label>
          <select
            value={filters.region || ''}
            onChange={(e) => handleFilterChange('region', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">All Regions</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        {/* Needs Restock */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Restock Status
          </label>
          <select
            value={filters.needs_restock === undefined ? '' : filters.needs_restock.toString()}
            onChange={(e) => handleFilterChange('needs_restock', e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">All Stores</option>
            <option value="true">Needs Restock</option>
            <option value="false">No Restock Needed</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-semibold text-gray-600">Active Filters:</span>
            {Object.entries(filters).map(([key, value]) => (
              <span
                key={key}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
              >
                {key === 'search' && `Search: "${value}"`}
                {key === 'stock_status' && `Status: ${value}`}
                {key === 'region' && `Region: ${value}`}
                {key === 'needs_restock' && (value ? 'Needs Restock' : 'No Restock Needed')}
                <button
                  onClick={() => handleFilterChange(key as keyof InventoryFilters, undefined)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
