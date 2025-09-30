# MediaNow Package Pricing System

A production-ready TypeScript/Node.js API service implementing municipality-based pricing and comprehensive audit trails for MediaNow's package offerings.

## Problem Statement & Solution

MediaNow required two critical enhancements to their pricing infrastructure:

**Municipality-Based Pricing**: Enable location-specific pricing strategies (Stockholm premium rates, rural discounts) while maintaining operational simplicity and data consistency.

**Complete Price History**: Replace manual spreadsheet tracking with automated audit trails that support accounting workflows, compliance requirements, and business analytics.

I implemented a clean MCS (Model-Controller-Service) architecture that handles complex pricing logic while maintaining simplicity for both technical teams and business users.

## Technical Architecture

- **TypeScript** with strict type safety and interfaces
- **Express.js** with native middleware (no external validation dependencies)
- **Sequelize ORM** with SQLite
- **Transaction-safe operations** ensuring complete data consistency
- **Native logging** with structured output for production monitoring
- **Comprehensive test suite** covering models, services, and API integration

## Quick Start

```bash
npm install
npm run seed    # Creates sample packages, municipalities, and pricing data
npm start       # Server available at http://localhost:3000
```

**Verify Installation**: `curl http://localhost:3000/health`

## API Overview

### Core Endpoints

**Update Package Price** - `PUT /api/packages/:packageId/price`  
Set global or municipality-specific pricing with automatic history tracking

**Get Current Price** - `GET /api/packages/:packageId/price`  
Retrieve active pricing with full package and location context

**Get Price History** - `GET /api/packages/:packageId/price-history`  
Generate historical reports

## Example Implementation

```bash
# Set Stockholm premium pricing (34.99 SEK for Basic package)
curl -X PUT http://localhost:3000/api/packages/1/price \
  -H 'Content-Type: application/json' \
  -d '{"price_cents": 3499, "municipality_id": 1}'

# Verify current Stockholm pricing
curl http://localhost:3000/api/packages/1/price?municipality_id=1

# Generate 2025 price history for compliance reporting
curl http://localhost:3000/api/packages/1/price-history?year=2025&municipality_id=1
```
