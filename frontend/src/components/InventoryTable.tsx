/**
 * Inventory Table Component
 * Displays all store inventory with restock tracking
 */

import { useState, useMemo } from 'react';
import type { InventoryItem } from '../types/inventory';

interface InventoryTableProps {
  inventoryItems: InventoryItem[];
  onBatchUpdate?: (selectedIds: string[]) => void;
  onTransfer?: (inventoryId: string) => void;
}

type SortField = 'name' | 'code' | 'current_stock' | 'next_restock_date' | 'stock_value' | 'stock_status';
type SortDirection = 'asc' | 'desc';

export default function InventoryTable({ inventoryItems, onBatchUpdate, onTransfer }: InventoryTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('stock_status');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Calculate days until restock
  const calculateDaysUntil = (nextRestockDate: string | null): number => {
    if (!nextRestockDate) return 999;
    const today = new Date();
    const nextDate = new Date(nextRestockDate);
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Sort inventory items
  const sortedItems = useMemo(() => {
    return [...inventoryItems].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.location?.name || '';
          bValue = b.location?.name || '';
          break;
        case 'code':
          aValue = a.location?.code || '';
          bValue = b.location?.code || '';
          break;
        case 'current_stock':
          aValue = a.current_stock;
          bValue = b.current_stock;
          break;
        case 'next_restock_date':
          aValue = calculateDaysUntil(a.next_restock_date);
          bValue = calculateDaysUntil(b.next_restock_date);
          break;
        case 'stock_value':
          aValue = a.stock_value;
          bValue = b.stock_value;
          break;
        case 'stock_status':
          const statusOrder = { critical: 0, low: 1, healthy: 2, overstocked: 3 };
          aValue = statusOrder[a.stock_status];
          bValue = statusOrder[b.stock_status];
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [inventoryItems, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === sortedItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedItems.map(item => item.id)));
    }
  };

  const handleBatchUpdate = () => {
    if (onBatchUpdate && selectedIds.size > 0) {
      onBatchUpdate(Array.from(selectedIds));
    }
  };

  // Get status badge
  const getStatusBadge = (status: string, trigger: string | null) => {
    switch (status) {
      case 'critical':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
            🚨 CRITICAL
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
            ⚠️ LOW
          </span>
        );
      case 'healthy':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
            ✅ HEALTHY
          </span>
        );
      case 'overstocked':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            📦 OVERSTOCKED
          </span>
        );
      default:
        return null;
    }
  };

  // Get trigger badges
  const getTriggerBadges = (trigger: string | null, daysUntil: number) => {
    if (!trigger) return null;

    const badges = [];

    if (trigger === 'both' || trigger === 'date_due') {
      badges.push(
        <span key="date" className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
          📅 Date Due
        </span>
      );
    }

    if (trigger === 'both' || trigger === 'stock_low') {
      badges.push(
        <span key="stock" className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 border border-red-200">
          📉 Low Stock
        </span>
      );
    }

    if (trigger === 'emergency') {
      badges.push(
        <span key="emergency" className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-200 text-red-900 border border-red-400 animate-pulse">
          🚨 EMERGENCY
        </span>
      );
    }

    return <div className="flex flex-wrap gap-1 mt-1">{badges}</div>;
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-gray-300">↕️</span>;
    return <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      {/* Batch Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-blue-900">
            {selectedIds.size} store(s) selected
          </span>
          <button
            onClick={handleBatchUpdate}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            📦 Batch Update Stock
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.size === sortedItems.length && sortedItems.length > 0}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded cursor-pointer"
                />
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                Store <SortIcon field="name" />
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('current_stock')}
              >
                Stock <SortIcon field="current_stock" />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Min / Max
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Ideal
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Last Restock
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('next_restock_date')}
              >
                Next Restock <SortIcon field="next_restock_date" />
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('stock_status')}
              >
                Status <SortIcon field="stock_status" />
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('stock_value')}
              >
                Value <SortIcon field="stock_value" />
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedItems.map((item) => {
              const daysUntil = calculateDaysUntil(item.next_restock_date);
              const stockPercentage = ((item.current_stock / item.maximum_stock) * 100).toFixed(0);
              const suggestedQty = Math.max(item.ideal_stock - item.current_stock, item.average_daily_sales * item.restock_cycle_days);

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-gray-50 ${item.stock_status === 'critical' ? 'bg-red-50' : ''}`}
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">{item.location?.name}</span>
                      <span className="text-xs text-gray-500">{item.location?.code}</span>
                      <span className="text-xs text-gray-400">{item.location?.city}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className={`text-lg font-bold ${item.stock_status === 'critical' ? 'text-red-600' : 'text-gray-900'}`}>
                        {item.current_stock}
                      </span>
                      <span className="text-xs text-gray-500">{stockPercentage}% of max</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div className="flex flex-col">
                      <span>Min: {item.minimum_stock}</span>
                      <span>Max: {item.maximum_stock}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="font-semibold text-blue-600">{item.ideal_stock}</span>
                    <span className="text-xs text-gray-500 block">({item.ideal_stock_percentage}% of max)</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatDate(item.last_restock_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className={`text-sm font-medium ${daysUntil < 0 ? 'text-red-600' : daysUntil <= 3 ? 'text-orange-600' : 'text-gray-700'}`}>
                        {formatDate(item.next_restock_date)}
                      </span>
                      <span className={`text-xs ${daysUntil < 0 ? 'text-red-500 font-bold' : daysUntil <= 3 ? 'text-orange-500' : 'text-gray-500'}`}>
                        {daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` : `in ${daysUntil} days`}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      {getStatusBadge(item.stock_status, item.restock_trigger_reason)}
                      {getTriggerBadges(item.restock_trigger_reason, daysUntil)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(item.stock_value)}</span>
                      <span className="text-xs text-gray-500">Revenue: {formatCurrency(item.potential_revenue)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex flex-col space-y-1">
                      {item.needs_restock && (
                        <>
                          <span className="text-xs text-gray-600 font-medium">
                            Suggest: {Math.round(suggestedQty)} units
                          </span>
                          <button
                            onClick={() => onTransfer?.(item.id)}
                            className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 transition-colors"
                          >
                            🚚 Transfer
                          </button>
                        </>
                      )}
                      <a
                        href={`/stores/${item.location_id}/settings`}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        ⚙️ Settings
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {sortedItems.length === 0 && (
        <div className="text-center py-12">
          <span className="text-4xl">📦</span>
          <p className="mt-2 text-sm text-gray-600">No inventory items found</p>
        </div>
      )}
    </div>
  );
}
