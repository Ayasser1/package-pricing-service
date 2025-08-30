import { sequelize } from '../../src/config/database';
import { Package } from '../../src/models/package.model';
import { Municipality } from '../../src/models/municipality.model';
import { Price } from '../../src/models/price.model';
import { PriceHistory } from '../../src/models/priceHistory.model';

/**
 * Price model tests
 * Tests database CRUD operations and transaction handling
 */

describe('PriceModel', () => {
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

  describe('Price model CRUD operations', () => {
    it('should create price record without municipality', async () => {
      const price = await Price.create({
        packageId: testPackage.id,
        priceCents: 2999,
        is_active: true,
        currency_code: 'SEK'
      });

      expect(price.id).toBeDefined();
      expect(price.packageId).toBe(testPackage.id);
      expect(price.municipalityId).toBeUndefined();
      expect(price.priceCents).toBe(2999);
      expect(price.is_active).toBe(true);
      expect(price.currency_code).toBe('SEK');
    });

    it('should create price record with municipality', async () => {
      const price = await Price.create({
        packageId: testPackage.id,
        municipalityId: testMunicipality.id,
        priceCents: 3999,
        is_active: true,
        currency_code: 'SEK'
      });

      expect(price.municipalityId).toBe(testMunicipality.id);
      expect(price.priceCents).toBe(3999);
    });

    it('should update price record', async () => {
      const price = await Price.create({
        packageId: testPackage.id,
        priceCents: 2999,
        is_active: true,
        currency_code: 'SEK'
      });

      await price.update({ is_active: false });

      const updatedPrice = await Price.findByPk(price.id);
      expect(updatedPrice?.is_active).toBe(false);
    });

    it('should delete price record', async () => {
      const price = await Price.create({
        packageId: testPackage.id,
        priceCents: 2999,
        is_active: true,
        currency_code: 'SEK'
      });

      await price.destroy();

      const deletedPrice = await Price.findByPk(price.id);
      expect(deletedPrice).toBeNull();
    });

    it('should find price with package association', async () => {
      const price = await Price.create({
        packageId: testPackage.id,
        priceCents: 2999,
        is_active: true,
        currency_code: 'SEK'
      });

      const priceWithPackage = await Price.findByPk(price.id, {
        include: [{ model: Package, as: 'package' }]
      });

      expect(priceWithPackage).toBeDefined();
      expect((priceWithPackage as any).package.name).toBe('Premium');
    });

    it('should find price with municipality association', async () => {
      const price = await Price.create({
        packageId: testPackage.id,
        municipalityId: testMunicipality.id,
        priceCents: 3999,
        is_active: true,
        currency_code: 'SEK'
      });

      const priceWithMunicipality = await Price.findByPk(price.id, {
        include: [{ model: Municipality, as: 'municipality' }]
      });

      expect(priceWithMunicipality).toBeDefined();
      expect((priceWithMunicipality as any).municipality.municipality_name).toBe('Test City');
    });
  });

  describe('PriceHistory model CRUD operations', () => {
    it('should create price history record', async () => {
      const history = await PriceHistory.create({
        packageId: testPackage.id,
        priceCents: 2999,
        currency_code: 'SEK'
      });

      expect(history.id).toBeDefined();
      expect(history.packageId).toBe(testPackage.id);
      expect(history.municipalityId).toBeUndefined();
      expect(history.priceCents).toBe(2999);
      expect(history.currency_code).toBe('SEK');
      expect(history.createdAt).toBeDefined();
    });

    it('should create price history record with municipality', async () => {
      const history = await PriceHistory.create({
        packageId: testPackage.id,
        municipalityId: testMunicipality.id,
        priceCents: 3999,
        currency_code: 'SEK'
      });

      expect(history.municipalityId).toBe(testMunicipality.id);
    });

    it('should find multiple price history records ordered by date', async () => {
      // Create multiple history entries
      await PriceHistory.create({
        packageId: testPackage.id,
        priceCents: 1999,
        currency_code: 'SEK'
      });

      // Wait a bit to ensure different timestamps
      await new Promise<void>(resolve => {
        setTimeout(resolve, 10);
      });

      await PriceHistory.create({
        packageId: testPackage.id,
        priceCents: 2999,
        currency_code: 'SEK'
      });

      const histories = await PriceHistory.findAll({
        where: { packageId: testPackage.id },
        order: [['createdAt', 'DESC']]
      });

      expect(histories).toHaveLength(2);
      expect(histories[0].priceCents).toBe(2999); // Most recent first
      expect(histories[1].priceCents).toBe(1999);
    });
  });

  describe('Transaction handling', () => {
    it('should handle transaction rollback on error', async () => {
      const transaction = await sequelize.transaction();

      try {
        // Create price within transaction
        await Price.create({
          packageId: testPackage.id,
          priceCents: 2999,
          is_active: true,
          currency_code: 'SEK'
        }, { transaction });

        // Simulate error and rollback
        throw new Error('Simulated error');
      } catch {
        await transaction.rollback();
      }

      // Verify no price was created due to rollback
      const prices = await Price.findAll({
        where: { packageId: testPackage.id }
      });
      expect(prices).toHaveLength(0);
    });

    it('should handle transaction commit on success', async () => {
      const transaction = await sequelize.transaction();

      try {
        // Create price within transaction
        const price = await Price.create({
          packageId: testPackage.id,
          priceCents: 2999,
          is_active: true,
          currency_code: 'SEK'
        }, { transaction });

        // Create history within same transaction
        await PriceHistory.create({
          packageId: testPackage.id,
          priceCents: 2999,
          currency_code: 'SEK'
        }, { transaction });

        await transaction.commit();

        // Verify both records were created
        const prices = await Price.findAll({
          where: { packageId: testPackage.id }
        });
        const histories = await PriceHistory.findAll({
          where: { packageId: testPackage.id }
        });

        expect(prices).toHaveLength(1);
        expect(histories).toHaveLength(1);
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    });
  });

  describe('Data validation', () => {
    it('should enforce price cents minimum value', async () => {
      await expect(
        Price.create({
          packageId: testPackage.id,
          priceCents: -100,
          is_active: true,
          currency_code: 'SEK'
        })
      ).rejects.toThrow();
    });

    it('should enforce currency code length', async () => {
      await expect(
        Price.create({
          packageId: testPackage.id,
          priceCents: 2999,
          is_active: true,
          currency_code: 'INVALID_CURRENCY'
        })
      ).rejects.toThrow();
    });

    it('should enforce foreign key constraints', async () => {
      await expect(
        Price.create({
          packageId: 99999, // Non-existent package
          priceCents: 2999,
          is_active: true,
          currency_code: 'SEK'
        })
      ).rejects.toThrow();
    });
  });
});
