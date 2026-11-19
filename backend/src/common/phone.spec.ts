import { normalizeRwandaPhone } from './phone.js';

describe('normalizeRwandaPhone', () => {
  it.each([
    ['0788123456', '+250788123456'],
    ['788123456', '+250788123456'],
    ['+250 788 123 456', '+250788123456'],
    ['0738123456', '+250738123456'],
  ])('normalizes %s', (input, expected) => {
    expect(normalizeRwandaPhone(input)).toBe(expected);
  });

  it.each(['12345', '0688123456', '+254712345678'])('rejects %s', (input) => {
    expect(normalizeRwandaPhone(input)).toBeNull();
  });
});
