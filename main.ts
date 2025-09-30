import { startServer } from './src/app';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Start the server
startServer(PORT).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
