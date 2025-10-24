# Frontend Pages Agent Guide

## Location
`/frontend/src/pages/`

## Purpose
Pages are the entry points for your application routes. In Astro, files in `/src/pages/` automatically become routes.

## Astro File-Based Routing

### Route Mapping
```
src/pages/index.astro           → /
src/pages/about.astro           → /about
src/pages/products/index.astro  → /products
src/pages/products/[id].astro   → /products/:id (dynamic)
src/pages/api/products.ts       → /api/products (API endpoint)
```

## Page Types

### 1. Static Pages (.astro)
Content-heavy pages rendered at build time
- Landing page
- About page
- Documentation

### 2. Dynamic Pages (.astro)
Pages with interactive React components
- Dashboard
- Product management
- Inventory tracking

### 3. API Routes (.ts)
Backend API endpoints
- `/api/products.ts` → GET/POST products
- `/api/auth/login.ts` → Authentication

## Page Structure

### Basic Page Template
```astro
---
// Frontmatter (runs on server)
import MainLayout from '../layouts/MainLayout.astro';
import ProductList from '../components/ProductList';

const title = 'Products';
---

<MainLayout title={title}>
  <div class="container mx-auto px-4">
    <h1 class="text-3xl font-bold mb-6">{title}</h1>
    <ProductList client:load />
  </div>
</MainLayout>
```

### With Data Fetching
```astro
---
import MainLayout from '../layouts/MainLayout.astro';

// Fetch data at build/request time
const response = await fetch('http://localhost:3000/api/products');
const products = await response.json();
---

<MainLayout title="Products">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    {products.map(product => (
      <div class="bg-white p-4 rounded-lg shadow">
        <h2>{product.name}</h2>
        <p>{product.price}</p>
      </div>
    ))}
  </div>
</MainLayout>
```

## Dynamic Routes

### Product Detail Page
`/src/pages/products/[id].astro`
```astro
---
import MainLayout from '../../layouts/MainLayout.astro';

// Access URL parameter
const { id } = Astro.params;

// Fetch product data
const response = await fetch(`http://localhost:3000/api/products/${id}`);
const product = await response.json();

if (!product) {
  return Astro.redirect('/404');
}
---

<MainLayout title={product.name}>
  <div class="max-w-4xl mx-auto">
    <img src={product.image_url} alt={product.name} />
    <h1 class="text-4xl font-bold">{product.name}</h1>
    <p class="text-2xl text-red-600">${product.base_price}</p>
    <p>{product.description}</p>
  </div>
</MainLayout>
```

### Generate Static Paths
For SSG (Static Site Generation):
```astro
---
export async function getStaticPaths() {
  const response = await fetch('http://localhost:3000/api/products');
  const products = await response.json();

  return products.map(product => ({
    params: { id: product.id },
    props: { product }
  }));
}

const { product } = Astro.props;
---
```

## API Routes

### Product API Endpoint
`/src/pages/api/products.ts`
```typescript
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  try {
    // Forward to backend
    const response = await fetch('http://localhost:3000/api/products');
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch products' }), {
      status: 500
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    const response = await fetch('http://localhost:3000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    return new Response(JSON.stringify(result), {
      status: 201
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create product' }), {
      status: 500
    });
  }
};
```

## Required Pages for MVP

### Public Pages
- [ ] `index.astro` - Landing page
- [ ] `login.astro` - Login page
- [ ] `register.astro` - Registration page

### Dashboard Pages (Protected)
- [ ] `dashboard/index.astro` - Overview dashboard
- [ ] `dashboard/products/index.astro` - Product list
- [ ] `dashboard/products/new.astro` - Create product
- [ ] `dashboard/products/[id].astro` - Product details
- [ ] `dashboard/inventory/index.astro` - Inventory overview
- [ ] `dashboard/inventory/transfer.astro` - Stock transfer
- [ ] `dashboard/locations/index.astro` - Locations list
- [ ] `dashboard/sms/index.astro` - SMS logs

### API Routes
- [ ] `api/auth/login.ts`
- [ ] `api/auth/register.ts`
- [ ] `api/products.ts`
- [ ] `api/inventory.ts`

## Authentication in Pages

### Protected Page Example
```astro
---
import DashboardLayout from '../../layouts/DashboardLayout.astro';

// Check authentication
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

// Check role
if (user.role !== 'admin' && user.role !== 'head_office') {
  return Astro.redirect('/dashboard');
}
---

<DashboardLayout title="Products" user={user}>
  <!-- Page content -->
</DashboardLayout>
```

## Form Handling

### Login Page Example
```astro
---
import AuthLayout from '../layouts/AuthLayout.astro';
import LoginForm from '../components/LoginForm';
---

<AuthLayout title="Login">
  <div class="max-w-md mx-auto mt-16">
    <h1 class="text-3xl font-bold mb-6 text-center">Login</h1>
    <LoginForm client:load />
  </div>
</AuthLayout>
```

## Error Pages

### 404 Page
`/src/pages/404.astro`
```astro
---
import MainLayout from '../layouts/MainLayout.astro';
---

<MainLayout title="404 - Page Not Found">
  <div class="text-center py-16">
    <h1 class="text-6xl font-bold text-red-600">404</h1>
    <p class="text-2xl mt-4">Page not found</p>
    <a href="/" class="mt-6 inline-block px-6 py-3 bg-red-600 text-white rounded-lg">
      Go Home
    </a>
  </div>
</MainLayout>
```

## Page Best Practices

1. **Use Layouts**: Don't repeat HTML structure
2. **Fetch Data in Frontmatter**: Use server-side data fetching
3. **Client Directives**: Use appropriate `client:*` directive for React components
4. **SEO**: Always provide title and meta description
5. **Loading States**: Show loading indicators for slow operations
6. **Error Handling**: Handle fetch errors gracefully
7. **Redirects**: Use `Astro.redirect()` for navigation

## Client Directives Recap

```astro
<!-- Load immediately -->
<Component client:load />

<!-- Load when visible -->
<Component client:visible />

<!-- Load when browser idle -->
<Component client:idle />

<!-- Only render in browser -->
<Component client:only="react" />
```

## Page Checklist

When creating a new page:
- [ ] Use appropriate layout
- [ ] Include meta tags (title, description)
- [ ] Handle authentication (if protected)
- [ ] Fetch data in frontmatter (if needed)
- [ ] Use client directives appropriately
- [ ] Add error handling
- [ ] Make responsive (mobile-first)
- [ ] Test navigation
- [ ] Add loading states

## Workflow Update
**Last Updated**: 2025-10-25
**Status**: Pages directory exists with basic index.astro
- File-based routing ready
- Guidelines documented
- Ready for page creation

## Next Steps
1. Update index.astro with proper layout and Tailwind
2. Create authentication pages (login, register)
3. Create dashboard pages structure
4. Implement API routes for backend proxy
5. Add 404 and error pages
