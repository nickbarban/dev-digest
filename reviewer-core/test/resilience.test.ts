import { describe, it, expect } from 'vitest';
import { withTimeout, TimeoutError } from '../src/llm/resilience.js';

describe('withTimeout', () => {
  it('resolves normally when the promise settles before the timeout', async () => {
    const p = new Promise((resolve) => setTimeout(() => resolve('ok'), 5));
    await expect(withTimeout(p, 200)).resolves.toBe('ok');
  });

  it('rejects with TimeoutError once ms elapses, even if the underlying promise never settles', async () => {
    const hung = new Promise(() => {}); // never resolves/rejects — simulates a stalled fetch
    await expect(withTimeout(hung, 20)).rejects.toThrow(TimeoutError);
  });

  it('passes through a rejection from the underlying promise before the timeout', async () => {
    const p = Promise.reject(new Error('boom'));
    await expect(withTimeout(p, 200)).rejects.toThrow('boom');
  });

  it('skips the race entirely when ms is 0 or negative', async () => {
    const p = Promise.resolve('immediate');
    await expect(withTimeout(p, 0)).resolves.toBe('immediate');
  });
});
