import { 
  Model, 
  DataTypes, 
  InferAttributes, 
  InferCreationAttributes, 
  CreationOptional,
  ForeignKey
} from 'sequelize';
import { sequelize } from '../config/database';
import { Package } from './package.model';
import { Municipality } from './municipality.model';

/**
 * Price model
 * Represents current active prices for packages, with optional municipality-specific pricing
 */
export class Price extends Model<
InferAttributes<Price>, 
InferCreationAttributes<Price>
> {
  declare id: CreationOptional<number>;
  declare packageId: ForeignKey<Package['id']>;
  declare municipalityId: CreationOptional<ForeignKey<Municipality['id']> | null>;
  declare priceCents: number;
  declare is_active: CreationOptional<boolean>;
  declare currency_code: CreationOptional<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Price.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  packageId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Package,
      key: 'id',
    },
  },
  municipalityId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Municipality,
      key: 'id',
    },
  },
  priceCents: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  currency_code: {
    type: DataTypes.STRING,
    defaultValue: 'SEK',
    validate: {
      len: [3, 3],
    },
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'Price',
  tableName: 'prices',
  indexes: [
    {
      unique: true,
      fields: ['packageId', 'municipalityId', 'is_active'],
      where: {
        is_active: true,
      },
    },
  ],
});



// Define associations
Package.hasMany(Price, {
  foreignKey: 'packageId',
  as: 'prices',
});

Price.belongsTo(Package, {
  foreignKey: 'packageId',
  as: 'package',
});

Municipality.hasMany(Price, {
  foreignKey: 'municipalityId',
  as: 'prices',
});

Price.belongsTo(Municipality, {
  foreignKey: 'municipalityId',
  as: 'municipality',
});
