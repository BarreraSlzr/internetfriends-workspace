/**
 * Component Documentation Storage Service
 * Handles loading and caching of pre-generated component snapshots
 */

import { ComponentSnapshot, SnapshotDatabase } from './component-snapshot-generator';

export class ComponentStorageService {
  private cache: Map<string, ComponentSnapshot> = new Map();
  private databaseCache: SnapshotDatabase | null = null;
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  /**
   * Get all component snapshots
   */
  async getAllComponents(): Promise<any[]> {
    const database = await this.getDatabase();
    return database?.components || [];
  }

  /**
   * Get component snapshot by ID
   */
  async getComponent(id: string): Promise<ComponentSnapshot | null> {
    // Check memory cache first
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }

    try {
      // Try to load from API endpoint
      const response = await fetch(`/api/design-system/snapshots/${id}`);
      if (response.ok) {
        const snapshot = await response.json() as ComponentSnapshot;
        this.cache.set(id, snapshot);
        
        // Auto-expire cache
        setTimeout(() => this.cache.delete(id), this.cacheTimeout);
        
        return snapshot;
      }
    } catch (error) {
      console.warn(`Failed to load component ${id}:`, error);
    }

    return null;
  }

  /**
   * Get database index
   */
  async getDatabase(): Promise<SnapshotDatabase | null> {
    if (this.databaseCache) {
      return this.databaseCache;
    }

    try {
      const response = await fetch('/api/design-system/snapshots');
      if (response.ok) {
        this.databaseCache = await response.json() as SnapshotDatabase;
        
        // Auto-expire database cache
        setTimeout(() => { this.databaseCache = null; }, this.cacheTimeout);
        
        return this.databaseCache;
      }
    } catch (error) {
      console.warn('Failed to load component database:', error);
    }

    return null;
  }

  /**
   * Search components by query
   */
  async searchComponents(query: string): Promise<ComponentSnapshot[]> {
    const components = await this.getAllComponents();
    const lowerQuery = query.toLowerCase();
    
    return components.filter(component => 
      component.metadata.name.toLowerCase().includes(lowerQuery) ||
      component.metadata.description.toLowerCase().includes(lowerQuery) ||
      component.metadata.category.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get components by category
   */
  async getComponentsByCategory(category: 'atomic' | 'molecular' | 'organism'): Promise<ComponentSnapshot[]> {
    const components = await this.getAllComponents();
    return components.filter(component => component.metadata.category === category);
  }

  /**
   * Get component statistics
   */
  async getStatistics() {
    const database = await this.getDatabase();
    if (!database) return null;

    const components = database.components;
    const totalComponents = components.length;
    const passingTests = components.filter(c => c.metadata.testStatus === 'passing').length;
    const testCoverage = totalComponents > 0 ? Math.round((passingTests / totalComponents) * 100) : 0;

    const categoryStats = {
      atomic: components.filter(c => c.metadata.category === 'atomic').length,
      molecular: components.filter(c => c.metadata.category === 'molecular').length,
      organism: components.filter(c => c.metadata.category === 'organism').length
    };

    return {
      totalComponents,
      testCoverage,
      categoryStats,
      lastGenerated: database.lastGenerated,
      averageAnalysisTime: components.reduce((sum, c) => sum + c.performance.analysisTime, 0) / totalComponents
    };
  }

  /**
   * Force refresh cache
   */
  async refreshCache(): Promise<void> {
    this.cache.clear();
    this.databaseCache = null;
    await this.getDatabase(); // Reload
  }
}

// Singleton instance
export const componentStorage = new ComponentStorageService();