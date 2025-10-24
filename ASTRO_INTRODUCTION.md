# Welcome to Astro! 🚀

## What is Astro?

**Astro** is a modern web framework designed for building fast, content-focused websites. Think of it as the best of both worlds: the simplicity of static site generators with the power of modern JavaScript frameworks.

### Key Philosophy
> "Ship less JavaScript, load faster websites"

Astro achieves this by:
1. **Rendering pages to HTML at build time** (Static Site Generation)
2. **Only loading JavaScript when needed** (Partial Hydration)
3. **Supporting multiple frameworks** (React, Vue, Svelte, etc.)

---

## Why Astro for This Project?

For the Chili Oil Distribution System, Astro is perfect because:

1. **Fast Performance**: Dashboard and inventory pages load instantly
2. **SEO Friendly**: Product pages are fully rendered HTML
3. **React Integration**: Use React for interactive components (forms, tables)
4. **File-Based Routing**: Simple and intuitive routing system
5. **TypeScript Support**: Full type safety out of the box

---

## Core Concepts

### 1. `.astro` Files

Astro files are like HTML with superpowers. They have three parts:

```astro
---
// 1. Component Script (Frontmatter)
// Runs on the server at build/request time
import Layout from '../layouts/Layout.astro';
const title = 'Products';
const products = await fetch('/api/products').then(r => r.json());
---

<!-- 2. Template (HTML/JSX-like) -->
<Layout title={title}>
  <h1>{title}</h1>
  {products.map(product => (
    <div>{product.name}</div>
  ))}
</Layout>

<!-- 3. Component Styles (Optional) -->
<style>
  h1 {
    color: red;
  }
</style>
```

### 2. File-Based Routing

Files in `/src/pages/` become routes automatically:

```
src/pages/
├── index.astro              → /
├── about.astro              → /about
├── products/
│   ├── index.astro          → /products
│   ├── [id].astro           → /products/:id (dynamic)
│   └── new.astro            → /products/new
└── api/
    └── products.ts          → /api/products (API endpoint)
```

**Example Dynamic Route:**
```astro
---
// src/pages/products/[id].astro
const { id } = Astro.params; // Get URL parameter
const product = await fetch(`/api/products/${id}`).then(r => r.json());
---

<h1>{product.name}</h1>
```

### 3. Islands Architecture (Partial Hydration)

**The Problem**: Traditional SPAs load JavaScript for the entire page, even static content.

**Astro's Solution**: Only interactive components load JavaScript.

```astro
---
import Header from '../components/Header.astro';  // No JS
import ProductList from '../components/ProductList';  // React component
---

<Header />  <!-- Static HTML, no JavaScript -->

<!-- Only this component loads JavaScript -->
<ProductList client:load />
```

### Client Directives

Control when components load JavaScript:

```astro
<!-- Load immediately on page load (critical interactions) -->
<LoginForm client:load />

<!-- Load when component becomes visible (lazy load) -->
<ProductGallery client:visible />

<!-- Load when browser is idle (non-critical) -->
<Newsletter client:idle />

<!-- Only render in browser (client-side only) -->
<ChatWidget client:only="react" />

<!-- No JavaScript at all (static) -->
<Footer />  <!-- Default: no directive = no JavaScript -->
```

**When to Use Each:**
- `client:load` - Authentication forms, critical UI
- `client:visible` - Content below the fold
- `client:idle` - Nice-to-have features
- `client:only` - Browser-only features (localStorage, window)
- **No directive** - Static content (headers, footers, text)

### 4. Layouts

Layouts wrap your pages with common structure:

```astro
---
// src/layouts/MainLayout.astro
import '../styles/global.css';

interface Props {
  title: string;
}

const { title } = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>{title}</title>
  </head>
  <body>
    <header>
      <nav><!-- Navigation --></nav>
    </header>

    <main>
      <slot />  <!-- Page content goes here -->
    </main>

    <footer><!-- Footer content --></footer>
  </body>
</html>
```

**Using a Layout:**
```astro
---
import MainLayout from '../layouts/MainLayout.astro';
---

<MainLayout title="Products">
  <h1>Product Catalog</h1>
  <!-- Your page content -->
</MainLayout>
```

### 5. Data Fetching

**Server-Side (in frontmatter):**
```astro
---
// Runs at build time or on the server
const products = await fetch('http://localhost:3000/api/products')
  .then(res => res.json());
---

<div>
  {products.map(product => (
    <div>{product.name}</div>
  ))}
</div>
```

**Client-Side (in React components):**
```tsx
import { useState, useEffect } from 'react';

export default function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  return <div>{/* Render products */}</div>;
}
```

### 6. API Routes

Create backend endpoints in Astro:

```typescript
// src/pages/api/products.ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const products = await fetch('http://localhost:3000/api/products')
    .then(res => res.json());

  return new Response(JSON.stringify(products), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();

  const response = await fetch('http://localhost:3000/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  return new Response(JSON.stringify(await response.json()), {
    status: 201
  });
};
```

---

## Astro + React Integration

### When to Use React vs Astro Components

**Use Astro Components (`.astro`) for:**
- Static content (headers, footers, text)
- Server-side rendering
- Layouts and page structure
- SEO-critical content

**Use React Components (`.tsx`) for:**
- Interactive forms
- Dynamic tables
- Real-time updates
- Complex state management
- Client-side interactions

### Example Integration

```astro
---
// src/pages/products.astro (Astro page)
import MainLayout from '../layouts/MainLayout.astro';
import ProductHeader from '../components/ProductHeader.astro';  // Static
import ProductList from '../components/ProductList';  // React

const title = 'Products';
---

<MainLayout title={title}>
  <!-- Static Astro component (no JavaScript) -->
  <ProductHeader title={title} />

  <!-- Interactive React component (with JavaScript) -->
  <ProductList client:load />
</MainLayout>
```

```tsx
// src/components/ProductList.tsx (React component)
import { useState, useEffect } from 'react';

export default function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(setProducts);
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map(product => (
        <div key={product.id} className="p-4 bg-white rounded shadow">
          <h3>{product.name}</h3>
          <p>${product.price}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## TailwindCSS in Astro

### Setup (Already Done!)

TailwindCSS v4 is configured using the Vite plugin:

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()]
  }
});
```

### Using Tailwind

**In Astro Files:**
```astro
<div class="max-w-7xl mx-auto px-4">
  <h1 class="text-3xl font-bold text-gray-900">
    Products
  </h1>
  <button class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
    Add Product
  </button>
</div>
```

**In React Components:**
```tsx
export default function Button({ children }) {
  return (
    <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
      {children}
    </button>
  );
}
```

**Global Styles:**
```css
/* src/styles/global.css */
@import "tailwindcss";

/* Custom styles */
.btn-primary {
  @apply px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700;
}
```

---

## Development Workflow

### Start Dev Server
```bash
cd frontend
npm run dev
```
Server runs on `http://localhost:4321`

### Build for Production
```bash
npm run build
```
Outputs to `/dist` folder

### Preview Production Build
```bash
npm run preview
```

---

## Common Patterns for This Project

### 1. Protected Page (Authentication)
```astro
---
import DashboardLayout from '../../layouts/DashboardLayout.astro';

// Check if user is authenticated
const token = Astro.cookies.get('token')?.value;

if (!token) {
  return Astro.redirect('/login');
}

// Fetch user data
const user = await fetch('http://localhost:3000/api/auth/me', {
  headers: { Authorization: `Bearer ${token}` }
}).then(res => res.json()).catch(() => null);

if (!user) {
  return Astro.redirect('/login');
}
---

<DashboardLayout title="Dashboard" user={user}>
  <h1>Welcome, {user.full_name}!</h1>
</DashboardLayout>
```

### 2. Form Page with React
```astro
---
import MainLayout from '../layouts/MainLayout.astro';
import ProductForm from '../components/ProductForm';
---

<MainLayout title="Create Product">
  <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Create Product</h1>
    <ProductForm client:load />
  </div>
</MainLayout>
```

### 3. Data Dashboard
```astro
---
import DashboardLayout from '../layouts/DashboardLayout.astro';
import StatsCard from '../components/StatsCard.astro';  // Static
import InventoryTable from '../components/InventoryTable';  // Interactive

const stats = await fetch('/api/dashboard/stats').then(r => r.json());
---

<DashboardLayout title="Dashboard">
  <!-- Static stats (no JavaScript needed) -->
  <div class="grid grid-cols-4 gap-4 mb-8">
    {stats.map(stat => (
      <StatsCard title={stat.title} value={stat.value} />
    ))}
  </div>

  <!-- Interactive table (with JavaScript) -->
  <InventoryTable client:load />
</DashboardLayout>
```

---

## Best Practices

### 1. **Start with Static, Add Interactivity When Needed**
```astro
<!-- Good: Static by default -->
<Header />

<!-- Add interactivity only when needed -->
<SearchBox client:load />
```

### 2. **Fetch Data in Frontmatter When Possible**
```astro
---
// Server-side fetch (faster, no loading states needed)
const products = await fetch('/api/products').then(r => r.json());
---

<div>
  {products.map(product => <ProductCard {...product} />)}
</div>
```

### 3. **Use Appropriate Client Directives**
```astro
<!-- Critical interactions -->
<LoginForm client:load />

<!-- Below the fold content -->
<ProductGallery client:visible />

<!-- Non-critical features -->
<Newsletter client:idle />
```

### 4. **Keep TypeScript Interfaces Consistent**
```typescript
// Define once in /src/types/product.ts
export interface Product {
  id: string;
  name: string;
  price: number;
}

// Use everywhere
import type { Product } from '../types/product';
```

---

## Debugging Tips

### 1. Check the Build Output
```bash
npm run build
```
Look for errors or warnings.

### 2. Use `console.log` in Frontmatter
```astro
---
const data = await fetch('/api/products').then(r => r.json());
console.log('Products:', data);  // Shows in terminal, not browser
---
```

### 3. Browser Console for Client Components
React components log to the browser console.

### 4. Check Network Tab
Verify API calls are working correctly.

---

## Resources

- **Official Docs**: https://docs.astro.build
- **Astro Discord**: https://astro.build/chat
- **Examples**: https://astro.build/themes
- **React in Astro**: https://docs.astro.build/en/guides/integrations-guide/react/

---

## Quick Command Reference

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Add new integration
npx astro add [integration]

# Check for issues
npm run astro check
```

---

## Summary

**Astro = HTML + JavaScript only when needed**

- `.astro` files for structure and static content
- React components for interactivity
- File-based routing for pages
- Server-side data fetching in frontmatter
- Client directives to control JavaScript loading
- TailwindCSS for styling

You're now ready to build fast, modern web applications with Astro! 🚀
