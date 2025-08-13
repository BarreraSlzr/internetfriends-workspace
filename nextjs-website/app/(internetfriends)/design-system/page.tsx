"use client";

import React, { useState } from "react";
import { ButtonAtomic } from "@/components/atomic/button/button.atomic";
import { GlassCardAtomic } from "@/components/atomic/glass-card/glass-card.atomic";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  TestTube,
  Eye,
  EyeOff,
} from "lucide-react";

interface ComponentShowcaseProps {
  id: string;
  name: string;
  category: "atomic" | "molecular" | "organism";
  testStatus: "passing" | "warning" | "failing";
  usageCount: number;
  description: string;
  variants?: Array<{ name: string; props: Record<string, any> }>;
  component?: React.ComponentType<any>;
  defaultProps?: Record<string, any>;
}

const COMPONENTS: ComponentShowcaseProps[] = [
  {
    id: "button-atomic",
    name: "ButtonAtomic",
    category: "atomic",
    testStatus: "passing",
    usageCount: 42,
    description:
      "InternetFriends styled button with multiple variants, loading states, and icon support",
    component: ButtonAtomic,
    defaultProps: { children: "Primary" },
    variants: [
      { name: "Primary", props: { variant: "primary", children: "Primary" } },
      { name: "Glass", props: { variant: "glass", children: "Glass" } },
      { name: "Outline", props: { variant: "outline", children: "Outline" } },
      { name: "Ghost", props: { variant: "ghost", children: "Ghost" } },
    ],
  },
  {
    id: "glass-card-atomic",
    name: "GlassCardAtomic",
    category: "atomic",
    testStatus: "passing",
    usageCount: 28,
    description:
      "Glass morphism card component with multiple variants and animation support",
    component: GlassCardAtomic,
    defaultProps: { children: "Glass Card Content" },
    variants: [
      {
        name: "Default Card",
        props: { variant: "default", children: "Default Card" },
      },
      {
        name: "Elevated Card",
        props: { variant: "elevated", children: "Elevated Card" },
      },
      {
        name: "Subtle Card",
        props: { variant: "subtle", children: "Subtle Card" },
      },
      {
        name: "Primary Card",
        props: { variant: "primary", children: "Primary Card" },
      },
    ],
  },
  {
    id: "navigation-molecular",
    name: "NavigationMolecular",
    category: "molecular",
    testStatus: "warning",
    usageCount: 5,
    description:
      "Complete navigation component with mobile menu, dropdowns, and glass morphism",
  },
];

function ComponentNode({ data }: { data: ComponentShowcaseProps }) {
  const [showPreview, setShowPreview] = useState(false);

  const getTestStatusIcon = (status: string) => {
    switch (status) {
      case "passing":
        return (
          <CheckCircle
            className="h-4 w-4 text-green-600"
            data-testid="check-circle"
          />
        );
      case "warning":
        return (
          <AlertTriangle
            className="h-4 w-4 text-yellow-600"
            data-testid="alert-triangle"
          />
        );
      case "failing":
        return (
          <XCircle className="h-4 w-4 text-red-600" data-testid="x-circle" />
        );
      default:
        return <TestTube className="h-4 w-4 text-gray-400" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "atomic":
        return "border-blue-300 bg-blue-50";
      case "molecular":
        return "border-green-300 bg-green-50";
      case "organism":
        return "border-purple-300 bg-purple-50";
      default:
        return "border-gray-300 bg-gray-50";
    }
  };

  const LiveComponentPreview = () => {
    if (!data.component || !showPreview) return null;

    const Component = data.component;
    const props = data.defaultProps || {};

    try {
      return (
        <div className="mt-4 p-4 bg-white border rounded-md">
          <div className="mb-2 text-sm font-medium text-gray-700">
            Live Preview:
          </div>
          <div className="mb-3">
            <Component {...props} />
          </div>

          {data.variants && data.variants.length > 0 && (
            <div className="mt-3">
              <div className="mb-2 text-xs text-gray-600">Variants:</div>
              <div className="grid grid-cols-2 gap-2">
                {data.variants.map((variant, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded">
                    <div className="text-xs mb-1 font-mono">{variant.name}</div>
                    <Component {...props} {...variant.props} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    } catch (error) {
      return (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
          <span className="text-sm text-red-600">Preview failed to render</span>
        </div>
      );
    }
  };

  return (
    <div
      data-id={data.id}
      data-category={data.category}
      className={`
        p-4 border-2 rounded-lg ${getCategoryColor(data.category)} 
        hover:shadow-md transition-all duration-200 mb-4 max-w-md
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-lg">{data.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-600 capitalize">
              {data.category}
            </span>
            {getTestStatusIcon(data.testStatus)}
            <span className="text-sm text-gray-500">
              {data.usageCount} uses
            </span>
          </div>
        </div>

        {data.component && (
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title={showPreview ? "Hide preview" : "Show preview"}
          >
            {showPreview ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      <p className="text-sm text-gray-700 mb-3">{data.description}</p>

      <LiveComponentPreview />
    </div>
  );
}

export default function DesignSystemPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredComponents = COMPONENTS.filter((comp) => {
    const matchesSearch = searchQuery
      ? comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesCategory =
      selectedCategory === "all" || comp.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const totalComponents = COMPONENTS.length;
  const passingTests = COMPONENTS.filter(
    (c) => c.testStatus === "passing",
  ).length;
  const testCoverage =
    totalComponents > 0
      ? Math.round((passingTests / totalComponents) * 100)
      : 0;

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            InternetFriends Design System
          </h1>
          <p className="text-gray-600">
            Visual component architecture and live showcase
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-white border rounded-lg">
            <div className="text-2xl font-bold">{totalComponents}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="p-4 bg-white border rounded-lg">
            <div className="text-2xl font-bold">
              {COMPONENTS.filter((c) => c.category === "atomic").length}
            </div>
            <div className="text-sm text-gray-600">Atomic</div>
          </div>
          <div className="p-4 bg-white border rounded-lg">
            <div className="text-2xl font-bold">{testCoverage}%</div>
            <div className="text-sm text-gray-600">Test Coverage</div>
          </div>
          <div className="p-4 bg-white border rounded-lg">
            <div className="text-2xl font-bold">{passingTests}</div>
            <div className="text-sm text-gray-600">Passing Tests</div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-8 p-4 bg-white border rounded-lg">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search components, hooks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="atomic">Atomic</option>
              <option value="molecular">Molecular</option>
              <option value="organism">Organism</option>
            </select>
          </div>
        </div>

        {/* Component Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComponents.map((component) => (
            <ComponentNode key={component.id} data={component} />
          ))}
        </div>

        {filteredComponents.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No components found</h3>
            <p className="text-gray-600">
              Try adjusting your search query or category filter
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
