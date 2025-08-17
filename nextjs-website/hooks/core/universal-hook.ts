// Universal hooks architecture for frontend, backend, and offline
// Provides consistent API across all environments

export type HookEnvironment = 'client' | 'server' | 'offline';

// Base hook interface that works everywhere
export interface UniversalHook<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
  environment: HookEnvironment;
}

// Universal state management
export interface UniversalState<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  subscribe: (callback: (value: T) => void) => () => void;
  persist: boolean;
  offline: boolean;
}

// Hook configuration
export interface HookConfig {
  persist?: boolean; // Save to localStorage/database
  offline?: boolean; // Work offline with cache
  ssr?: boolean; // Server-side compatible
  realtime?: boolean; // Subscribe to updates
  cache?: boolean | number; // Cache duration in ms
}

// Universal hook factory
export function createUniversalHook<T>(
  name: string,
  config: HookConfig = {}
): UniversalHook<T> {
  const environment: HookEnvironment = 
    typeof window === 'undefined' ? 'server' :
    navigator.onLine === false ? 'offline' : 'client';

  return {
    data: null,
    loading: false,
    error: null,
    environment,
    
    async execute(...args: any[]) {
      // Universal execution logic
      throw new Error(`Hook ${name} execute not implemented`);
    },
    
    reset() {
      // Universal reset logic
    }
  };
}

// State persistence utility
export class UniversalStorage {
  static async get<T>(key: string): Promise<T | null> {
    if (typeof window !== 'undefined') {
      // Client-side localStorage
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } else if (typeof global !== 'undefined') {
      // Server-side storage (could be database, file, etc.)
      return null; // Implement server storage
    }
    return null;
  }

  static async set<T>(key: string, value: T): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    } else if (typeof global !== 'undefined') {
      // Implement server storage
    }
  }

  static async remove(key: string): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    } else if (typeof global !== 'undefined') {
      // Implement server storage removal
    }
  }
}

// Offline queue for failed operations
export class OfflineQueue {
  private static queue: Array<{
    id: string;
    operation: () => Promise<any>;
    retries: number;
    timestamp: number;
  }> = [];

  static add(operation: () => Promise<any>, id?: string) {
    this.queue.push({
      id: id || Date.now().toString(),
      operation,
      retries: 0,
      timestamp: Date.now()
    });
    this.persist();
  }

  static async processQueue() {
    if (!navigator.onLine) return;

    const failedOperations: typeof this.queue = [];

    for (const item of this.queue) {
      try {
        await item.operation();
      } catch (error) {
        if (item.retries < 3) {
          failedOperations.push({
            ...item,
            retries: item.retries + 1
          });
        }
      }
    }

    this.queue = failedOperations;
    this.persist();
  }

  private static persist() {
    UniversalStorage.set('offline-queue', this.queue);
  }

  static async restore() {
    const saved = await UniversalStorage.get<typeof this.queue>('offline-queue');
    if (saved) this.queue = saved;
  }
}

// Hook event system for cross-hook communication
export class HookEvents {
  private static listeners = new Map<string, Set<Function>>();

  static on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  static emit(event: string, data?: any) {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }
}

export { createUniversalHook as default };