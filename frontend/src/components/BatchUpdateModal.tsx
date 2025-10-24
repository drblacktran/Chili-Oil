/**
 * Batch Stock Update Modal
 * Allows updating stock levels for multiple stores at once
 */

import { useState } from 'react';
import type { InventoryItem } from '../types/inventory';

interface BatchUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: InventoryItem[];
  onUpdate: (newStockLevel: number, reason: string) => void;
}

export default function BatchUpdateModal({
  isOpen,
  onClose,
  selectedItems,
  onUpdate,
}: BatchUpdateModalProps) {
  const [newStockLevel, setNewStockLevel] = useState<number>(0);
  const [reason, setReason] = useState<string>('');
  const [updateMode, setUpdateMode] = useState<'set' | 'add' | 'subtract'>('set');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newStockLevel < 0) {
      alert('Stock level cannot be negative');
      return;
    }

    if (!reason.trim()) {
      alert('Please provide a reason for this update');
      return;
    }

    onUpdate(newStockLevel, reason);
    handleClose();
  };

  const handleClose = () => {
    setNewStockLevel(0);
    setReason('');
    setUpdateMode('set');
    onClose();
  };

  // Calculate total impact
  const calculateImpact = () => {
    let totalChange = 0;
    selectedItems.forEach(item => {
      switch (updateMode) {
        case 'set':
          totalChange += newStockLevel - item.current_stock;
          break;
        case 'add':
          totalChange += newStockLevel;
          break;
        case 'subtract':
          totalChange -= newStockLevel;
          break;
      }
    });
    return totalChange;
  };

  const impact = calculateImpact();
  const totalValue = impact * (selectedItems[0]?.product?.unit_cost || 4.50);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
            <div class="flex items-center justify-between">
              <h2 className="text-xl font-bold">📦 Batch Stock Update</h2>
              <button
                onClick={handleClose}
                className="text-white hover:text-gray-200 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-blue-100 mt-1">
              Updating {selectedItems.length} store(s)
            </p>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Selected Stores Summary */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-2">
                Selected Stores
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto border border-gray-200">
                <div className="space-y-2">
                  {selectedItems.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">
                          {item.location?.name}
                        </span>
                        <span className="text-gray-500">({item.location?.code})</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-600">
                          Current: <span className="font-semibold">{item.current_stock}</span>
                        </span>
                        <span className="text-gray-600">
                          Min: <span className="font-semibold">{item.minimum_stock}</span>
                        </span>
                        <span className={`font-semibold ${
                          item.stock_status === 'critical' ? 'text-red-600' :
                          item.stock_status === 'low' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {item.stock_status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Update Mode */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Update Mode
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setUpdateMode('set')}
                  className={`px-4 py-3 rounded-lg border-2 font-semibold transition-colors ${
                    updateMode === 'set'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Set To
                </button>
                <button
                  type="button"
                  onClick={() => setUpdateMode('add')}
                  className={`px-4 py-3 rounded-lg border-2 font-semibold transition-colors ${
                    updateMode === 'add'
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Add (+)
                </button>
                <button
                  type="button"
                  onClick={() => setUpdateMode('subtract')}
                  className={`px-4 py-3 rounded-lg border-2 font-semibold transition-colors ${
                    updateMode === 'subtract'
                      ? 'border-red-600 bg-red-50 text-red-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Subtract (−)
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {updateMode === 'set' && 'Set all selected stores to a specific stock level'}
                {updateMode === 'add' && 'Add units to current stock levels'}
                {updateMode === 'subtract' && 'Subtract units from current stock levels'}
              </p>
            </div>

            {/* Stock Level Input */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                {updateMode === 'set' ? 'New Stock Level' :
                 updateMode === 'add' ? 'Units to Add' :
                 'Units to Subtract'}
              </label>
              <input
                type="number"
                min="0"
                value={newStockLevel}
                onChange={(e) => setNewStockLevel(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter quantity"
                required
              />
            </div>

            {/* Impact Preview */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-bold text-blue-900 mb-3">
                📊 Impact Preview
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Total Change:</span>
                  <span className={`ml-2 font-bold text-lg ${
                    impact > 0 ? 'text-green-600' : impact < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {impact > 0 ? '+' : ''}{impact} units
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">Value Impact:</span>
                  <span className={`ml-2 font-bold text-lg ${
                    totalValue > 0 ? 'text-green-600' : totalValue < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {totalValue > 0 ? '+' : ''}${Math.abs(totalValue).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Reason for Update <span className="text-red-600">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="E.g., Physical stock count adjustment, damaged goods removal, etc."
                rows={3}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This reason will be recorded in the stock movement history
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                Update {selectedItems.length} Store(s)
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
