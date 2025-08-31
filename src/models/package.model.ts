import { 
  Model, 
  DataTypes, 
  InferAttributes, 
  InferCreationAttributes, 
  CreationOptional,
  ForeignKey,
  Association
} from 'sequelize';
import { sequelize } from '../config/database';
import { Municipality } from './municipality.model';

/**
 * Package model
 */
export class Package extends Model<
InferAttributes<Package>, 
InferCreationAttributes<Package>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare description: CreationOptional<string>;
  declare package_code: string;
  declare duration_days: number;
  declare max_ads_count: number;
  declare is_active: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Associations
  declare static associations: {
    prices: Association<Package, any>;
  };
}

Package.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  package_code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  duration_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  max_ads_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'Package',
  tableName: 'packages',
  indexes: [
    {
      fields: ['id', 'is_active'],
      name: 'package_id_active_idx'
    },
    {
      fields: ['is_active'],
      name: 'package_active_idx'
    }
  ]
});
