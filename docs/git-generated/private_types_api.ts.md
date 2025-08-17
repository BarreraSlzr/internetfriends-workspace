# Private Documentation: types/api.ts

**Full Git Attribution with Source Links**  
**Generated**: 2025-08-17T18:22:37Z

## Direct GitHub Access



## Complete Attribution

```json
{
    "attribution": {
    "file": "types/api.ts",
    "urls": {
        "github_blob": "https://github.com/BarreraSlzr/internetfriends-workspace/blob/993590f5d3b3c057d3f529169116d9ae214f8bef/types/api.ts",
        "github_blame": "https://github.com/BarreraSlzr/internetfriends-workspace/blame/993590f5d3b3c057d3f529169116d9ae214f8bef/types/api.ts",
        "github_history": "https://github.com/BarreraSlzr/internetfriends-workspace/commits/epic/git-sourced-documentation-v1/types/api.ts",
        "github_raw": "https://github.com/BarreraSlzr/internetfriends-workspace/raw/993590f5d3b3c057d3f529169116d9ae214f8bef/types/api.ts"
    },
    "metadata": {
        "commit": "993590f5d3b3c057d3f529169116d9ae214f8bef",
        "commit_short": "993590f5",
        "branch": "epic/git-sourced-documentation-v1",
        "line_count":      365,
        "file_size":     8695,
        "last_modified": "2025-08-17 11:09:03 -0600",
        "last_author": "Emmanuel Barrera Salazar (BarreraSlzr)",
        "last_commit_message": "feat(platform): complete platform stabilization with tests and documentation"
    }
},
    "line_ranges": [0;34m[source-attr][0m Extracting line ranges for types/api.ts
{
    "file": "types/api.ts",
    "constructs": {
        "interfaces": [
            {"name": "ApiResponse<T", "line": 7, "type": "interface"},
            {"name": "ApiError", "line": 23, "type": "interface"},
            {"name": "PaginationParams", "line": 41, "type": "interface"},
            {"name": "PaginatedResponse<T>", "line": 49, "type": "interface"},
            {"name": "AuthTokens", "line": 62, "type": "interface"},
            {"name": "AuthUser", "line": 69, "type": "interface"},
            {"name": "AuthRequest", "line": 80, "type": "interface"},
            {"name": "AuthResponse", "line": 86, "type": "interface"},
            {"name": "ProfileUpdateRequest", "line": 92, "type": "interface"},
            {"name": "ProfileResponse", "line": 113, "type": "interface"},
            {"name": "BalanceUpdateRequest", "line": 116, "type": "interface"},
            {"name": "BalanceResponse", "line": 122, "type": "interface"},
            {"name": "TransactionRecord", "line": 128, "type": "interface"},
            {"name": "TransactionHistoryResponse", "line": 137, "type": "interface"},
            {"name": "PaymentInitiationRequest", "line": 140, "type": "interface"},
            {"name": "PaymentInitiationResponse", "line": 148, "type": "interface"},
            {"name": "PaymentCompletionRequest", "line": 155, "type": "interface"},
            {"name": "PaymentCompletionResponse", "line": 163, "type": "interface"},
            {"name": "CommunityCreateRequest", "line": 170, "type": "interface"},
            {"name": "CommunityResponse", "line": 178, "type": "interface"},
            {"name": "CommunityListResponse", "line": 180, "type": "interface"},
            {"name": "CommunityInviteRequest", "line": 182, "type": "interface"},
            {"name": "CommunityInviteResponse", "line": 188, "type": "interface"},
            {"name": "BandwidthShareRequest", "line": 191, "type": "interface"},
            {"name": "BandwidthShareResponse", "line": 198, "type": "interface"},
            {"name": "AchievementUnlockRequest", "line": 205, "type": "interface"},
            {"name": "AchievementUnlockResponse", "line": 210, "type": "interface"},
            {"name": "LeaderboardRequest", "line": 217, "type": "interface"},
            {"name": "LeaderboardResponse", "line": 222, "type": "interface"},
            {"name": "LeaderboardEntry", "line": 224, "type": "interface"},
            {"name": "FileUploadRequest", "line": 232, "type": "interface"},
            {"name": "FileUploadResponse", "line": 238, "type": "interface"},
            {"name": "SearchRequest", "line": 246, "type": "interface"},
            {"name": "SearchResponse", "line": 252, "type": "interface"},
            {"name": "ValidationError", "line": 258, "type": "interface"},
            {"name": "ValidationErrorResponse", "line": 265, "type": "interface"},
            {"name": "RateLimitInfo", "line": 276, "type": "interface"},
            {"name": "RateLimitResponse", "line": 283, "type": "interface"},
            {"name": "WebSocketMessage<T", "line": 292, "type": "interface"},
            {"name": "WebSocketAuth", "line": 299, "type": "interface"},
            {"name": "ApiRouteConfig", "line": 309, "type": "interface"}
        ],
        "types": [
            {"name": "HttpMethod", "line": 31, "type": "type"},
            {"name": "HttpStatusCode", "line": 32, "type": "type"},
            {"name": "ApiRouteHandler<T", "line": 35, "type": "type"},
            {"name": "ApiEndpoint", "line": 305, "type": "type"},
            {"name": "ApiVersion", "line": 307, "type": "type"},
            {"name": "{", "line": 366, "type": "type"}
        ],
        "schemas": [

        ]
    }
},
    "repository": {
  "url": "https://github.com/BarreraSlzr/internetfriends-workspace",
  "type": "private",
  "commit": "993590f5d3b3c057d3f529169116d9ae214f8bef",
  "branch": "epic/git-sourced-documentation-v1"
},
    "generated_at": "2025-08-17T18:22:37Z"
}
```

## TypeScript Definitions with Line Numbers

```typescript
     1	// InternetFriends API Types
     2	// Shared type definitions for API communication between frontend and backend
     3	
     4	import { NextRequest, NextResponse } from 'next/server'
     5	
     6	// Base API Response Structure
     7	export interface ApiResponse<T = unknown> {
     8	  success: boolean
     9	  data?: T
    10	  error?: {
    11	    code: string
    12	    message: string
    13	    details?: Record<string, unknown>
    14	  }
    15	  meta?: {
    16	    timestamp: string
    17	    requestId: string
    18	    version: string
    19	  }
    20	}
    21	
    22	// Standardized API Error Types
    23	export interface ApiError {
    24	  code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'SERVER_ERROR' | 'RATE_LIMITED' | 'FORBIDDEN'
    25	  message: string
    26	  details?: Record<string, unknown>
    27	  statusCode: number
    28	}
    29	
    30	// HTTP Methods and Status Codes
    31	export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'
    32	export type HttpStatusCode = 200 | 201 | 204 | 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500 | 503
    33	
    34	// API Route Handler Types (for Next.js 15 compatibility)
    35	export type ApiRouteHandler<T = unknown> = (
    36	  request: NextRequest,
    37	  context?: { params?: Record<string, string> }
    38	) => Promise<NextResponse<ApiResponse<T>>>
    39	
    40	// Generic API Request/Response Types
    41	export interface PaginationParams {
    42	  page?: number
    43	  limit?: number
    44	  offset?: number
    45	  sort?: string
    46	  order?: 'asc' | 'desc'
    47	}
    48	
    49	export interface PaginatedResponse<T> {
    50	  items: T[]
```

---
*Private repository access required for GitHub links.*
