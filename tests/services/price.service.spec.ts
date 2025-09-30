import {
  updatePackagePrice,
  getCurrentPackagePrice,
  getPackagePriceHistory
} from '../../src/services/price.service';
import { Package } from '../../src/models/package.model';
import { Municipality } from '../../src/models/municipality.model';
import { Price } from '../../src/models/price.model';
import { PriceHistory } from '../../src/models/priceHistory.model';
import { sequelize } from '../../src/config/database';

/**
 * Price service tests
 */

describe('PriceService', () => {
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

  describe('updatePackagePrice', () => {
    it('should create new package price without municipality', async () => {
      const result = await updatePackagePrice(testPackage.id, 2999); 

      expect(result.success).toBe(true);
      expect(result.price.priceCents).toBe(2999);
      expect(result.price.priceDisplay).toBe(29.99);
      expect(result.price.packageId).toBe(testPackage.id);
      expect(result.price.municipalityId).toBeUndefined();
    });

    it('should create new package price with municipality', async () => {
      const result = await updatePackagePrice(testPackage.id, 3999, testMunicipality.id);

      expect(result.success).toBe(true);
      expect(result.price.priceCents).toBe(3999);
      expect(result.price.priceDisplay).toBe(39.99);
      expect(result.price.packageId).toBe(testPackage.id);
      expect(result.price.municipalityId).toBe(testMunicipality.id);
      expect(result.price.municipality).toBeDefined();
      expect(result.price.municipality?.municipality_name).toBe('Test City');
    });

    it('should update existing price in place', async () => {
      // Create initial price
      await updatePackagePrice(testPackage.id, 1999);
      
      // Update price
      const result = await updatePackagePrice(testPackage.id, 2499);

      expect(result.success).toBe(true);
      expect(result.price.priceDisplay).toBe(24.99);

      // Check that price was updated in place
      const allPrices = await Price.findAll({
        where: { packageId: testPackage.id }
      });
      expect(allPrices).toHaveLength(1);
      
      const activePrices = allPrices.filter(p => p.is_active);
      expect(activePrices).toHaveLength(1);
      expect(activePrices[0].priceCents).toBe(2499);
    });

    it('should create price history entry', async () => {
      await updatePackagePrice(testPackage.id, 1599);

      const historyEntries = await PriceHistory.findAll({
        where: { packageId: testPackage.id }
      });
      
      expect(historyEntries).toHaveLength(1);
      expect(historyEntries[0].priceCents).toBe(1599);
    });

    it('should throw error for non-existent package', async () => {
      await expect(updatePackagePrice(99999, 2999))
        .rejects
        .toThrow('Package with ID 99999 not found or inactive');
    });

    it('should throw error for non-existent municipality', async () => {
      await expect(updatePackagePrice(testPackage.id, 2999, 99999))
        .rejects
        .toThrow('Municipality with ID 99999 not found or inactive');
    });
  });

  describe('getCurrentPackagePrice', () => {
    beforeEach(async () => {
      // Create base price
      await updatePackagePrice(testPackage.id, 2599);
      // Create municipality-specific price
      await updatePackagePrice(testPackage.id, 3599, testMunicipality.id);
    });

    it('should return base price when no municipality specified', async () => {
      const result = await getCurrentPackagePrice(testPackage.id);

      expect(result.success).toBe(true);
      expect(result.price?.priceDisplay).toBe(25.99);
      expect(result.price?.municipalityId).toBeUndefined();
      expect(result.price?.package.name).toBe('Premium');
    });

    it('should return municipality-specific price when municipality specified', async () => {
      const result = await getCurrentPackagePrice(testPackage.id, testMunicipality.id);

      expect(result.success).toBe(true);
      expect(result.price?.priceDisplay).toBe(35.99);
      expect(result.price?.municipalityId).toBe(testMunicipality.id);
      expect(result.price?.municipality?.municipality_name).toBe('Test City');
    });

    it('should return error for non-existent package', async () => {
      const result = await getCurrentPackagePrice(99999);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Package with ID 99999 not found');
    });

    it('should return error when no active price found', async () => {
      const newPackage = await Package.create({
        name: 'Basic',
        description: 'Basic package',
        package_code: 'BASIC-TEST',
        duration_days: 15,
        max_ads_count: 10,
        is_active: true
      });

      const result = await getCurrentPackagePrice(newPackage.id);

      expect(result.success).toBe(false);
      expect(result.error).toContain('No active price found');
    });
  });

  describe('getPackagePriceHistory', () => {
    beforeEach(async () => {
      // Create price history for current year
      await updatePackagePrice(testPackage.id, 2099);
      await updatePackagePrice(testPackage.id, 2599);
      
      // Create municipality-specific price history
      await updatePackagePrice(testPackage.id, 3099, testMunicipality.id);
      await updatePackagePrice(testPackage.id, 3599, testMunicipality.id);
    });

    it('should return price history for current year without municipality', async () => {
      const currentYear = new Date().getFullYear();
      const result = await getPackagePriceHistory(testPackage.id, currentYear);

      expect(result.success).toBe(true);
      expect(result.history).toBeDefined();
      expect(result.history!.length).toBe(2);
      
      // Should be sorted by date descending
      expect(result.history![0].priceDisplay).toBe(25.99);
      expect(result.history![1].priceDisplay).toBe(20.99);
    });

    it('should return municipality-specific price history', async () => {
      const currentYear = new Date().getFullYear();
      const result = await getPackagePriceHistory(testPackage.id, currentYear, testMunicipality.id);

      expect(result.success).toBe(true);
      expect(result.history).toBeDefined();
      expect(result.history!.length).toBe(2);
      expect(result.history![0].priceDisplay).toBe(35.99);
      expect(result.history![0].municipality?.municipality_name).toBe('Test City');
    });

    it('should return empty history for future year', async () => {
      const futureYear = new Date().getFullYear() + 1;
      const result = await getPackagePriceHistory(testPackage.id, futureYear);

      expect(result.success).toBe(true);
      expect(result.history).toBeDefined();
      expect(result.history!.length).toBe(0);
    });

    it('should return error for non-existent package', async () => {
      const currentYear = new Date().getFullYear();
      const result = await getPackagePriceHistory(99999, currentYear);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Package with ID 99999 not found');
    });

    it('should return error for non-existent municipality', async () => {
      const currentYear = new Date().getFullYear();
      const result = await getPackagePriceHistory(testPackage.id, currentYear, 99999);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Municipality with ID 99999 not found');
    });
  });
});
