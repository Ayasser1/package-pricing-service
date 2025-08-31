/**
 * Type definitions
 * Contains interfaces for price operations and responses
 */

/**
 * Municipality information structure
 */
export interface MunicipalityInfo {
  id: number;
  municipality_name: string;
  municipality_code: string;
}

/**
 * Package information structure
 */
export interface PackageInfo {
  id: number;
  name: string;
  package_code: string;
}

/**
 * Price information structure
 */
export interface PriceInfo {
  id: number;
  packageId: number;
  municipalityId?: number;
  priceCents: number;
  priceDisplay: number;
  currency_code: string;
}

/**
 * Result interface for price update operations
 */
export interface PriceUpdateResult {
  success: boolean;
  price: PriceInfo & {
    municipality?: MunicipalityInfo;
  };
  message: string;
}

/**
 * Result interface for current price retrieval operations
 */
export interface CurrentPriceResult {
  success: boolean;
  price?: PriceInfo & {
    package: PackageInfo;
    municipality?: MunicipalityInfo;
  };
  error?: string;
}

/**
 * Price history entry with creation timestamp
 */
export interface PriceHistoryEntry {
  id: number;
  packageId: number;
  municipalityId?: number;
  priceCents: number;
  priceDisplay: number;
  currency_code: string;
  createdAt: Date;
  municipality?: MunicipalityInfo;
}

/**
 * Result interface for price history retrieval operations
 */
export interface PriceHistoryResult {
  success: boolean;
  history?: PriceHistoryEntry[];
  error?: string;
}
