/**
 * Inventory Dashboard Container
 * Handles filtering and state management for inventory items
 */

import { useState, useMemo } from 'react';
import InventoryTable from './InventoryTable';
import InventoryFilters from './InventoryFilters';
import BatchUpdateModal from './BatchUpdateModal';
import type { InventoryItem, InventoryFilters as IFilters } from '../types/inventory';

interface InventoryDashboardProps {
  inventoryItems: InventoryItem[];
  regions: string[];
}

export default function InventoryDashboard({ inventoryItems, regions }: InventoryDashboardProps) {
  const [filters, setFilters] = useState<IFilters>({});
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Apply filters to inventory items
  const filteredItems = useMemo(() => {
    return inventoryItems.filter(item => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          item.location?.name.toLowerCase().includes(searchLower) ||
          item.location?.code.toLowerCase().includes(searchLower) ||
          item.location?.city?.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Stock status filter
      if (filters.stock_status && item.stock_status !== filters.stock_status) {
        return false;
      }

      // Region filter
      if (filters.region && item.location?.region !== filters.region) {
        return false;
      }

      // Needs restock filter
      if (filters.needs_restock !== undefined && item.needs_restock !== filters.needs_restock) {
        return false;
      }

      return true;
    });
  }, [inventoryItems, filters]);

  // Get selected items
  const selectedItems = useMemo(() => {
    return inventoryItems.filter(item => selectedIds.includes(item.id));
  }, [inventoryItems, selectedIds]);

  const handleFilterChange = (newFilters: IFilters) => {
    setFilters(newFilters);
  };

  const handleBatchUpdate = (ids: string[]) => {
    setSelectedIds(ids);
    setShowBatchModal(true);
  };

  const handleBatchUpdateSubmit = (newStockLevel: number, reason: string) => {
    console.log('Batch update:', { selectedIds, newStockLevel, reason });

    // In a real app, this would call an API endpoint
    alert(
      `Batch update submitted!\n\n` +
      `Stores: ${selectedIds.length}\n` +
      `New stock level: ${newStockLevel}\n` +
      `Reason: ${reason}\n\n` +
      `This would create stock_movements records and update inventory.`
    );

    setShowBatchModal(false);
    setSelectedIds([]);
  };

  const handleTransfer = (inventoryId: string) => {
    console.log('Transfer requested for:', inventoryId);
    window.location.href = '/transfers/new?inventory=' + inventoryId;
  };

  return (
    <div>
      <InventoryFilters
        regions={regions}
        onFilterChange={handleFilterChange}
      />

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredItems.length}</span> of{' '}
          <span className="font-semibold text-gray-900">{inventoryItems.length}</span> stores
        </p>
      </div>

      <InventoryTable
        inventoryItems={filteredItems}
        onBatchUpdate={handleBatchUpdate}
        onTransfer={handleTransfer}
      />

      <BatchUpdateModal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        selectedItems={selectedItems}
        onUpdate={handleBatchUpdateSubmit}
      />
    </div>
  );
}
