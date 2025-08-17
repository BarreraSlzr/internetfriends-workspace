# Documentation: types/api.ts

**Auto-generated from Git repository**  
**Source**: [GitHub](/blob/da5d6e6730c93466f69433826d7d6652c3c1c53c/types/api.ts)  
**Last Modified**: 2025-08-17 11:09:03 -0600  
**Generated**: 2025-08-17T17:36:26Z

## File Overview

```
Path: types/api.ts
Lines:      365
Last Author: Emmanuel Barrera Salazar (BarreraSlzr)
Commit: da5d6e67
```

## TypeScript Definitions

```typescript
[0;34m[git-docs][0m Extracting TypeScript definitions from ./types/api.ts
=== INTERFACES ===
7 |export interface ApiResponse<T = unknown> {
23 |export interface ApiError {
41 |export interface PaginationParams {
49 |export interface PaginatedResponse<T> {
62 |export interface AuthTokens {
69 |export interface AuthUser {
80 |export interface AuthRequest {
86 |export interface AuthResponse extends ApiResponse<{
92 |export interface ProfileUpdateRequest {
113 |export interface ProfileResponse extends ApiResponse<FriendsProfile> {}
116 |export interface BalanceUpdateRequest {
122 |export interface BalanceResponse extends ApiResponse<{
128 |export interface TransactionRecord {
137 |export interface TransactionHistoryResponse extends ApiResponse<PaginatedResponse<TransactionRecord>> {}
140 |export interface PaymentInitiationRequest {
148 |export interface PaymentInitiationResponse extends ApiResponse<{
155 |export interface PaymentCompletionRequest {
163 |export interface PaymentCompletionResponse extends ApiResponse<{
170 |export interface CommunityCreateRequest {
178 |export interface CommunityResponse extends ApiResponse<Community> {}
180 |export interface CommunityListResponse extends ApiResponse<PaginatedResponse<Community>> {}
182 |export interface CommunityInviteRequest {
188 |export interface CommunityInviteResponse extends ApiResponse<CommunityInvite> {}
191 |export interface BandwidthShareRequest {
198 |export interface BandwidthShareResponse extends ApiResponse<{
205 |export interface AchievementUnlockRequest {
210 |export interface AchievementUnlockResponse extends ApiResponse<{
217 |export interface LeaderboardRequest extends PaginationParams {
222 |export interface LeaderboardResponse extends ApiResponse<PaginatedResponse<LeaderboardEntry>> {}
224 |export interface LeaderboardEntry {
232 |export interface FileUploadRequest {
238 |export interface FileUploadResponse extends ApiResponse<{
246 |export interface SearchRequest extends PaginationParams {
252 |export interface SearchResponse extends ApiResponse<{
258 |export interface ValidationError {
265 |export interface ValidationErrorResponse extends ApiResponse<never> {
276 |export interface RateLimitInfo {
283 |export interface RateLimitResponse extends ApiResponse<never> {
292 |export interface WebSocketMessage<T = unknown> {
299 |export interface WebSocketAuth {
309 |export interface ApiRouteConfig {

=== TYPES ===
31 |export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'
32 |export type HttpStatusCode = 200 | 201 | 204 | 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500 | 503
35 |export type ApiRouteHandler<T = unknown> = (
305 |export type ApiEndpoint = 'auth' | 'profile' | 'balance' | 'payments' | 'communities' | 'bandwidth' | 'achievements' | 'leaderboard' | 'search' | 'files'
307 |export type ApiVersion = 'v1' | 'v2'
366 |export type { FriendsProfile, Community, CommunityInvite, Achievement, PaymentProvider } from './data'
```

## Source Attribution

```json
{
    "file": "types/api.ts",
    "github_url": "/blob/da5d6e6730c93466f69433826d7d6652c3c1c53c/types/api.ts",
    "github_blame_url": "/blame/da5d6e6730c93466f69433826d7d6652c3c1c53c/types/api.ts",
    "commit": "da5d6e6730c93466f69433826d7d6652c3c1c53c",
    "branch": "epic/git-sourced-documentation-v1",
    "line_count":      365,
    "last_modified": "2025-08-17 11:09:03 -0600",
    "last_author": "Emmanuel Barrera Salazar (BarreraSlzr)",
    "generated_at": "2025-08-17T17:36:26Z"
}
```

## Recent Changes

```diff
9f47699 feat(platform): complete platform stabilization with tests and documentation
```

---
*This documentation was automatically generated from the Git repository. 
For the most up-to-date version, visit the [source file](/blob/da5d6e6730c93466f69433826d7d6652c3c1c53c/types/api.ts).*
