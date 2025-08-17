import { useState, useEffect, useCallback, useRef } from 'react';
import { UniversalStorage, OfflineQueue, HookEvents } from '../core/universal-hook';
import type { HookConfig } from '../core/universal-hook';

// Universal state hook that works everywhere
export function useUniversalState<T>(
  key: string,
  initialValue: T,
  config: HookConfig = {}
) {
  const [value, setValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(config.persist || false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  // Load persisted value on mount
  useEffect(() => {
    if (!config.persist) return;

    const loadValue = async () => {
      try {
        const stored = await UniversalStorage.get<T>(key);
        if (stored !== null && mounted.current) {
          setValue(stored);
        }
      } catch (err) {
        setError(`Failed to load ${key}: ${err}`);
      } finally {
        setLoading(false);
      }
    };

    loadValue();
  }, [key, config.persist]);

  // Persist value changes
  const setPersistedValue = useCallback(async (newValue: T | ((prev: T) => T)) => {
    const finalValue = typeof newValue === 'function' 
      ? (newValue as (prev: T) => T)(value) 
      : newValue;

    setValue(finalValue);

    if (config.persist) {
      try {
        if (navigator.onLine || !config.offline) {
          await UniversalStorage.set(key, finalValue);
        } else {
          // Queue for when back online
          OfflineQueue.add(() => UniversalStorage.set(key, finalValue));
        }
      } catch (err) {
        setError(`Failed to persist ${key}: ${err}`);
      }
    }

    // Emit change event for other hooks
    HookEvents.emit(`state:${key}`, finalValue);
  }, [key, value, config.persist, config.offline]);

  // Subscribe to changes from other hooks
  useEffect(() => {
    if (!config.realtime) return;

    return HookEvents.on(`state:${key}`, (newValue: T) => {
      if (mounted.current) {
        setValue(newValue);
      }
    });
  }, [key, config.realtime]);

  // Cleanup
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  return {
    value,
    setValue: setPersistedValue,
    loading,
    error,
    reset: () => setPersistedValue(initialValue)
  };
}

// Universal API hook
export function useUniversalAPI<T>(
  endpoint: string,
  config: HookConfig & {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    params?: Record<string, any>;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheKey = `api:${endpoint}:${JSON.stringify(config.params)}`;

  const execute = useCallback(async (overrideConfig?: Partial<typeof config>) => {
    const finalConfig = { ...config, ...overrideConfig };
    setLoading(true);
    setError(null);

    try {
      // Check cache first
      if (finalConfig.cache) {
        const cached = await UniversalStorage.get<{ data: T; timestamp: number }>(cacheKey);
        const cacheAge = typeof finalConfig.cache === 'number' ? finalConfig.cache : 5 * 60 * 1000; // 5 min default
        
        if (cached && Date.now() - cached.timestamp < cacheAge) {
          setData(cached.data);
          setLoading(false);
          return cached.data;
        }
      }

      // Build URL with params
      const url = new URL(endpoint, window.location.origin);
      if (finalConfig.params) {
        Object.entries(finalConfig.params).forEach(([key, value]) => {
          url.searchParams.append(key, String(value));
        });
      }

      const fetchOptions: RequestInit = {
        method: finalConfig.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (finalConfig.body) {
        fetchOptions.body = JSON.stringify(finalConfig.body);
      }

      const response = await fetch(url.toString(), fetchOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);

      // Cache the result
      if (finalConfig.cache) {
        await UniversalStorage.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }

      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);

      // Handle offline scenarios
      if (finalConfig.offline && !navigator.onLine) {
        // Try to get cached data
        const cached = await UniversalStorage.get<{ data: T; timestamp: number }>(cacheKey);
        if (cached) {
          setData(cached.data);
          return cached.data;
        }

        // Queue for retry when online
        OfflineQueue.add(() => execute(overrideConfig));
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, config, cacheKey]);

  return {
    data,
    loading,
    error,
    execute,
    reset: () => {
      setData(null);
      setError(null);
    }
  };
}

// Universal form hook
export function useUniversalForm<T extends Record<string, any>>(
  initialValues: T,
  config: HookConfig & {
    validate?: (values: T) => Record<string, string>;
    onSubmit?: (values: T) => Promise<any>;
  } = {}
) {
  const { value: values, setValue: setValues, loading: persistLoading } = useUniversalState(
    `form:${JSON.stringify(initialValues)}`,
    initialValues,
    { persist: config.persist }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [setValues, errors]);

  const validate = useCallback(() => {
    if (!config.validate) return true;
    
    const newErrors = config.validate(values);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [config.validate, values]);

  const submit = useCallback(async () => {
    if (!validate() || !config.onSubmit) return;

    setSubmitting(true);
    try {
      await config.onSubmit(values);
      
      // Clear form if successful and not persisted
      if (!config.persist) {
        setValues(initialValues);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Submit failed';
      setErrors({ submit: errorMessage });
    } finally {
      setSubmitting(false);
    }
  }, [validate, config.onSubmit, values, config.persist, setValues, initialValues]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [setValues, initialValues]);

  return {
    values,
    setValue,
    errors,
    submitting: submitting || persistLoading,
    validate,
    submit,
    reset
  };
}

// Component registry hook with universal caching
export function useComponentRegistry(config: HookConfig = {}) {
  return useUniversalAPI('/api/component-registry', {
    cache: 10 * 60 * 1000, // 10 minutes
    offline: true,
    ...config
  });
}

// OpenCode integration hook
export function useOpenCode(config: HookConfig = {}) {
  const [session, setSession] = useUniversalState('opencode-session', null, {
    persist: true,
    ...config
  });

  const analyze = useUniversalAPI('/api/opencode-simple', {
    method: 'POST',
    offline: true,
    ...config
  });

  const deploy = useUniversalAPI('/api/deploy-staging', {
    method: 'POST',
    ...config
  });

  return {
    session,
    setSession,
    analyze: analyze.execute,
    deploy: deploy.execute,
    loading: analyze.loading || deploy.loading,
    error: analyze.error || deploy.error
  };
}

export {
  UniversalStorage,
  OfflineQueue,
  HookEvents
};