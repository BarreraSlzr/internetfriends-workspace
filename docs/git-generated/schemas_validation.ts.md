# Documentation: schemas/validation.ts

**Auto-generated from Git repository**  
**Source**: [GitHub](/blob/da5d6e6730c93466f69433826d7d6652c3c1c53c/schemas/validation.ts)  
**Last Modified**: 2025-08-17 11:09:03 -0600  
**Generated**: 2025-08-17T17:36:26Z

## File Overview

```
Path: schemas/validation.ts
Lines:      433
Last Author: Emmanuel Barrera Salazar (BarreraSlzr)
Commit: da5d6e67
```

## TypeScript Definitions

```typescript
[0;34m[git-docs][0m Extracting TypeScript definitions from ./schemas/validation.ts
=== TYPES ===
424 |export type FriendsProfileType = z.infer<typeof FriendsProfileSchema>
425 |export type ProfileUpdateType = z.infer<typeof ProfileUpdateSchema>
426 |export type CommunityType = z.infer<typeof CommunitySchema>
427 |export type CommunityCreateType = z.infer<typeof CommunityCreateSchema>
428 |export type PaymentInitiationType = z.infer<typeof PaymentInitiationSchema>
429 |export type PaymentCompletionType = z.infer<typeof PaymentCompletionSchema>
430 |export type BandwidthRequestType = z.infer<typeof BandwidthRequestSchema>
431 |export type AuthRequestType = z.infer<typeof AuthRequestSchema>
432 |export type RegistrationRequestType = z.infer<typeof RegistrationRequestSchema>
433 |export type ApiResponseType<T> = z.infer<ReturnType<typeof ApiResponseSchema<z.ZodSchema<T>>>>
434 |export type PaginatedResponseType<T> = z.infer<ReturnType<typeof PaginatedResponseSchema<z.ZodSchema<T>>>>

=== ZOD SCHEMAS ===
8 |export const IdSchema = z.string().min(1, 'ID is required')
9 |export const UsernameSchema = z.string()
14 |export const EmailSchema = z.string().email('Invalid email address')
15 |export const PasswordSchema = z.string()
19 |export const DisplayNameSchema = z.string()
23 |export const BioSchema = z.string()
27 |export const CountryCodeSchema = z.string()
31 |export const CurrencySchema = z.enum(['USD', 'MXN'])
35 |export const GLevelTierSchema = z.object({
48 |export const GSAmountSchema = z.number()
52 |export const PriceSchema = z.number()
58 |export const LocationSchema = z.object({
64 |export const ReputationSchema = z.object({
70 |export const ProfileStatsSchema = z.object({
79 |export const NotificationPreferencesSchema = z.object({
86 |export const ProfilePreferencesSchema = z.object({
92 |export const AchievementSchema = z.object({
102 |export const FriendsProfileSchema = z.object({
125 |export const ProfileUpdateSchema = z.object({
135 |export const PaymentProviderSchema = z.enum([
140 |export const PaymentConfigSchema = z.object({
157 |export const GSPurchaseTierSchema = z.object({
171 |export const PaymentInitiationSchema = z.object({
179 |export const PaymentCompletionSchema = z.object({
187 |export const PaymentTransactionSchema = z.object({
204 |export const CommunitySettingsSchema = z.object({
211 |export const CommunityStatsSchema = z.object({
218 |export const CommunitySchema = z.object({
237 |export const CommunityCreateSchema = z.object({
245 |export const CommunityInviteSchema = z.object({
259 |export const CommunityInviteCreateSchema = z.object({
267 |export const BandwidthRequestSchema = z.object({
294 |export const BandwidthShareRequestSchema = z.object({
303 |export const ApiErrorSchema = z.object({
310 |export const ApiResponseMetaSchema = z.object({
323 |export const PaginationParamsSchema = z.object({
345 |export const AuthRequestSchema = z.object({
351 |export const RegistrationRequestSchema = z.object({
361 |export const PasswordResetRequestSchema = z.object({
365 |export const PasswordResetConfirmSchema = z.object({
376 |export const FileUploadSchema = z.object({
383 |export const SearchRequestSchema = z.object({
```

## Source Attribution

```json
{
    "file": "schemas/validation.ts",
    "github_url": "/blob/da5d6e6730c93466f69433826d7d6652c3c1c53c/schemas/validation.ts",
    "github_blame_url": "/blame/da5d6e6730c93466f69433826d7d6652c3c1c53c/schemas/validation.ts",
    "commit": "da5d6e6730c93466f69433826d7d6652c3c1c53c",
    "branch": "epic/git-sourced-documentation-v1",
    "line_count":      433,
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
For the most up-to-date version, visit the [source file](/blob/da5d6e6730c93466f69433826d7d6652c3c1c53c/schemas/validation.ts).*
