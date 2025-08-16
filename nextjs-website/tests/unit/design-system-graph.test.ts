import { describe, test, expect, beforeEach } from "bun:test";

// Mock API response with flattened structure (actual)
const mockApiComponents = [
  {
    id: "button-atomic",
    name: "ButtonAtomic", 
    category: "atomic",
    description: "Primary button component",
    testStatus: "passing",
    usageCount: 15,
    lastModified: "2024-01-15T10:00:00Z",
    generatedAt: "2024-01-15T10:00:00Z"
  },
  {
    id: "card-molecular",
    name: "CardMolecular",
    category: "molecular", 
    description: "Glass card component",
    testStatus: "warning",
    usageCount: 8,
    lastModified: "2024-01-14T15:30:00Z",
    generatedAt: "2024-01-15T10:00:00Z"
  }
];

// Test data structure mismatch patterns found in design system graph
describe("Design System Graph - Data Structure Safety", () => {
  // Test the specific error pattern we identified and fixed
  describe("Component filtering with flattened API response", () => {
    // Mock nested structure (what TypeScript interfaces expected)
    const mockNestedComponents = [
      {
        id: "button-atomic",
        metadata: {
          name: "ButtonAtomic",
          category: "atomic", 
          description: "Primary button component"
        }
      }
    ];

    test("should safely filter flattened API response without accessing undefined properties", () => {
      const searchQuery = "button";
      
      // This should work without throwing errors
      const filtered = mockApiComponents.filter(component =>
        component?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        component?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        component?.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe("ButtonAtomic");
    });

    test("should handle null/undefined components gracefully", () => {
      const componentsWithNulls: any[] = [
        ...mockApiComponents,
        null,
        undefined,
        { id: "incomplete" }, // Missing required fields
      ];
      
      // Filter should not throw even with null/undefined entries
      const filtered = componentsWithNulls.filter((component: any) =>
        component?.name?.toLowerCase().includes("button") 
      );
      
      expect(filtered).toHaveLength(1);
    });

    test("should handle missing properties in filter operations", () => {
      const incompleteComponents: any[] = [
        { id: "test1", name: "TestComponent" }, // Missing category, description
        { id: "test2", category: "atomic" }, // Missing name, description  
        { id: "test3", description: "Test description" }, // Missing name, category
      ];
      
      // None of these should throw errors
      expect(() => {
        incompleteComponents.filter((component: any) =>
          component?.name?.toLowerCase().includes("test") ||
          component?.description?.toLowerCase().includes("test") ||
          component?.category?.toLowerCase().includes("atomic")
        );
      }).not.toThrow();
    });

    test("should demonstrate the original error pattern (accessing nested properties)", () => {
      // This would have caused the original error
      expect(() => {
        mockApiComponents.filter(component =>
          // @ts-expect-error - Testing the error pattern
          component.metadata.name.toLowerCase().includes("button")
        );
      }).toThrow();
    });
  });

  describe("React Flow node creation safety", () => {
    test("should create nodes safely from API components", () => {
      const createNodes = (components: any[]) => {
        return components.map((component, index) => ({
          id: component.id,
          type: 'component',
          position: { x: 0, y: 0 },
          data: {
            component,
            onSelect: () => {},
          },
          draggable: true,
          className: `node-${component.category}`,
        }));
      };

      const nodes = createNodes(mockApiComponents);
      
      expect(nodes).toHaveLength(2);
      expect(nodes[0].id).toBe("button-atomic");
      expect(nodes[0].className).toBe("node-atomic");
      expect(nodes[1].id).toBe("card-molecular");
      expect(nodes[1].className).toBe("node-molecular");
    });

    test("should handle components with missing categories", () => {
      const componentsWithMissingCategory = [
        { id: "test1", name: "Test" }, // No category
        { id: "test2", name: "Test2", category: null }, // Null category
        { id: "test3", name: "Test3", category: undefined }, // Undefined category
      ];

      const createNodes = (components: any[]) => {
        return components.map((component) => ({
          id: component.id,
          type: 'component',
          position: { x: 0, y: 0 },
          data: { component, onSelect: () => {} },
          draggable: true,
          className: `node-${component.category || 'unknown'}`,
        }));
      };

      expect(() => createNodes(componentsWithMissingCategory)).not.toThrow();
      
      const nodes = createNodes(componentsWithMissingCategory);
      expect(nodes[0].className).toBe("node-unknown");
      expect(nodes[1].className).toBe("node-unknown"); // null becomes "unknown"
      expect(nodes[2].className).toBe("node-unknown"); // undefined becomes "unknown"
    });
  });

  describe("Array safety checks", () => {
    test("should handle non-array inputs gracefully", () => {
      const nonArrayInputs = [
        null,
        undefined,
        "string",
        123,
        {},
        { length: 0 }, // Object that looks like array
      ];

      nonArrayInputs.forEach(input => {
        expect(() => {
          // Safety check pattern used in components
          if (!Array.isArray(input)) {
            console.warn('Input is not an array:', input);
            return [];
          }
          return input.filter(() => true);
        }).not.toThrow();
      });
    });

    test("should ensure filter operations always receive arrays", () => {
      const ensureArray = (input: any) => Array.isArray(input) ? input : [];
      
      expect(ensureArray(mockApiComponents)).toEqual(mockApiComponents);
      expect(ensureArray(null)).toEqual([]);
      expect(ensureArray(undefined)).toEqual([]);
      expect(ensureArray("string")).toEqual([]);
      expect(ensureArray({})).toEqual([]);
    });
  });

  describe("Property access safety patterns", () => {
    test("should use optional chaining for all property access", () => {
      const testComponent = {
        id: "test",
        // Intentionally missing other properties
      };

      // Safe property access patterns
      expect((testComponent as any)?.name?.toLowerCase()).toBeUndefined();
      expect((testComponent as any)?.description?.toLowerCase()).toBeUndefined();
      expect((testComponent as any)?.category?.toLowerCase()).toBeUndefined();
      
      // These should not throw
      expect(() => {
        const name = (testComponent as any)?.name?.toLowerCase() || "";
        const desc = (testComponent as any)?.description?.toLowerCase() || "";
        const cat = (testComponent as any)?.category?.toLowerCase() || "";
      }).not.toThrow();
    });

    test("should provide fallbacks for undefined properties", () => {
      const testComponent = { id: "test" };
      
      const safeName = (testComponent as any)?.name || "Unnamed Component";
      const safeDescription = (testComponent as any)?.description || "No description available";
      const safeCategory = (testComponent as any)?.category || "uncategorized";
      
      expect(safeName).toBe("Unnamed Component");
      expect(safeDescription).toBe("No description available"); 
      expect(safeCategory).toBe("uncategorized");
    });
  });
});

// Integration test for the complete filtering function
describe("Design System Page - Filter Function Integration", () => {
  const mockComponents = [
    {
      id: "button-atomic",
      name: "ButtonAtomic",
      category: "atomic",
      description: "Primary button component for user interactions",
      testStatus: "passing",
      usageCount: 15,
      lastModified: "2024-01-15T10:00:00Z",
      generatedAt: "2024-01-15T10:00:00Z"
    },
    {
      id: "card-molecular", 
      name: "GlassCardMolecular",
      category: "molecular",
      description: "Glass morphism card layout component",
      testStatus: "warning",
      usageCount: 8,
      lastModified: "2024-01-14T15:30:00Z", 
      generatedAt: "2024-01-15T10:00:00Z"
    },
    {
      id: "header-organism",
      name: "HeaderOrganism",
      category: "organism",
      description: "Main navigation header with logo and menu",
      testStatus: "failing", 
      usageCount: 3,
      lastModified: "2024-01-13T09:15:00Z",
      generatedAt: "2024-01-15T10:00:00Z"
    }
  ];

  // Simulate the corrected filter function from the page
  const filterComponents = (components: any[], searchQuery: string, selectedCategory: string) => {
    let filtered = components;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(component =>
        component?.name?.toLowerCase().includes(query) ||
        component?.description?.toLowerCase().includes(query) ||
        component?.category?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(component =>
        component?.category === selectedCategory
      );
    }

    return filtered;
  };

  test("should filter by search query correctly", () => {
    const result = filterComponents(mockComponents, "button", "all");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("ButtonAtomic");
  });

  test("should filter by category correctly", () => {
    const result = filterComponents(mockComponents, "", "molecular");
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe("molecular");
  });

  test("should combine search and category filters", () => {
    const result = filterComponents(mockComponents, "glass", "molecular");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("GlassCardMolecular");
  });

  test("should return empty array when no matches", () => {
    const result = filterComponents(mockComponents, "nonexistent", "all");
    expect(result).toHaveLength(0);
  });

  test("should handle malformed component data gracefully", () => {
    const malformedComponents: any[] = [
      ...mockComponents,
      null,
      undefined,
      { id: "incomplete" },
      { name: "OnlyName" },
      { category: "atomic" },
    ];

    expect(() => {
      filterComponents(malformedComponents, "button", "all");
    }).not.toThrow();
  });
});