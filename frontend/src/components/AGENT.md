# Frontend Components Agent Guide

## Location
`/frontend/src/components/`

## Purpose
This directory contains all reusable React components for the Chili Oil Distribution System frontend.

## Tech Stack
- **React 19** with TypeScript
- **TailwindCSS v4** for styling
- **Astro** for integration

## Component Structure

### Component Types

#### 1. UI Components (`/ui/`)
Basic, reusable UI elements:
- Buttons, inputs, cards, modals
- Form elements
- Loading spinners
- Alerts and notifications

#### 2. Feature Components
Business logic components:
- ProductCard
- InventoryTable
- StockTransferForm
- LocationSelector
- SMSLogViewer

#### 3. Layout Components
Specific to layouts (but not full page layouts):
- Header, Footer, Sidebar
- Navigation components
- Breadcrumbs

## Coding Standards

### Component Template
```tsx
import { useState } from 'react';

interface ComponentNameProps {
  title: string;
  onAction?: () => void;
}

export default function ComponentName({ title, onAction }: ComponentNameProps) {
  const [state, setState] = useState<string>('');

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold">{title}</h2>
      {/* Component content */}
    </div>
  );
}
```

### File Naming
- Use PascalCase: `ProductCard.tsx`, `InventoryTable.tsx`
- Co-locate styles if needed: `ProductCard.module.css`
- Tests alongside: `ProductCard.test.tsx`

### Props Interface
- Always define TypeScript interfaces for props
- Use descriptive names
- Mark optional props with `?`
- Export interfaces if reused

### State Management
- Use `useState` for local state
- Use `useEffect` for side effects
- Consider Context API for shared state
- Keep components focused and single-purpose

## TailwindCSS Guidelines

### Utility-First Approach
```tsx
// Good
<button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
  Submit
</button>

// Avoid (unless reused heavily)
<button className="btn-primary">Submit</button>
```

### Responsive Design
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>
```

### Common Patterns
- **Card**: `bg-white rounded-lg shadow p-4`
- **Container**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Button Primary**: `px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700`
- **Input**: `w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500`

## Integration with Astro

### Client Directives
```astro
<!-- Load on page load -->
<ComponentName client:load prop="value" />

<!-- Load when visible -->
<ComponentName client:visible prop="value" />

<!-- Load when idle -->
<ComponentName client:idle prop="value" />

<!-- Only in browser -->
<ComponentName client:only="react" prop="value" />
```

### When to Use Each:
- `client:load` - Critical interactive components (forms, auth)
- `client:visible` - Below-fold components
- `client:idle` - Non-critical interactions
- `client:only` - Browser-only features

## API Integration

### Example API Call
```tsx
import { useState, useEffect } from 'react';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="grid gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

## Forms & Validation

### Form Example
```tsx
import { useState } from 'react';

export default function ProductForm() {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    price: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create product');

      // Success handling
    } catch (error) {
      // Error handling
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={formData.name}
        onChange={e => setFormData({...formData, name: e.target.value})}
        className="w-full px-3 py-2 border rounded-lg"
      />
      <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg">
        Create Product
      </button>
    </form>
  );
}
```

## Component Checklist

When creating a new component:
- [ ] TypeScript interface for props
- [ ] Proper error handling
- [ ] Loading states
- [ ] Responsive design (mobile-first)
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] Meaningful class names
- [ ] Clean component structure
- [ ] Comments for complex logic

## Common Components to Build

### MVP Phase
1. **ProductCard** - Display product with image, SKU, price
2. **InventoryTable** - Show stock levels across locations
3. **StockTransferForm** - Transfer stock between locations
4. **LocationSelector** - Dropdown to select distributor
5. **SMSAlert** - Display SMS notification status
6. **Dashboard Stats** - Show inventory metrics
7. **LowStockBadge** - Warning indicator for low stock

## Best Practices

1. **Keep Components Small**: One responsibility per component
2. **Use Composition**: Compose complex UIs from simple components
3. **Props Over State**: Pass data down, callbacks up
4. **Memoization**: Use `useMemo` and `useCallback` for expensive operations
5. **Accessibility**: Always include ARIA labels and keyboard support
6. **Error Boundaries**: Wrap components that might fail
7. **Type Safety**: Leverage TypeScript fully

## Workflow Update
**Last Updated**: 2025-10-25
**Status**: Initial setup complete
- Astro + React + TailwindCSS configured
- Component directory structure created
- Ready for component development

## Next Steps
1. Create base layout component
2. Build UI component library (buttons, inputs, cards)
3. Implement product management components
4. Build inventory tracking components