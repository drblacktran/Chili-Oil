/**
 * StatCard Component
 * Displays a metric card with icon, label, value, and optional trend
 */
interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'red' | 'blue' | 'green' | 'yellow' | 'gray';
}

export default function StatCard({
  icon,
  label,
  value,
  subtext,
  trend,
  color = 'red',
}: StatCardProps) {
  const colorClasses = {
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    gray: 'bg-gray-50 text-gray-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Icon */}
      <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]} mb-4`}>
        <span className="text-2xl">{icon}</span>
      </div>

      {/* Label */}
      <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>

      {/* Value */}
      <div className="flex items-baseline space-x-2">
        <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>

        {/* Trend Indicator */}
        {trend && (
          <span
            className={`text-sm font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>

      {/* Subtext */}
      {subtext && <p className="text-sm text-gray-500 mt-1">{subtext}</p>}
    </div>
  );
}
