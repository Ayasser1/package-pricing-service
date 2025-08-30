import {sequelizeConnection} from '../../db/config';
import {Package} from '../../models/package';
import PackageService from '../../services/package.service';
import PriceService from '../../services/price.service';

describe('PriceService', () => {
	// Set the db object to a variable which can be accessed throughout the whole test file
	const db = sequelizeConnection;

	// Before any tests run, clear the DB and run migrations with Sequelize sync()
	beforeEach(async () => {
		await db.sync({force: true});
	});

	afterAll(async () => {
		await db.close();
	});

  it('Returns the pricing history for the provided year and package', async () => {
    const basic = await Package.create({ name: 'basic', priceCents: 20_00 });

    const date = new Date();

    // These should NOT be included
    date.setFullYear(2019);
    await Promise.all([
      PackageService.updatePackagePrice(basic, 20_00, 'Göteborg', date),
      PackageService.updatePackagePrice(basic, 30_00, 'Stockholm', date),
    ])

    date.setFullYear(2020);
    await Promise.all([
      PackageService.updatePackagePrice(basic, 30_00, 'Göteborg', date),
      PackageService.updatePackagePrice(basic, 40_00, 'Stockholm', date),
      PackageService.updatePackagePrice(basic, 100_00, 'Stockholm', date),
    ])

    expect(await PriceService.getPriceHistory()).toBe({
      Göteborg: [30_00],
      Stockholm: [40_00, 100_00],
    });
  });

  it('Supports filtering on municipality', async () => {
    const basic = await Package.create({ name: 'basic', priceCents: 20_00 });

    const date = new Date();

    date.setFullYear(2020);
    await Promise.all([
      PackageService.updatePackagePrice(basic, 20_00, 'Göteborg', date),
      PackageService.updatePackagePrice(basic, 30_00, 'Stockholm', date),
      PackageService.updatePackagePrice(basic, 100_00, 'Stockholm', date),
    ]);

    // Add some assertions here!
  })
});
