# API Documentation

MediaNow's pricing API provides three essential endpoints for managing municipality-based pricing with complete audit trails.

## Endpoint Reference

### 1. Update Package Price

**`PUT /api/packages/:packageId/price`**

Sets new pricing for a package, either globally or for a specific municipality. Creates automatic audit trail entries.

**Parameters:**
- `packageId` (URL parameter): Package ID (integer)

**Request Body:**
```json
{
  "price_cents": 3499,                    // Required: Price in cents
  "municipality_id": 1                    // Optional: For location-specific pricing
}
```

**Business Logic:**
- Without `municipality_id`: Updates global pricing for all locations
- With `municipality_id`: Creates location-specific pricing override
- All changes automatically logged with timestamps for audit trails

**Example - Set Global Pricing:**
```bash
curl -X PUT http://localhost:3000/api/packages/1/price \
  -H 'Content-Type: application/json' \
  -d '{"price_cents": 2999}'
```

**Example - Set Stockholm Premium:**
```bash
curl -X PUT http://localhost:3000/api/packages/2/price \
  -H 'Content-Type: application/json' \
  -d '{"price_cents": 4999, "municipality_id": 1}'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Price updated successfully",
  "data": {
    "id": 5,
    "packageId": 2,
    "municipalityId": 1,
    "priceCents": 4999,
    "priceDisplay": 49.99,
    "currency_code": "SEK",
    "municipality": {
      "id": 1,
      "municipality_name": "Stockholm",
      "municipality_code": "STO"
    }
  }
}
```

### 2. Get Current Price

**`GET /api/packages/:packageId/price`**

Retrieves active pricing for a package, with municipality-specific logic.

**Parameters:**
- `packageId` (URL parameter): Package ID
- `municipality_id` (query parameter, optional): Location for pricing lookup

**Business Logic:**
- With municipality: Returns location-specific price if available, otherwise base price
- Without municipality: Returns base package pricing

**Example - Get Stockholm Pricing:**
```bash
curl "http://localhost:3000/api/packages/1/price?municipality_id=1"
```

**Example - Get Base Pricing:**
```bash
curl "http://localhost:3000/api/packages/1/price"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "packageId": 1,
    "municipalityId": 1,
    "priceCents": 2499,
    "priceDisplay": 24.99,
    "currency_code": "SEK",
    "package": {
      "id": 1,
      "name": "Basic",
      "package_code": "BASIC"
    },
    "municipality": {
      "id": 1,
      "municipality_name": "Stockholm",
      "municipality_code": "STO"
    }
  }
}
```

### 3. Get Price History

**`GET /api/packages/:packageId/price-history`**

Generates comprehensive pricing audit trail for accounting and compliance reporting.

**Parameters:**
- `packageId` (URL parameter): Package ID
- `year` (query parameter, optional): Filter by specific year
- `municipality_id` (query parameter, optional): Filter by location

**Business Logic:**
- Returns chronological history of all price changes
- Supports filtering by year for annual reports
- Includes municipality context for each price change
- Optimized for accounting department workflows

**Example - All Price History:**
```bash
curl "http://localhost:3000/api/packages/1/price-history"
```

**Example - 2025 Stockholm History:**
```bash
curl "http://localhost:3000/api/packages/1/price-history?year=2025&municipality_id=1"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "package": {
      "id": 1,
      "name": "Basic",
      "package_code": "BASIC"
    },
    "municipality": {
      "id": 1,
      "municipality_name": "Stockholm",
      "municipality_code": "STO"
    },
    "price_history": [
      {
        "id": 3,
        "packageId": 1,
        "municipalityId": 1,
        "priceCents": 2499,
        "currency_code": "SEK",
        "createdAt": "2025-08-30T09:45:32.165Z"
      },
      {
        "id": 1,
        "packageId": 1,
        "municipalityId": null,
        "priceCents": 1999,
        "currency_code": "SEK",
        "createdAt": "2025-08-30T09:45:31.977Z"
      }
    ],
    "total_changes": 2
  }
}
```

## Error Handling

All endpoints follow consistent error response patterns:

**404 Not Found:**
```json
{
  "success": false,
  "error": "Package not found",
  "details": "Package with ID 999 does not exist"
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": "Price must be a positive number"
}
```

**500 Server Error:**
```json
{
  "success": false,
  "error": "Internal server error",
  "details": "Database connection failed"
}
```

## Health Check

**`GET /health`**

Simple endpoint for monitoring and deployment verification.

```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-08-30T09:45:32.165Z",
  "service": "MediaNow Package Pricing Service"
}
```
```json
{
  "success": true,
  "data": {
    "priceCents": 2999,
    "priceDisplay": 29.99,
    "package": {
      "name": "Basic"
    }
  }
}
```

## Get Price History

**GET** `/api/packages/:packageId/price-history`

Shows all the times a price changed in a given year. Accounting team uses this for reports.

```bash
# All price changes for Basic package in 2025
curl localhost:3000/api/packages/1/price-history?year=2025

# Just the Stockholm price changes
curl localhost:3000/api/packages/1/price-history?year=2025&municipality_id=1
```

You get back a list of all the changes:
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "priceCents": 2999,
        "priceDisplay": 29.99,
        "createdAt": "2025-08-30T14:15:22.000Z"
      }
    ]
  }
}
```

## Notes

- Prices are in cents (2999 = 29.99) to avoid decimal math issues
- If you don't specify `municipality_id`, it affects the global price
- Every price change gets logged automatically for history
- Package IDs: 1=Basic, 2=Plus, 3=Premium (check the seed data)
