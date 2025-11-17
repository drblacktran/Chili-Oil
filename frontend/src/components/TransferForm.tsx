/**
 * Stock Transfer Form Component
 * Create new transfers with suggested quantities
 *
 * TODO [PHASE 3 - BACKEND]: Transfer Creation API
 * - Implement POST /api/transfers endpoint
 * - Create stock_movements record in database
 * - Update inventory stock levels atomically
 * - Send confirmation SMS/email to destination store
 * - Return transfer ID and updated stock levels
 *
 * TODO [PHASE 3 - BACKEND]: Stock Validation
 * - Server-side validation of available stock
 * - Check for concurrent updates (optimistic locking)
 * - Prevent negative stock levels
 * - Validate transfer business rules
 *
 * TODO [PHASE 3 - UX]: Transfer Scheduling
 * - Add "Schedule for later" option
 * - Calendar picker for delivery date/time
 * - Recurring transfer templates
 * - Bulk transfer creation (multiple stores)
 *
 * TODO [PHASE 3 - UX]: Enhanced Suggestions
 * - Factor in delivery lead time
 * - Consider seasonal multipliers
 * - Check historical transfer patterns
 * - Suggest optimal transfer timing
 *
 * TODO [PHASE 3 - UX]: Transfer History
 * - Show recent transfers for context
 * - "Repeat last transfer" quick action
 * - Transfer templates based on history
 *
 * TODO [PHASE 4 - TESTING]: Form Validation Testing
 * - Test all validation rules
 * - Test edge cases (zero quantity, out of stock)
 * - Test calculation accuracy
 * - Add accessibility testing
 */

import { useState, useMemo, useEffect } from 'react';
import type { InventoryItem, StoreLocation } from '../types/inventory';

interface TransferFormProps {
  inventoryItems: InventoryItem[];
  headOffice?: StoreLocation;
  stores: (StoreLocation | undefined)[];
}

export default function TransferForm({ inventoryItems, headOffice, stores }: TransferFormProps) {
  const [fromLocationId, setFromLocationId] = useState(headOffice?.id || '');
  const [toLocationId, setToLocationId] = useState('');
  const [productId, setProductId] = useState('prod-001'); // Benjamin's Chili Oil
  const [quantity, setQuantity] = useState<number>(0);
  const [transferType, setTransferType] = useState<'restock' | 'emergency' | 'adjustment'>('restock');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [useSuggested, setUseSuggested] = useState(true);

  // Get inventory items for selected locations
  const fromInventory = useMemo(() => {
    return inventoryItems.find(
      item => item.location_id === fromLocationId && item.product_id === productId
    );
  }, [inventoryItems, fromLocationId, productId]);

  const toInventory = useMemo(() => {
    return inventoryItems.find(
      item => item.location_id === toLocationId && item.product_id === productId
    );
  }, [inventoryItems, toLocationId, productId]);

  // Calculate suggested quantity
  const suggestedQuantity = useMemo(() => {
    if (!toInventory) return 0;

    const deficitFromIdeal = toInventory.ideal_stock - toInventory.current_stock;
    const projectedSales = toInventory.average_daily_sales * toInventory.restock_cycle_days;
    const suggested = Math.max(deficitFromIdeal, projectedSales, 0);

    return Math.round(suggested);
  }, [toInventory]);

  // Auto-set suggested quantity when destination changes
  useEffect(() => {
    if (useSuggested && suggestedQuantity > 0) {
      setQuantity(suggestedQuantity);
    }
  }, [suggestedQuantity, useSuggested]);

  // Calculate stock after transfer
  const fromStockAfter = (fromInventory?.current_stock || 0) - quantity;
  const toStockAfter = (toInventory?.current_stock || 0) + quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!toLocationId) {
      alert('Please select a destination store');
      return;
    }

    if (quantity <= 0) {
      alert('Transfer quantity must be greater than 0');
      return;
    }

    if (fromStockAfter < 0) {
      alert('Insufficient stock at source location');
      return;
    }

    // In real app, this would call an API
    const transferData = {
      from_location_id: fromLocationId,
      to_location_id: toLocationId,
      product_id: productId,
      quantity,
      transfer_type: transferType,
      transfer_date: transferDate,
      notes,
      from_stock_before: fromInventory?.current_stock,
      from_stock_after: fromStockAfter,
      to_stock_before: toInventory?.current_stock,
      to_stock_after: toStockAfter,
    };

    console.log('Transfer submitted:', transferData);

    alert(
      `Transfer Created Successfully!\n\n` +
      `From: ${fromInventory?.location?.name}\n` +
      `To: ${toInventory?.location?.name}\n` +
      `Quantity: ${quantity} units\n` +
      `Type: ${transferType}\n\n` +
      `This would:\n` +
      `- Create stock_movements record\n` +
      `- Update inventory stock levels\n` +
      `- Update last_restock_date\n` +
      `- Recalculate next_restock_date\n` +
      `- Send confirmation SMS (if enabled)`
    );

    // Reset form
    setToLocationId('');
    setQuantity(0);
    setNotes('');
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form Column */}
      <div className="lg:col-span-2">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Transfer Details</h2>

          <div className="space-y-6">
            {/* From Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                From Location
              </label>
              <select
                value={fromLocationId}
                onChange={(e) => setFromLocationId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                <option value="">Select source...</option>
                {headOffice && (
                  <option value={headOffice.id}>
                    {headOffice.name} (Head Office) - Stock: {fromInventory?.current_stock || 0}
                  </option>
                )}
              </select>
            </div>

            {/* To Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                To Location <span className="text-red-600">*</span>
              </label>
              <select
                value={toLocationId}
                onChange={(e) => setToLocationId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                <option value="">Select destination...</option>
                {stores.filter(Boolean).map((store) => {
                  const inventory = inventoryItems.find(
                    item => item.location_id === store?.id && item.product_id === productId
                  );
                  return (
                    <option key={store?.id} value={store?.id}>
                      {store?.name} ({store?.code}) - Stock: {inventory?.current_stock || 0} - {inventory?.stock_status?.toUpperCase()}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Product */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Product
              </label>
              <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="text-2xl">🌶️</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Benjamin's Chili Oil</p>
                  <p className="text-xs text-gray-500">SKU: BK-CHILI-RETAIL</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(toInventory?.product?.retail_price || 12.80)}
                  </p>
                  <p className="text-xs text-gray-500">Retail Price</p>
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Transfer Quantity <span className="text-red-600">*</span>
                </label>
                {suggestedQuantity > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setUseSuggested(true);
                      setQuantity(suggestedQuantity);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    💡 Use Suggested ({suggestedQuantity})
                  </button>
                )}
              </div>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => {
                  setUseSuggested(false);
                  setQuantity(Number(e.target.value));
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter quantity"
                required
              />
              {toInventory && quantity > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-blue-50 border border-blue-200 rounded p-2 text-center">
                    <p className="text-blue-600 font-semibold">Current</p>
                    <p className="text-blue-900 font-bold text-lg">{toInventory.current_stock}</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded p-2 text-center">
                    <p className="text-green-600 font-semibold">After Transfer</p>
                    <p className="text-green-900 font-bold text-lg">{toStockAfter}</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded p-2 text-center">
                    <p className="text-purple-600 font-semibold">Ideal</p>
                    <p className="text-purple-900 font-bold text-lg">{toInventory.ideal_stock}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Transfer Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Transfer Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTransferType('restock')}
                  className={`px-4 py-3 rounded-lg border-2 font-semibold transition-colors ${
                    transferType === 'restock'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  📅 Scheduled
                </button>
                <button
                  type="button"
                  onClick={() => setTransferType('emergency')}
                  className={`px-4 py-3 rounded-lg border-2 font-semibold transition-colors ${
                    transferType === 'emergency'
                      ? 'border-red-600 bg-red-50 text-red-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  🚨 Emergency
                </button>
                <button
                  type="button"
                  onClick={() => setTransferType('adjustment')}
                  className={`px-4 py-3 rounded-lg border-2 font-semibold transition-colors ${
                    transferType === 'adjustment'
                      ? 'border-yellow-600 bg-yellow-50 text-yellow-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  📝 Adjustment
                </button>
              </div>
            </div>

            {/* Transfer Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Transfer Date
              </label>
              <input
                type="date"
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Delivery Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="E.g., Leave at back entrance, call on arrival..."
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <a
                href="/inventory"
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </a>
              <button
                type="submit"
                className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-md"
                disabled={!toLocationId || quantity <= 0 || fromStockAfter < 0}
              >
                🚚 Create Transfer
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Preview Column */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 sticky top-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4">
            📊 Transfer Summary
          </h3>

          {toInventory ? (
            <div className="space-y-4">
              {/* Destination Store Info */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-500 mb-1">Destination Store</p>
                <p className="font-bold text-gray-900">{toInventory.location?.name}</p>
                <p className="text-xs text-gray-600">{toInventory.location?.code}</p>
                {toInventory.location?.preferred_delivery_day && (
                  <p className="text-xs text-blue-600 mt-2">
                    Prefers: {toInventory.location.preferred_delivery_day}
                  </p>
                )}
              </div>

              {/* Stock Levels */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Current Stock:</span>
                  <span className={`font-bold ${
                    toInventory.stock_status === 'critical' ? 'text-red-600' :
                    toInventory.stock_status === 'low' ? 'text-yellow-600' :
                    'text-gray-900'
                  }`}>
                    {toInventory.current_stock}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Minimum Stock:</span>
                  <span className="font-semibold text-gray-900">{toInventory.minimum_stock}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Ideal Stock:</span>
                  <span className="font-semibold text-blue-600">{toInventory.ideal_stock}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Maximum Stock:</span>
                  <span className="font-semibold text-gray-900">{toInventory.maximum_stock}</span>
                </div>
              </div>

              {/* Transfer Impact */}
              {quantity > 0 && (
                <>
                  <div className="border-t pt-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">After Transfer</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">New Stock Level:</span>
                      <span className="font-bold text-green-600 text-lg">{toStockAfter}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span className="text-gray-600">% of Maximum:</span>
                      <span className="font-semibold text-gray-900">
                        {((toStockAfter / toInventory.maximum_stock) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Value */}
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <p className="text-xs font-semibold text-green-700 mb-1">Transfer Value</p>
                    <p className="text-lg font-bold text-green-900">
                      {formatCurrency(quantity * (toInventory.product?.unit_cost || 4.50))}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Cost: {formatCurrency(toInventory.product?.unit_cost || 4.50)}/unit
                    </p>
                  </div>

                  {/* Warnings */}
                  {toStockAfter > toInventory.maximum_stock && (
                    <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                      <p className="text-xs font-semibold text-yellow-800">⚠️ Warning</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Transfer will exceed maximum capacity by {toStockAfter - toInventory.maximum_stock} units
                      </p>
                    </div>
                  )}

                  {fromStockAfter < 0 && (
                    <div className="bg-red-50 border border-red-300 rounded-lg p-3">
                      <p className="text-xs font-semibold text-red-800">🚨 Error</p>
                      <p className="text-xs text-red-700 mt-1">
                        Insufficient stock at source location
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Suggestion Reasoning */}
              {suggestedQuantity > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-blue-800 mb-1">💡 Suggestion</p>
                  <p className="text-sm font-bold text-blue-900">{suggestedQuantity} units</p>
                  <p className="text-xs text-blue-700 mt-2">
                    Based on:
                  </p>
                  <ul className="text-xs text-blue-600 mt-1 space-y-1">
                    <li>• Deficit: {toInventory.ideal_stock - toInventory.current_stock} units</li>
                    <li>• Projected sales: {Math.round(toInventory.average_daily_sales * toInventory.restock_cycle_days)} units</li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-4xl">📍</span>
              <p className="text-sm text-gray-500 mt-2">
                Select a destination store to see details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
