import { Node, Edge } from "reactflow";

export interface ComponentRegistryItem {
  id: string;
  name: string;
  category: "atomic" | "molecular" | "organism";
  description: string;
  filePath: string;
  props?: ComponentProp[];
  features?: string[];
  dependencies?: string[];
  composition?: string[];
  examples?: ComponentExample[];
  documentation?: string;
  status: "stable" | "beta" | "deprecated" | "planned";
  lastUpdated: Date;
}

export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: unknown;
  description: string;
}

export interface ComponentExample {
  name: string;
  code: string;
  description?: string;
}

export interface UtilityRegistryItem {
  id: string;
  name: string;
  category: "tokens" | "utilities" | "functions" | "constants";
  description: string;
  filePath: string;
  exports?: string[];
  functions?: UtilityFunction[];
  tokens?: DesignToken[];
  classes?: CSSClass[];
  status: "stable" | "beta" | "deprecated" | "planned";
  lastUpdated: Date;
}

export interface DesignToken {
  name: string;
  value: string;
  description: string;
  category: "color" | "spacing" | "typography" | "animation" | "shadow";
}

export interface CSSClass {
  name: string;
  description: string;
  properties?: string[];
}

export interface UtilityFunction {
  name: string;
  signature: string;
  description: string;
  parameters?: FunctionParameter[];
  returnType: string;
}

export interface FunctionParameter {
  name: string;
  type: string;
  description: string;
  optional?: boolean;
}

export interface HookRegistryItem {
  id: string;
  name: string;
  description: string;
  filePath: string;
  parameters?: FunctionParameter[];
  returns: string;
  usage: string;
  dependencies?: string[];
  status: "stable" | "beta" | "deprecated" | "planned";
  lastUpdated: Date;
}

export interface PageRegistryItem {
  id: string;
  name: string;
  route: string;
  description: string;
  filePath: string;
  layout?: string;
  components: string[];
  features: string[];
  seoTitle?: string;
  seoDescription?: string;
  status: "live" | "draft" | "archived";
  lastUpdated: Date;
}

export class ComponentRegistry {
  private components: Map<string, ComponentRegistryItem> = new Map();
  private utilities: Map<string, UtilityRegistryItem> = new Map();
  private hooks: Map<string, HookRegistryItem> = new Map();
  private pages: Map<string, PageRegistryItem> = new Map();

  constructor() {
    this.initializeRegistry();
  }

  private initializeRegistry() {
    // Initialize atomic components
    this.registerComponent({
      id: "header-atomic",
      name: "HeaderAtomic",
      category: "atomic",
      description:
        "Glass morphism header with scroll detection and responsive navigation",
      filePath: "/components/atomic/header/header.atomic.tsx",
      props: [
        {
          name: "sticky",
          type: "boolean",
          required: false,
          defaultValue: true,
          description:
            "Whether the header should stick to the top when scrolling",
        },
        {
          name: "transparent",
          type: "boolean",
          required: false,
          defaultValue: true,
          description: "Whether the header should be transparent",
        },
        {
          name: "className",
          type: "string",
          required: false,
          description: "Additional CSS classes",
        },
      ],
      features: [
        "Glass morphism styling",
        "Scroll detection",
        "Responsive design",
        "Backdrop blur effects",
        "InternetFriends design system integration",
      ],
      dependencies: ["@/lib/utils", "react"],
      status: "stable",
      lastUpdated: new Date(),
    });

    this.registerComponent({
      id: "glass-card-atomic",
      name: "GlassCardAtomic",
      category: "atomic",
      description:
        "Glass morphism card component with hover effects and compact border radius",
      filePath: "/components/atomic/glass-card/glass-card.atomic.tsx",
      props: [
        {
          name: "children",
          type: "React.ReactNode",
          required: true,
          description: "Card content",
        },
        {
          name: "variant",
          type: "header | card | overlay",
          required: false,
          defaultValue: "card",
          description: "Visual variant of the glass card",
        },
        {
          name: "className",
          type: "string",
          required: false,
          description: "Additional CSS classes",
        },
      ],
      features: [
        "Glass morphism effects",
        "Hover animations",
        "Compact border radius (12px max)",
        "Backdrop blur",
        "Multiple variants",
      ],
      dependencies: ["@/lib/utils", "react"],
      status: "stable",
      lastUpdated: new Date(),
    });

    this.registerComponent({
      id: "button-atomic",
      name: "ButtonAtomic",
      category: "atomic",
      description:
        "Versatile button component with InternetFriends design system styling",
      filePath: "/components/atomic/button/button.atomic.tsx",
      props: [
        {
          name: "variant",
          type: "primary | glass | outline | ghost",
          required: false,
          defaultValue: "primary",
          description: "Button style variant",
        },
        {
          name: "size",
          type: "sm | md | lg",
          required: false,
          defaultValue: "md",
          description: "Button size",
        },
        {
          name: "children",
          type: "React.ReactNode",
          required: true,
          description: "Button content",
        },
        {
          name: "disabled",
          type: "boolean",
          required: false,
          defaultValue: false,
          description: "Whether the button is disabled",
        },
        {
          name: "className",
          type: "string",
          required: false,
          description: "Additional CSS classes",
        },
      ],
      features: [
        "Multiple style variants",
        "Size variations",
        "Glass morphism variant",
        "Hover and focus states",
        "Accessibility support",
      ],
      dependencies: ["@/lib/utils", "react"],
      status: "stable",
      lastUpdated: new Date(),
    });

    // Initialize molecular components
    this.registerComponent({
      id: "navigation-molecular",
      name: "NavigationMolecular",
      category: "molecular",
      description:
        "Comprehensive navigation component with mobile support and dropdown menus",
      filePath: "/components/molecular/navigation/navigation.molecular.tsx",
      props: [
        {
          name: "items",
          type: "NavigationItem[]",
          required: true,
          description: "Navigation menu items",
        },
        {
          name: "logo",
          type: "NavigationLogo",
          required: false,
          description: "Logo configuration",
        },
        {
          name: "actions",
          type: "React.ReactNode",
          required: false,
          description: "Action buttons or elements",
        },
        {
          name: "variant",
          type: "transparent | solid",
          required: false,
          defaultValue: "transparent",
          description: "Navigation style variant",
        },
      ],
      features: [
        "Mobile responsive",
        "Dropdown menu support",
        "Glass morphism styling",
        "Logo display",
        "Action buttons",
        "Keyboard navigation",
        "Accessibility support",
      ],
      composition: ["HeaderAtomic", "ButtonAtomic"],
      status: "stable",
      lastUpdated: new Date(),
    });

    // Initialize utilities
    this.registerUtility({
      id: "design-tokens",
      name: "Design Tokens",
      category: "tokens",
      description:
        "InternetFriends design system tokens for colors, spacing, and animations",
      filePath: "/styles/design-tokens.css",
      tokens: [
        {
          name: "--if-primary",
          value: "#3b82f6",
          description: "Primary brand color",
          category: "color",
        },
        {
          name: "--glass-bg-header",
          value: "rgba(255, 255, 255, 0.85)",
          description: "Glass header background",
          category: "color",
        },
        {
          name: "--radius-lg",
          value: "0.75rem",
          description: "Large border radius (12px max)",
          category: "spacing",
        },
      ],
      status: "stable",
      lastUpdated: new Date(),
    });

    this.registerUtility({
      id: "css-utilities",
      name: "CSS Utilities",
      category: "utilities",
      description: "Utility classes for common styling patterns",
      filePath: "/styles/utilities.css",
      classes: [
        {
          name: "glass-header",
          description: "Glass morphism header styling",
          properties: [
            "backdrop-filter: blur(12px)",
            "background: var(--glass-bg-header)",
          ],
        },
        {
          name: "glass-card",
          description: "Glass morphism card styling",
          properties: [
            "backdrop-filter: blur(8px)",
            "border-radius: var(--radius-lg)",
          ],
        },
      ],
      status: "stable",
      lastUpdated: new Date(),
    });

    // Initialize hooks
    this.registerHook({
      id: "use-scroll-detection",
      name: "useScrollDetection",
      description: "Hook for detecting scroll position and direction",
      filePath: "/hooks/use-scroll-detection.ts",
      parameters: [
        {
          name: "threshold",
          type: "number",
          description: "Scroll threshold in pixels",
          optional: true,
        },
      ],
      returns:
        "{ scrollY: number, isScrolled: boolean, scrollDirection: 'up' | 'down' }",
      usage: "Header scroll state management and scroll-based animations",
      dependencies: ["react"],
      status: "stable",
      lastUpdated: new Date(),
    });

    // Initialize pages
    this.registerPage({
      id: "home-page",
      name: "Home Page",
      route: "/",
      description:
        "Main landing page showcasing InternetFriends services and design system",
      filePath: "/app/(internetfriends)/page.tsx",
      layout: "default",
      components: ["HeaderAtomic", "GlassCardAtomic", "ButtonAtomic"],
      features: [
        "Hero section with glass morphism",
        "Service cards with hover effects",
        "Responsive design",
        "SEO optimized",
      ],
      seoTitle: "InternetFriends | Creative Digital Solutions",
      seoDescription:
        "Professional web development and creative project services",
      status: "live",
      lastUpdated: new Date(),
    });
  }

  // Component methods
  registerComponent(component: ComponentRegistryItem): void {
    this.components.set(component.id, component);
  }

  getComponent(id: string): ComponentRegistryItem | undefined {
    return this.components.get(id);
  }

  getAllComponents(): ComponentRegistryItem[] {
    return Array.from(this.components.values());
  }

  getComponentsByCategory(
    category: "atomic" | "molecular" | "organism",
  ): ComponentRegistryItem[] {
    return this.getAllComponents().filter((comp) => comp.category === category);
  }

  // Utility methods
  registerUtility(utility: UtilityRegistryItem): void {
    this.utilities.set(utility.id, utility);
  }

  getUtility(id: string): UtilityRegistryItem | undefined {
    return this.utilities.get(id);
  }

  getAllUtilities(): UtilityRegistryItem[] {
    return Array.from(this.utilities.values());
  }

  // Hook methods
  registerHook(hook: HookRegistryItem): void {
    this.hooks.set(hook.id, hook);
  }

  getHook(id: string): HookRegistryItem | undefined {
    return this.hooks.get(id);
  }

  getAllHooks(): HookRegistryItem[] {
    return Array.from(this.hooks.values());
  }

  // Page methods
  registerPage(page: PageRegistryItem): void {
    this.pages.set(page.id, page);
  }

  getPage(id: string): PageRegistryItem | undefined {
    return this.pages.get(id);
  }

  getAllPages(): PageRegistryItem[] {
    return Array.from(this.pages.values());
  }

  // React Flow integration
  generateFlowNodes(): Node[] {
    const nodes: Node[] = [];

    // Add component nodes
    this.getAllComponents().forEach((component, index) => {
      nodes.push({
        id: component.id,
        type: "component",
        position: { x: index * 200, y: 100 },
        data: {
          label: component.name,
          description: component.description,
          category: component.category,
          status: component.status,
          props: component.props || [],
          features: component.features || [],
        },
      });
    });

    // Add utility nodes
    this.getAllUtilities().forEach((utility, index) => {
      nodes.push({
        id: utility.id,
        type: "utility",
        position: { x: index * 200, y: 250 },
        data: {
          label: utility.name,
          description: utility.description,
          category: utility.category,
          exports: utility.exports || [],
        },
      });
    });

    // Add page nodes
    this.getAllPages().forEach((page, index) => {
      nodes.push({
        id: page.id,
        type: "page",
        position: { x: index * 200, y: 400 },
        data: {
          label: page.name,
          description: page.description,
          route: page.route,
          components: page.components,
        },
      });
    });

    return nodes;
  }

  generateFlowEdges(): Edge[] {
    const edges: Edge[] = [];

    // Create composition edges (molecular -> atomic)
    this.getAllComponents().forEach((comp) => {
      if (comp.composition) {
        comp.composition.forEach((childName) => {
          const childId = this.findComponentByName(childName);
          if (childId) {
            edges.push({
              id: `${childId}-${comp.id}`,
              source: childId,
              target: comp.id,
              type: "smoothstep",
            });
          }
        });
      }
    });

    // Create dependency edges
    this.getAllComponents().forEach((comp) => {
      if (comp.dependencies) {
        comp.dependencies.forEach((dep) => {
          const utilityId = this.findUtilityByExport(dep);
          if (utilityId) {
            edges.push({
              id: `${utilityId}-${comp.id}`,
              source: utilityId,
              target: comp.id,
              type: "smoothstep",
              animated: true,
            });
          }
        });
      }
    });

    // Create page to component edges
    this.getAllPages().forEach((page) => {
      page.components.forEach((compName) => {
        const compId = this.findComponentByName(compName);
        if (compId) {
          edges.push({
            id: `${page.id}-${compId}`,
            source: page.id,
            target: compId,
            type: "smoothstep",
          });
        }
      });
    });

    return edges;
  }

  private findUtilityByExport(exportName: string): string | undefined {
    for (const [id, utility] of this.utilities) {
      if (
        utility.exports &&
        (utility.exports.includes(exportName) ||
          utility.functions?.some((f) => f.name === exportName))
      ) {
        return id;
      }
    }
    return undefined;
  }

  private findComponentByName(name: string): string | undefined {
    for (const [id, component] of this.components) {
      if (component.name === name) {
        return id;
      }
    }
    return undefined;
  }

  // Search functionality
  searchComponents(query: string): ComponentRegistryItem[] {
    if (!query.trim()) {
      return [];
    }

    const lowercaseQuery = query.toLowerCase();
    return this.getAllComponents().filter(
      (comp) =>
        comp.name.toLowerCase().includes(lowercaseQuery) ||
        comp.description.toLowerCase().includes(lowercaseQuery) ||
        comp.features?.some((feature) =>
          feature.toLowerCase().includes(lowercaseQuery),
        ),
    );
  }

  getComponentStats() {
    const components = this.getAllComponents();
    return {
      total: components.length,
      atomic: components.filter((c) => c.category === "atomic").length,
      molecular: components.filter((c) => c.category === "molecular").length,
      organism: components.filter((c) => c.category === "organism").length,
      stable: components.filter((c) => c.status === "stable").length,
      beta: components.filter((c) => c.status === "beta").length,
      planned: components.filter((c) => c.status === "planned").length,
    };
  }
}

// Singleton instance
export const componentRegistry = new ComponentRegistry();
