import { 
  Model, 
  DataTypes, 
  InferAttributes, 
  InferCreationAttributes, 
  CreationOptional 
} from 'sequelize';
import { sequelize } from '../config/database';

/**
 * Municipality model
 */
export class Municipality extends Model<
InferAttributes<Municipality>, 
InferCreationAttributes<Municipality>
> {
  declare id: CreationOptional<number>;
  declare municipality_name: string;
  declare municipality_code: string;
  declare state_province: string;
  declare country: string;
  declare is_active: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Municipality.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  municipality_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  municipality_code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  state_province: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING,
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
  modelName: 'Municipality',
  tableName: 'municipalities',
  indexes: [
    {
      fields: ['id', 'is_active'],
      name: 'municipality_id_active_idx'
    },
    {
      fields: ['is_active'],
      name: 'municipality_active_idx'
    }
  ]
});
