const cacheStore = new Map();
const CACHE_PREFIX = 'mc:';

function cache(seconds = 300) {
  return (req, res, next) => {
    const key = CACHE_PREFIX + req.originalUrl;
    const cached = cacheStore.get(key);
    if (cached && Date.now() - cached.ts < seconds * 1000) {
      res.set(cached.headers);
      res.set('X-Cache', 'HIT');
      return res.status(cached.status).json(cached.body);
    }
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      cacheStore.set(key, { body, status: res.statusCode, headers: res.getHeaders(), ts: Date.now() });
      originalJson(body);
    };
    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', `public, max-age=${seconds}, s-maxage=${seconds}`);
    next();
  };
}

function noCache() {
  return (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
  };
}

function invalidateCache(pattern) {
  const search = CACHE_PREFIX + (pattern || '');
  for (const key of cacheStore.keys()) {
    if (key.startsWith(search)) cacheStore.delete(key);
  }
}

function clearCache() {
  cacheStore.clear();
}

function invalidateOnWrite(prefix) {
  return (req, res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) invalidateCache(prefix);
    next();
  };
}

module.exports = { cache, noCache, invalidateCache, clearCache, invalidateOnWrite };
