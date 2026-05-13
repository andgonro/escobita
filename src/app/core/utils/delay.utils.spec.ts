import { delay } from './delay.utils';

// Covers: TR-2.3, AD-9

describe('delay', () => {
  it('resolves asynchronously after at least the requested duration', async () => {
    const requestedMs = 10;
    const start = Date.now();

    await delay(requestedMs);

    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(requestedMs);
  });
});
