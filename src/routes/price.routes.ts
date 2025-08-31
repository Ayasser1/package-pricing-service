import { Router } from 'express';
import {
  updatePrice,
  getCurrentPrice,
  getPriceHistory
} from '../controllers/price.controller';
import {
  validatePackageId,
  validatePriceUpdate,
  validateMunicipalityQuery,
  validatePriceHistoryQuery
} from '../middleware/validation';

/**
 * Price routes
 * Defines route endpoints and applies validation middleware
 */

const router = Router();

/**
 * Update or create package price
 * PUT /api/packages/:packageId/price
 */
router.put(
  '/:packageId/price',
  validatePackageId,
  validatePriceUpdate,
  updatePrice
);

/**
 * Get current package price
 * GET /api/packages/:packageId/price
 */
router.get(
  '/:packageId/price',
  validatePackageId,
  validateMunicipalityQuery,
  getCurrentPrice
);

/**
 * Get package pricing history
 * GET /api/packages/:packageId/price-history
 */
router.get(
  '/:packageId/price-history',
  validatePackageId,
  validatePriceHistoryQuery,
  getPriceHistory
);

export default router;
