declare module 'express-timeout-handler' {
  import { RequestHandler } from 'express';

  interface TimeoutOptions {
    timeout?: number;
    onTimeout?: (req: any, res: any, next: any) => void;
    disable?: string[];
    onDelayedResponse?: (req: any, res: any, next: any) => void;
  }

  function timeout(options?: TimeoutOptions): RequestHandler;
  export = timeout;
} 