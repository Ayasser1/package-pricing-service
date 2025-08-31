import { Transaction, Op } from 'sequelize';
import { sequelize } from '../config/database';
import { Package } from '../models/package.model';
import { Municipality } from '../models/municipality.model';
import { Price } from '../models/price.model';
import { PriceHistory } from '../models/priceHistory.model';
import { logInfo, logError } from '../utils/logger';
import { 
  PriceUpdateResult, 
  CurrentPriceResult, 
  PriceHistoryResult 
} from '../types/price.types';

/**
 * Price service
 * Handles business logic for municipality-based pricing and pricing history
 */

const convertCentsToDisplay = (priceCents: number): number => {
  return Math.round((priceCents / 100) * 100) / 100;
};

/**
 * Update or create package price with municipality support
 * @param packageId - Package ID
 * @param priceCents - Price in cents (e.g., 2999 for 29.99)
 * @param municipalityId - Optional municipality ID
 * @returns Promise with price update result
 */
export const updatePackagePrice = async (
  packageId: number, 
  priceCents: number, 
  municipalityId?: number
): Promise<PriceUpdateResult> => {
  const operation = `updatePackagePrice(${packageId}, ${priceCents}, ${municipalityId})`;
  logInfo('PRICE_SERVICE', `Starting ${operation}`);

  let transaction: Transaction | null = null;

  try {
    transaction = await sequelize.transaction();

    const packageRecord = await Package.findOne({
      where: { 
        id: packageId,
        is_active: true 
      },
      transaction
    });

    if (!packageRecord) {
      throw new Error(`Package with ID ${packageId} not found or inactive`);
    }

    let municipalityRecord = null;
    if (municipalityId) {
      municipalityRecord = await Municipality.findOne({
        where: { 
          id: municipalityId,
          is_active: true 
        },
        transaction
      });

      if (!municipalityRecord) {
        throw new Error(`Municipality with ID ${municipalityId} not found or inactive`);
      }
    }

    if (priceCents < 0) {
      throw new Error('Price cannot be negative');
    }

    const whereClause: any = {
      packageId,
      is_active: true
    };
    
    if (municipalityId) {
      whereClause.municipalityId = municipalityId;
    } else {
      whereClause.municipalityId = null;
    }

    const existingPrice = await Price.findOne({
      where: whereClause,
      transaction
    });

    let newPrice;
    if (existingPrice) {
      await existingPrice.update({
        priceCents,
        currency_code: 'SEK'
      }, { transaction });
      newPrice = existingPrice;
    } else {
      newPrice = await Price.create({
        packageId,
        municipalityId: municipalityId || undefined,
        priceCents,
        is_active: true,
        currency_code: 'SEK'
      }, { transaction });
    }

    // Add entry to price history
    await PriceHistory.create({
      packageId,
      municipalityId: municipalityId || undefined,
      priceCents,
      currency_code: 'SEK'
    }, { transaction });

    await transaction.commit();
    
    logInfo('PRICE_SERVICE', `Successfully completed ${operation}`);

    return {
      success: true,
      price: {
        id: newPrice.id,
        packageId: newPrice.packageId,
        municipalityId: newPrice.municipalityId || undefined,
        priceCents: newPrice.priceCents,
        priceDisplay: convertCentsToDisplay(newPrice.priceCents),
        currency_code: newPrice.currency_code,
        municipality: municipalityRecord ? {
          id: municipalityRecord.id,
          municipality_name: municipalityRecord.municipality_name,
          municipality_code: municipalityRecord.municipality_code
        } : undefined
      },
      message: 'Price updated successfully'
    };

  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError('PRICE_SERVICE', `Failed ${operation}: ${errorMessage}`, error as Error);
    
    throw new Error(errorMessage);
  }
};

/**
 * Get current active price for a package
 * @param packageId - Package ID
 * @param municipalityId - Optional municipality ID
 * @returns Promise with current price result
 */
export const getCurrentPackagePrice = async (
  packageId: number,
  municipalityId?: number
): Promise<CurrentPriceResult> => {
  const operation = `getCurrentPackagePrice(${packageId}, ${municipalityId})`;
  logInfo('PRICE_SERVICE', `Starting ${operation}`);

  try {
    const packageRecord = await Package.findOne({
      where: { 
        id: packageId,
        is_active: true 
      }
    });

    if (!packageRecord) {
      return {
        success: false,
        error: `Package with ID ${packageId} not found or inactive`
      };
    }

    const whereClausePriceFind: any = {
      packageId,
      is_active: true
    };
    
    if (municipalityId) {
      whereClausePriceFind.municipalityId = municipalityId;
    } else {
      whereClausePriceFind.municipalityId = null;
    }

    const priceRecord = await Price.findOne({
      where: whereClausePriceFind,
      include: [
        {
          model: Municipality,
          as: 'municipality',
          required: false
        }
      ]
    });

    if (!priceRecord) {
      return {
        success: false,
        error: `No active price found for package ${packageId}${municipalityId ? ` in municipality ${municipalityId}` : ''}`
      };
    }

    logInfo('PRICE_SERVICE', `Successfully completed ${operation}`);

    return {
      success: true,
      price: {
        id: priceRecord.id,
        packageId: priceRecord.packageId,
        municipalityId: priceRecord.municipalityId || undefined,
        priceCents: priceRecord.priceCents,
        priceDisplay: convertCentsToDisplay(priceRecord.priceCents),
        currency_code: priceRecord.currency_code,
        package: {
          id: packageRecord.id,
          name: packageRecord.name,
          package_code: packageRecord.package_code
        },
        municipality: priceRecord.municipalityId ? {
          id: (priceRecord as any).municipality.id,
          municipality_name: (priceRecord as any).municipality.municipality_name,
          municipality_code: (priceRecord as any).municipality.municipality_code
        } : undefined
      }
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError('PRICE_SERVICE', `Failed ${operation}: ${errorMessage}`, error as Error);
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Get price history for a package in a specific year
 * @param packageId - Package ID
 * @param year - Year to filter by
 * @param municipalityId - Optional municipality ID
 * @returns Promise with price history result
 */
export const getPackagePriceHistory = async (
  packageId: number,
  year: number,
  municipalityId?: number
): Promise<PriceHistoryResult> => {
  const operation = `getPackagePriceHistory(${packageId}, ${year}, ${municipalityId})`;
  logInfo('PRICE_SERVICE', `Starting ${operation}`);

  try {
    const packageRecord = await Package.findOne({
      where: { 
        id: packageId,
        is_active: true 
      }
    });

    if (!packageRecord) {
      return {
        success: false,
        error: `Package with ID ${packageId} not found or inactive`
      };
    }

    if (municipalityId) {
      const municipalityRecord = await Municipality.findOne({
        where: { 
          id: municipalityId,
          is_active: true 
        }
      });

      if (!municipalityRecord) {
        return {
          success: false,
          error: `Municipality with ID ${municipalityId} not found or inactive`
        };
      }
    }

    // Create date range for the year
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    const whereClauseHistory: any = {
      packageId,
      createdAt: {
        [Op.gte]: startDate,
        [Op.lt]: endDate
      }
    };
    
    if (municipalityId) {
      whereClauseHistory.municipalityId = municipalityId;
    } else {
      whereClauseHistory.municipalityId = null;
    }

    const historyRecords = await PriceHistory.findAll({
      where: whereClauseHistory,
      include: [
        {
          model: Municipality,
          as: 'municipality',
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    logInfo('PRICE_SERVICE', `Successfully completed ${operation} - found ${historyRecords.length} records`);

    return {
      success: true,
      history: historyRecords.map(record => ({
        id: record.id,
        packageId: record.packageId,
        municipalityId: record.municipalityId || undefined,
        priceCents: record.priceCents,
        priceDisplay: convertCentsToDisplay(record.priceCents),
        currency_code: record.currency_code,
        createdAt: record.createdAt,
        municipality: record.municipalityId ? {
          id: (record as any).municipality.id,
          municipality_name: (record as any).municipality.municipality_name,
          municipality_code: (record as any).municipality.municipality_code
        } : undefined
      }))
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError('PRICE_SERVICE', `Failed ${operation}: ${errorMessage}`, error as Error);
    
    return {
      success: false,
      error: errorMessage
    };
  }
};
