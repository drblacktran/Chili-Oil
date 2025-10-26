# OpenStreetMap Integration Strategy

## Overview

The hub expansion map uses **OpenStreetMap** (OSM) via the **Leaflet** library to visualize stores, hubs, and regions across Melbourne. This document explains the data flow, API usage, and implementation strategy.

---

## Technology Stack

### Core Libraries

1. **Leaflet 1.9.4** - Open-source JavaScript mapping library
   - Lightweight (~40KB gzipped)
   - Mobile-friendly with touch support
   - Extensive plugin ecosystem
   - No API keys required for OSM tiles

2. **OpenStreetMap Tile Server**
   - Free tile service: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
   - No API key needed
   - Rate limit: Fair use policy (max ~250 tiles/request for bulk downloads)
   - Attribution required: `© OpenStreetMap contributors`

3. **React Integration**
   - Dynamic import for client-side only rendering (Astro SSR compatibility)
   - Ref-based map instance management
   - React hooks for marker updates

---

## Data Flow Architecture

### 1. Store & Hub Data (From Backend)

```typescript
// Data comes from PostgreSQL via API
GET /api/stores → StoreLocation[]
GET /api/hubs → RegionalHub[]
GET /api/regions → CustomRegion[]

// Store location structure
interface StoreLocation {
  id: string;
  name: string;
  code: string;
  latitude: number;   // From database
  longitude: number;  // From database
  region: string;
  address_line1: string;
  // ... other fields
}
```

**Data Source Options:**

#### Option A: Pre-geocoded Database (Recommended)
- **Pros**: Fast, no API calls, works offline
- **Cons**: Need to geocode addresses once during setup
- **Implementation**: 
  ```sql
  -- Store coordinates directly in database
  ALTER TABLE locations 
  ADD COLUMN latitude DECIMAL(10, 8),
  ADD COLUMN longitude DECIMAL(11, 8);
  ```

#### Option B: Real-time Geocoding (Development Only)
- **Pros**: Flexible, auto-updates with address changes
- **Cons**: Slower, requires API calls, rate limits
- **Implementation**: Use Nominatim API (see below)

---

### 2. Geocoding Addresses to Coordinates

For converting addresses to lat/lng coordinates, use **Nominatim** (OSM's geocoding service):

#### Nominatim API Usage

```typescript
// Geocode a single address
async function geocodeAddress(address: string): Promise<{lat: number, lng: number} | null> {
  const query = encodeURIComponent(address + ', Melbourne, VIC, Australia');
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'BenjaminsChiliOil/1.0 (contact@example.com)' // Required!
      }
    });
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Example usage
const coords = await geocodeAddress('123 Sydney Road, Brunswick VIC 3056');
// Returns: { lat: -37.7691, lng: 144.9584 }
```

**Nominatim Usage Policy:**
- ✅ Free for light use
- ✅ No API key required
- ⚠️ Rate limit: 1 request/second
- ⚠️ Must include User-Agent header with contact email
- ⚠️ Not for bulk geocoding (use bulk.openstreetmap.org instead)

---

### 3. Bulk Geocoding Strategy (One-Time Setup)

For geocoding all store addresses at once:

```typescript
// Batch geocode with rate limiting
async function batchGeocodeStores(stores: Store[]): Promise<GeocodeResult[]> {
  const results = [];
  
  for (const store of stores) {
    const address = `${store.address_line1}, ${store.city}, ${store.state} ${store.postal_code}, Australia`;
    
    const coords = await geocodeAddress(address);
    results.push({
      store_id: store.id,
      address: address,
      latitude: coords?.lat || null,
      longitude: coords?.lng || null,
    });
    
    // Rate limiting: 1 request/second
    await new Promise(resolve => setTimeout(resolve, 1100));
  }
  
  return results;
}

// Save to database
async function saveGeocodedCoordinates(results: GeocodeResult[]) {
  for (const result of results) {
    await db.query(`
      UPDATE locations 
      SET latitude = $1, longitude = $2 
      WHERE id = $3
    `, [result.latitude, result.longitude, result.store_id]);
  }
}
```

**Recommended Approach:**
1. Geocode all addresses **once** during initial setup
2. Store coordinates in database
3. Re-geocode only when address changes
4. Use cached coordinates for map rendering

---

### 4. Region Boundary Data

#### Option A: Postcode-Based Regions (Current Implementation)

```typescript
// Simple circle/polygon approximation
const REGION_BOUNDARIES = {
  'CBD & Inner City': {
    center: { lat: -37.8136, lng: 144.9631 },
    postcodes: ['3000', '3002', '3004'],
    radius: 5000 // 5km radius
  },
  // ... other regions
};

// Draw approximate boundary
L.circle([lat, lng], { radius: 5000 }).addTo(map);
```

**Pros**: Simple, fast, no external data needed  
**Cons**: Not geographically accurate

#### Option B: GeoJSON Boundaries (Advanced)

Fetch actual postcode boundaries from OSM:

```typescript
// Fetch GeoJSON boundary for a postcode
async function getPostcodeBoundary(postcode: string): Promise<GeoJSON> {
  const url = `https://nominatim.openstreetmap.org/search?postalcode=${postcode}&country=au&polygon_geojson=1&format=json`;
  
  const response = await fetch(url, {
    headers: { 'User-Agent': 'BenjaminsChiliOil/1.0' }
  });
  
  const data = await response.json();
  return data[0]?.geojson || null;
}

// Draw on map
const boundary = await getPostcodeBoundary('3000');
L.geoJSON(boundary, { color: '#DC2626', weight: 2 }).addTo(map);
```

**Pros**: Geographically accurate  
**Cons**: More API calls, complex rendering

#### Option C: Pre-downloaded GeoJSON (Best for Production)

1. Download Melbourne postcode boundaries once from:
   - **data.gov.au** (Australian government open data)
   - **ABS (Australian Bureau of Statistics)** postcode data
   - **OpenStreetMap extract** for Victoria

2. Store GeoJSON files in `/public/data/boundaries/`

3. Load locally (no API calls):
   ```typescript
   const boundary = await fetch('/data/boundaries/postcode-3000.geojson');
   const geojson = await boundary.json();
   L.geoJSON(geojson).addTo(map);
   ```

**Recommended for production!**

---

## Map Features Implementation

### 1. Custom Markers

```typescript
// Store marker with stock status color
const storeIcon = L.divIcon({
  html: `<div style="background: ${statusColor}">🏪</div>`,
  className: 'custom-store-marker',
  iconSize: [24, 24],
});

// Hub marker (larger, different color)
const hubIcon = L.divIcon({
  html: `<div style="background: #2563EB">🏭</div>`,
  className: 'custom-hub-marker',
  iconSize: [32, 32],
});
```

### 2. Clustering (for many stores)

```typescript
// Install: npm install leaflet.markercluster
import 'leaflet.markercluster';

const markers = L.markerClusterGroup();
stores.forEach(store => {
  const marker = L.marker([store.lat, store.lng]);
  markers.addLayer(marker);
});
map.addLayer(markers);
```

### 3. Hub Coverage Radius

```typescript
// 10km coverage circle around hub
L.circle([hub.lat, hub.lng], {
  radius: 10000,
  color: '#2563EB',
  fillOpacity: 0.1,
  dashArray: '5, 5'
}).addTo(map);
```

### 4. Route Lines (Hub → Stores)

```typescript
// Draw line from hub to each store it serves
hubs.forEach(hub => {
  const hubStores = stores.filter(s => s.parent_location_id === hub.id);
  
  hubStores.forEach(store => {
    L.polyline([
      [hub.lat, hub.lng],
      [store.lat, store.lng]
    ], {
      color: '#2563EB',
      weight: 2,
      opacity: 0.5,
      dashArray: '5, 10'
    }).addTo(map);
  });
});
```

### 5. Heat Map (Store Density)

```typescript
// Install: npm install leaflet.heat
import 'leaflet.heat';

const heatPoints = stores.map(s => [s.lat, s.lng, 1.0]);
L.heatLayer(heatPoints, {
  radius: 25,
  blur: 15,
  maxZoom: 13
}).addTo(map);
```

---

## Data Update Strategy

### Real-time Updates

```typescript
// WebSocket for live updates
const ws = new WebSocket('wss://api.example.com/ws/locations');

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  
  if (update.type === 'store_stock_update') {
    // Update marker color based on new stock status
    updateStoreMarker(update.store_id, update.stock_status);
  }
  
  if (update.type === 'hub_capacity_update') {
    // Update hub popup with new capacity
    updateHubPopup(update.hub_id, update.current_stock);
  }
};
```

### Periodic Refresh

```typescript
// Refresh map data every 5 minutes
useEffect(() => {
  const interval = setInterval(async () => {
    const freshStores = await fetch('/api/stores').then(r => r.json());
    setStores(freshStores);
    // Markers auto-update via useEffect dependency
  }, 5 * 60 * 1000);
  
  return () => clearInterval(interval);
}, []);
```

---

## Performance Optimization

### 1. Marker Clustering
- Group nearby markers at low zoom levels
- Individual markers appear when zoomed in
- Prevents UI lag with 100+ stores

### 2. Tile Caching
```typescript
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  // Browser caches tiles automatically
  // Consider service worker for PWA offline support
}).addTo(map);
```

### 3. Lazy Loading
```typescript
// Only load map when component is visible
const [shouldRender, setShouldRender] = useState(false);

useEffect(() => {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      setShouldRender(true);
    }
  });
  
  observer.observe(containerRef.current);
}, []);
```

### 4. Debounced Region Updates
```typescript
// Don't re-render markers on every region filter change
const debouncedRegionUpdate = useDebounce(selectedRegion, 300);

useEffect(() => {
  updateMarkersForRegion(debouncedRegionUpdate);
}, [debouncedRegionUpdate]);
```

---

## Alternative Map Providers (If Needed)

### Google Maps
- **Pros**: Familiar UI, detailed data, Street View
- **Cons**: Requires API key, costs money after free tier (~$200/month for 100k loads)

### Mapbox
- **Pros**: Beautiful styling, custom maps, free tier (50k loads/month)
- **Cons**: Requires API key, more complex setup

### OpenStreetMap (Current Choice)
- **Pros**: Completely free, no API key, open data
- **Cons**: Less detailed than Google in some areas, basic styling

**Recommendation**: Start with OSM/Leaflet (free), migrate to Mapbox if you need advanced features later.

---

## Implementation Checklist

- [x] Install Leaflet library
- [x] Create HubExpansionMap component
- [ ] Geocode all existing store addresses (one-time)
- [ ] Save coordinates to database
- [ ] Download Melbourne postcode GeoJSON boundaries (optional)
- [ ] Create API endpoints for store/hub location data
- [ ] Implement marker clustering for scalability
- [ ] Add hub coverage radius visualization
- [ ] Test on mobile devices (touch support)
- [ ] Add offline map caching (PWA)

---

## Example API Responses

### GET /api/stores/locations

```json
[
  {
    "id": "store-001",
    "name": "ABC Grocery - Brunswick",
    "code": "STORE001",
    "latitude": -37.7691,
    "longitude": 144.9584,
    "region": "Northern Corridor",
    "address_line1": "123 Sydney Road",
    "city": "Brunswick",
    "postal_code": "3056",
    "stock_status": "healthy"
  }
]
```

### GET /api/hubs/with-coverage

```json
[
  {
    "id": "hub-001",
    "location_id": "loc-hub-001",
    "partner_company_name": "XYZ Shipping Co",
    "hub_type": "shipping_company",
    "coverage_regions": ["Northern Corridor", "CBD & Inner City"],
    "stores_served": 8,
    "current_stock_level": 450,
    "max_storage_capacity": 1000,
    "location": {
      "latitude": -37.7691,
      "longitude": 144.9584,
      "name": "XYZ Warehouse - Brunswick",
      "address_line1": "456 Hub Road"
    }
  }
]
```

---

## Resources

- **Leaflet Docs**: https://leafletjs.com/
- **OSM Tile Servers**: https://wiki.openstreetmap.org/wiki/Tile_servers
- **Nominatim API**: https://nominatim.org/release-docs/latest/api/Search/
- **Postcode Data (Australia)**: https://data.gov.au/
- **React Leaflet**: https://react-leaflet.js.org/ (alternative wrapper)

---

**Next Steps**: Test the map component with mock data, then integrate with real backend API.
