declare module 'express-csp-header' {
  import { RequestHandler } from 'express';
  
  export const SELF: string;
  export const INLINE: string;
  export const NONE: string;
  
  export interface CSPDirectives {
    'default-src'?: string[];
    'script-src'?: string[];
    'style-src'?: string[];
    'img-src'?: string[];
    'font-src'?: string[];
    'object-src'?: string[];
    'block-all-mixed-content'?: boolean;
    [key: string]: string[] | boolean | undefined;
  }
  
  export interface CSPOptions {
    directives: CSPDirectives;
  }
  
  export function expressCspHeader(options: CSPOptions): RequestHandler;
} 