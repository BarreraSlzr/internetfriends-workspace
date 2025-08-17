# Private Documentation: types/data.ts

**Full Git Attribution with Source Links**  
**Generated**: 2025-08-17T18:22:36Z

## Direct GitHub Access



## Complete Attribution

```json
{
    "attribution": {
    "file": "types/data.ts",
    "urls": {
        "github_blob": "https://github.com/BarreraSlzr/internetfriends-workspace/blob/993590f5d3b3c057d3f529169116d9ae214f8bef/types/data.ts",
        "github_blame": "https://github.com/BarreraSlzr/internetfriends-workspace/blame/993590f5d3b3c057d3f529169116d9ae214f8bef/types/data.ts",
        "github_history": "https://github.com/BarreraSlzr/internetfriends-workspace/commits/epic/git-sourced-documentation-v1/types/data.ts",
        "github_raw": "https://github.com/BarreraSlzr/internetfriends-workspace/raw/993590f5d3b3c057d3f529169116d9ae214f8bef/types/data.ts"
    },
    "metadata": {
        "commit": "993590f5d3b3c057d3f529169116d9ae214f8bef",
        "commit_short": "993590f5",
        "branch": "epic/git-sourced-documentation-v1",
        "line_count":      431,
        "file_size":    10510,
        "last_modified": "2025-08-17 11:09:03 -0600",
        "last_author": "Emmanuel Barrera Salazar (BarreraSlzr)",
        "last_commit_message": "feat(platform): complete platform stabilization with tests and documentation"
    }
},
    "line_ranges": [0;34m[source-attr][0m Extracting line ranges for types/data.ts
{
    "file": "types/data.ts",
    "constructs": {
        "interfaces": [
            {"name": "FriendsProfile", "line": 5, "type": "interface"},
            {"name": "GLevelTier", "line": 53, "type": "interface"},
            {"name": "Achievement", "line": 67, "type": "interface"},
            {"name": "Community", "line": 84, "type": "interface"},
            {"name": "CommunityInvite", "line": 113, "type": "interface"},
            {"name": "CommunityMember", "line": 130, "type": "interface"},
            {"name": "PaymentConfig", "line": 148, "type": "interface"},
            {"name": "PaymentTransaction", "line": 165, "type": "interface"},
            {"name": "GSPurchaseTier", "line": 184, "type": "interface"},
            {"name": "BandwidthRequest", "line": 199, "type": "interface"},
            {"name": "BandwidthSession", "line": 230, "type": "interface"},
            {"name": "Message", "line": 256, "type": "interface"},
            {"name": "Conversation", "line": 281, "type": "interface"},
            {"name": "Notification", "line": 299, "type": "interface"},
            {"name": "UserAnalytics", "line": 315, "type": "interface"},
            {"name": "SystemMetrics", "line": 338, "type": "interface"}
        ],
        "types": [
            {"name": "PaymentProvider", "line": 146, "type": "type"},
            {"name": "RequiredFields<T,", "line": 361, "type": "type"},
            {"name": "OptionalFields<T,", "line": 362, "type": "type"},
            {"name": "UpdateFields<T>", "line": 363, "type": "type"}
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
    "generated_at": "2025-08-17T18:22:36Z"
}
```

## TypeScript Definitions with Line Numbers

```typescript
     1	// InternetFriends Data Models
     2	// Shared data type definitions used across frontend and backend
     3	
     4	// Core User and Profile Types
     5	export interface FriendsProfile {
     6	  id: string
     7	  username: string
     8	  displayName: string
     9	  email?: string
    10	  avatar?: string
    11	  bio?: string
    12	  location?: {
    13	    city: string
    14	    country: string
    15	    isPublic: boolean
    16	  }
    17	  joinedAt: Date
    18	  lastActive: Date
    19	  isOnline: boolean
    20	  gLevel: GLevelTier
    21	  reputation: {
    22	    score: number // 0-100
    23	    reviews: number
    24	    avgRating: number // 1-5 stars
    25	  }
    26	  stats: {
    27	    gBalance: number
    28	    totalGsEarned: number
    29	    bandwidthShared: number // MB
    30	    connectionsHelped: number
    31	    communitiesCreated: number
    32	    communitiesJoined: number
    33	  }
    34	  preferences: {
    35	    sharingEnabled: boolean
    36	    discoverable: boolean
    37	    notifications: {
    38	      newRequests: boolean
    39	      gEarned: boolean
    40	      levelUp: boolean
    41	      communityInvites: boolean
    42	    }
    43	  }
    44	  achievements: Achievement[]
    45	  // Additional fields for API/database usage
    46	  country?: string // Deprecated: use location.country
    47	  tax_id?: string // For Mexican tax compliance
    48	  gs_balance?: number // Deprecated: use stats.gBalance
    49	  level?: number // Deprecated: use gLevel.level
    50	}
```

---
*Private repository access required for GitHub links.*
