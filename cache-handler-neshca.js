const { IncrementalCache } = require("@neshca/cache-handler");
const createLruCache = require("@neshca/cache-handler/local-lru").default;
const createRedisCache = require("@neshca/cache-handler/redis-strings").default;
const { createClient } = require("redis");

const client = createClient({
  socket: { host: "127.0.0.1", port: 6379 },
});

client.on("error", (error) => {
  console.error("Redis error:", error);
});

IncrementalCache.onCreation(async () => {
  // read more about TTL limitations https://caching-tools.github.io/next-shared-cache/configuration/ttl
  const useTtl = false;

  await client.connect();

  const redisCache = await createRedisCache({
    client,
    useTtl,
    // timeout for the Redis client operations like `get` and `set`
    // afeter this timeout, the operation will be considered failed and the `localCache` will be used
    timeoutMs: 5000,
  });

  const localCache = createLruCache({
    useTtl,
  });

  return {
    cache: [redisCache, localCache],
    useFileSystem: !useTtl,
  };
});

module.exports = IncrementalCache;
