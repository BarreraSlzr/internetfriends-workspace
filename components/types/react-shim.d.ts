// Temporary React type shim for isolated component workspace without installed dependencies.
// Replace with real @types/react once dependency installation is available.

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare namespace React {
  interface ReactNode {}
  interface CSSProperties { [key: string]: string | number | undefined }
  interface FC<P = {}> { (props: P & { children?: React.ReactNode }): any }
  function useState<S>(init: S | (() => S)): [S, (s: S) => void];
  function useEffect(cb: () => void | (() => void), deps?: any[]): void;
  function useMemo<T>(factory: () => T, deps: any[]): T;
  function useCallback<T extends (...args: any[]) => any>(fn: T, deps: any[]): T;
}

// Basic JSX intrinsic elements allowance
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace JSX {
  interface IntrinsicElements { [elemName: string]: any }
}

// Module declaration to satisfy imports
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare module 'react' {
  export = React;
  export as namespace React;
}
