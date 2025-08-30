import express from 'express';
import { initializeDatabase, sequelize } from './config/database';
import priceRoutes from './routes/price.routes';
import { requestLogger } from './middleware/logger';
import { logInfo, logError } from './utils/logger';

/**
 * Express application setup
 */

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Routes
app.use('/api/packages', priceRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'MediaNow Package Pricing Service'
  });
});

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const endpoint = `${req.method} ${req.path}`;
  logError(endpoint, `Unhandled error: ${error.message}`, error);
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  const endpoint = `${req.method} ${req.path}`;
  logInfo(endpoint, 'Route not found');
  
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `The endpoint ${req.method} ${req.path} does not exist`
  });
});

/**
 * Initialize database and start server
 */
const startServer = async (port: number = 3000): Promise<void> => {
  try {
    // Initialize database connection
    await initializeDatabase();
    
    // Sync database models (create tables if they don't exist)
    await sequelize.sync({ alter: true });
    logInfo('DATABASE', 'Database synchronized successfully');
    
    // Start server
    app.listen(port, () => {
      logInfo('SERVER', `MediaNow Pricing Service started on port ${port}`);
      logInfo('SERVER', `Health check available at http://localhost:${port}/health`);
    });
    
  } catch (error) {
    logError('SERVER', 'Failed to start server', error as Error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logInfo('SERVER', 'Received SIGTERM, shutting down gracefully');
  try {
    await sequelize.close();
    logInfo('SERVER', 'Database connection closed');
    process.exit(0);
  } catch (error) {
    logError('SERVER', 'Error during shutdown', error as Error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  logInfo('SERVER', 'Received SIGINT, shutting down gracefully');
  try {
    await sequelize.close();
    logInfo('SERVER', 'Database connection closed');
    process.exit(0);
  } catch (error) {
    logError('SERVER', 'Error during shutdown', error as Error);
    process.exit(1);
  }
});

export { app, startServer };
