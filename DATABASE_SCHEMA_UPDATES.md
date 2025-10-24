# Database Schema Updates for Map View

## Changes Required for Geolocation Support

### 1. Update `locations` Table

Add geolocation fields to support map view functionality:

```sql
ALTER TABLE locations
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8),
ADD COLUMN region VARCHAR(100), -- e.g., 'North', 'South', 'CBD'
ADD COLUMN full_address TEXT;

-- Create spatial index for efficient geo queries
CREATE INDEX idx_locations_coordinates ON locations(latitude, longitude);

-- Create region index for filtering
CREATE INDEX idx_locations_region ON locations(region);
```

### 2. Updated `locations` Table Schema

```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type ENUM('head_centre', 'distributor') NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,

  -- Contact Information
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,

  -- Address
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Australia',

  -- Geolocation (NEW)
  latitude DECIMAL(10, 8), -- e.g., -37.8136
  longitude DECIMAL(11, 8), -- e.g., 144.9631
  region VARCHAR(100), -- e.g., 'North', 'South', 'CBD', 'East', 'West'
  full_address TEXT, -- Combined address for geocoding

  -- Business Details
  business_license VARCHAR(100),
  tax_id VARCHAR(100),

  -- Relationships
  parent_location_id UUID REFERENCES locations(id),
  assigned_user_id UUID REFERENCES users(id),

  -- Settings
  sms_notifications_enabled BOOLEAN DEFAULT true,
  email_notifications_enabled BOOLEAN DEFAULT true,

  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Spatial constraint (optional - for PostGIS)
  -- CONSTRAINT valid_coordinates CHECK (
  --   latitude BETWEEN -90 AND 90 AND
  --   longitude BETWEEN -180 AND 180
  -- )
);
```

### 3. Sample Data - Melbourne Distributors

```sql
-- Head Centre (Melbourne CBD)
INSERT INTO locations (
  name, type, code, contact_person, email, phone,
  city, state, postal_code, country,
  latitude, longitude, region, full_address
) VALUES (
  'Main Warehouse', 'head_centre', 'HC001',
  'Admin User', 'admin@chilioil.com.au', '+61 3 9654 0000',
  'Melbourne CBD', 'Victoria', '3000', 'Australia',
  -37.8136, 144.9631, 'CBD',
  '789 Collins St, Melbourne VIC 3000'
);

-- Distributors across Melbourne
INSERT INTO locations (
  name, type, code, contact_person, email, phone,
  city, state, postal_code, country,
  latitude, longitude, region, full_address,
  parent_location_id
) VALUES
-- North Region
('North Melbourne Distributor', 'distributor', 'DIST001',
  'Ahmad Ali', 'ahmad@dist1.com.au', '+61 3 9329 1111',
  'North Melbourne', 'Victoria', '3051', 'Australia',
  -37.7995, 144.9491, 'North',
  '123 Arden St, North Melbourne VIC 3051',
  (SELECT id FROM locations WHERE code = 'HC001')),

-- South Region
('South Yarra Distributor', 'distributor', 'DIST002',
  'Lee Wei', 'lee@dist2.com.au', '+61 3 9866 2222',
  'South Yarra', 'Victoria', '3141', 'Australia',
  -37.8397, 145.0001, 'South',
  '456 Toorak Rd, South Yarra VIC 3141',
  (SELECT id FROM locations WHERE code = 'HC001')),

-- CBD
('CBD Central Distributor', 'distributor', 'DIST003',
  'Sarah Johnson', 'sarah@dist3.com.au', '+61 3 9654 3333',
  'Melbourne CBD', 'Victoria', '3000', 'Australia',
  -37.8136, 144.9631, 'CBD',
  '789 Collins St, Melbourne VIC 3000',
  (SELECT id FROM locations WHERE code = 'HC001')),

-- East Region
('Box Hill Distributor', 'distributor', 'DIST004',
  'Kumar Singh', 'kumar@dist4.com.au', '+61 3 9890 4444',
  'Box Hill', 'Victoria', '3128', 'Australia',
  -37.8197, 145.1233, 'East',
  '321 Station St, Box Hill VIC 3128',
  (SELECT id FROM locations WHERE code = 'HC001')),

-- West Region (Geelong)
('Geelong Distributor', 'distributor', 'DIST005',
  'David Brown', 'david@dist5.com.au', '+61 3 5221 5555',
  'Geelong', 'Victoria', '3220', 'Australia',
  -38.1499, 144.3617, 'West',
  '555 Moorabool St, Geelong VIC 3220',
  (SELECT id FROM locations WHERE code = 'HC001')),

-- West Region (Footscray)
('Footscray Distributor', 'distributor', 'DIST006',
  'Jessica Wong', 'jessica@dist6.com.au', '+61 3 9687 6666',
  'Footscray', 'Victoria', '3011', 'Australia',
  -37.7985, 144.9007, 'West',
  '888 Barkly St, Footscray VIC 3011',
  (SELECT id FROM locations WHERE code = 'HC001')),

-- East Region (Glen Waverley)
('Glen Waverley Distributor', 'distributor', 'DIST007',
  'Raj Patel', 'raj@dist7.com.au', '+61 3 9560 7777',
  'Glen Waverley', 'Victoria', '3150', 'Australia',
  -37.8780, 145.1629, 'East',
  '999 Springvale Rd, Glen Waverley VIC 3150',
  (SELECT id FROM locations WHERE code = 'HC001')),

-- North Region (Brunswick)
('Brunswick Distributor', 'distributor', 'DIST008',
  'Fatima Hassan', 'fatima@dist8.com.au', '+61 3 9380 8888',
  'Brunswick', 'Victoria', '3056', 'Australia',
  -37.7645, 144.9602, 'North',
  '147 Sydney Rd, Brunswick VIC 3056',
  (SELECT id FROM locations WHERE code = 'HC001')),

-- South Region (St Kilda)
('St Kilda Distributor', 'distributor', 'DIST009',
  'Chen Li', 'chen@dist9.com.au', '+61 3 9534 9999',
  'St Kilda', 'Victoria', '3182', 'Australia',
  -37.8677, 144.9807, 'South',
  '258 Acland St, St Kilda VIC 3182',
  (SELECT id FROM locations WHERE code = 'HC001')),

-- South East Region (Dandenong)
('Dandenong Distributor', 'distributor', 'DIST010',
  'Ravi Kumar', 'ravi@dist10.com.au', '+61 3 9791 0000',
  'Dandenong', 'Victoria', '3175', 'Australia',
  -37.9871, 145.2154, 'South East',
  '369 Lonsdale St, Dandenong VIC 3175',
  (SELECT id FROM locations WHERE code = 'HC001'));
```

### 4. Useful Geo Queries

#### Find Nearest Distributors
```sql
-- Find distributors within 10km of a point (requires PostGIS)
SELECT
  name,
  code,
  city,
  ST_Distance(
    ST_MakePoint(longitude, latitude)::geography,
    ST_MakePoint(144.9631, -37.8136)::geography
  ) / 1000 AS distance_km
FROM locations
WHERE type = 'distributor'
  AND latitude IS NOT NULL
  AND longitude IS NOT NULL
ORDER BY distance_km
LIMIT 5;
```

#### Get Distributors by Region
```sql
SELECT
  region,
  COUNT(*) as distributor_count,
  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count
FROM locations
WHERE type = 'distributor'
GROUP BY region
ORDER BY region;
```

#### Calculate Distance Between Locations
```sql
-- Simple distance calculation (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL, lon1 DECIMAL,
  lat2 DECIMAL, lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  earth_radius DECIMAL := 6371; -- km
  dlat DECIMAL;
  dlon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);

  a := sin(dlat/2) * sin(dlat/2) +
       cos(radians(lat1)) * cos(radians(lat2)) *
       sin(dlon/2) * sin(dlon/2);

  c := 2 * atan2(sqrt(a), sqrt(1-a));

  RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### 5. Map Integration Options

#### Option A: Google Maps API
- **Cost**: Free up to 28,000 map loads/month
- **Features**: Rich markers, info windows, clustering
- **Installation**: `npm install @vis.gl/react-google-maps`

#### Option B: Mapbox GL JS
- **Cost**: Free up to 50,000 map loads/month
- **Features**: Beautiful maps, custom styling
- **Installation**: `npm install mapbox-gl react-map-gl`

#### Option C: Leaflet (Open Source)
- **Cost**: Free
- **Features**: Lightweight, no API key required
- **Installation**: `npm install leaflet react-leaflet`

### 6. Backend API Endpoints for Map

```javascript
// Get all distributors with geolocation
GET /api/locations?includeGeo=true

// Get distributors by region
GET /api/locations?region=North

// Get distributors within radius
GET /api/locations/nearby?lat=-37.8136&lng=144.9631&radius=10

// Response format:
{
  "success": true,
  "data": [{
    "id": "uuid",
    "name": "North Melbourne Distributor",
    "code": "DIST001",
    "latitude": -37.7995,
    "longitude": 144.9491,
    "region": "North",
    "status": "active",
    "totalStock": 180,
    "lowStockItems": 3
  }]
}
```

### 7. Frontend Implementation Notes

See `frontend/src/components/MapView.tsx` for:
- Component structure placeholder
- Region filtering
- Status-based marker colors
- Click handlers for distributor details

### 8. Migration Steps

1. **Backup Database**
   ```bash
   pg_dump -U postgres chili_oil_db > backup_before_geo.sql
   ```

2. **Add Columns**
   ```sql
   ALTER TABLE locations
   ADD COLUMN latitude DECIMAL(10, 8),
   ADD COLUMN longitude DECIMAL(11, 8),
   ADD COLUMN region VARCHAR(100),
   ADD COLUMN full_address TEXT;
   ```

3. **Populate Coordinates**
   - Use geocoding service (Google Geocoding API)
   - Or manually enter coordinates from mock data
   - Verify all distributors have valid coordinates

4. **Create Indexes**
   ```sql
   CREATE INDEX idx_locations_coordinates ON locations(latitude, longitude);
   CREATE INDEX idx_locations_region ON locations(region);
   ```

5. **Update Application Code**
   - Update location creation forms to include geo fields
   - Add map component to dashboard
   - Implement geocoding for new addresses

---

## Benefits of Geolocation

1. **Visual Distribution Monitoring** - See all distributors at a glance
2. **Route Optimization** - Plan delivery routes efficiently
3. **Regional Analysis** - Understand geographic performance
4. **Coverage Gaps** - Identify underserved areas
5. **Proximity Search** - Find nearest distributors
6. **Territory Management** - Assign regions and territories

---

## Next Steps

1. Choose map provider (Google Maps, Mapbox, or Leaflet)
2. Get API key (if needed)
3. Install map library
4. Implement MapView component
5. Add geocoding for address-to-coordinates conversion
6. Add reverse geocoding for coordinates-to-address
