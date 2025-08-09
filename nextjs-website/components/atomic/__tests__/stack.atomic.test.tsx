/**
 * @file stack.atomic.test.tsx
 * Tests for StackAtomic layout primitive & helper components.
 *
 * Epic: component-architecture-v1 (feature: atomic-foundation)
 *
 * Coverage Goals:
 *  - Rendering & data attributes
 *  - Direction, gap, alignment, justify props
 *  - Divider interleaving (boolean + custom node)
 *  - HStack / VStack convenience wrappers
 *  - Responsive override class emission
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  StackAtomic,
  HStack,
  VStack,
  type StackProps,
} from "@/components/atomic/stack";

// Utility: render helper with minimal boilerplate
const renderStack = (ui: React.ReactElement) => render(ui);

describe("StackAtomic", () => {
  test("renders children and default attributes", () => {
    renderStack(
      <StackAtomic data-testid="stack">
        <span>One</span>
        <span>Two</span>
      </StackAtomic>,
    );
    const el = screen.getByTestId("stack");
    expect(el).toBeInTheDocument();
    // Defaults from component: direction=column, gap=md, align=stretch, justify=start
    expect(el).toHaveAttribute("data-direction", "column");
    expect(el).toHaveAttribute("data-gap", "md");
    expect(el).toHaveAttribute("data-align", "stretch");
    expect(el).toHaveAttribute("data-justify", "start");
    // Tailwind gap for md => gap-3
    expect(el.className).toMatch(/gap-3/);
    // Direction column => flex-col
    expect(el.className).toMatch(/flex-col/);
  });

  test("applies row direction, alignment and justification classes", () => {
    renderStack(
      <StackAtomic
        data-testid="stack-row"
        direction="row"
        gap="lg"
        align="center"
        justify="between"
      >
        <div>A</div>
        <div>B</div>
      </StackAtomic>,
    );
    const el = screen.getByTestId("stack-row");
    expect(el).toHaveAttribute("data-direction", "row");
    expect(el.className).toMatch(/flex-row/);
    expect(el).toHaveAttribute("data-gap", "lg");
    // gap lg => gap-4
    expect(el.className).toMatch(/gap-4/);
    // Alignment & justification classes
    expect(el.className).toMatch(/items-center/);
    expect(el.className).toMatch(/justify-between/);
  });

  test("interleaves default dividers when divider=true", () => {
    renderStack(
      <VStack data-testid="stack-dividers" divider>
        <span>1</span>
        <span>2</span>
        <span>3</span>
      </VStack>,
    );
    const el = screen.getByTestId("stack-dividers");
    // Children nodes = original children + divider wrappers
    // Expect pattern: child, divider, child, divider, child => length = 5
    expect(el.childNodes.length).toBe(5);
  });

  test("uses custom divider node when provided", () => {
    const CustomDivider = () => <span data-testid="custom-divider">|</span>;
    renderStack(
      <StackAtomic data-testid="stack-custom-divider" divider={<CustomDivider />}>
        <span>A</span>
        <span>B</span>
      </StackAtomic>,
    );
    const el = screen.getByTestId("stack-custom-divider");
    // Two children + one divider wrapper => length 3
    expect(el.childNodes.length).toBe(3);
    // Ensure our custom divider rendered inside wrapper
    expect(screen.getByTestId("custom-divider")).toBeInTheDocument();
  });

  test("HStack helper enforces row direction", () => {
    renderStack(
      <HStack data-testid="hstack" gap="xs">
        <span>One</span>
        <span>Two</span>
      </HStack>,
    );
    const el = screen.getByTestId("hstack");
    expect(el).toHaveAttribute("data-direction", "row");
    expect(el.className).toMatch(/flex-row/);
    // gap xs => gap-1
    expect(el.className).toMatch(/gap-1/);
  });

  test("VStack helper enforces column direction", () => {
    renderStack(
      <VStack data-testid="vstack" gap="xl">
        <span>One</span>
        <span>Two</span>
      </VStack>,
    );
    const el = screen.getByTestId("vstack");
    expect(el).toHaveAttribute("data-direction", "column");
    expect(el.className).toMatch(/flex-col/);
    // gap xl => gap-6
    expect(el.className).toMatch(/gap-6/);
  });

  test("applies responsive override classes", () => {
    renderStack(
      <StackAtomic
        data-testid="stack-responsive"
        direction="column"
        responsive={{
          md: { direction: "row", gap: "lg", align: "center" },
        }}
      >
        <span>Alpha</span>
        <span>Beta</span>
      </StackAtomic>,
    );
    const el = screen.getByTestId("stack-responsive");
    // Responsive classes should be present in className string
    expect(el.className).toMatch(/md:flex-row/);
    expect(el.className).toMatch(/md:gap-4/); // gap lg => gap-4
    expect(el.className).toMatch(/md:items-center/);
  });

  test("honors inline + fullWidth + wrap flags", () => {
    renderStack(
      <StackAtomic
        data-testid="stack-flags"
        inline
        fullWidth
        wrap
        direction="row"
      >
        <span>A</span>
        <span>B</span>
      </StackAtomic>,
    );
    const el = screen.getByTestId("stack-flags");
    expect(el.className).toMatch(/inline-flex/);
    expect(el.className).toMatch(/w-full/);
    expect(el.className).toMatch(/flex-wrap/);
  });

  test("allows overriding rendered element via 'as'", () => {
    renderStack(
      <StackAtomic as="section" data-testid="stack-section">
        <span>Content</span>
      </StackAtomic>,
    );
    const el = screen.getByTestId("stack-section");
    expect(el.tagName.toLowerCase()).toBe("section");
  });

  test("isStable: deterministic class list for identical props", () => {
    const props: StackProps = {
      direction: "row",
      gap: "md",
      align: "center",
      justify: "around",
      wrap: false,
      inline: false,
      fullWidth: true,
      "data-testid": "stable",
    };
    const { rerender } = renderStack(
      <StackAtomic {...props}>
        <span>1</span>
        <span>2</span>
      </StackAtomic>,
    );
    const first = screen.getByTestId("stable").className;
    rerender(
      <StackAtomic {...props}>
        <span>1</span>
        <span>2</span>
      </StackAtomic>,
    );
    const second = screen.getByTestId("stable").className;
    expect(second).toBe(first);
  });
});
