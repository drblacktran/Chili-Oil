/**
 * DistributorCard Component
 * Displays distributor status overview with stock information
 */
import type { DistributorOverview } from '../types/dashboard';

interface DistributorCardProps {
  distributor: DistributorOverview;
  onClick?: () => void;
}

export default function DistributorCard({ distributor, onClick }: DistributorCardProps) {
  const statusConfig = {
    healthy: {
      label: 'Healthy',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      iconColor: 'text-green-500',
      icon: '✅',
    },
    low_stock: {
      label: 'Low Stock',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      iconColor: 'text-yellow-500',
      icon: '⚠️',
    },
    critical: {
      label: 'Critical',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      iconColor: 'text-red-500',
      icon: '🚨',
    },
    inactive: {
      label: 'Inactive',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      iconColor: 'text-gray-500',
      icon: '⭕',
    },
  };

  const config = statusConfig[distributor.status];

  return (
    <div
      onClick={onClick}
      className={`${config.bgColor} rounded-lg p-5 border-2 border-transparent hover:border-red-500 transition-all cursor-pointer group`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xl">{config.icon}</span>
            <h3 className="font-bold text-gray-900 text-sm group-hover:text-red-600 transition-colors">
              {distributor.code}
            </h3>
          </div>
          <p className="text-xs text-gray-600 font-medium">{distributor.name}</p>
        </div>

        {/* Status Badge */}
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${config.bgColor} ${config.textColor} border ${config.textColor.replace('text', 'border')}`}
        >
          {config.label}
        </span>
      </div>

      {/* Location */}
      <div className="flex items-center text-xs text-gray-600 mb-3">
        <span className="mr-1">📍</span>
        <span>{distributor.city}, {distributor.state}</span>
      </div>

      {/* Stock Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Total Stock:</span>
          <span className="text-sm font-bold text-gray-900">
            {distributor.totalStock.toLocaleString()} units
          </span>
        </div>

        {distributor.lowStockItems > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Low Stock Items:</span>
            <span className={`text-sm font-bold ${config.textColor}`}>
              {distributor.lowStockItems}
            </span>
          </div>
        )}

        {distributor.lastRestocked && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span className="text-xs text-gray-500">Last Restocked:</span>
            <span className="text-xs text-gray-700 font-medium">
              {new Date(distributor.lastRestocked).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Hover Action Hint */}
      <div className="mt-3 pt-3 border-t border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-xs text-red-600 font-medium text-center">
          Click for details →
        </p>
      </div>
    </div>
  );
}
