/**
 * ViewToggle Component
 * Toggle between grid and map view for distributors
 */

interface ViewToggleProps {
  view: 'grid' | 'map';
  onChange: (view: 'grid' | 'map') => void;
}

export default function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onChange('grid')}
        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
          view === 'grid'
            ? 'bg-white text-gray-900 shadow'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <span className="mr-2">📊</span>
        Grid View
      </button>
      <button
        onClick={() => onChange('map')}
        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
          view === 'map'
            ? 'bg-white text-gray-900 shadow'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <span className="mr-2">🗺️</span>
        Map View
      </button>
    </div>
  );
}
