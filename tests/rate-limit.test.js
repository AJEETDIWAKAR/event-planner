import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimiter } from '../js/rate-limit.js';

test('allows up to the limit then blocks with retry-after', () => {
  const t = 1000;
  const rl = createRateLimiter({ limit: 3, windowMs: 10_000, now: () => t });
  assert.equal(rl.check('a').allowed, true);
  assert.equal(rl.check('a').allowed, true);
  const third = rl.check('a');
  assert.equal(third.allowed, true);
  assert.equal(third.remaining, 0);
  const blocked = rl.check('a');
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.retryAfterSec, 10);
});

test('keys are independent and window resets', () => {
  let t = 0;
  const rl = createRateLimiter({ limit: 1, windowMs: 1000, now: () => t });
  assert.equal(rl.check('a').allowed, true);
  assert.equal(rl.check('a').allowed, false);
  assert.equal(rl.check('b').allowed, true);
  t = 1500;
  assert.equal(rl.check('a').allowed, true);
});

test('memory stays bounded', () => {
  const rl = createRateLimiter({ limit: 1, maxKeys: 3, now: () => 0 });
  for (let i = 0; i < 20; i++) {
    rl.check(`k${i}`);
  }
  assert.equal(rl.check('new').allowed, true);
});
