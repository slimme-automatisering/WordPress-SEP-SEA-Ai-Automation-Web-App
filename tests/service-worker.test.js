import { describe, it, expect } from 'vitest';
import * as serviceWorker from '../src/service-worker.js';

describe('Service Worker', () => {
  it('moet routes registreren voor API caching', () => {
    const routes = serviceWorker.getRegisteredRoutes();
    const apiRoute = routes.find(route => 
      route.handler instanceof NetworkFirst &&
      route.urlPattern.test('/api/test')
    );
    
    expect(apiRoute).toBeTruthy();
  });

  it('moet static assets cachen', () => {
    const routes = serviceWorker.getRegisteredRoutes();
    const staticRoute = routes.find(route => 
      route.handler instanceof CacheFirst &&
      route.urlPattern.test('/images/test.png')
    );
    
    expect(staticRoute).toBeTruthy();
  });
}); 