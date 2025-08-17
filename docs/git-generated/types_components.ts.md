# Documentation: types/components.ts

**Auto-generated from Git repository**  
**Source**: [GitHub](/blob/5d05e08307cea4aa99bf92dd58d948d5e89cdebc/types/components.ts)  
**Last Modified**: 2025-08-17 11:09:03 -0600  
**Generated**: 2025-08-17T18:31:55Z

## File Overview

```
Path: types/components.ts
Lines:      384
Last Author: Emmanuel Barrera Salazar (BarreraSlzr)
Commit: 5d05e083
```

## TypeScript Definitions

```typescript
[0;34m[git-docs][0m Extracting TypeScript definitions from ./types/components.ts
=== INTERFACES ===
16 |export interface BaseComponentProps {
26 |export interface ButtonAtomicProps extends BaseComponentProps {
39 |export interface GlassCardProps extends BaseComponentProps {
48 |export interface HeaderAtomicProps extends BaseComponentProps {
90 |export interface GlooCanvasProps extends BaseComponentProps {
115 |export interface GlooGlobalProps extends Omit<GlooCanvasProps, "colors"> {
130 |export interface NavigationItem {
140 |export interface NavigationProps extends BaseComponentProps {
153 |export interface GSPurchaseStoreProps extends BaseComponentProps {
162 |export interface ProfileComponentProps extends BaseComponentProps {
171 |export interface CommunityCardProps extends BaseComponentProps {
180 |export interface LeaderboardProps extends BaseComponentProps {
189 |export interface AchievementDisplayProps extends BaseComponentProps {
199 |export interface HeroTextProps extends BaseComponentProps {
209 |export interface FormProps extends BaseComponentProps {
218 |export interface FormFieldProps extends BaseComponentProps {
228 |export interface ModalProps extends BaseComponentProps {
270 |export interface ComponentState {
297 |export interface ComponentRegistryItem {
308 |export interface ComponentRegistryFilter {
317 |export interface ThemeConfig {
330 |export interface ThemeContextValue {
338 |export interface PerformanceMetrics {
345 |export interface OptimizationConfig {

=== TYPES ===
59 |export type GlooPaletteStrategy =
71 |export type GlooThemeMode = "light" | "dark"
73 |export type GlooEffectName =
242 |export type SizeVariant = "xs" | "sm" | "md" | "lg" | "xl"
245 |export type ColorVariant =
255 |export type VisualVariant = "solid" | "outline" | "ghost" | "link" | "gradient"
258 |export type LoadingState = "idle" | "loading" | "success" | "error"
261 |export type AnimationDirection = "up" | "down" | "left" | "right" | "fade"
264 |export type PolymorphicProps<T extends ElementType = "div"> = {
281 |export type ClickHandler = (event: React.MouseEvent) => void
282 |export type ChangeHandler<T = string> = (value: T) => void
283 |export type SubmitHandler<T = unknown> = (data: T) => void | Promise<void>
286 |export type RenderProp<T> = (props: T) => ReactNode
287 |export type ChildrenRenderProp<T> = { children: RenderProp<T> }
290 |export type ForwardedRef<T> = React.ForwardedRef<T>
291 |export type ComponentWithRef<T, P> = React.ForwardRefExoticComponent<
```

## Source Attribution

```json
{
    "file": "types/components.ts",
    "github_url": "/blob/5d05e08307cea4aa99bf92dd58d948d5e89cdebc/types/components.ts",
    "github_blame_url": "/blame/5d05e08307cea4aa99bf92dd58d948d5e89cdebc/types/components.ts",
    "commit": "5d05e08307cea4aa99bf92dd58d948d5e89cdebc",
    "branch": "epic/git-sourced-documentation-v1",
    "line_count":      384,
    "last_modified": "2025-08-17 11:09:03 -0600",
    "last_author": "Emmanuel Barrera Salazar (BarreraSlzr)",
    "generated_at": "2025-08-17T18:31:55Z"
}
```

## Recent Changes

```diff
9f47699 feat(platform): complete platform stabilization with tests and documentation
```

---
*This documentation was automatically generated from the Git repository. 
For the most up-to-date version, visit the [source file](/blob/5d05e08307cea4aa99bf92dd58d948d5e89cdebc/types/components.ts).*
