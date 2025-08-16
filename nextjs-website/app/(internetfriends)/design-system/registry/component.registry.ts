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
    description: 'React Flow based component dependency visualization',
    filePath: 'components/molecular/design-system-graph/design-system-graph.molecular.tsx',
    dependencies: ['@xyflow/react', '@/lib/design-system'],
    props: ['components', 'onNodeClick', 'className'],
    examples: ['default', 'filtered'],
  },
];

export const utilityComponents: ComponentRegistryEntry[] = [
  {
    id: 'cn-utility',
    name: 'cn',
    category: 'utility',
    description: 'Utility function for merging CSS classes with clsx and tailwind-merge',
    filePath: 'lib/utils.ts',
    dependencies: ['clsx', 'tailwind-merge'],
    props: [],
    examples: ['merge-classes'],
  },
  {
    id: 'stamp-utility',
    name: 'generateStamp',
    category: 'utility', 
    description: 'Generate timestamp stamps for consistent dating',
    filePath: 'lib/utils/stamp.ts',
    dependencies: [],
    props: [],
    examples: ['timestamp'],
  },
];

export const pageComponents: ComponentRegistryEntry[] = [
  {
    id: 'design-system-page',
    name: 'DesignSystemPage',
    category: 'page',
    description: 'Main design system exploration and documentation page',
    filePath: 'app/(internetfriends)/design-system/page.tsx',
    dependencies: ['@/components/molecular', '@/lib/design-system'],
    props: [],
    examples: ['default'],
  },
  {
    id: 'orchestrator-page',
    name: 'OrchestratorPage', 
    category: 'page',
    description: 'Project orchestration and monitoring dashboard',
    filePath: 'app/(internetfriends)/orchestrator/page.tsx',
    dependencies: ['@xyflow/react', '@/components/organisms'],
    props: [],
    examples: ['default'],
  },
];

export const getAllComponents = (): ComponentRegistryEntry[] => {
  return [...atomicComponents, ...molecularComponents, ...utilityComponents, ...pageComponents];
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
    type: component.category === 'utility' ? 'utility' : component.category === 'page' ? 'page' : 'component',
    position: { x: (index % 3) * 300, y: Math.floor(index / 3) * 200 },
    data: {
      label: component.name,
      category: component.category,
      description: component.description,
    },
  }));
};

export const generateFlowEdges = () => {
  const edges: Array<{ id: string; source: string; target: string; type?: string }> = [];
  
  molecularComponents.forEach(molecular => {
    atomicComponents.forEach(atomic => {
      if (molecular.dependencies.some(dep => dep.includes('atomic'))) {
        edges.push({
          id: `${atomic.id}-${molecular.id}`,
          source: atomic.id,
          target: molecular.id,
          type: 'default',
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
    utility: utilityComponents.length,
    organism: 0,
    template: 0,
    page: pageComponents.length,
    stable: components.filter(c => !c.description.includes('experimental')).length,
  };
};

export const componentRegistry = {
  atomic: atomicComponents,
  molecular: molecularComponents,
  utility: utilityComponents,
  organism: [],
  template: [],
  page: pageComponents,
  getAllComponents,
  getComponent: getComponentById, // Add alias for test compatibility
  getComponentById,
  getComponentsByCategory,
  searchComponents,
  generateFlowNodes,
  generateFlowEdges,
  getComponentStats,
};