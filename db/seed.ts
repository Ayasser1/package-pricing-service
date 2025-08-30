import {Package} from '../models/package';
import {Price} from '../models/price';

export const seedDb = async () => {
	await Package.destroy({truncate: true});

	await Package.bulkCreate([
		{name: 'basic', priceCents: 20_000},
		{name: 'plus', priceCents: 59_900},
		{name: 'premium', priceCents: 111_100},
	], {validate: true});

	const basic = await Package.findOne({where: {name: 'basic'}}) as Package;
	const plus = await Package.findOne({where: {name: 'plus'}}) as Package;
	const premium = await Package.findOne({where: {name: 'premium'}}) as Package;

	await Price.bulkCreate([
		{priceCents: 5000, packageId: basic.id},
		{priceCents: 10_000, packageId: basic.id},
	], {validate: true});

	await Price.bulkCreate([
		{priceCents: 19_990, packageId: plus.id},
		{priceCents: 29_900, packageId: plus.id},
		{priceCents: 39_900, packageId: plus.id},
	], {validate: true});

	await Price.bulkCreate([
		{priceCents: 55_000, packageId: premium.id},
		{priceCents: 66_600, packageId: premium.id},
		{priceCents: 77_700, packageId: premium.id},
		{priceCents: 88_800, packageId: premium.id},
	], {validate: true});
};
