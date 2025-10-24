/**
 * Simple Donut Chart Component
 * Lightweight CSS-based donut chart without external dependencies
 */
import React from 'react';

export interface DonutChartData {
  label: string;
  value: number;
  color: string;
  icon?: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  title?: string;
  size?: number;
  showLegend?: boolean;
}

export default function DonutChart({
  data,
  title,
  size = 200,
  showLegend = true,
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Calculate percentages and build conic gradient
  let currentAngle = 0;
  const segments = data.map((item) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    return {
      ...item,
      percentage,
      startAngle,
      endAngle: currentAngle,
    };
  });

  // Build conic gradient string
  const gradientStops = segments
    .map((seg, index) => {
      if (index === 0) {
        return `${seg.color} 0deg ${seg.endAngle}deg`;
      }
      return `${seg.color} ${seg.startAngle}deg ${seg.endAngle}deg`;
    })
    .join(', ');

  return (
    <div className="w-full">
      {title && <h4 className="text-sm font-bold text-gray-900 mb-4">{title}</h4>}

      <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
        {/* Donut Chart */}
        <div className="flex-shrink-0 relative" style={{ width: size, height: size }}>
          <div
            className="rounded-full"
            style={{
              width: '100%',
              height: '100%',
              background: `conic-gradient(${gradientStops})`,
            }}
          >
            {/* Center hole */}
            <div
              className="absolute inset-0 m-auto bg-white rounded-full flex flex-col items-center justify-center"
              style={{
                width: `${size * 0.6}px`,
                height: `${size * 0.6}px`,
              }}
            >
              <div className="text-3xl font-bold text-gray-900">{total}</div>
              <div className="text-xs text-gray-500 mt-1">Total</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="flex-1 space-y-2">
            {segments.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <div className="flex items-center space-x-2">
                    {item.icon && <span className="text-lg">{item.icon}</span>}
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">{item.value}</div>
                  <div className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
