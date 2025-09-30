import { Request, Response } from 'express';
import { 
  updatePackagePrice, 
  getCurrentPackagePrice, 
  getPackagePriceHistory 
} from '../services/price.service';
import { logInfo, logError } from '../utils/logger';

/**
 * Price controller
 * Handles HTTP requests/responses and calls appropriate services
 */

/**
 * Update or create package price endpoint
 * PUT /api/packages/:packageId/price
 */
export const updatePrice = async (req: Request, res: Response): Promise<void> => {
  const endpoint = `PUT /api/packages/${req.params.packageId}/price`;
  logInfo(endpoint, 'Processing price update request');

  try {
    const packageId = parseInt(req.params.packageId, 10);
    const { price_cents, municipality_id } = req.body;

    const result = await updatePackagePrice(
      packageId,
      parseInt(price_cents, 10),
      municipality_id ? parseInt(municipality_id, 10) : undefined
    );

    if (result.success) {
      logInfo(endpoint, `Successfully updated price for package ${packageId}`);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.price
      });
    } else {
      logError(endpoint, `Failed to update price for package ${packageId}`);
      res.status(500).json({
        success: false,
        error: 'Internal server error occurred while updating price'
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError(endpoint, `Error updating price: ${errorMessage}`, error as Error);

    if (errorMessage.includes('not found') || errorMessage.includes('inactive')) {
      res.status(404).json({
        success: false,
        error: errorMessage
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error occurred while updating price'
      });
    }
  }
};

/**
 * Get current package price endpoint
 * GET /api/packages/:packageId/price
 */
export const getCurrentPrice = async (req: Request, res: Response): Promise<void> => {
  const endpoint = `GET /api/packages/${req.params.packageId}/price`;
  logInfo(endpoint, 'Processing get current price request');

  try {
    const packageId = parseInt(req.params.packageId, 10);
    const municipality_id = req.query.municipality_id
      ? parseInt(req.query.municipality_id as string, 10)
      : undefined;

    const result = await getCurrentPackagePrice(packageId, municipality_id);

    if (result.success && result.price) {
      logInfo(endpoint, `Successfully retrieved price for package ${packageId}`);
      res.status(200).json({
        success: true,
        data: result.price
      });
    } else {
      logInfo(endpoint, `Price not found for package ${packageId}`);
      res.status(404).json({
        success: false,
        error: result.error || 'Price not found'
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError(endpoint, `Error retrieving price: ${errorMessage}`, error as Error);

    res.status(500).json({
      success: false,
      error: 'Internal server error occurred while retrieving price'
    });
  }
};

/**
 * Get package pricing history endpoint
 * GET /api/packages/:packageId/price-history
 */
export const getPriceHistory = async (req: Request, res: Response): Promise<void> => {
  const endpoint = `GET /api/packages/${req.params.packageId}/price-history`;
  logInfo(endpoint, 'Processing get price history request');

  try {
    const packageId = parseInt(req.params.packageId, 10);
    const year = parseInt(req.query.year as string, 10);

    const municipalityId = req.query.municipality_id
      ? parseInt(req.query.municipalityId as string, 10)
      : undefined;

    const result = await getPackagePriceHistory(packageId, year, municipalityId);

    if (result.success && result.history) {
      logInfo(endpoint, `Successfully retrieved price history for package ${packageId} in year ${year}`);
      res.status(200).json({
        success: true,
        data: {
          package_id: packageId,
          year,
          municipalityId,
          history: result.history,
          count: result.history.length
        }
      });
    } else {
      logInfo(endpoint, `Price history not found for package ${packageId}`);
      res.status(404).json({
        success: false,
        error: result.error || 'Price history not found'
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError(endpoint, `Error retrieving price history: ${errorMessage}`, error as Error);

    res.status(500).json({
      success: false,
      error: 'Internal server error occurred while retrieving price history'
    });
  }
};
