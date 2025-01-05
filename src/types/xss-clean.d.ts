declare module 'xss-clean' {
  import { RequestHandler } from 'express';
  
  function xssClean(): RequestHandler;
  export = xssClean;
}

declare module 'xss-clean/lib/xss' {
  export function clean(obj: any): any;
} 