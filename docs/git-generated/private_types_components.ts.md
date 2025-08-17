# Private Documentation: types/components.ts

**Full Git Attribution with Source Links**  
**Generated**: 2025-08-17T18:31:56Z

## Direct GitHub Access



## Complete Attribution

```json
{
    "attribution": {
    "file": "types/components.ts",
    "urls": {
        "github_blob": "https://github.com/BarreraSlzr/internetfriends-workspace/blob/5d05e08307cea4aa99bf92dd58d948d5e89cdebc/types/components.ts",
        "github_blame": "https://github.com/BarreraSlzr/internetfriends-workspace/blame/5d05e08307cea4aa99bf92dd58d948d5e89cdebc/types/components.ts",
        "github_history": "https://github.com/BarreraSlzr/internetfriends-workspace/commits/epic/git-sourced-documentation-v1/types/components.ts",
        "github_raw": "https://github.com/BarreraSlzr/internetfriends-workspace/raw/5d05e08307cea4aa99bf92dd58d948d5e89cdebc/types/components.ts"
    },
    "metadata": {
        "commit": "5d05e08307cea4aa99bf92dd58d948d5e89cdebc",
        "commit_short": "5d05e083",
        "branch": "epic/git-sourced-documentation-v1",
        "line_count":      384,
        "file_size":     9697,
        "last_modified": "2025-08-17 11:09:03 -0600",
        "last_author": "Emmanuel Barrera Salazar (BarreraSlzr)",
        "last_commit_message": "feat(platform): complete platform stabilization with tests and documentation"
    }
},
    "line_ranges": [0;34m[source-attr][0m Extracting line ranges for types/components.ts
{
    "file": "types/components.ts",
    "constructs": {
        "interfaces": [
            {"name": "BaseComponentProps", "line": 16, "type": "interface"},
            {"name": "ButtonAtomicProps", "line": 26, "type": "interface"},
            {"name": "GlassCardProps", "line": 39, "type": "interface"},
            {"name": "HeaderAtomicProps", "line": 48, "type": "interface"},
            {"name": "GlooCanvasProps", "line": 90, "type": "interface"},
            {"name": "GlooGlobalProps", "line": 115, "type": "interface"},
            {"name": "NavigationItem", "line": 130, "type": "interface"},
            {"name": "NavigationProps", "line": 140, "type": "interface"},
            {"name": "GSPurchaseStoreProps", "line": 153, "type": "interface"},
            {"name": "ProfileComponentProps", "line": 162, "type": "interface"},
            {"name": "CommunityCardProps", "line": 171, "type": "interface"},
            {"name": "LeaderboardProps", "line": 180, "type": "interface"},
            {"name": "AchievementDisplayProps", "line": 189, "type": "interface"},
            {"name": "HeroTextProps", "line": 199, "type": "interface"},
            {"name": "FormProps", "line": 209, "type": "interface"},
            {"name": "FormFieldProps", "line": 218, "type": "interface"},
            {"name": "ModalProps", "line": 228, "type": "interface"},
            {"name": "ComponentState", "line": 270, "type": "interface"},
            {"name": "ComponentRegistryItem", "line": 297, "type": "interface"},
            {"name": "ComponentRegistryFilter", "line": 308, "type": "interface"},
            {"name": "ThemeConfig", "line": 317, "type": "interface"},
            {"name": "ThemeContextValue", "line": 330, "type": "interface"},
            {"name": "PerformanceMetrics", "line": 338, "type": "interface"},
            {"name": "OptimizationConfig", "line": 345, "type": "interface"}
        ],
        "types": [
            {"name": "GlooPaletteStrategy", "line": 59, "type": "type"},
            {"name": "GlooThemeMode", "line": 71, "type": "type"},
            {"name": "GlooEffectName", "line": 73, "type": "type"},
            {"name": "SizeVariant", "line": 242, "type": "type"},
            {"name": "ColorVariant", "line": 245, "type": "type"},
            {"name": "VisualVariant", "line": 255, "type": "type"},
            {"name": "LoadingState", "line": 258, "type": "type"},
            {"name": "AnimationDirection", "line": 261, "type": "type"},
            {"name": "PolymorphicProps<T", "line": 264, "type": "type"},
            {"name": "ClickHandler", "line": 281, "type": "type"},
            {"name": "ChangeHandler<T", "line": 282, "type": "type"},
            {"name": "SubmitHandler<T", "line": 283, "type": "type"},
            {"name": "RenderProp<T>", "line": 286, "type": "type"},
            {"name": "ChildrenRenderProp<T>", "line": 287, "type": "type"},
            {"name": "ForwardedRef<T>", "line": 290, "type": "type"},
            {"name": "ComponentWithRef<T,", "line": 291, "type": "type"}
        ],
        "schemas": [

        ]
    }
},
    "repository": {
  "url": "https://github.com/BarreraSlzr/internetfriends-workspace",
  "type": "private",
  "commit": "5d05e08307cea4aa99bf92dd58d948d5e89cdebc",
  "branch": "epic/git-sourced-documentation-v1"
},
    "generated_at": "2025-08-17T18:31:56Z"
}
```

## TypeScript Definitions with Line Numbers

```typescript
     1	// InternetFriends Component-Specific Types
     2	// Type definitions for component props, organized by component category
     3	
     4	import { ReactNode, ElementType, ComponentProps } from "react"
     5	import type { 
     6	  FriendsProfile, 
     7	  Community, 
     8	  CommunityInvite, 
     9	  Achievement, 
    10	  GSPurchaseTier,
    11	  PaymentProvider,
    12	  GLevelTier 
    13	} from './data'
    14	
    15	// === Base Component Props ===
    16	export interface BaseComponentProps {
    17	  className?: string
    18	  "data-testid"?: string
    19	  children?: ReactNode
    20	  id?: string
    21	}
    22	
    23	// === Atomic Component Types ===
    24	
    25	// Button Component
    26	export interface ButtonAtomicProps extends BaseComponentProps {
    27	  variant?: "primary" | "secondary" | "outline" | "ghost" | "link"
    28	  size?: "xs" | "sm" | "md" | "lg" | "xl"
    29	  loading?: boolean
    30	  disabled?: boolean
    31	  fullWidth?: boolean
    32	  startIcon?: ReactNode
    33	  endIcon?: ReactNode
    34	  type?: "button" | "submit" | "reset"
    35	  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
    36	}
    37	
    38	// Glass Card Component
    39	export interface GlassCardProps extends BaseComponentProps {
    40	  variant?: "default" | "outlined" | "elevated" | "glass"
    41	  padding?: "xs" | "sm" | "md" | "lg" | "xl"
    42	  radius?: "xs" | "sm" | "md" | "lg" | "xl"
    43	  interactive?: boolean
    44	  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
    45	}
    46	
    47	// Header Component
    48	export interface HeaderAtomicProps extends BaseComponentProps {
    49	  variant?: "default" | "transparent" | "glass"
    50	  sticky?: boolean
```

---
*Private repository access required for GitHub links.*
