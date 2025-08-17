import { useCallback, useEffect } from 'react';
import { useUniversalState, useUniversalAPI } from '../shared';
import type { HookConfig } from '../core/universal-hook';

// Design system specific hooks
function useDesignSystem(config: HookConfig = {}) {
  const components = useUniversalAPI('/api/component-registry', {
    cache: 5 * 60 * 1000, // 5 minutes
    offline: true,
    ...config
  });

  const statistics = useUniversalAPI('/api/design-system/stats', {
    cache: 10 * 60 * 1000, // 10 minutes
    offline: true,
    ...config
  });

  const search = useCallback(async (query: string, category?: string) => {
    return components.execute({
      params: { search: query, category }
    });
  }, [components.execute]);

  return {
    components: components.data,
    statistics: statistics.data,
    loading: components.loading || statistics.loading,
    error: components.error || statistics.error,
    search,
    refresh: () => {
      components.execute();
      statistics.execute();
    }
  };
}

// Visual analysis and screenshot hooks
function useVisualAnalysis(config: HookConfig = {}) {
  const { value: screenshots, setValue: setScreenshots } = useUniversalState(
    'visual-screenshots',
    [] as Array<{
      id: string;
      url: string;
      timestamp: number;
      component?: string;
      analysis?: any;
    }>,
    { persist: true, offline: true, ...config }
  );

  const captureScreenshot = useCallback(async (element?: HTMLElement) => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(element || document.body, {
        height: window.innerHeight,
        width: window.innerWidth,
        scrollX: 0,
        scrollY: 0,
      });
      
      const dataUrl = canvas.toDataURL('image/png');
      const screenshot = {
        id: Date.now().toString(),
        url: dataUrl,
        timestamp: Date.now(),
        component: element?.dataset?.component
      };

      setScreenshots(prev => [screenshot, ...prev.slice(0, 9)]); // Keep last 10
      return screenshot;
    } catch (error) {
      throw new Error(`Screenshot failed: ${error}`);
    }
  }, [setScreenshots]);

  const analyzeScreenshot = useUniversalAPI('/api/opencode-simple', {
    method: 'POST',
    offline: true,
    ...config
  });

  const analyze = useCallback(async (screenshotId: string) => {
    const screenshot = screenshots.find(s => s.id === screenshotId);
    if (!screenshot) throw new Error('Screenshot not found');

    const result = await analyzeScreenshot.execute({
      body: {
        screenshot: screenshot.url,
        task: 'analyze design system component and suggest improvements',
        includeCode: true
      }
    });

    // Update screenshot with analysis
    setScreenshots(prev => prev.map(s => 
      s.id === screenshotId 
        ? { ...s, analysis: result }
        : s
    ));

    return result;
  }, [screenshots, analyzeScreenshot.execute, setScreenshots]);

  return {
    screenshots,
    captureScreenshot,
    analyze,
    analyzing: analyzeScreenshot.loading,
    error: analyzeScreenshot.error,
    clearScreenshots: () => setScreenshots([])
  };
}

// Performance monitoring hooks
function usePerformance(config: HookConfig = {}) {
  const { value: metrics, setValue: setMetrics } = useUniversalState(
    'performance-metrics',
    {
      fcp: 0,
      lcp: 0,
      cls: 0,
      fid: 0,
      ttfb: 0
    },
    { persist: true, realtime: true, ...config }
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Observe Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        switch (entry.entryType) {
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
            }
            break;
          case 'largest-contentful-paint':
            setMetrics(prev => ({ ...prev, lcp: entry.startTime }));
            break;
          case 'layout-shift':
            setMetrics(prev => ({ ...prev, cls: prev.cls + (entry as any).value }));
            break;
          case 'first-input':
            setMetrics(prev => ({ ...prev, fid: (entry as any).processingStart - entry.startTime }));
            break;
          case 'navigation':
            setMetrics(prev => ({ ...prev, ttfb: (entry as any).responseStart }));
            break;
        }
      }
    });

    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift', 'first-input', 'navigation'] });

    return () => observer.disconnect();
  }, [setMetrics]);

  const getScore = useCallback((metric: keyof typeof metrics) => {
    const value = metrics[metric];
    switch (metric) {
      case 'fcp':
        return value < 1800 ? 'good' : value < 3000 ? 'needs-improvement' : 'poor';
      case 'lcp':
        return value < 2500 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor';
      case 'cls':
        return value < 0.1 ? 'good' : value < 0.25 ? 'needs-improvement' : 'poor';
      case 'fid':
        return value < 100 ? 'good' : value < 300 ? 'needs-improvement' : 'poor';
      case 'ttfb':
        return value < 800 ? 'good' : value < 1800 ? 'needs-improvement' : 'poor';
      default:
        return 'unknown';
    }
  }, [metrics]);

  return {
    metrics,
    getScore,
    overallScore: Object.values(metrics).every(v => getScore(v as any) === 'good') ? 'good' : 'needs-improvement'
  };
}

// Git and deployment hooks
function useDeployment(config: HookConfig = {}) {
  const { value: deployments, setValue: setDeployments } = useUniversalState(
    'deployment-history',
    [] as Array<{
      id: string;
      environment: string;
      status: 'pending' | 'success' | 'failed';
      url?: string;
      timestamp: number;
      error?: string;
    }>,
    { persist: true, ...config }
  );

  const deploy = useUniversalAPI('/api/deploy-staging', {
    method: 'POST',
    offline: false, // Deployments require network
    ...config
  });

  const deployToStaging = useCallback(async () => {
    const deploymentId = Date.now().toString();
    
    // Add pending deployment
    setDeployments(prev => [{
      id: deploymentId,
      environment: 'staging',
      status: 'pending',
      timestamp: Date.now()
    }, ...prev.slice(0, 9)]); // Keep last 10

    try {
      const result = await deploy.execute({
        body: { environment: 'staging' }
      });

      // Update with success
      setDeployments(prev => prev.map(d => 
        d.id === deploymentId 
          ? { ...d, status: 'success', url: result.url }
          : d
      ));

      return result;
    } catch (error) {
      // Update with failure
      setDeployments(prev => prev.map(d => 
        d.id === deploymentId 
          ? { ...d, status: 'failed', error: error instanceof Error ? error.message : 'Deploy failed' }
          : d
      ));
      throw error;
    }
  }, [deploy.execute, setDeployments]);

  return {
    deployments,
    deployToStaging,
    deploying: deploy.loading,
    error: deploy.error,
    lastDeployment: deployments[0]
  };
}

// Theme and preferences hooks
function useTheme(config: HookConfig = {}) {
  const { value: theme, setValue: setTheme } = useUniversalState(
    'user-theme',
    {
      mode: 'light' as 'light' | 'dark' | 'auto',
      primaryColor: '#3b82f6',
      glassEnabled: true,
      reducedMotion: false
    },
    { persist: true, realtime: true, ...config }
  );

  const toggleMode = useCallback(() => {
    setTheme(prev => ({
      ...prev,
      mode: prev.mode === 'light' ? 'dark' : prev.mode === 'dark' ? 'auto' : 'light'
    }));
  }, [setTheme]);

  const setColor = useCallback((color: string) => {
    setTheme(prev => ({ ...prev, primaryColor: color }));
  }, [setTheme]);

  const toggleGlass = useCallback(() => {
    setTheme(prev => ({ ...prev, glassEnabled: !prev.glassEnabled }));
  }, [setTheme]);

  // Apply theme to document
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.setAttribute('data-theme', theme.mode);
    root.style.setProperty('--color-primary', theme.primaryColor);
    root.style.setProperty('--glass-enabled', theme.glassEnabled ? '1' : '0');
    root.style.setProperty('--reduced-motion', theme.reducedMotion ? '1' : '0');
  }, [theme]);

  return {
    theme,
    setTheme,
    toggleMode,
    setColor,
    toggleGlass,
    isDark: theme.mode === 'dark' || (theme.mode === 'auto' && window.matchMedia?.('(prefers-color-scheme: dark)').matches)
  };
}

// OpenCode integration hook
function useOpenCode(config: HookConfig = {}) {
  const api = useUniversalAPI('/api/opencode-simple', {
    method: 'POST',
    offline: true,
    ...config
  });

  const analyze = useCallback(async (options: {
    screenshot?: string;
    task: string;
    includeCode?: boolean;
    context?: any;
  }) => {
    return await api.execute({
      body: options
    });
  }, [api.execute]);

  const deploy = useCallback(async (environment: string = 'staging') => {
    const deployApi = useUniversalAPI('/api/deploy-staging', {
      method: 'POST',
      offline: false,
      ...config
    });
    
    return await deployApi.execute({
      body: { environment }
    });
  }, [config]);

  return {
    analyze,
    deploy,
    loading: api.loading,
    error: api.error
  };
}

// Export all domain-specific hooks
export {
  useDesignSystem,
  useVisualAnalysis,
  usePerformance,
  useDeployment,
  useTheme,
  useOpenCode
};