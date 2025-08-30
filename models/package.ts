import {type Association, type CreationOptional, DataTypes, type InferAttributes, type InferCreationAttributes, Model, type NonAttribute} from 'sequelize';
import {sequelizeConnection} from '../db/config';
import {Price} from './price';

class Package extends Model<InferAttributes<Package>, InferCreationAttributes<Package>> {
	declare static associations: {
		prices: Association<Package, Price>;
	};

	declare id: CreationOptional<number>;
	declare name: string;
	declare priceCents: number;
	declare prices?: NonAttribute<Price[]>;
}

Package.init({
	id: {
		type: DataTypes.INTEGER.UNSIGNED,
		autoIncrement: true,
		primaryKey: true,
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},
	priceCents: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 0,
	},
}, {
	sequelize: sequelizeConnection,
});

Package.hasMany(Price, {
	sourceKey: 'id',
	foreignKey: 'packageId',
	as: 'prices',
});

export {Package};
