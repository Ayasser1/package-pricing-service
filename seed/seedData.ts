import { sequelize } from '../src/config/database';
import { Package } from '../src/models/package.model';
import { Municipality } from '../src/models/municipality.model';
import { updatePackagePrice } from '../src/services/price.service';
import { logInfo } from '../src/utils/logger';

/**
 * Seed script for MediaNow Package Pricing Service
 * Creates sample packages, municipalities, and pricing data
 */

async function seedDatabase() {
  try {
    logInfo('SEED', 'Starting database seed...');

    // Sync database (create tables if they don't exist)
    await sequelize.sync({ force: true });
    logInfo('SEED', 'Database synced successfully');

    // Create packages
    const basicPackage = await Package.create({
      name: 'Basic',
      description: 'Basic package with essential features',
      package_code: 'BASIC',
      duration_days: 15,
      max_ads_count: 10,
      is_active: true
    });

    const plusPackage = await Package.create({
      name: 'Plus',
      description: 'Plus package with enhanced features',
      package_code: 'PLUS',
      duration_days: 30,
      max_ads_count: 50,
      is_active: true
    });

    const premiumPackage = await Package.create({
      name: 'Premium',
      description: 'Premium package with all features',
      package_code: 'PREMIUM',
      duration_days: 60,
      max_ads_count: 100,
      is_active: true
    });

    logInfo('SEED', 'Created packages: Basic, Plus, Premium');

    // Create municipalities
    const stockholm = await Municipality.create({
      municipality_name: 'Stockholm',
      municipality_code: 'STH',
      state_province: 'Stockholm',
      country: 'Sweden',
      is_active: true
    });

    const goteborg = await Municipality.create({
      municipality_name: 'Göteborg',
      municipality_code: 'GOT',
      state_province: 'Västra Götaland',
      country: 'Sweden',
      is_active: true
    });

    const malmo = await Municipality.create({
      municipality_name: 'Malmö',
      municipality_code: 'MAL',
      state_province: 'Skåne',
      country: 'Sweden',
      is_active: true
    });

    logInfo('SEED', 'Created municipalities: Stockholm, Göteborg, Malmö');

    // Create base prices for packages
    await updatePackagePrice(basicPackage.id, 1999);
    await updatePackagePrice(plusPackage.id, 3999);
    await updatePackagePrice(premiumPackage.id, 5999);

    logInfo('SEED', 'Created base prices for all packages');

    // Create municipality-specific prices (Stockholm premium pricing)
    await updatePackagePrice(basicPackage.id, 2499, stockholm.id);
    await updatePackagePrice(plusPackage.id, 4999, stockholm.id);
    await updatePackagePrice(premiumPackage.id, 7999, stockholm.id);

    // Create municipality-specific prices (Malmö discounted pricing)
    await updatePackagePrice(basicPackage.id, 1799, malmo.id);
    await updatePackagePrice(plusPackage.id, 3499, malmo.id);
    await updatePackagePrice(premiumPackage.id, 5499, malmo.id);

    logInfo('SEED', 'Created municipality-specific prices for Stockholm and Malmö');

    // Create some price history by updating prices again
    await updatePackagePrice(premiumPackage.id, 6499);
    await updatePackagePrice(premiumPackage.id, 8499, stockholm.id);

    logInfo('SEED', 'Created additional price history entries');

    logInfo('SEED', 'Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedDatabase };
