import { Request, Response, NextFunction } from 'express';
import { logInfo } from '../utils/logger';

/**
 * Request logging middleware
 * Logs all incoming HTTP requests with native console logging
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const { method, url, ip } = req;
  
  logInfo('REQUEST', `${method} ${url} from ${ip}`);
  
  const originalEnd = res.end.bind(res);
  res.end = function(chunk?: any, encoding?: any, cb?: any) {
    const duration = Date.now() - startTime;
    logInfo('RESPONSE', `${method} ${url} - ${res.statusCode} (${duration}ms)`);
    
    return originalEnd(chunk, encoding, cb);
  };
  
  next();
};
