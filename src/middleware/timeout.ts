import timeout from 'connect-timeout';
import { Request, Response, NextFunction } from 'express';

export const timeoutMiddleware = timeout('30s');

export const haltOnTimedout = (req: Request, res: Response, next: NextFunction) => {
  if (!req.timedout) next();
}; 