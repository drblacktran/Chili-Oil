# Frontend Layouts Agent Guide

## Location
`/frontend/src/layouts/`

## Purpose
Astro layouts define the structure and wrapper for pages. They provide consistent structure across multiple pages.

## What Are Layouts?

In Astro, layouts are `.astro` files that wrap page content. They typically include:
- HTML structure (`<html>`, `<head>`, `<body>`)
- Common elements (header, footer, navigation)
- Global styles
- Meta tags and SEO

## Base Layout Structure

### MainLayout.astro (Primary Layout)
```astro
---
import '../styles/global.css';

interface Props {
  title: string;
  description?: string;
}

const { title, description = 'Chili Oil Distribution System' } = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <title>{title} | Chili Oil Distribution</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <!-- Header content -->
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <footer class="bg-gray-800 text-white mt-auto">
      <!-- Footer content -->
    </footer>
  </body>
</html>
```

## Layout Types

### 1. MainLayout.astro
- Default layout for most pages
- Includes header, footer, navigation
- Global styles imported

### 2. DashboardLayout.astro
- Sidebar navigation
- User menu
- Role-based content

### 3. AuthLayout.astro
- Login/Register pages
- Centered content
- No header/footer
- Minimal design

### 4. BlankLayout.astro
- Minimal structure
- For special pages (404, maintenance)

## Using Layouts in Pages

### Example Usage
```astro
---
// src/pages/products.astro
import MainLayout from '../layouts/MainLayout.astro';
import ProductList from '../components/ProductList';
---

<MainLayout title="Products">
  <h1 class="text-3xl font-bold mb-6">Product Catalog</h1>
  <ProductList client:load />
</MainLayout>
```

## Layout Best Practices

### 1. Import Global Styles
Always import global CSS in the main layout:
```astro
---
import '../styles/global.css';
---
```

### 2. Use Props for Dynamic Content
```astro
---
interface Props {
  title: string;
  showNav?: boolean;
  className?: string;
}

const { title, showNav = true, className = '' } = Astro.props;
---
```

### 3. Conditional Elements
```astro
{showNav && (
  <nav>
    <!-- Navigation -->
  </nav>
)}
```

### 4. Slot for Content
Use `<slot />` to inject page content:
```astro
<main>
  <slot />
</main>
```

### 5. Named Slots (Advanced)
```astro
<div class="layout">
  <aside>
    <slot name="sidebar" />
  </aside>
  <main>
    <slot />
  </main>
</div>
```

Usage in page:
```astro
<MainLayout>
  <div slot="sidebar">Sidebar content</div>
  <div>Main content</div>
</MainLayout>
```

## SEO & Meta Tags

### Complete Meta Setup
```astro
---
interface Props {
  title: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
}

const {
  title,
  description = 'Manage your chili oil distribution',
  image = '/og-image.png',
  noIndex = false
} = Astro.props;

const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content={description} />
  <link rel="canonical" href={canonicalURL} />

  {noIndex && <meta name="robots" content="noindex, nofollow" />}

  <!-- Open Graph -->
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={image} />
  <meta property="og:type" content="website" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={image} />

  <title>{title} | Chili Oil Distribution</title>
</head>
```

## Navigation Component

### Example Header
```astro
---
// Can include React components
import UserMenu from '../components/UserMenu';
---

<header class="bg-white shadow">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center py-4">
      <a href="/" class="text-2xl font-bold text-red-600">
        Chili Oil Distribution
      </a>

      <nav class="hidden md:flex space-x-6">
        <a href="/products" class="hover:text-red-600">Products</a>
        <a href="/inventory" class="hover:text-red-600">Inventory</a>
        <a href="/transfers" class="hover:text-red-600">Transfers</a>
        <a href="/locations" class="hover:text-red-600">Locations</a>
      </nav>

      <UserMenu client:load />
    </div>
  </div>
</header>
```

## Responsive Layout

### Mobile-First Approach
```astro
<div class="flex flex-col lg:flex-row">
  <!-- Sidebar: full width on mobile, fixed on desktop -->
  <aside class="w-full lg:w-64 bg-gray-800 text-white">
    <slot name="sidebar" />
  </aside>

  <!-- Main: responsive padding -->
  <main class="flex-1 p-4 md:p-6 lg:p-8">
    <slot />
  </main>
</div>
```

## Layout with Authentication

### Protected Layout
```astro
---
// Check if user is authenticated
const token = Astro.cookies.get('token');

if (!token) {
  return Astro.redirect('/login');
}

// Verify token with backend
const user = await fetch('/api/auth/me', {
  headers: { Authorization: `Bearer ${token}` }
}).then(res => res.json());

if (!user) {
  return Astro.redirect('/login');
}
---

<MainLayout title="Dashboard">
  <div class="mb-4">
    Welcome, {user.name}!
  </div>
  <slot />
</MainLayout>
```

## Dark Mode Support (Optional)

```astro
<html lang="en" class="dark">
  <body class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
    <!-- Content -->
  </body>
</html>

<script>
  // Toggle dark mode
  const toggle = document.querySelector('#dark-mode-toggle');
  toggle?.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
  });
</script>
```

## Layouts Checklist

When creating a layout:
- [ ] Import global CSS
- [ ] Define TypeScript interface for props
- [ ] Include proper meta tags
- [ ] Use semantic HTML
- [ ] Add proper ARIA attributes
- [ ] Make it responsive
- [ ] Include `<slot />` for content
- [ ] Add consistent header/footer (if applicable)

## Required Layouts for MVP

1. **MainLayout.astro** - Default for all pages
2. **DashboardLayout.astro** - Inventory, products, transfers
3. **AuthLayout.astro** - Login, register

## Workflow Update
**Last Updated**: 2025-10-25
**Status**: Directory created, awaiting layout implementation
- Layouts folder structure ready
- Guidelines documented
- Ready for MainLayout creation

## Next Steps
1. Create MainLayout.astro with Tailwind imports
2. Create DashboardLayout with sidebar navigation
3. Create AuthLayout for login/register
4. Test layouts with sample pages
