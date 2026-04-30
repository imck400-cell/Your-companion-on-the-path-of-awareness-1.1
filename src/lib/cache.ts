const cache = new Map<string, { data: any, timestamp: number }>();

export const getCache = (key: string, maxAgeMs: number = 5 * 60 * 1000) => {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > maxAgeMs) {
    cache.delete(key);
    return null;
  }
  return item.data;
};

export const setCache = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

export const clearCache = (key: string) => {
  cache.delete(key);
};
