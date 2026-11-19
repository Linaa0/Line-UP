import { hashPassword, verifyPassword } from './password.js';

describe('password hashing', () => {
  it('verifies the right password and rejects a wrong one', async () => {
    const hash = await hashPassword('Kigali-2026!');
    expect(hash.startsWith('scrypt$')).toBe(true);
    await expect(verifyPassword('Kigali-2026!', hash)).resolves.toBe(true);
    await expect(verifyPassword('kigali-2026!', hash)).resolves.toBe(false);
  });

  it('salts every hash', async () => {
    expect(await hashPassword('same')).not.toBe(await hashPassword('same'));
  });
});
