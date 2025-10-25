/**
 * Store Settings Form Component
 * Edit store-specific inventory configuration
 */

import { useState } from 'react';
import type { StoreLocation, InventoryItem } from '../types/inventory';

interface StoreSettingsFormProps {
  store: StoreLocation;
  inventoryItem?: InventoryItem;
}

export default function StoreSettingsForm({ store, inventoryItem }: StoreSettingsFormProps) {
  const [formData, setFormData] = useState({
    // Restock Settings
    restock_cycle_days: store.restock_cycle_days,
    minimum_stock_level: store.minimum_stock_level,
    maximum_stock_level: store.maximum_stock_level,
    ideal_stock_percentage: store.ideal_stock_percentage,

    // Sales Velocity
    average_daily_sales: store.average_daily_sales,

    // Delivery Preferences
    preferred_delivery_day: store.preferred_delivery_day || '',
    preferred_delivery_time: store.preferred_delivery_time || '',

    // Seasonal Adjustments
    seasonal_multiplier: store.seasonal_multiplier,
    seasonal_notes: store.seasonal_notes || '',

    // Notifications
    sms_notifications_enabled: store.sms_notifications_enabled,
    email_notifications_enabled: store.email_notifications_enabled,
    emergency_restock_enabled: store.emergency_restock_enabled,

    // Contact
    contact_person: store.contact_person || '',
    phone: store.phone,
    email: store.email || '',
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Updating store settings:', formData);

    // In real app, would call API
    alert(
      `Store Settings Updated!\n\n` +
      `This would update the locations table with:\n` +
      `- Restock cycle: ${formData.restock_cycle_days} days\n` +
      `- Min stock: ${formData.minimum_stock_level}\n` +
      `- Max stock: ${formData.maximum_stock_level}\n` +
      `- Ideal: ${formData.ideal_stock_percentage}%\n` +
      `- Avg daily sales: ${formData.average_daily_sales}\n` +
      `- Preferred delivery: ${formData.preferred_delivery_day || 'Not set'}\n\n` +
      `Inventory items would be recalculated based on new settings.`
    );

    setHasChanges(false);
  };

  const handleReset = () => {
    setFormData({
      restock_cycle_days: store.restock_cycle_days,
      minimum_stock_level: store.minimum_stock_level,
      maximum_stock_level: store.maximum_stock_level,
      ideal_stock_percentage: store.ideal_stock_percentage,
      average_daily_sales: store.average_daily_sales,
      preferred_delivery_day: store.preferred_delivery_day || '',
      preferred_delivery_time: store.preferred_delivery_time || '',
      seasonal_multiplier: store.seasonal_multiplier,
      seasonal_notes: store.seasonal_notes || '',
      sms_notifications_enabled: store.sms_notifications_enabled,
      email_notifications_enabled: store.email_notifications_enabled,
      emergency_restock_enabled: store.emergency_restock_enabled,
      contact_person: store.contact_person || '',
      phone: store.phone,
      email: store.email || '',
    });
    setHasChanges(false);
  };

  // Calculate ideal stock
  const calculatedIdealStock = Math.round((formData.maximum_stock_level * formData.ideal_stock_percentage) / 100);

  // Calculate projected sales
  const projectedSales = formData.average_daily_sales * formData.restock_cycle_days;

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Restock Settings Section */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
          <span className="text-2xl mr-2">📅</span>
          Restock Settings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Restock Cycle Days */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Restock Cycle (Days)
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={formData.restock_cycle_days}
              onChange={(e) => handleChange('restock_cycle_days', Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Default: 21 days. Time between scheduled restocks.
            </p>
          </div>

          {/* Minimum Stock Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Minimum Stock Level
            </label>
            <input
              type="number"
              min="0"
              value={formData.minimum_stock_level}
              onChange={(e) => handleChange('minimum_stock_level', Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Triggers low stock alert when reached.
            </p>
          </div>

          {/* Maximum Stock Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Maximum Stock Level
            </label>
            <input
              type="number"
              min={formData.minimum_stock_level}
              value={formData.maximum_stock_level}
              onChange={(e) => handleChange('maximum_stock_level', Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Storage capacity limit.
            </p>
          </div>

          {/* Ideal Stock Percentage */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Ideal Stock Percentage
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={formData.ideal_stock_percentage}
                onChange={(e) => handleChange('ideal_stock_percentage', Number(e.target.value))}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <span className="text-gray-600 font-semibold">%</span>
            </div>
            <p className="text-xs text-blue-600 mt-1 font-semibold">
              Ideal stock: {calculatedIdealStock} units ({formData.ideal_stock_percentage}% of {formData.maximum_stock_level})
            </p>
          </div>
        </div>
      </div>

      {/* Sales Velocity Section */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
          <span className="text-2xl mr-2">📊</span>
          Sales Velocity
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Average Daily Sales */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Average Daily Sales (Units)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={formData.average_daily_sales}
              onChange={(e) => handleChange('average_daily_sales', Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Manual input. Used for stockout projections.
            </p>
          </div>

          {/* Projected Sales */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Projected Sales per Cycle
            </label>
            <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-2xl font-bold text-blue-900">{Math.round(projectedSales)} units</p>
              <p className="text-xs text-blue-600 mt-1">
                {formData.average_daily_sales} units/day × {formData.restock_cycle_days} days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Preferences Section */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
          <span className="text-2xl mr-2">🚚</span>
          Delivery Preferences
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preferred Delivery Day */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Preferred Delivery Day
            </label>
            <select
              value={formData.preferred_delivery_day}
              onChange={(e) => handleChange('preferred_delivery_day', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">No preference</option>
              {daysOfWeek.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Helps with logistics planning.
            </p>
          </div>

          {/* Preferred Delivery Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Preferred Delivery Time
            </label>
            <input
              type="text"
              value={formData.preferred_delivery_time}
              onChange={(e) => handleChange('preferred_delivery_time', e.target.value)}
              placeholder="e.g., 10:00 AM - 2:00 PM"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional time window.
            </p>
          </div>
        </div>
      </div>

      {/* Seasonal Adjustments Section */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
          <span className="text-2xl mr-2">🌟</span>
          Seasonal Adjustments
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Seasonal Multiplier */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Seasonal Multiplier
            </label>
            <input
              type="number"
              min="0.1"
              max="5.0"
              step="0.1"
              value={formData.seasonal_multiplier}
              onChange={(e) => handleChange('seasonal_multiplier', Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              1.0 = normal, 1.5 = 50% increase, 0.8 = 20% decrease
            </p>
          </div>

          {/* Seasonal Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Seasonal Notes
            </label>
            <textarea
              value={formData.seasonal_notes}
              onChange={(e) => handleChange('seasonal_notes', e.target.value)}
              placeholder="e.g., Increase stock during summer, nearby events..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
          <span className="text-2xl mr-2">🔔</span>
          Notification Settings
        </h2>

        <div className="space-y-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.sms_notifications_enabled}
              onChange={(e) => handleChange('sms_notifications_enabled', e.target.checked)}
              className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <span className="font-semibold text-gray-900">Enable SMS Notifications</span>
              <p className="text-xs text-gray-500">Send low stock and restock alerts via SMS</p>
            </div>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.email_notifications_enabled}
              onChange={(e) => handleChange('email_notifications_enabled', e.target.checked)}
              className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <span className="font-semibold text-gray-900">Enable Email Notifications</span>
              <p className="text-xs text-gray-500">Send alerts via email (if email provided)</p>
            </div>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.emergency_restock_enabled}
              onChange={(e) => handleChange('emergency_restock_enabled', e.target.checked)}
              className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <span className="font-semibold text-gray-900">Allow Emergency Restock Requests</span>
              <p className="text-xs text-gray-500">Store can trigger urgent restock alerts</p>
            </div>
          </label>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
          <span className="text-2xl mr-2">📞</span>
          Contact Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Contact Person
            </label>
            <input
              type="text"
              value={formData.contact_person}
              onChange={(e) => handleChange('contact_person', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="optional@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow border border-gray-200 p-6">
        <div>
          {hasChanges && (
            <p className="text-sm text-yellow-700 font-semibold">
              ⚠️ You have unsaved changes
            </p>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={!hasChanges}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={!hasChanges}
            className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            💾 Save Settings
          </button>
        </div>
      </div>
    </form>
  );
}
