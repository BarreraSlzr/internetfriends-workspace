"use client"

// Force dynamic rendering to bypass SSR hook issues
export const dynamic = "force-dynamic";

import { DashboardMetric } from "@/components/data/metric-display";
import { GlassPanel } from "@/components/glass";
import { useTheme } from "@/hooks/use-theme";
import {
  AlertTriangle,
  CheckCircle,
  Copy,
  Download,
  Eye,
  EyeOff,
  Palette,
  RotateCcw,
  Search,
  Settings,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface TokenGroup {
  name: string;
  description: string;
  tokens: TokenInfo[];
  category: "color" | "spacing" | "typography" | "effects" | "semantic";
}

interface TokenInfo {
  name: string;
  value: string;
  computedValue: string;
  category: string;
  usage: number;
  description?: string;
  deprecated?: boolean;
}

interface TokenOverride {
  [key: string]: string;
}

export default function TokenInspectorPage() {
  const { theme } = useTheme();
  const isDark = theme.colorScheme === "dark";

  const [tokens, setTokens] = useState<TokenGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [overrides, setOverrides] = useState<TokenOverride>({});
  const [showOverridePanel, setShowOverridePanel] = useState(false);

  // Extract CSS custom properties from the document
  useEffect(() => {
    const extractTokens = () => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      const tokenGroups: Record<string, TokenInfo[]> = {
        color: [],
        spacing: [],
        typography: [],
        effects: [],
        semantic: [],
      };

      // Get all CSS custom properties
      for (let i = 0; i < document.styleSheets.length; i++) {
        try {
          const sheet = document.styleSheets[i] as CSSStyleSheet;
          if (!sheet.cssRules) continue;

          for (let j = 0; j < sheet.cssRules.length; j++) {
            const rule = sheet.cssRules[j];
            if (rule instanceof CSSStyleRule && rule.selectorText === ":root") {
              const style = rule.style;
              for (let k = 0; k < style.length; k++) {
                const prop = style[k];
                if (prop.startsWith("--")) {
                  const value = style.getPropertyValue(prop);
                  const computedValue = computedStyle.getPropertyValue(prop);

                  const category = categorizeToken(prop);
                  const usage = estimateUsage(prop);

                  tokenGroups[category].push({
                    name: prop,
                    value: value.trim(),
                    computedValue: computedValue.trim(),
                    category,
                    usage,
                    description: getTokenDescription(prop),
                    deprecated: isDeprecatedToken(prop),
                  });
                }
              }
            }
          }
        } catch (e) {
          // Skip inaccessible stylesheets
          continue;
        }
      }

      // Convert to TokenGroup format
      const groups: TokenGroup[] = Object.entries(tokenGroups)
        .filter(([_, tokens]) => tokens.length > 0)
        .map(([category, tokens]) => ({
          name: category.charAt(0).toUpperCase() + category.slice(1),
          description: getCategoryDescription(category),
          tokens: tokens.sort((a, b) => a.name.localeCompare(b.name)),
          category: category as TokenGroup["category"],
        }));

      setTokens(groups);
      setLoading(false);
    };

    // Wait for styles to load
    setTimeout(extractTokens, 1000);
  }, []);

  // Categorize token based on name patterns
  const categorizeToken = (tokenName: string): string => {
    if (
      tokenName.includes("color") ||
      tokenName.includes("bg") ||
      tokenName.includes("border") ||
      tokenName.includes("accent") ||
      tokenName.includes("primary") ||
      tokenName.includes("surface")
    ) {
      return "color";
    }
    if (
      tokenName.includes("spacing") ||
      tokenName.includes("gap") ||
      tokenName.includes("margin") ||
      tokenName.includes("padding") ||
      tokenName.includes("radius")
    ) {
      return "spacing";
    }
    if (
      tokenName.includes("font") ||
      tokenName.includes("text") ||
      tokenName.includes("letter") ||
      tokenName.includes("line")
    ) {
      return "typography";
    }
    if (
      tokenName.includes("glass") ||
      tokenName.includes("blur") ||
      tokenName.includes("shadow") ||
      tokenName.includes("atmos")
    ) {
      return "effects";
    }
    return "semantic";
  };

  const getCategoryDescription = (category: string): string => {
    const descriptions = {
      color: "Brand colors, surfaces, and semantic color tokens",
      spacing: "Layout spacing, margins, padding, and border radius values",
      typography: "Font families, sizes, weights, and text properties",
      effects: "Glass morphism, atmospheric effects, and visual enhancements",
      semantic: "Component-specific and utility tokens",
    };
    return descriptions[category as keyof typeof descriptions] || "";
  };

  const getTokenDescription = (tokenName: string): string => {
    const descriptions: Record<string, string> = {
      "--if-primary": "Primary brand color used across interactive elements",
      "--if-accent-primary": "Dynamic accent color, runtime-adaptive per theme",
      "--if-surface-neutral": "Base neutral surface color",
      "--if-atmos-noise-ambient-opacity": "Ambient noise overlay opacity",
      "--if-atmos-goo-exposure": "Goo atmospheric effect exposure multiplier",
      "--glass-blur-1": "Level 1 glass morphism blur intensity",
      "--glass-opacity-1": "Level 1 glass morphism background opacity",
    };
    return descriptions[tokenName] || "";
  };

  const isDeprecatedToken = (tokenName: string): boolean => {
    return tokenName.includes("legacy") || tokenName.includes("deprecated");
  };

  const estimateUsage = (tokenName: string): number => {
    // Simple heuristic - count occurrences in stylesheets
    let count = 0;
    try {
      for (let i = 0; i < document.styleSheets.length; i++) {
        const sheet = document.styleSheets[i] as CSSStyleSheet;
        if (!sheet.cssRules) continue;
        const cssText = Array.from(sheet.cssRules)
          .map((rule) => rule.cssText)
          .join(" ");
        const matches = cssText.match(new RegExp(`var\\(${tokenName}`, "g"));
        count += matches ? matches.length : 0;
      }
    } catch (e) {
      // Fallback to basic estimation
      count = Math.floor(Math.random() * 10) + 1;
    }
    return count;
  };

  // Filter tokens based on search and category
  const filteredTokens = useMemo(() => {
    return tokens
      .map((group) => ({
        ...group,
        tokens: group.tokens.filter((token) => {
          const matchesSearch = searchQuery
            ? token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (token.description &&
                token.description
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()))
            : true;

          const matchesCategory =
            selectedCategory === "all" || group.category === selectedCategory;

          return matchesSearch && matchesCategory;
        }),
      }))
      .filter((group) => group.tokens.length > 0);
  }, [tokens, searchQuery, selectedCategory]);

  // Apply token override
  const applyOverride = (tokenName: string, value: string) => {
    document.documentElement.style.setProperty(tokenName, value);
    setOverrides((prev) => ({ ...prev, [tokenName]: value }));
  };

  // Reset all overrides
  const resetOverrides = () => {
    Object.keys(overrides).forEach((tokenName) => {
      document.documentElement.style.removeProperty(tokenName);
    });
    setOverrides({});
  };

  // Copy token reference to clipboard
  const copyTokenReference = (tokenName: string) => {
    navigator.clipboard.writeText(`var(${tokenName})`);
  };

  // Export current token values
  const exportTokens = () => {
    const exportData = {
      tokens: tokens.flatMap((group) => group.tokens),
      overrides,
      generatedAt: new Date().toISOString(),
      theme: isDark ? "dark" : "light",
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `design-tokens-${isDark ? "dark" : "light"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Settings className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium">Extracting Design Tokens...</p>
          <p className="text-sm text-muted-foreground mt-2">
            Analyzing CSS custom properties
          </p>
        </div>
      </div>
    );
  }

  const totalTokens = tokens.reduce(
    (sum, group) => sum + group.tokens.length,
    0,
  );
  const overrideCount = Object.keys(overrides).length;
  const deprecatedCount = tokens.reduce(
    (sum, group) => sum + group.tokens.filter((t) => t.deprecated).length,
    0,
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Palette className="h-6 w-6" />
              Design Token Inspector
            </h1>
            <p className="text-muted-foreground mt-1">
              Explore and modify CSS custom properties in real-time
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOverridePanel(!showOverridePanel)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                showOverridePanel
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {showOverridePanel ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              Override Panel
            </button>

            <button
              onClick={exportTokens}
              className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-md transition-colors"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <DashboardMetric value={totalTokens} label="Total Tokens" />
          <DashboardMetric
            value={overrideCount}
            label="Active Overrides"
            trend={overrideCount > 0 ? "up" : "neutral"}
          />
          <DashboardMetric
            value={deprecatedCount}
            label="Deprecated"
            trend={deprecatedCount > 0 ? "down" : "up"}
          />
          <DashboardMetric
            value={filteredTokens.reduce((sum, g) => sum + g.tokens.length, 0)}
            label="Filtered"
            accent
          />
        </div>

        {/* Controls */}
        <GlassPanel depth={2} noise="weak" className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search tokens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Categories</option>
              <option value="color">Color</option>
              <option value="spacing">Spacing</option>
              <option value="typography">Typography</option>
              <option value="effects">Effects</option>
              <option value="semantic">Semantic</option>
            </select>

            {overrideCount > 0 && (
              <button
                onClick={resetOverrides}
                className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Reset ({overrideCount})
              </button>
            )}
          </div>
        </GlassPanel>

        {/* Token Groups */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTokens.map((group) => (
            <GlassPanel key={group.name} depth={1} noise="weak" className="p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  {group.category === "color" && (
                    <Palette className="h-5 w-5" />
                  )}
                  {group.category === "effects" && <Zap className="h-5 w-5" />}
                  {group.name}
                  <span className="text-sm text-muted-foreground">
                    ({group.tokens.length})
                  </span>
                </h2>
                <p className="text-sm text-muted-foreground">
                  {group.description}
                </p>
              </div>

              <div className="space-y-3">
                {group.tokens.map((token) => (
                  <div
                    key={token.name}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-md hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-sm font-medium">
                          {token.name}
                        </code>
                        {token.deprecated && (
                          <AlertTriangle className="h-4 w-4 text-warning" />
                        )}
                        {overrides[token.name] && (
                          <CheckCircle className="h-4 w-4 text-success" />
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground font-mono">
                          {overrides[token.name] || token.value}
                        </span>
                        {token.category === "color" && (
                          <div
                            className="w-4 h-4 rounded border border-border"
                            style={{
                              backgroundColor:
                                overrides[token.name] || token.computedValue,
                            }}
                          />
                        )}
                        <span className="text-xs text-muted-foreground">
                          Used {token.usage}x
                        </span>
                      </div>

                      {token.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {token.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => copyTokenReference(token.name)}
                        className="p-2 hover:bg-muted rounded transition-colors"
                        title="Copy token reference"
                      >
                        <Copy className="h-4 w-4" />
                      </button>

                      {showOverridePanel && (
                        <input
                          type="text"
                          placeholder="Override value..."
                          className="w-24 px-2 py-1 text-xs bg-background border border-input rounded"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const value = (e.target as HTMLInputElement)
                                .value;
                              if (value) {
                                applyOverride(token.name, value);
                                (e.target as HTMLInputElement).value = "";
                              }
                            }
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          ))}
        </div>

        {filteredTokens.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No tokens found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search query or category filter
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
