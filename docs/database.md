# Database Architecture

MediaNow's pricing package database follows established patterns for audit trails, referential integrity, and performance optimization.

## Design 

**Audit-First Architecture**: Every price change creates immutable history records, supporting compliance requirements and business analytics.

**Referential Integrity**: Foreign key constraints ensure data consistency across all municipality and pricing operations.

# Database Architecture

MediaNow's pricing database uses for supporting complete price history tracking with business-focused package metadata.


**Active Record Pattern**: Uses `is_active` flag to be able to disable selling package or price.

**Business-Focused Schema**: Package model includes business attributes (duration_days, max_ads_count) for complete product definition.

**Flexible Geographic Model**: Municipality structure supports international expansion with state/province and country fields.

## Database Schema Visualization

```
┌─────────────────────────────────┐
│           PACKAGES              │
├─────────────────────────────────┤
│ PK  id (INTEGER)                │
│     name (VARCHAR) UNIQUE       │
│     description (VARCHAR)       │
│     package_code (VARCHAR) UQ   │
│     duration_days (INTEGER)     │
│     max_ads_count (INTEGER)     │
│     is_active (BOOLEAN)         │
│     createdAt (DATETIME)        │
│     updatedAt (DATETIME)        │
└─────────────────────────────────┘
             │
             │ 1:N
             ▼
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│            PRICES               │       │        MUNICIPALITIES           │
├─────────────────────────────────┤       ├─────────────────────────────────┤
│ PK  id (INTEGER)                │       │ PK  id (INTEGER)                │
│ FK  packageId (INTEGER)                 │     municipality_name (VARCHAR) │
│ FK  municipalityId (INTEGER) ───┼──────▶│     municipality_code (VARCHAR) │
│     priceCents (INTEGER)        │       │     state_province (VARCHAR)    │
│     is_active (BOOLEAN)         │       │     country (VARCHAR)           │
│     currency_code (VARCHAR(3))  │       │     is_active (BOOLEAN)         │
│     createdAt (DATETIME)        │       │     createdAt (DATETIME)        │
│     updatedAt (DATETIME)        │       │     updatedAt (DATETIME)        │
└─────────────────────────────────┘       └─────────────────────────────────┘
                                                      │
                                                      │
                                                      │
┌─────────────────────────────────┐                   │
│         PRICE_HISTORIES         │                   │
├─────────────────────────────────┤                   │
│ PK  id (INTEGER)                │                   │
│ FK  packageId (INTEGER) ────────┼──────────────────┘│
│ FK  municipalityId (INTEGER) ───┼──────────────────▶│
│     priceCents (INTEGER)        │
│     currency_code (VARCHAR(3))  │
│     createdAt (DATETIME)        │
│     [NO updatedAt - immutable]  │
└─────────────────────────────────┘

```

## Entity Relationship Details

**Package → Price (1:N)**
- One package can have multiple price records
- Each price record belongs to exactly one package

**Municipality → Price (0:N)**  
- One municipality can have pricing for multiple packages
- Price records can exist without municipality (NULL = global pricing)

**Package → PriceHistory (1:N)**
- Complete audit trail of all pricing changes for each package
- Immutable records (no updates, only inserts)

**Municipality → PriceHistory (0:N)**
- Historical tracking includes municipality context
- NULL municipalityId represents global price changes

## Core Tables

### Package
```sql
CREATE TABLE packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  description VARCHAR(255),
  package_code VARCHAR(255) NOT NULL UNIQUE,
  duration_days INTEGER NOT NULL,
  max_ads_count INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Strategic indexes for performance optimization
CREATE INDEX package_id_active_idx ON packages(id, is_active);  -- Optimizes active package lookups
CREATE INDEX package_active_idx ON packages(is_active);         -- Supports listing active packages
```

**Business Logic:**
- `package_code`: Unique business identifier for external integrations
- `duration_days` & `max_ads_count`: Core product definition attributes
- `is_active`: support disable package by product side.
- Flexible naming: No restrictions on package names, supporting dynamic product catalog

### Municipality
```sql
CREATE TABLE municipalities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  municipality_name VARCHAR(255) NOT NULL,
  municipality_code VARCHAR(255) NOT NULL UNIQUE,
  state_province VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Geographic lookup optimization and performance indexes
CREATE INDEX municipality_id_active_idx ON municipalities(id, is_active);  -- Optimizes active municipality lookups
CREATE INDEX municipality_active_idx ON municipalities(is_active);         -- Supports listing active municipalities
```

**Business Logic:**
- International structure: Supports expansion beyond Sweden with country/state_province.
- `municipality_code`: Unique business identifier (likely official government codes)
- `is_active`: Enables disabling municipalities.
- Extensible for demographic/economic metadata

### Price (Active Pricing Records)
```sql
CREATE TABLE prices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  packageId INTEGER NOT NULL,
  municipalityId INTEGER NULL,
  priceCents INTEGER NOT NULL CHECK(priceCents >= 0),
  is_active BOOLEAN DEFAULT TRUE,
  currency_code VARCHAR(3) DEFAULT 'SEK',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (packageId) REFERENCES packages(id),
  FOREIGN KEY (municipalityId) REFERENCES municipalities(id)
);

-- Performance optimization indexes (matches actual Price model implementation)
CREATE UNIQUE INDEX prices_packageId_municipalityId_is_active_unique 
  ON prices(packageId, municipalityId, is_active) 
  WHERE is_active = TRUE;
```

**Business Logic:**
- `municipalityId` NULL: Represents global/base pricing for the package
- `is_active` pattern: disable price records per package/municipality
- Currency support: Multi-currency ready with 3-character currency codes
- Unique constraint: Prevents multiple active prices for same package/municipality combination
- Price validation: Non-negative pricing enforced at database level

### PriceHistory (Immutable Audit Trail)
```sql
CREATE TABLE price_histories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  packageId INTEGER NOT NULL,
  municipalityId INTEGER NULL,
  priceCents INTEGER NOT NULL CHECK(priceCents >= 0),
  currency_code VARCHAR(3) DEFAULT 'SEK',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  -- Note: No updatedAt - history records are immutable
  
  FOREIGN KEY (packageId) REFERENCES packages(id),
  FOREIGN KEY (municipalityId) REFERENCES municipalities(id)
);

-- Optimized indexes for historical reporting and service queries
CREATE INDEX price_history_package_date_idx 
  ON price_histories(packageId, createdAt);
CREATE INDEX price_history_package_municipality_date_idx 
  ON price_histories(packageId, municipalityId, createdAt);
CREATE INDEX price_history_municipality_date_idx 
  ON price_histories(municipalityId, createdAt);
```

**Business Logic:**
- Immutable records: No updatedAt field, records never modified after creation
- Complete audit trail: Every price change creates new history record
- Currency tracking: Historical currency information preserved
- **Query-Optimized Indexes**: Designed specifically for the query patterns used in `getPackagePriceHistory` service method:
  - Package + date range queries
  - Package + municipality + date range queries  
  - Municipality-specific historical analysis
- Time-series performance: All indexes include `createdAt` for efficient chronological filtering and ordering

## Price Update Strategy

**Create or Update Pattern**: The system now uses an efficient "upsert" approach for price updates:

1. **Check for existing active price** for the package/municipality combination
2. **If exists**: Update the existing record in place (maintains stable record IDs)
3. **If new**: Create a new price record
4. **Always**: Log the change in price_histories table for audit trail

**Benefits of This Approach:**
- **Cleaner data**: Only one active price record per package/municipality
- **Stable references**: External systems can rely on consistent price record IDs
- **Efficient updates**: No need to deactivate and recreate for simple price changes
- **Complete audit**: History table still captures every change with timestamps