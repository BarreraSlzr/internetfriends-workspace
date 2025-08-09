/**
 * typography.integration.test.tsx
 * Integration-oriented smoke tests ensuring TextAtomic is properly
 * composed inside higher-level organisms (AnalyticsOrganism & DataTableOrganism).
 *
 * Scope:
 *  - Verifies organism-level render does not regress TextAtomic usage.
 *  - Confirms expected data-testid anchors & data attributes exist.
 *  - Light behavioral checks (no deep logic duplication).
 *
 * NOTE:
 *  These are intentionally non-brittle. They avoid snapshotting full className
 *  strings so internal utility refactors won't cause churn.
 *
 * Epic: component-architecture-v1
 * Feature: typography-foundation
 */
import React from "react";
import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";

// Atoms
import { TextAtomic } from "@/components/atomic/text";

// Organisms (paths rely on TS path aliases / Next.js config)
import { AnalyticsOrganism } from "@/app/(internetfriends)/components/organism/analytics/analytics.organism";
import { DataTableOrganism } from "@/app/(internetfriends)/components/organism/data-table/data-table.organism";

// Utility: create minimal table data
function buildTableFixture(rowCount = 3) {
  const columns = [
    {
      key: "id",
      header: "ID",
      type: "text" as const,
      sortable: true,
      filterable: true,
      align: "left" as const,
    },
    {
      key: "name",
      header: "Name",
      type: "text" as const,
      sortable: true,
      filterable: true,
      align: "left" as const,
    },
  ];

  const data = Array.from({ length: rowCount }).map((_, i) => ({
    id: `row-${i + 1}`,
    name: `Item ${i + 1}`,
  }));

  return { columns, data };
}

describe("Typography Integration (AnalyticsOrganism)", () => {
  it("renders analytics title using TextAtomic with expected attributes", () => {
    render(
      <AnalyticsOrganism
        title="Analytics Overview"
        showKPIs={false}
        showCharts={false}
        showInsights={false}
      />,
    );

    const title = screen.getByTestId("analytics-title");
    expect(title).toBeInTheDocument();
    expect(title).toHaveAttribute("data-variant", "h2");
    expect(title).toHaveAttribute("data-tone", "contrast");
  });

  it("renders section heading variants when KPIs are enabled", () => {
    render(
      <AnalyticsOrganism
        title="A11y Analytics"
        showKPIs
        showCharts={false}
        showInsights={false}
      />,
    );

    const kpiHeading = screen.getByTestId("section-kpis-title");
    expect(kpiHeading).toBeInTheDocument();
    expect(kpiHeading).toHaveAttribute("data-variant", "h4");
  });

  it("renders insight section heading when insights are enabled", () => {
    render(
      <AnalyticsOrganism
        title="Insights Analytics"
        showKPIs={false}
        showCharts={false}
        showInsights
      />,
    );

    const insightsHeading = screen.getByTestId("section-insights-title");
    expect(insightsHeading).toBeInTheDocument();
    expect(insightsHeading).toHaveAttribute("data-variant", "h5");
  });

  it("renders KPI card text atoms (title/value/change) when KPIs shown", () => {
    render(
      <AnalyticsOrganism
        title="KPI Check"
        showKPIs
        showCharts={false}
        showInsights={false}
      />,
    );

    // Wait for KPI mock data (initial load is synchronous after simulated timeout)
    const kpiTitle = screen.getAllByTestId("kpi-title")[0];
    const kpiValue = screen.getAllByTestId("kpi-value")[0];
    const kpiChange = screen.getAllByTestId("kpi-change")[0];

    expect(kpiTitle).toHaveAttribute("data-variant", "label");
    expect(kpiValue).toHaveAttribute("data-variant", "h4");
    expect(kpiChange).toHaveAttribute("data-variant", "micro");
  });
});

describe("Typography Integration (DataTableOrganism)", () => {
  it("renders header cells using TextAtomic labels", () => {
    const { data, columns } = buildTableFixture(2);

    render(
      <DataTableOrganism
        data={data}
        columns={columns as any}
        paginated={false}
        zebra={false}
        stickyHeader={false}
        searchable={false}
        exportable={false}
        sortable
        filterable={false}
      />,
    );

    const headerTexts = screen.getAllByTestId("table-header-text");
    expect(headerTexts.length).toBe(columns.length);
    headerTexts.forEach((el, idx) => {
      expect(el).toHaveTextContent(columns[idx].header);
      expect(el).toHaveAttribute("data-variant", "label-sm");
    });
  });

  it("renders selection count text using micro variant when rows are selected", () => {
    const { data, columns } = buildTableFixture(3);

    render(
      <DataTableOrganism
        data={data}
        columns={columns as any}
        selectable
        paginated={false}
        zebra={false}
        stickyHeader={false}
        searchable={false}
        exportable={false}
        sortable={false}
        filterable={false}
        showRowNumbers
      />,
    );

    // Select first row
    const firstCheckbox = screen.getAllByRole("checkbox")[0];
    firstCheckbox.click();

    const selectionCount = screen.getByTestId("table-selection-count");
    expect(selectionCount).toHaveAttribute("data-variant", "micro");
    expect(selectionCount).toHaveTextContent("1 selected");
  });

  it("shows empty state micro text when there are no rows", () => {
    const { columns } = buildTableFixture(0);

    render(
      <DataTableOrganism
        data={[]}
        columns={columns as any}
        paginated={false}
        zebra={false}
        stickyHeader={false}
        searchable={false}
        exportable={false}
        sortable={false}
        filterable={false}
      />,
    );

    const empty = screen.getByTestId("table-empty-text");
    expect(empty).toHaveAttribute("data-variant", "micro");
    expect(empty).toHaveAttribute("data-tone", "subtle");
    expect(empty).toHaveTextContent(/No data/i);
  });
});

describe("TextAtomic direct usage sanity", () => {
  it("renders basic body variant by default", () => {
    render(<TextAtomic data-testid="plain-text">Plain</TextAtomic>);
    const el = screen.getByTestId("plain-text");
    expect(el).toHaveAttribute("data-variant", "body");
    expect(el.tagName.toLowerCase()).toBe("p");
  });

  it("applies truncate and clamp attributes without breaking data markers", () => {
    render(
      <div>
        <TextAtomic data-testid="truncate" truncate>
          Very long text should be truncated
        </TextAtomic>
        <TextAtomic data-testid="clamp" clamp={2}>
          {Array.from({ length: 10 })
            .map((_, i) => `Sentence ${i + 1}.`)
            .join(" ")}
        </TextAtomic>
      </div>,
    );

    const trunc = screen.getByTestId("truncate");
    const clamp = screen.getByTestId("clamp");
    expect(trunc).toHaveAttribute("data-variant", "body");
    expect(clamp).toHaveAttribute("data-variant", "body");
  });
});
