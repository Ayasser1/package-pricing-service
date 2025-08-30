import { sequelizeConnection } from '../db/config'
import {Package} from '../models/package';
import { Price } from '../models/price';

export default {
  async getAll() {
    return await Package.findAll({
			include: [
				{model: Price, as: 'prices'},
			],
		});
  },
  async updatePackagePrice(pack: Package, newPriceCents: number) {
    try {
      const newPackage = await sequelizeConnection.transaction(async t => {
        await Price.create({
          packageId: pack.id,
          priceCents: pack.priceCents,
        }, { transaction: t });

        pack.priceCents = newPriceCents;

        return pack.save({ transaction: t });
      });

      return newPackage;
    } catch (err: unknown) {
      throw new Error('Error handling the transaction');
    }
  },
	async priceFor(municipality: string) {
    const foundPackage = await Package.findOne({ where: { name: municipality } });

    if (!foundPackage) {
      return null;
    }

		return foundPackage.priceCents;
	},
};
