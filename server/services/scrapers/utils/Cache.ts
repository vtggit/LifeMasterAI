interface CacheEntry<T> {
  value: T;
  expiry: number;
}

export class Cache {
  private store: Map<string, CacheEntry<any>>;
  private defaultTTL: number; // milliseconds

  constructor(defaultTTL = 3600000) { // 1 hour default TTL
    this.store = new Map();
    this.defaultTTL = defaultTTL;
    this.startCleanupInterval();
  }

  set<T>(key: string, value: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.store.set(key, { value, expiry });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    
    if (!entry) {
      return null;
    }

    if (entry.expiry < Date.now()) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store.entries()) {
        if (entry.expiry < now) {
          this.store.delete(key);
        }
      }
    }, 300000); // Clean up every 5 minutes
  }
}