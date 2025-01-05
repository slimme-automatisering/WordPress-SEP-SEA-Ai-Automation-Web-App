import { describe, it, expect } from "vitest";
import { cache } from "../../src/config/redis.js";

describe("Redis Load Tests", () => {
  it("moet grote hoeveelheden data kunnen verwerken", async () => {
    const testData = Array.from({ length: 1000 }, (_, i) => ({
      key: `test:${i}`,
      value: `value:${i}`,
    }));

    // Test bulk writes
    const writePromises = testData.map(({ key, value }) =>
      cache.set(key, value, 60),
    );
    await Promise.all(writePromises);

    // Test bulk reads
    const readPromises = testData.map(({ key }) => cache.get(key));
    const results = await Promise.all(readPromises);

    // Verify results
    results.forEach((value, i) => {
      expect(value).toBe(`value:${i}`);
    });
  });

  it("moet hoge concurrency aankunnen", async () => {
    const concurrentOperations = 100;
    const key = "concurrent:test";

    // Test concurrent increments
    const incrementPromises = Array.from({ length: concurrentOperations }, () =>
      cache.increment(key),
    );
    await Promise.all(incrementPromises);

    const finalValue = await cache.get(key);
    expect(parseInt(finalValue)).toBe(concurrentOperations);
  });
});
