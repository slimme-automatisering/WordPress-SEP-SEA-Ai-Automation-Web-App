declare module 'express-rate-limit' {
  import { RequestHandler } from 'express';
  
  interface Options {
    windowMs?: number;
    max?: number;
    message?: string;
    statusCode?: number;
    headers?: boolean;
    handler?: Function;
    standardHeaders?: boolean;
    legacyHeaders?: boolean;
  }
  
  function rateLimit(options?: Options): RequestHandler;
  
  export = rateLimit;
} 