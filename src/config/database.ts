import { Sequelize } from 'sequelize';

/**
 * Database configuration for the MediaNow pricing system
 * Uses SQLite for simplicity and development
 */
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './db/sqlite.db',
  logging: false,
  define: {
    timestamps: true,
    underscored: false,
  },
});

/**
 * Initialize database connection
 * @returns Promise that resolves when connection is established
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('[INFO] Database connection established successfully');
  } catch (error) {
    console.error('[ERROR] Unable to connect to database:', error);
    throw error;
  }
};

/**
 * Close database connection
 * @returns Promise that resolves when connection is closed
 */
export const closeDatabaseConnection = async (): Promise<void> => {
  try {
    await sequelize.close();
    console.log('[INFO] Database connection closed');
  } catch (error) {
    console.error('[ERROR] Error closing database connection:', error);
    throw error;
  }
};

export { sequelize };
