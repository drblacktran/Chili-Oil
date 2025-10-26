/**
 * AlertCard Component
 * Displays low stock alerts with severity levels
 */
import type { LowStockAlert } from '../types/dashboard';

interface AlertCardProps {
  alert: LowStockAlert;
  onAction?: () => void;
}

export default function AlertCard({ alert, onAction }: AlertCardProps) {
  const severityConfig = {
    critical: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      icon: '',
      badgeColor: 'bg-red-100 text-red-800',
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700',
      icon: '',
      badgeColor: 'bg-yellow-100 text-yellow-800',
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      icon: '',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
  };

  const config = severityConfig[alert.severity];
  const stockPercentage = (alert.currentStock / alert.minimumStock) * 100;

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} border-l-4 rounded-lg p-4 hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <span className="text-2xl flex-shrink-0">{config.icon}</span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Product Name & SKU */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-sm mb-1">
                {alert.productName}
              </h4>
              <p className="text-xs text-gray-600 font-mono">
                SKU: {alert.sku}
              </p>
            </div>

            {/* Severity Badge */}
            <span
              className={`${config.badgeColor} px-2 py-1 rounded-full text-xs font-semibold uppercase ml-2 flex-shrink-0`}
            >
              {alert.severity}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center text-xs text-gray-700 mb-2">
            <span className="font-medium">
              {alert.locationName} ({alert.locationCode})
            </span>
          </div>

          {/* Stock Level */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Current Stock:</span>
              <span className={`font-bold ${config.textColor}`}>
                {alert.currentStock} / {alert.minimumStock} units
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  stockPercentage < 30
                    ? 'bg-red-500'
                    : stockPercentage < 70
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(stockPercentage, 100)}%` }}
              />
            </div>

            <p className="text-xs text-gray-600">
              {stockPercentage < 30 ? (
                <span className="text-red-600 font-semibold">
                  Critically low - immediate action required
                </span>
              ) : stockPercentage < 70 ? (
                <span className="text-yellow-600 font-semibold">
                  Running low - restock soon
                </span>
              ) : (
                <span className="text-green-600 font-semibold">Stock adequate</span>
              )}
            </p>
          </div>

          {/* Action Button */}
          {onAction && (
            <button
              onClick={onAction}
              className={`mt-3 w-full px-3 py-2 ${config.textColor} bg-white border ${config.borderColor} rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors`}
            >
              Transfer Stock →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
