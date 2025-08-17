# Documentation: types/index.ts

**Auto-generated from Git repository**  
**Source**: [GitHub](/blob/993590f5d3b3c057d3f529169116d9ae214f8bef/types/index.ts)  
**Last Modified**: 2025-08-17 11:09:03 -0600  
**Generated**: 2025-08-17T18:22:35Z

## File Overview

```
Path: types/index.ts
Lines:      325
Last Author: Emmanuel Barrera Salazar (BarreraSlzr)
Commit: 993590f5
```

## TypeScript Definitions

```typescript
[0;34m[git-docs][0m Extracting TypeScript definitions from ./types/index.ts
=== TYPES ===
5 |export type {
34 |export type {
88 |export type {
233 |export type Profile = FriendsProfile
234 |export type User = FriendsProfile
235 |export type GLevel = GLevelTier
236 |export type PaymentMethod = PaymentProvider
241 |export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>
244 |export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
247 |export type ApiEndpointResponse<T> = ApiResponse<T>
250 |export type ApiPaginatedResponse<T> = ApiResponse<PaginatedResponse<T>>
253 |export type AsyncApiResponse<T> = Promise<ApiResponse<T>>
256 |export type ComponentPropsWithRef<T, R = HTMLElement> = T & {
261 |export type StrictComponentProps<T> = T & {
313 |export type ExtractStringLiterals<T> = T extends string ? T : never
316 |export type AllOptional<T> = Partial<T> extends T ? true : false
319 |export type RequiredKeys<T> = {
324 |export type OptionalKeys<T> = {
```

## Source Attribution

```json
{
    "file": "types/index.ts",
    "github_url": "/blob/993590f5d3b3c057d3f529169116d9ae214f8bef/types/index.ts",
    "github_blame_url": "/blame/993590f5d3b3c057d3f529169116d9ae214f8bef/types/index.ts",
    "commit": "993590f5d3b3c057d3f529169116d9ae214f8bef",
    "branch": "epic/git-sourced-documentation-v1",
    "line_count":      325,
    "last_modified": "2025-08-17 11:09:03 -0600",
    "last_author": "Emmanuel Barrera Salazar (BarreraSlzr)",
    "generated_at": "2025-08-17T18:22:35Z"
}
```

## Recent Changes

```diff
9f47699 feat(platform): complete platform stabilization with tests and documentation
```

---
*This documentation was automatically generated from the Git repository. 
For the most up-to-date version, visit the [source file](/blob/993590f5d3b3c057d3f529169116d9ae214f8bef/types/index.ts).*
