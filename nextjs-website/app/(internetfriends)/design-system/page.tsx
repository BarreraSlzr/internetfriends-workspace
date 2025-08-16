"use client";

import * as React from "react";
const { useState, useEffect } = React;
import { componentRegistry, ComponentRegistryEntry, PageRegistryEntry } from "@/lib/design-system/component-registry";
import { GlassCardAtomic } from "@/components/atomic/glass-card/glass-card.atomic";
import { ButtonAtomic } from "@/components/atomic/button/button.atomic";
import {
  Search,
  Filter,
  RefreshCw,
  BarChart3,
  Component,
  GitBranch,
  X,
  Globe,
  Code,
  Image,
  TrendingUp,
  Map,
  Grid3x3,
  Eye,
  FileCode,
  ExternalLink
} from "lucide-react";

type ViewMode = 'components' | 'pages' | 'sitemap' | 'usage';
type VisualizationMode = 'graph' | 'grid' | 'mirror';

export default function EnhancedDesignSystemPage() {
  // Registry data
  const [components, setComponents] = useState<ComponentRegistryEntry[]>([]);
  const [pages, setPages] = useState<PageRegistryEntry[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  
  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('components');
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>('graph');
  const [selectedItem, setSelectedItem] = useState<ComponentRegistryEntry | PageRegistryEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Load registry data
  useEffect(() => {
    loadRegistryData();
  }, []);

  const loadRegistryData = async () => {
    setIsLoading(true);
    try {
      const registryComponents = await componentRegistry.getAllComponents();
      const registryPages = await componentRegistry.getAllPages();
      const registryStats = await componentRegistry.getStatistics();
      
      setComponents(registryComponents);
      setPages(registryPages);
      setStatistics(registryStats);
    } catch (error) {
      console.error('Failed to load registry data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemSelect = (item: ComponentRegistryEntry | PageRegistryEntry) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const getFilteredData = () => {
    if (viewMode === 'pages') {
      if (!searchQuery && selectedCategory === 'all') return pages;
      
      return pages.filter(page => {
        const matchesSearch = !searchQuery || 
          page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          page.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCategory = selectedCategory === 'all' || page.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
      });
    } else {
      if (!searchQuery && selectedCategory === 'all') return components;
      
      return components.filter(component => {
        const matchesSearch = !searchQuery ||
          component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          component.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          component.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
      });
    }
  };

  const renderViewModeSelector = () => (
    <div className="flex items-center bg-gray-100 rounded-lg p-1 mb-4">
      <ButtonAtomic
        variant={viewMode === 'components' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => setViewMode('components')}
        className="flex items-center gap-2 text-xs"
      >
        <Component className="w-4 h-4" />
        Components
      </ButtonAtomic>
      <ButtonAtomic
        variant={viewMode === 'pages' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => setViewMode('pages')}
        className="flex items-center gap-2 text-xs"
      >
        <Globe className="w-4 h-4" />
        Pages
      </ButtonAtomic>
      <ButtonAtomic
        variant={viewMode === 'sitemap' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => setViewMode('sitemap')}
        className="flex items-center gap-2 text-xs"
      >
        <Map className="w-4 h-4" />
        Sitemap
      </ButtonAtomic>
      <ButtonAtomic
        variant={viewMode === 'usage' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => setViewMode('usage')}
        className="flex items-center gap-2 text-xs"
      >
        <TrendingUp className="w-4 h-4" />
        Usage
      </ButtonAtomic>
    </div>
  );

  const renderVisualizationSelector = () => (
    <div className="flex items-center bg-gray-100 rounded-lg p-1">
      <ButtonAtomic
        variant={visualizationMode === 'graph' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => setVisualizationMode('graph')}
        className="flex items-center gap-2 text-xs"
      >
        <GitBranch className="w-4 h-4" />
        Graph
      </ButtonAtomic>
      <ButtonAtomic
        variant={visualizationMode === 'grid' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => setVisualizationMode('grid')}
        className="flex items-center gap-2 text-xs"
      >
        <Grid3x3 className="w-4 h-4" />
        Grid
      </ButtonAtomic>
      <ButtonAtomic
        variant={visualizationMode === 'mirror' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => setVisualizationMode('mirror')}
        className="flex items-center gap-2 text-xs"
      >
        <Eye className="w-4 h-4" />
        Mirror
      </ButtonAtomic>
    </div>
  );

  const renderStatisticsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <GlassCardAtomic variant="default" className="p-6 text-center">
        <Component className="w-8 h-8 mx-auto mb-3 text-blue-500" />
        <div className="text-3xl font-bold text-gray-900">
          {statistics?.totalComponents || components.length}
        </div>
        <div className="text-sm text-gray-600">Components</div>
      </GlassCardAtomic>

      <GlassCardAtomic variant="default" className="p-6 text-center">
        <Globe className="w-8 h-8 mx-auto mb-3 text-green-500" />
        <div className="text-3xl font-bold text-gray-900">
          {statistics?.totalPages || pages.length}
        </div>
        <div className="text-sm text-gray-600">Pages</div>
      </GlassCardAtomic>

      <GlassCardAtomic variant="default" className="p-6 text-center">
        <TrendingUp className="w-8 h-8 mx-auto mb-3 text-purple-500" />
        <div className="text-3xl font-bold text-gray-900">
          {statistics?.reusabilityScore || 0}%
        </div>
        <div className="text-sm text-gray-600">Reusability</div>
      </GlassCardAtomic>

      <GlassCardAtomic variant="default" className="p-6 text-center">
        <BarChart3 className="w-8 h-8 mx-auto mb-3 text-orange-500" />
        <div className="text-3xl font-bold text-gray-900">
          {statistics?.averageComponentsPerPage?.toFixed(1) || 0}
        </div>
        <div className="text-sm text-gray-600">Avg per Page</div>
      </GlassCardAtomic>
    </div>
  );

  const renderComponentCard = (component: ComponentRegistryEntry) => (
    <GlassCardAtomic 
      key={component.id} 
      variant="default" 
      className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-blue-400 hover:border-dashed"
      onClick={() => handleItemSelect(component)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-sm text-gray-900 mb-1">
            {component.name}
          </h3>
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
            component.category === 'atomic' ? 'bg-blue-100 text-blue-700' :
            component.category === 'molecular' ? 'bg-green-100 text-green-700' :
            component.category === 'organism' ? 'bg-orange-100 text-orange-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {component.category}
          </span>
        </div>
        <div className={`w-3 h-3 rounded-full ${
          component.status === 'active' ? 'bg-green-500' :
          component.status === 'experimental' ? 'bg-yellow-500' :
          'bg-red-500'
        }`} />
      </div>
      
      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
        {component.description}
      </p>
      
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div className="text-gray-500">
          Usage: <span className="font-medium text-gray-700">{component.usageCount}</span>
        </div>
        <div className="text-gray-500">
          Pages: <span className="font-medium text-gray-700">{component.usedInPages.length}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <div className="flex flex-wrap gap-1">
          {component.tags.slice(0, 2).map(tag => (
            <span key={tag} className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {component.hasScreenshot && <Image className="w-3 h-3 text-gray-400" />}
          <Code className="w-3 h-3 text-gray-400" />
        </div>
      </div>
    </GlassCardAtomic>
  );

  const renderPageCard = (page: PageRegistryEntry) => (
    <GlassCardAtomic 
      key={page.id} 
      variant="default" 
      className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-green-400 hover:border-dashed"
      onClick={() => handleItemSelect(page)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-sm text-gray-900 mb-1">
            {page.name}
          </h3>
          <span className="text-xs text-gray-500 font-mono">
            {page.route}
          </span>
        </div>
        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
          page.category === 'marketing' ? 'bg-purple-100 text-purple-700' :
          page.category === 'app' ? 'bg-blue-100 text-blue-700' :
          page.category === 'admin' ? 'bg-red-100 text-red-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {page.category}
        </span>
      </div>
      
      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
        {page.description}
      </p>
      
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div className="text-gray-500">
          Components: <span className="font-medium text-gray-700">{page.componentCount}</span>
        </div>
        <div className="text-gray-500">
          Status: <span className={`font-medium ${
            page.status === 'active' ? 'text-green-700' :
            page.status === 'draft' ? 'text-yellow-700' :
            'text-red-700'
          }`}>
            {page.status}
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          {new Date(page.lastModified).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-1">
          {page.hasScreenshot && <Image className="w-3 h-3 text-gray-400" />}
          <FileCode className="w-3 h-3 text-gray-400" />
          <ExternalLink className="w-3 h-3 text-gray-400" />
        </div>
      </div>
    </GlassCardAtomic>
  );

  const renderContent = () => {
    const filteredData = getFilteredData();

    if (viewMode === 'sitemap' || visualizationMode === 'graph') {
      return (
        <div className="h-[calc(100vh-300px)]">
          {/* Enhanced React Flow graph would go here */}
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Map className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Interactive Sitemap View
              </h3>
              <p className="text-gray-500 mb-4">
                {viewMode === 'sitemap' 
                  ? 'Page relationships and navigation flow'
                  : 'Component dependency graph'
                }
              </p>
              <div className="text-sm text-gray-400">
                Enhanced visualization coming soon...
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (visualizationMode === 'mirror') {
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Project Mirror View
            </h3>
            <p className="text-gray-600">
              Live screenshots and component usage across all pages
            </p>
          </div>
          
          {/* Mirror layout would show screenshot thumbnails */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map(page => (
              <div key={page.id} className="space-y-2">
                <div className="aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <Image className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <div className="text-sm font-medium text-gray-600">{page.name}</div>
                    <div className="text-xs text-gray-500">{page.route}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {page.componentCount} components • {page.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Grid view
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {viewMode === 'pages' 
          ? (filteredData as PageRegistryEntry[]).map(renderPageCard)
          : (filteredData as ComponentRegistryEntry[]).map(renderComponentCard)
        }
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                InternetFriends Design System
              </h1>
              <p className="text-sm text-gray-600">
                Registry-based component and page visualization
              </p>
            </div>

            <div className="flex items-center gap-3">
              {renderVisualizationSelector()}
              
              <ButtonAtomic
                variant="outline"
                size="sm"
                onClick={loadRegistryData}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </ButtonAtomic>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics */}
        {renderStatisticsCards()}
        
        {/* View Mode Selector */}
        {renderViewModeSelector()}

        {/* Filters */}
        {(visualizationMode === 'grid' || visualizationMode === 'mirror') && (
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${viewMode}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-dashed"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-dashed appearance-none bg-white"
              >
                <option value="all">All Categories</option>
                {viewMode === 'pages' ? (
                  <>
                    <option value="marketing">Marketing</option>
                    <option value="app">App</option>
                    <option value="admin">Admin</option>
                    <option value="demo">Demo</option>
                  </>
                ) : (
                  <>
                    <option value="atomic">Atomic</option>
                    <option value="molecular">Molecular</option>
                    <option value="organism">Organism</option>
                    <option value="template">Template</option>
                    <option value="page">Page</option>
                  </>
                )}
              </select>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 mx-auto mb-4 text-blue-500 animate-spin" />
              <p className="text-gray-600">Loading registry data...</p>
            </div>
          </div>
        )}

        {/* Content */}
        {!isLoading && renderContent()}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {selectedItem.name}
                  </h2>
                  <p className="text-gray-600">{selectedItem.description}</p>
                </div>
                <ButtonAtomic
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedItem(null);
                  }}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Close
                </ButtonAtomic>
              </div>
              
              {/* Modal content would show detailed information */}
              <div className="space-y-4">
                {'usageCount' in selectedItem ? (
                  // Component details
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Component Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>Category: {selectedItem.category}</div>
                      <div>Status: {selectedItem.status}</div>
                      <div>Usage: {selectedItem.usageCount} times</div>
                      <div>Pages: {selectedItem.usedInPages.length}</div>
                    </div>
                  </div>
                ) : (
                  // Page details
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Page Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>Route: {'route' in selectedItem ? selectedItem.route : 'N/A'}</div>
                      <div>Category: {'category' in selectedItem ? selectedItem.category : 'N/A'}</div>
                      <div>Components: {'componentCount' in selectedItem ? selectedItem.componentCount : 'N/A'}</div>
                      <div>Status: {'status' in selectedItem ? selectedItem.status : 'N/A'}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}