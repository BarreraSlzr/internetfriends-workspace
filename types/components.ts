// InternetFriends Component-Specific Types
// Type definitions for component props, organized by component category

import { ReactNode, ElementType, ComponentProps } from "react"
import type { 
  FriendsProfile, 
  Community, 
  CommunityInvite, 
  Achievement, 
  GSPurchaseTier,
  PaymentProvider,
  GLevelTier 
} from './data'

// === Base Component Props ===
export interface BaseComponentProps {
  className?: string
  "data-testid"?: string
  children?: ReactNode
  id?: string
}

// === Atomic Component Types ===

// Button Component
export interface ButtonAtomicProps extends BaseComponentProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link"
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  startIcon?: ReactNode
  endIcon?: ReactNode
  type?: "button" | "submit" | "reset"
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

// Glass Card Component
export interface GlassCardProps extends BaseComponentProps {
  variant?: "default" | "outlined" | "elevated" | "glass"
  padding?: "xs" | "sm" | "md" | "lg" | "xl"
  radius?: "xs" | "sm" | "md" | "lg" | "xl"
  interactive?: boolean
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
}

// Header Component
export interface HeaderAtomicProps extends BaseComponentProps {
  variant?: "default" | "transparent" | "glass"
  sticky?: boolean
  borderOnScroll?: boolean
  logo?: ReactNode
  navigation?: ReactNode
  actions?: ReactNode
  mobileMenu?: ReactNode
}

// === Gloo System Types ===
export type GlooPaletteStrategy =
  | "brand-triad"
  | "analogous" 
  | "seeded-random"
  | "primary-accent"
  | "soft-glass"
  | "monochrome"
  | "complementary"
  | "octopus-flat"
  | "modern-minimal"
  | "retina-optimized"

export type GlooThemeMode = "light" | "dark"

export type GlooEffectName =
  | "default"
  | "spiral"
  | "wave"
  | "vortex"
  | "pulse"
  | "ripple"
  | "twist"
  | "oscillate"
  | "fractal"
  | "swirl"
  | "bounce"
  | "octopus"
  | "modernFlow"
  | "minimalist"
  | "retinal"

export interface GlooCanvasProps extends BaseComponentProps {
  speed?: number
  resolution?: number
  depth?: number
  still?: boolean
  tint?: [number, number, number]
  color1?: [number, number, number]
  color2?: [number, number, number]
  color3?: [number, number, number]
  colors?: string[]
  effectIndex?: number
  effectName?: GlooEffectName
  width?: number
  height?: number
  dpr?: number
  animate?: boolean
  preserveDrawingBuffer?: boolean
  disabled?: boolean
  reducedMotion?: boolean
  autoEffectCycle?: boolean
  effectCycleMs?: number
  onError?: (err: string) => void
  onEffectChange?: (effectIndex: number, effectName: GlooEffectName) => void
}

export interface GlooGlobalProps extends Omit<GlooCanvasProps, "colors"> {
  paletteStrategy?: GlooPaletteStrategy
  paletteLight?: string[]
  paletteDark?: string[]
  palette?: string[]
  anchorToPrimary?: boolean
  autoRegeneratePalette?: boolean
  paletteRegenerateMs?: number
  absolute?: boolean
  zIndex?: number
}

// === Molecular Component Types ===

// Navigation Component
export interface NavigationItem {
  label: string
  href: string
  icon?: ReactNode
  active?: boolean
  disabled?: boolean
  external?: boolean
  children?: NavigationItem[]
}

export interface NavigationProps extends BaseComponentProps {
  items: NavigationItem[]
  orientation?: "horizontal" | "vertical"
  variant?: "default" | "pills" | "underline" | "sidebar"
  pathname?: string
  collapsible?: boolean
  logo?: ReactNode
  actions?: ReactNode
}

// === Organism Component Types ===

// G's Purchase Store Component
export interface GSPurchaseStoreProps extends BaseComponentProps {
  profile: FriendsProfile
  tiers: GSPurchaseTier[]
  onPurchase: (tier: GSPurchaseTier, provider: PaymentProvider) => void
  isLoading?: boolean
  error?: string
}

// Profile Component
export interface ProfileComponentProps extends BaseComponentProps {
  profile: FriendsProfile
  isOwner?: boolean
  onUpdate?: (updates: Partial<FriendsProfile>) => void
  showStats?: boolean
  showAchievements?: boolean
}

// Community Card Component
export interface CommunityCardProps extends BaseComponentProps {
  community: Community
  currentUserId?: string
  onJoin?: (communityId: string) => void
  onLeave?: (communityId: string) => void
  showJoinButton?: boolean
}

// Leaderboard Component
export interface LeaderboardProps extends BaseComponentProps {
  category: 'gs' | 'bandwidth' | 'communities' | 'reputation'
  profiles: FriendsProfile[]
  currentUserId?: string
  isLoading?: boolean
  onRefresh?: () => void
}

// Achievement Display Component
export interface AchievementDisplayProps extends BaseComponentProps {
  achievement: Achievement
  variant?: "card" | "badge" | "toast"
  unlocked?: boolean
  onClaim?: (achievementId: string) => void
}

// === Page Component Types ===

// Hero Text Component
export interface HeroTextProps extends BaseComponentProps {
  title: string
  subtitle?: string
  description?: string
  actions?: ReactNode
  useGloo?: boolean // Fixed: was missing this required prop
  variant?: "default" | "centered" | "split"
}

// Form Component Types
export interface FormProps extends BaseComponentProps {
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
  mode?: "onChange" | "onBlur" | "onSubmit"
  layout?: "vertical" | "horizontal" | "inline"
  spacing?: "xs" | "sm" | "md" | "lg" | "xl"
  loading?: boolean
  disabled?: boolean
}

export interface FormFieldProps extends BaseComponentProps {
  label?: string
  description?: string
  required?: boolean
  error?: boolean
  errorMessage?: string
  layout?: "vertical" | "horizontal"
}

// Modal Component Types
export interface ModalProps extends BaseComponentProps {
  open: boolean
  onClose: () => void
  title?: string
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "fullscreen"
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  content?: ReactNode
  footer?: ReactNode
}

// === Utility Types ===

// Size variants used across components
export type SizeVariant = "xs" | "sm" | "md" | "lg" | "xl"

// Color variants for interactive elements
export type ColorVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"

// Visual variants for styling
export type VisualVariant = "solid" | "outline" | "ghost" | "link" | "gradient"

// Loading states
export type LoadingState = "idle" | "loading" | "success" | "error"

// Animation directions
export type AnimationDirection = "up" | "down" | "left" | "right" | "fade"

// Polymorphic component props
export type PolymorphicProps<T extends ElementType = "div"> = {
  as?: T
} & BaseComponentProps &
  Omit<ComponentProps<T>, keyof BaseComponentProps | "as">

// Component state types
export interface ComponentState {
  loading?: boolean
  error?: boolean
  success?: boolean
  disabled?: boolean
  focused?: boolean
  hovered?: boolean
  active?: boolean
}

// Event handler types
export type ClickHandler = (event: React.MouseEvent) => void
export type ChangeHandler<T = string> = (value: T) => void
export type SubmitHandler<T = unknown> = (data: T) => void | Promise<void>

// Render prop types
export type RenderProp<T> = (props: T) => ReactNode
export type ChildrenRenderProp<T> = { children: RenderProp<T> }

// Forwarded ref types
export type ForwardedRef<T> = React.ForwardedRef<T>
export type ComponentWithRef<T, P> = React.ForwardRefExoticComponent<
  P & React.RefAttributes<T>
>

// === Component Registry Types ===

export interface ComponentRegistryItem {
  name: string
  description: string
  category: "atomic" | "molecular" | "organism" | "template"
  path: string
  props: Record<string, unknown>
  tags: string[]
  status: "stable" | "beta" | "deprecated"
  dependencies?: string[]
}

export interface ComponentRegistryFilter {
  category?: ComponentRegistryItem['category']
  status?: ComponentRegistryItem['status']
  search?: string
  tags?: string[]
}

// === Theme System Types ===

export interface ThemeConfig {
  isDarkMode: boolean
  primaryColor: string
  accentColor: string
  borderRadius: number
  spacing: Record<SizeVariant, string>
  typography: {
    fontFamily: string
    fontSize: Record<SizeVariant, string>
    fontWeight: Record<string, number>
  }
}

export interface ThemeContextValue {
  theme: ThemeConfig
  toggleTheme: () => void
  setTheme: (theme: Partial<ThemeConfig>) => void
}

// === Performance Types ===

export interface PerformanceMetrics {
  componentRenderTime: number
  bundleSize: number
  memoryUsage: number
  interactionLatency: number
}

export interface OptimizationConfig {
  enableLazyLoading: boolean
  enableCodeSplitting: boolean
  enableImageOptimization: boolean
  maxBundleSize: number
}

// Type guards for component props
export const isHeroTextProps = (value: unknown): value is HeroTextProps => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'title' in value &&
    typeof (value as HeroTextProps).title === 'string'
  )
}

export const isButtonAtomicProps = (value: unknown): value is ButtonAtomicProps => {
  return (
    typeof value === 'object' &&
    value !== null
  )
}

// Default props for components
export const BUTTON_ATOMIC_DEFAULTS: Required<Pick<ButtonAtomicProps, 'variant' | 'size' | 'type' | 'loading' | 'disabled' | 'fullWidth'>> = {
  variant: "primary",
  size: "md", 
  type: "button",
  loading: false,
  disabled: false,
  fullWidth: false
}

export const GLOO_CANVAS_DEFAULTS: Required<Pick<GlooCanvasProps, 'speed' | 'resolution' | 'depth' | 'animate' | 'disabled'>> = {
  speed: 1,
  resolution: 1,
  depth: 1,
  animate: true,
  disabled: false
}