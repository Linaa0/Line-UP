import { isAllowedOrigin } from './app.setup.js';

describe('isAllowedOrigin', () => {
  const allowed = ['https://line-up.example'];

  it('always allows native apps (no Origin header)', () => {
    expect(isAllowedOrigin(undefined, allowed, true)).toBe(true);
  });

  it('allows configured origins in every environment', () => {
    expect(isAllowedOrigin('https://line-up.example', allowed, true)).toBe(true);
  });

  it('allows local Expo web ports in development', () => {
    expect(isAllowedOrigin('http://localhost:8081', allowed, false)).toBe(true);
    expect(isAllowedOrigin('http://192.168.1.20:8081', allowed, false)).toBe(true);
  });

  it('blocks local and unknown origins in production', () => {
    expect(isAllowedOrigin('http://localhost:8081', allowed, true)).toBe(false);
    expect(isAllowedOrigin('https://evil.example', allowed, false)).toBe(false);
  });
});
