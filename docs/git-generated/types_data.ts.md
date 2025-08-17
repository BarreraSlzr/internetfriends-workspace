# Documentation: types/data.ts

**Auto-generated from Git repository**  
**Source**: [GitHub](/blob/993590f5d3b3c057d3f529169116d9ae214f8bef/types/data.ts)  
**Last Modified**: 2025-08-17 11:09:03 -0600  
**Generated**: 2025-08-17T18:22:35Z

## File Overview

```
Path: types/data.ts
Lines:      431
Last Author: Emmanuel Barrera Salazar (BarreraSlzr)
Commit: 993590f5
```

## TypeScript Definitions

```typescript
[0;34m[git-docs][0m Extracting TypeScript definitions from ./types/data.ts
=== INTERFACES ===
5 |export interface FriendsProfile {
53 |export interface GLevelTier {
67 |export interface Achievement {
84 |export interface Community {
113 |export interface CommunityInvite {
130 |export interface CommunityMember {
148 |export interface PaymentConfig {
165 |export interface PaymentTransaction {
184 |export interface GSPurchaseTier {
199 |export interface BandwidthRequest {
230 |export interface BandwidthSession {
256 |export interface Message {
281 |export interface Conversation {
299 |export interface Notification {
315 |export interface UserAnalytics {
338 |export interface SystemMetrics {

=== TYPES ===
146 |export type PaymentProvider = 'paypal' | 'apple_pay' | 'google_pay' | 'stripe' | 'mercado_pago' | 'oxxo' | 'gumroad' | 'revenuecat' | 'polar' | 'lemonsqueezy' | 'slash'
361 |export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
362 |export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
363 |export type UpdateFields<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>
```

## Source Attribution

```json
{
    "file": "types/data.ts",
    "github_url": "/blob/993590f5d3b3c057d3f529169116d9ae214f8bef/types/data.ts",
    "github_blame_url": "/blame/993590f5d3b3c057d3f529169116d9ae214f8bef/types/data.ts",
    "commit": "993590f5d3b3c057d3f529169116d9ae214f8bef",
    "branch": "epic/git-sourced-documentation-v1",
    "line_count":      431,
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
For the most up-to-date version, visit the [source file](/blob/993590f5d3b3c057d3f529169116d9ae214f8bef/types/data.ts).*
