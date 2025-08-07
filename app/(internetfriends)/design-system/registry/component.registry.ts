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
  _code: string;
  description?: string;
}

export interface UtilityRegistryItem {
  id: string;
  name: string;
  category: "tokens" | "utilities" | "functions" | "constants";
  description: string;
  filePath: string;
  exports?: string[];
  tokens?: DesignToken[];
  classes?: CSSClass[];
  functions?: UtilityFunction[];
  features?: string[];
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
  _signature: string;
  description: string;
  parameters?: FunctionParameter[];
  _returnType: string;
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
  examples?: ComponentExample[];
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
  features?: string[];
  seoTitle?: string;
  seoDescription?: string;
  status: "live" | "development" | "planned" | "archived";
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
    // Initialize with existing components
    this.registerComponent({
      id: "header-atomic",
      name: "HeaderAtomic",
      category: "atomic",
      description: "Glass morphism header with scroll detection and responsive navigation",
      filePath: "/components/atomic/header/header.atomic.tsx",
      props: [
        {
          name: "sticky",
          type: "boolean",
          required: false,
          defaultValue: true,
          description: "Whether the header should stick to the top when scrolling",
        },
        {
          name: "transparent",
          type: "boolean",
          required: false,
          defaultValue: true,
          description: "Whether to use glass morphism transparency effect",
        },
        {
          name: "scrollThreshold",
          type: "number",
          required: false,
          defaultValue: 50,
          description: "Scroll threshold in pixels before header changes appearance",
        },
      ],
      features: [
        "Glass morphism effect",
        "Scroll state detection",
        "Responsive design",
        "Theme-aware styling",
        "Accessibility support",
      ],
      dependencies: ["@/lib/utils", "react"],
      status: "stable",
      lastUpdated: new Date(),
    });

    this.registerComponent({
      id: "glass-card-atomic",
      name: "GlassCardAtomic",
      category: "atomic",
      description: "Glass morphism card component with multiple variants and animation support",
      filePath: "/components/atomic/glass-card/glass-card.atomic.tsx",
      props: [
        {
          name: "variant",
          type: "'default' | 'elevated' | 'subtle' | 'primary' | 'destructive'",
          required: false,
          defaultValue: "default",
          description: "Visual variant of the card",
        },
        {
          name: "size",
          type: "'sm' | 'md' | 'lg' | 'xl'",
          required: false,
          defaultValue: "md",
          description: "Size variant affecting padding and border radius",
        },
        {
          name: "hover",
          type: "boolean",
          required: false,
          defaultValue: true,
          description: "Whether to show hover effects",
        },
        {
          name: "animated",
          type: "boolean",
          required: false,
          defaultValue: false,
          description: "Whether to apply floating animation",
        },
      ],
      features: [
        "Multiple visual variants",
        "Size variations",
        "Hover animations",
        "Glass morphism backdrop",
        "Configurable padding and borders",
      ],
      dependencies: ["@/lib/utils", "react"],
      status: "stable",
      lastUpdated: new Date(),
    });

    this.registerComponent({
      id: "button-atomic",
      name: "ButtonAtomic",
      category: "atomic",
      description: "InternetFriends styled button with multiple variants, loading states, and icon support",
      filePath: "/components/atomic/button/button.atomic.tsx",
      props: [
        {
          name: "variant",
          type: "'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'destructive' | 'link'",
          required: false,
          defaultValue: "primary",
          description: "Visual variant of the button",
        },
        {
          name: "size",
          type: "'sm' | 'md' | 'lg' | 'xl' | 'icon'",
          required: false,
          defaultValue: "md",
          description: "Size variant affecting padding and height",
        },
        {
          name: "loading",
          type: "boolean",
          required: false,
          defaultValue: false,
          description: "Whether button is in loading state",
        },
        {
          name: "fullWidth",
          type: "boolean",
          required: false,
          defaultValue: false,
          description: "Whether button should take full width",
        },
      ],
      features: [
        "Multiple variants with InternetFriends styling",
        "Loading states with spinner",
        "Icon support (left and right)",
        "Hover and active animations",
        "Accessibility compliance",
        "Radix Slot integration for asChild prop",
      ],
      dependencies: [
        "@radix-ui/react-slot",
        "class-variance-authority",
        "@/lib/utils",
        "react",
      ],
      status: "stable",
      lastUpdated: new Date(),
    });

    // Molecular Components
    this.registerComponent({
      id: "navigation-molecular",
      name: "NavigationMolecular",
      category: "molecular",
      description: "Complete navigation component with mobile menu, dropdowns, and glass morphism",
      filePath: "/components/molecular/navigation/navigation.molecular.tsx",
      props: [
        {
          name: "items",
          type: "NavigationItem[]",
          required: true,
          description: "Navigation items to display",
        },
        {
          name: "logo",
          type: "NavigationLogo",
          required: false,
          description: "Logo configuration",
        },
        {
          name: "variant",
          type: "'transparent' | 'solid' | 'glass'",
          required: false,
          defaultValue: "transparent",
          description: "Visual variant of the navigation",
        },
        {
          name: "mobileBreakpoint",
          type: "'sm' | 'md' | 'lg'",
          required: false,
          defaultValue: "lg",
          description: "Breakpoint for mobile menu toggle",
        },
      ],
      features: [
        "Mobile responsive with slide-out menu",
        "Dropdown navigation support",
        "Glass morphism styling",
        "Keyboard navigation",
        "Active state management",
        "External link support",
      ],
      dependencies: [
        "@/components/atomic/header",
        "@/components/atomic/button",
        "lucide-react",
        "next/link",
      ],
      composition: ["HeaderAtomic", "ButtonAtomic"],
      status: "stable",
      lastUpdated: new Date(),
    });

    // Initialize utilities
    this.registerUtility({
      id: "design-tokens",
      name: "InternetFriends Design Tokens",
      category: "tokens",
      description: "Complete design token system with glass morphism and compact radius values",
      filePath: "/app/(internetfriends)/globals.css",
      tokens: [
        {
          name: "--if-primary",
          value: "#3b82f6",
          description: "Primary brand color - InternetFriends blue",
          category: "color",
        },
        {
          name: "--glass-bg-header",
          value: "rgba(255, 255, 255, 0.85)",
          description: "Glass morphism background for headers",
          category: "color",
        },
        {
          name: "--radius-lg",
          value: "0.75rem",
          description: "Large border radius - maximum for backgrounds",
          category: "spacing",
        },
      ],
      features: [
        "Glass morphism system",
        "Compact border radius scale",
        "Coin of value color system",
        "Light/dark mode support",
      ],
      status: "stable",
      lastUpdated: new Date(),
    });

    this.registerUtility({
      id: "css-utilities",
      name: "CSS Utilities",
      category: "utilities",
      description: "Custom CSS utility classes for InternetFriends design system",
      filePath: "/app/(internetfriends)/globals.css",
      classes: [
        {
          name: ".glass-header",
          description: "Glass morphism header styling with backdrop blur",
          properties: [
            "backdrop-filter: blur(12px)",
            "border: 1px solid var(--glass-border)",
          ],
        },
        {
          name: ".focus-dashed",
          description: "Mermaid viewer inspired focus state with dashed border",
          properties: ["border: 2px dashed var(--color-border-focus)"],
        },
        {
          name: ".btn-if-primary",
          description: "Primary button styling with InternetFriends brand colors",
          properties: [
            "background: var(--if-primary)",
            "hover animations",
            "shadow effects",
          ],
        },
      ],
      features: [
        "Glass morphism effects",
        "Focus state management",
        "Animation utilities",
        "Responsive helpers",
      ],
      status: "stable",
      lastUpdated: new Date(),
    });

    // Initialize hooks
    this.registerHook({
      id: "use-scroll-detection",
      name: "useScrollDetection",
      description: "Custom hook for detecting scroll position and triggering state changes",
      filePath: "/hooks/useScrollDetection.ts",
      parameters: [
        {
          name: "threshold",
          type: "number",
          description: "Scroll threshold in pixels",
          optional: true,
        },
      ],
      returns: "{ _isScrolled: boolean, _scrollY: number }",
      usage: "Header scroll state management and scroll-based animations",
      dependencies: ["react"],
      status: "planned",
      lastUpdated: new Date(),
    });

    // Initialize pages
    this.registerPage({
      id: "home-page",
      name: "Home Page",
      route: "/",
      description: "Main landing page showcasing InternetFriends services and design system",
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
      seoDescription: "Professional web development and creative project services",
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

  // Flow generation methods
  generateFlowNodes(): Node[] {
    const nodes: Node[] = [];

    // Add component nodes
    this.getAllComponents().forEach((comp, index) => {
      nodes.push({
        id: comp.id,
        type: "component",
        position: {
          x: 100 + (index % 3) * 250,
          y: 200 + Math.floor(index / 3) * 200,
        },
        data: {
          label: comp.name,
          category: comp.category,
          description: comp.description,
          props: comp.props?.map((p) => p.name) || [],
          features: comp.features || [],
          composition: comp.composition || [],
        },
      });
    });

    // Add utility nodes
    this.getAllUtilities().forEach((util, index) => {
      nodes.push({
        id: util.id,
        type: "utility",
        position: { x: 700 + (index % 2) * 250, y: 200 + index * 150 },
        data: {
          label: util.name,
          category: util.category,
          description: util.description,
          tokens: util.tokens?.map((t) => t.name) || [],
          classes: util.classes?.map((c) => c.name) || [],
          features: util.features || [],
        },
      });
    });

    // Add hook nodes
    this.getAllHooks().forEach((hook, index) => {
      nodes.push({
        id: hook.id,
        type: "hook",
        position: { x: 100 + index * 200, y: 350 },
        data: {
          label: hook.name,
          description: hook.description,
          returns: hook.returns,
          usage: hook.usage,
          parameters: hook.parameters?.map((p) => `${p.name}: ${p.type}`) || [],
          dependencies: hook.dependencies || [],
        },
      });
    });

    // Add page nodes
    this.getAllPages().forEach((page, index) => {
      nodes.push({
        id: page.id,
        type: "page",
        position: { x: 400 + index * 300, y: 50 },
        data: {
          label: page.name,
          description: page.description,
          route: page.route,
          components: page.components,
          features: page.features || [],
          layout: page.layout,
        },
      });
    });

    return nodes;
  }

  generateFlowEdges(): Edge[] {
    const edges: Edge[] = [];

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

    // Create composition edges
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
        utility.exports?.includes(exportName) ||
        exportName.includes(utility.name.toLowerCase())
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

  // Search and filtering
  searchComponents(query: string): ComponentRegistryItem[] {
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
      _total: components.length,
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
export const _componentRegistry = new ComponentRegistry();
