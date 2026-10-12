import { describe, it } from 'node:test';
import assert from 'node:assert';
import { hashPassword, verifyPassword, newId } from '../server/db/store.ts';

describe('store crypto', () => {
  it('hashes and verifies password', () => {
    const { hash, salt } = hashPassword('test-password-12345');
    assert.ok(hash.length > 20);
    assert.ok(verifyPassword('test-password-12345', hash, salt));
    assert.ok(!verifyPassword('wrong', hash, salt));
  });
  it('generates ids', () => {
    const id = newId('x');
    assert.ok(id.startsWith('x_'));
  });
});
