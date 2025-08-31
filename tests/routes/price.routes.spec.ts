import { sequelize } from '../../src/config/database';
import { Package } from '../../src/models/package.model';
import { Municipality } from '../../src/models/municipality.model';
import { Price } from '../../src/models/price.model';
import { PriceHistory } from '../../src/models/priceHistory.model';
import {
  updatePackagePrice,
  getCurrentPackagePrice,
  getPackagePriceHistory
} from '../../src/services/price.service';

/**
 * Service integration tests
 * Tests the complete business logic through service layer
 */

describe('Service Integration Tests', () => {
  let testPackage: Package;
  let testMunicipality: Municipality;

  beforeAll(async () => {
    // Initialize test database
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    // Create test data
    testPackage = await Package.create({
      name: 'Premium',
      description: 'Premium package for testing',
      package_code: 'PREM-TEST',
      duration_days: 30,
      max_ads_count: 100,
      is_active: true
    });

    testMunicipality = await Municipality.create({
      municipality_name: 'Test City',
      municipality_code: 'TC',
      state_province: 'Test State',
      country: 'Test Country',
      is_active: true
    });
  });

  afterEach(async () => {
    // Clean up test data
    await PriceHistory.destroy({ where: {} });
    await Price.destroy({ where: {} });
    await Municipality.destroy({ where: {} });
    await Package.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Complete pricing workflow', () => {
    it('should handle complete pricing workflow without municipality', async () => {
      // Update package price
      const updateResult = await updatePackagePrice(testPackage.id, 2999);
      expect(updateResult.success).toBe(true);
      expect(updateResult.price.priceDisplay).toBe(29.99);

      // Get current price
      const currentResult = await getCurrentPackagePrice(testPackage.id);
      expect(currentResult.success).toBe(true);
      expect(currentResult.price?.priceDisplay).toBe(29.99);

      // Check price history
      const currentYear = new Date().getFullYear();
      const historyResult = await getPackagePriceHistory(testPackage.id, currentYear);
      expect(historyResult.success).toBe(true);
      expect(historyResult.history).toHaveLength(1);
      expect(historyResult.history![0].priceDisplay).toBe(29.99);
    });

    it('should handle complete pricing workflow with municipality', async () => {
      // Update package price with municipality
      const updateResult = await updatePackagePrice(testPackage.id, 3999, testMunicipality.id);
      expect(updateResult.success).toBe(true);
      expect(updateResult.price.priceDisplay).toBe(39.99);
      expect(updateResult.price.municipalityId).toBe(testMunicipality.id);

      // Get municipality-specific price
      const currentResult = await getCurrentPackagePrice(testPackage.id, testMunicipality.id);
      expect(currentResult.success).toBe(true);
      expect(currentResult.price?.priceDisplay).toBe(39.99);
      expect(currentResult.price?.municipalityId).toBe(testMunicipality.id);

      // Check municipality-specific price history
      const currentYear = new Date().getFullYear();
      const historyResult = await getPackagePriceHistory(testPackage.id, currentYear, testMunicipality.id);
      expect(historyResult.success).toBe(true);
      expect(historyResult.history).toHaveLength(1);
      expect(historyResult.history![0].priceDisplay).toBe(39.99);
      expect(historyResult.history![0].municipalityId).toBe(testMunicipality.id);
    });

    it('should handle multiple price updates and maintain history', async () => {
      // Create base price
      await updatePackagePrice(testPackage.id, 1999);
      
      // Create municipality-specific price
      await updatePackagePrice(testPackage.id, 2999, testMunicipality.id);
      
      // Update base price
      await updatePackagePrice(testPackage.id, 2499);
      
      // Update municipality price
      await updatePackagePrice(testPackage.id, 3499, testMunicipality.id);

      // Check current prices
      const basePrice = await getCurrentPackagePrice(testPackage.id);
      const municipalityPrice = await getCurrentPackagePrice(testPackage.id, testMunicipality.id);

      expect(basePrice.price?.priceDisplay).toBe(24.99);
      expect(municipalityPrice.price?.priceDisplay).toBe(34.99);

      // Check price history
      const currentYear = new Date().getFullYear();
      const baseHistory = await getPackagePriceHistory(testPackage.id, currentYear);
      const municipalityHistory = await getPackagePriceHistory(testPackage.id, currentYear, testMunicipality.id);

      expect(baseHistory.history).toHaveLength(2);
      expect(municipalityHistory.history).toHaveLength(2);

      // Verify history order (most recent first)
      expect(baseHistory.history![0].priceDisplay).toBe(24.99);
      expect(baseHistory.history![1].priceDisplay).toBe(19.99);
      
      expect(municipalityHistory.history![0].priceDisplay).toBe(34.99);
      expect(municipalityHistory.history![1].priceDisplay).toBe(29.99);
    });
  });

  describe('Error handling scenarios', () => {
    it('should handle non-existent package gracefully', async () => {
      await expect(updatePackagePrice(99999, 2999))
        .rejects
        .toThrow('Package with ID 99999 not found or inactive');

      const currentResult = await getCurrentPackagePrice(99999);
      expect(currentResult.success).toBe(false);

      const historyResult = await getPackagePriceHistory(99999, 2024);
      expect(historyResult.success).toBe(false);
    });

    it('should handle non-existent municipality gracefully', async () => {
      await expect(updatePackagePrice(testPackage.id, 2999, 99999))
        .rejects
        .toThrow('Municipality with ID 99999 not found or inactive');

      const historyResult = await getPackagePriceHistory(testPackage.id, 2024, 99999);
      expect(historyResult.success).toBe(false);
    });
  });
});
