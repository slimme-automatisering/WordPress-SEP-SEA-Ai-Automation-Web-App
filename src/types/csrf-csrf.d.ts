declare module 'csrf-csrf' {
  import { RequestHandler } from 'express';

  interface DoubleCsrfOptions {
    getSecret: () => string;
    cookieName?: string;
    cookieOptions?: {
      secure?: boolean;
      sameSite?: boolean | 'lax' | 'strict' | 'none';
    };
    size?: number;
    ignoredMethods?: string[];
  }

  interface DoubleCsrfProtection {
    generateToken: (req: any, res: any) => string;
    doubleCsrfProtection: RequestHandler;
  }

  export function doubleCsrf(options: DoubleCsrfOptions): DoubleCsrfProtection;
}