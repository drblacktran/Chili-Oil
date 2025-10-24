/**
 * Simple Bar Chart Component
 * Lightweight CSS-based bar chart without external dependencies
 */
import React from 'react';

export interface BarChartData {
  label: string;
  value: number;
  color?: string;
  icon?: string;
}

interface BarChartProps {
  data: BarChartData[];
  title?: string;
  height?: number;
  showValues?: boolean;
  horizontal?: boolean;
}

export default function BarChart({
  data,
  title,
  height = 200,
  showValues = true,
  horizontal = false,
}: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));

  if (horizontal) {
    // Horizontal bar chart
    return (
      <div className="w-full">
        {title && <h4 className="text-sm font-bold text-gray-900 mb-3">{title}</h4>}
        <div className="space-y-3">
          {data.map((item, index) => {
            const percentage = (item.value / maxValue) * 100;
            return (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    {item.icon && <span className="text-lg">{item.icon}</span>}
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  </div>
                  {showValues && (
                    <span className="text-sm font-bold text-gray-900">{item.value}</span>
                  )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: item.color || '#DC2626',
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Vertical bar chart
  return (
    <div className="w-full">
      {title && <h4 className="text-sm font-bold text-gray-900 mb-3">{title}</h4>}
      <div className="flex items-end justify-between space-x-2" style={{ height: `${height}px` }}>
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center justify-end">
              {/* Value on top */}
              {showValues && (
                <div className="mb-1 text-xs font-bold text-gray-700">{item.value}</div>
              )}

              {/* Bar */}
              <div className="w-full flex flex-col items-center justify-end" style={{ height: '100%' }}>
                <div
                  className="w-full rounded-t transition-all duration-500 hover:opacity-80 cursor-pointer"
                  style={{
                    height: `${percentage}%`,
                    backgroundColor: item.color || '#DC2626',
                  }}
                  title={`${item.label}: ${item.value}`}
                ></div>
              </div>

              {/* Label */}
              <div className="mt-2 text-center">
                {item.icon && <div className="text-xl mb-1">{item.icon}</div>}
                <div className="text-xs text-gray-600 font-medium line-clamp-2">{item.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
