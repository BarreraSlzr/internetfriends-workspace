# Private Documentation: types/index.ts

**Full Git Attribution with Source Links**  
**Generated**: 2025-08-17T17:36:28Z

## Direct GitHub Access



## Complete Attribution

```json
{
    "attribution": {
    "file": "types/index.ts",
    "urls": {
        "github_blob": "https://github.com/BarreraSlzr/internetfriends-workspace/blob/da5d6e6730c93466f69433826d7d6652c3c1c53c/types/index.ts",
        "github_blame": "https://github.com/BarreraSlzr/internetfriends-workspace/blame/da5d6e6730c93466f69433826d7d6652c3c1c53c/types/index.ts",
        "github_history": "https://github.com/BarreraSlzr/internetfriends-workspace/commits/epic/git-sourced-documentation-v1/types/index.ts",
        "github_raw": "https://github.com/BarreraSlzr/internetfriends-workspace/raw/da5d6e6730c93466f69433826d7d6652c3c1c53c/types/index.ts"
    },
    "metadata": {
        "commit": "da5d6e6730c93466f69433826d7d6652c3c1c53c",
        "commit_short": "da5d6e67",
        "branch": "epic/git-sourced-documentation-v1",
        "line_count":      325,
        "file_size":     7610,
        "last_modified": "2025-08-17 11:09:03 -0600",
        "last_author": "Emmanuel Barrera Salazar (BarreraSlzr)",
        "last_commit_message": "feat(platform): complete platform stabilization with tests and documentation"
    }
},
    "line_ranges": [0;34m[source-attr][0m Extracting line ranges for types/index.ts
{
    "file": "types/index.ts",
    "constructs": {
        "interfaces": [

        ],
        "types": [
            {"name": "{", "line": 5, "type": "type"},
            {"name": "{", "line": 34, "type": "type"},
            {"name": "{", "line": 88, "type": "type"},
            {"name": "Profile", "line": 233, "type": "type"},
            {"name": "User", "line": 234, "type": "type"},
            {"name": "GLevel", "line": 235, "type": "type"},
            {"name": "PaymentMethod", "line": 236, "type": "type"},
            {"name": "WithRequired<T,", "line": 241, "type": "type"},
            {"name": "WithOptional<T,", "line": 244, "type": "type"},
            {"name": "ApiEndpointResponse<T>", "line": 247, "type": "type"},
            {"name": "ApiPaginatedResponse<T>", "line": 250, "type": "type"},
            {"name": "AsyncApiResponse<T>", "line": 253, "type": "type"},
            {"name": "ComponentPropsWithRef<T,", "line": 256, "type": "type"},
            {"name": "StrictComponentProps<T>", "line": 261, "type": "type"},
            {"name": "ExtractStringLiterals<T>", "line": 313, "type": "type"},
            {"name": "AllOptional<T>", "line": 316, "type": "type"},
            {"name": "RequiredKeys<T>", "line": 319, "type": "type"},
            {"name": "OptionalKeys<T>", "line": 324, "type": "type"}
        ],
        "schemas": [

        ]
    }
},
    "repository": {
  "url": "https://github.com/BarreraSlzr/internetfriends-workspace",
  "type": "private",
  "commit": "da5d6e6730c93466f69433826d7d6652c3c1c53c",
  "branch": "epic/git-sourced-documentation-v1"
},
    "generated_at": "2025-08-17T17:36:28Z"
}
```

## TypeScript Definitions with Line Numbers

```typescript
     1	// InternetFriends Type System - Main Index
     2	// Central export point for all shared types across the application
     3	
     4	// === Core Data Types ===
     5	export type {
     6	  FriendsProfile,
     7	  GLevelTier,
     8	  Achievement,
     9	  Community,
    10	  CommunityInvite,
    11	  CommunityMember,
    12	  PaymentProvider,
    13	  PaymentConfig,
    14	  PaymentTransaction,
    15	  GSPurchaseTier,
    16	  BandwidthRequest,
    17	  BandwidthSession,
    18	  Message,
    19	  Conversation,
    20	  Notification,
    21	  UserAnalytics,
    22	  SystemMetrics,
    23	  RequiredFields,
    24	  OptionalFields,
    25	  UpdateFields,
    26	  DEFAULT_G_LEVEL,
    27	  PAYMENT_PROVIDERS,
    28	  ACHIEVEMENT_RARITIES,
    29	  COMMUNITY_MEMBER_ROLES,
    30	  NOTIFICATION_PRIORITIES
    31	} from './data'
    32	
    33	// === API Types ===
    34	export type {
    35	  ApiResponse,
    36	  ApiError,
    37	  HttpMethod,
    38	  HttpStatusCode,
    39	  ApiRouteHandler,
    40	  PaginationParams,
    41	  PaginatedResponse,
    42	  AuthTokens,
    43	  AuthUser,
    44	  AuthRequest,
    45	  AuthResponse,
    46	  ProfileUpdateRequest,
    47	  ProfileResponse,
    48	  BalanceUpdateRequest,
    49	  BalanceResponse,
    50	  TransactionRecord,
```

---
*Private repository access required for GitHub links.*
