import { describe, it, expect, vi } from 'vitest';
import { useResponsive, breakpoints } from '../../src/utils/responsive.js';
import { renderHook } from '@testing-library/react';

vi.mock('react-responsive', () => ({
  useMediaQuery: vi.fn()
}));

describe('Responsive Utils', () => {
  it('moet correcte breakpoints exporteren', () => {
    expect(breakpoints).toEqual({
      mobile: '320px',
      tablet: '768px',
      desktop: '1024px'
    });
  });

  it('moet mobile device detecteren', () => {
    const { result } = renderHook(() => useResponsive());
    
    expect(result.current.deviceType).toBe('mobile');
    expect(result.current.isMobile).toBe(true);
  });
}); 