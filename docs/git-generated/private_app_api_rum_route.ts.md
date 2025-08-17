# Private Documentation: app/api/rum/route.ts

**Full Git Attribution with Source Links**  
**Generated**: 2025-08-17T18:22:37Z

## Direct GitHub Access



## Complete Attribution

```json
{
    "attribution": {
    "file": "app/api/rum/route.ts",
    "urls": {
        "github_blob": "https://github.com/BarreraSlzr/internetfriends-workspace/blob/993590f5d3b3c057d3f529169116d9ae214f8bef/app/api/rum/route.ts",
        "github_blame": "https://github.com/BarreraSlzr/internetfriends-workspace/blame/993590f5d3b3c057d3f529169116d9ae214f8bef/app/api/rum/route.ts",
        "github_history": "https://github.com/BarreraSlzr/internetfriends-workspace/commits/epic/git-sourced-documentation-v1/app/api/rum/route.ts",
        "github_raw": "https://github.com/BarreraSlzr/internetfriends-workspace/raw/993590f5d3b3c057d3f529169116d9ae214f8bef/app/api/rum/route.ts"
    },
    "metadata": {
        "commit": "993590f5d3b3c057d3f529169116d9ae214f8bef",
        "commit_short": "993590f5",
        "branch": "epic/git-sourced-documentation-v1",
        "line_count":      352,
        "file_size":     9282,
        "last_modified": "2025-08-10 22:39:33 -0600",
        "last_author": "Emmanuel Barrera Salazar (BarreraSlzr)",
        "last_commit_message": "🔧 Major TypeScript compilation fixes"
    }
},
    "line_ranges": [0;34m[source-attr][0m Extracting line ranges for app/api/rum/route.ts
{
    "file": "app/api/rum/route.ts",
    "constructs": {
        "interfaces": [

        ],
        "types": [

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
     1	import { NextRequest, NextResponse } from "next/server";
     2	import {
     3	  writeFileSync,
     4	  appendFileSync,
     5	  existsSync,
     6	  mkdirSync,
     7	  readFileSync,
     8	} from "fs";
     9	import { join } from "path";
    10	
    11	interface RUMPayload {
    12	  ttfb?: number;
    13	  fcp?: number;
    14	  lcp?: number;
    15	  cls?: number;
    16	  fid_like?: number;
    17	  inp?: number;
    18	  navType?: string;
    19	  url?: string;
    20	  userAgent?: string;
    21	  connectionType?: string;
    22	  deviceMemory?: number;
    23	  timestamp?: number;
    24	  sessionId?: string;
    25	  userId?: string;
    26	}
    27	
    28	interface RUMMetrics extends RUMPayload {
    29	  timestamp: number;
    30	  url: string;
    31	  userAgent: string;
    32	  ip?: string;
    33	  country?: string;
    34	  epic?: string;
    35	}
    36	
    37	// Rate limiting store (in production, use Redis)
    38	const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
    39	const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
    40	const RATE_LIMIT_MAX = 100; // Max requests per minute per IP
    41	
    42	function isValidMetric(value: any): boolean {
    43	  return (
    44	    typeof value === "number" &&
    45	    !isNaN(value) &&
    46	    isFinite(value) &&
    47	    value >= 0 &&
    48	    value < 60000
    49	  ); // Max 60 seconds for timing metrics
    50	}
```

---
*Private repository access required for GitHub links.*
