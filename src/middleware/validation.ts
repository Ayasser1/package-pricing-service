import { Request, Response, NextFunction } from 'express';
import { logError } from '../utils/logger';

/**
 * TypeScript validation middleware
 */

const isPositiveInteger = (value: any): boolean => {
  const num = Number(value);
  return Number.isInteger(num) && num > 0;
};

const isValidYear = (value: any): boolean => {
  const year = Number(value);
  return Number.isInteger(year) && year >= 1900 && year <= new Date().getFullYear() + 10;
};

export const validatePackageId = (req: Request, res: Response, next: NextFunction): void => {
  const { packageId } = req.params;
  
  if (!packageId || !isPositiveInteger(packageId)) {
    logError('VALIDATION', `Invalid packageId parameter: ${packageId}`);
    res.status(400).json({
      error: 'Invalid package ID. Must be a positive integer.',
      code: 'INVALID_PACKAGE_ID'
    });
    return;
  }
  
  next();
};

export const validatePriceUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { price_cents, municipality_id } = req.body;
  
  if (price_cents === undefined || price_cents === null) {
    logError('VALIDATION', 'Missing required field: price_cents');
    res.status(400).json({
      error: 'Price in cents is required.',
      code: 'MISSING_PRICE_CENTS'
    });
    return;
  }
  
  if (!isPositiveInteger(price_cents)) {
    logError('VALIDATION', `Invalid price_cents value: ${price_cents}`);
    res.status(400).json({
      error: 'Price must be a positive integer in cents.',
      code: 'INVALID_PRICE_CENTS'
    });
    return;
  }
  
  if (municipality_id !== undefined && municipality_id !== null && !isPositiveInteger(municipality_id)) {
    logError('VALIDATION', `Invalid municipality_id: ${municipality_id}`);
    res.status(400).json({
      error: 'Municipality ID must be a positive integer.',
      code: 'INVALID_MUNICIPALITY_ID'
    });
    return;
  }
  
  next();
};

export const validateMunicipalityQuery = (req: Request, res: Response, next: NextFunction): void => {
  const { municipality_id } = req.query;
  
  if (municipality_id && !isPositiveInteger(municipality_id)) {
    logError('VALIDATION', `Invalid municipality_id query parameter: ${municipality_id}`);
    res.status(400).json({
      error: 'Municipality ID must be a positive integer.',
      code: 'INVALID_MUNICIPALITY_ID'
    });
    return;
  }
  
  next();
};

export const validatePriceHistoryQuery = (req: Request, res: Response, next: NextFunction): void => {
  const { year, municipality_id } = req.query;
  
  if (!year) {
    logError('VALIDATION', 'Missing required query parameter: year');
    res.status(400).json({
      error: 'Year parameter is required.',
      code: 'MISSING_YEAR'
    });
    return;
  }
  
  if (!isValidYear(year)) {
    logError('VALIDATION', `Invalid year parameter: ${year}`);
    res.status(400).json({
      error: 'Year must be a valid 4-digit year.',
      code: 'INVALID_YEAR'
    });
    return;
  }
  
  if (municipality_id && !isPositiveInteger(municipality_id)) {
    logError('VALIDATION', `Invalid municipality_id query parameter: ${municipality_id}`);
    res.status(400).json({
      error: 'Municipality ID must be a positive integer.',
      code: 'INVALID_MUNICIPALITY_ID'
    });
    return;
  }
  
  next();
};
