// CSS Module declarations for InternetFriends
declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.module.scss" {
  const classes: { [key: string]: string };
  export default classes;
}

// Holographic CSS declarations
declare module "*/holographic-filters.css" {
  const classes: { [key: string]: string };
  export default classes;
}

// @xyflow/react module declaration for React Flow components
declare module "@xyflow/react" {
  export interface Node {
    id: string;
    position: { x: number; y: number };
    data: any;
    type?: string;
  }

  export interface Edge {
    id: string;
    source: string;
    target: string;
    type?: string;
  }

  export interface ReactFlowProps {
    nodes: Node[];
    edges: Edge[];
    onNodesChange?: (changes: any[]) => void;
    onEdgesChange?: (changes: any[]) => void;
    onConnect?: (connection: any) => void;
    fitView?: boolean;
    className?: string;
    children?: React.ReactNode;
  }

  export default function ReactFlow(props: ReactFlowProps): JSX.Element;
  export function ReactFlowProvider({ children }: { children: React.ReactNode }): JSX.Element;
  export const Handle: React.ComponentType<{
    type: "source" | "target";
    position: "top" | "right" | "bottom" | "left";
    id?: string;
  }>;
  export const Position: {
    Top: "top";
    Right: "right"; 
    Bottom: "bottom";
    Left: "left";
  };
}

// OpenCode integration module
declare module "@/scripts/opencode-visual-integration" {
  export function getOpenCodeIntegration(): any;
  export default function openCodeVisualIntegration(): any;
}

// Theme module extensions
declare module "next-themes" {
  export interface ThemeProviderProps {
    children: React.ReactNode;
    attribute?: string;
    defaultTheme?: string;
    enableSystem?: boolean;
    disableTransitionOnChange?: boolean;
  }
  export function ThemeProvider(props: ThemeProviderProps): JSX.Element;
  export function useTheme(): {
    theme: string | undefined;
    setTheme: (theme: string) => void;
    systemTheme: string | undefined;
  };
}

// WebGL and canvas context extensions
declare global {
  interface HTMLCanvasElement {
    getContext(contextId: "webgl2"): WebGL2RenderingContext | null;
    getContext(contextId: "webgl" | "experimental-webgl"): WebGLRenderingContext | null;
  }
}

// Browser API extensions for Friends network features
declare global {
  interface Navigator {
    bluetooth?: {
      requestDevice(options?: any): Promise<any>;
      getAvailability(): Promise<boolean>;
    };
  }
  
  interface BluetoothDevice {
    id: string;
    name: string;
    gatt?: any;
  }
}

export {};