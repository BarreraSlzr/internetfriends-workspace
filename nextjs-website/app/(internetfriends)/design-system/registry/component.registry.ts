import type { ComponentRegistryEntry } from '@/lib/design-system/component-registry';

export const atomicComponents: ComponentRegistryEntry[] = [
  {
    id: 'header-atomic',
    name: 'HeaderAtomic',
    category: 'atomic',
    description: 'Primary navigation header with glass morphism design',
    filePath: 'components/atomic/header/header.atomic.tsx',
    dependencies: ['@/lib/utils', 'lucide-react'],
    props: ['variant', 'className', 'children'],
    examples: ['default', 'compact'],
  },
  {
    id: 'glass-card-atomic',
    name: 'GlassCardAtomic',
    category: 'atomic',
    description: 'Glass morphism card component with backdrop blur',
    filePath: 'components/atomic/glass-card/glass-card.atomic.tsx',
    dependencies: ['@/lib/utils'],
    props: ['className', 'children', 'variant'],
    examples: ['default', 'elevated'],
  },
  {
    id: 'button-atomic',
    name: 'ButtonAtomic',
    category: 'atomic',
    description: 'Primary button component with InternetFriends styling',
    filePath: 'components/atomic/button/button.atomic.tsx',
    dependencies: ['@/lib/utils', 'class-variance-authority'],
    props: ['variant', 'size', 'disabled', 'children'],
    examples: ['primary', 'secondary', 'ghost'],
  },
];

export const molecularComponents: ComponentRegistryEntry[] = [
  {
    id: 'navigation-molecular',
    name: 'NavigationMolecular',
    category: 'molecular',
    description: 'Complete navigation system with mobile responsiveness',
    filePath: 'components/molecular/navigation/navigation.molecular.tsx',
    dependencies: ['@/components/atomic', '@/lib/utils'],
    props: ['items', 'activeItem', 'className'],
    examples: ['desktop', 'mobile'],
  },
  {
    id: 'design-system-graph-molecular',
    name: 'DesignSystemGraph',
    category: 'molecular',
    description: 'Interactive graph visualization of component relationships',
    filePath: 'components/molecular/design-system-graph/design-system-graph.molecular.tsx',
    dependencies: ['@xyflow/react', '@/lib/design-system'],
    props: ['components', 'onNodeSelect', 'className'],
    examples: ['default', 'compact'],
  },
];

export const getAllComponents = (): ComponentRegistryEntry[] => {
  return [
    ...atomicComponents,
    ...molecularComponents,
  ];
};

export const getComponentById = (id: string): ComponentRegistryEntry | undefined => {
  return getAllComponents().find(component => component.id === id);
};

export const getComponentsByCategory = (category: string): ComponentRegistryEntry[] => {
  return getAllComponents().filter(component => component.category === category);
};

export const searchComponents = (query: string): ComponentRegistryEntry[] => {
  const lowerQuery = query.toLowerCase();
  return getAllComponents().filter(component =>
    component.name.toLowerCase().includes(lowerQuery) ||
    component.description.toLowerCase().includes(lowerQuery)
  );
};

export const generateFlowNodes = () => {
  return getAllComponents().map((component, index) => ({
    id: component.id,
    type: 'component',
    position: { x: (index % 3) * 300, y: Math.floor(index / 3) * 200 },
    data: {
      label: component.name,
      category: component.category,
      description: component.description,
    },
  }));
};

export const generateFlowEdges = () => {
  const edges: Array<{ id: string; source: string; target: string }> = [];
  
  molecularComponents.forEach(molecular => {
    atomicComponents.forEach(atomic => {
      if (molecular.dependencies.some(dep => dep.includes('atomic'))) {
        edges.push({
          id: `${atomic.id}-${molecular.id}`,
          source: atomic.id,
          target: molecular.id,
        });
      }
    });
  });
  
  return edges;
};

export const getComponentStats = () => {
  const components = getAllComponents();
  return {
    total: components.length,
    atomic: atomicComponents.length,
    molecular: molecularComponents.length,
    organism: 0,
    template: 0,
    page: 0,
  };
};

export const componentRegistry = {
  atomic: atomicComponents,
  molecular: molecularComponents,
  organism: [],
  template: [],
  page: [],
  getAllComponents,
  getComponentById,
  getComponentsByCategory,
  searchComponents,
  generateFlowNodes,
  generateFlowEdges,
  getComponentStats,
};