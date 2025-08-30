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
 * PriceHistory model
 * Maintains a complete log of all price changes for accounting purposes
 */
export class PriceHistory extends Model<
InferAttributes<PriceHistory>, 
InferCreationAttributes<PriceHistory>
> {
  declare id: CreationOptional<number>;
  declare packageId: ForeignKey<Package['id']>;
  declare municipalityId: CreationOptional<ForeignKey<Municipality['id']> | null>;
  declare priceCents: number;
  declare currency_code: CreationOptional<string>;
  declare createdAt: CreationOptional<Date>;
}

PriceHistory.init({
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
  currency_code: {
    type: DataTypes.STRING,
    defaultValue: 'SEK',
    validate: {
      len: [3, 3],
    },
  },
  createdAt: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'PriceHistory',
  tableName: 'price_histories',
  updatedAt: false, // History table doesn't need updatedAt
});

// Define associations
Package.hasMany(PriceHistory, {
  foreignKey: 'packageId',
  as: 'priceHistories',
});

PriceHistory.belongsTo(Package, {
  foreignKey: 'packageId',
  as: 'package',
});

Municipality.hasMany(PriceHistory, {
  foreignKey: 'municipalityId',
  as: 'priceHistories',
});

PriceHistory.belongsTo(Municipality, {
  foreignKey: 'municipalityId',
  as: 'municipality',
});
