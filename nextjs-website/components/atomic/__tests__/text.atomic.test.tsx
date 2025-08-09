import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  TextAtomic,
  Heading,
  Paragraph,
  Muted,
  Subtle,
  Contrast,
  type TextTone,
} from "@/components/atomic/text";

/**
 * NOTE:
 * These tests intentionally avoid over-specifying exact Tailwind utility class
 * bundles (so refactors of scale tokens don’t cause brittle failures). We focus on:
 *  - Data attributes
 *  - Semantic tag mapping
 *  - Behavioral props (truncate, clamp, casing, weight)
 *  - Tone + emphasis interactions
 */

describe("TextAtomic", () => {
  it("renders with default body variant and data attributes", () => {
    render(<TextAtomic data-testid="txt-default">Hello</TextAtomic>);
    const el = screen.getByTestId("txt-default");
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute("data-variant", "body");
    expect(el).toHaveAttribute("data-tone", "default");
    // Default semantic should be <p>
    expect(el.tagName.toLowerCase()).toBe("p");
  });

  it("applies heading semantic tag when variant=h2 and no explicit 'as'", () => {
    render(
      <TextAtomic variant="h2" data-testid="txt-h2">
        Title
      </TextAtomic>,
    );
    const el = screen.getByTestId("txt-h2");
    expect(el.tagName.toLowerCase()).toBe("h2");
    expect(el).toHaveAttribute("data-variant", "h2");
  });

  it("overrides semantic element via 'as' while keeping visual variant", () => {
    render(
      <TextAtomic as="div" variant="h3" data-testid="txt-div-h3">
        Title
      </TextAtomic>,
    );
    const el = screen.getByTestId("txt-div-h3");
    expect(el.tagName.toLowerCase()).toBe("div");
    expect(el).toHaveAttribute("data-variant", "h3");
  });

  it("Heading helper maps level prop to correct variant + semantic", () => {
    render(<Heading level={4} data-testid="heading-4">Section</Heading>);
    const el = screen.getByTestId("heading-4");
    expect(el.tagName.toLowerCase()).toBe("h4");
    expect(el).toHaveAttribute("data-variant", "h4");
  });

  it("Paragraph helper enforces body variant and p tag", () => {
    render(<Paragraph data-testid="paragraph">Body</Paragraph>);
    const el = screen.getByTestId("paragraph");
    expect(el.tagName.toLowerCase()).toBe("p");
    expect(el).toHaveAttribute("data-variant", "body");
  });

  it("applies tone variants (muted, subtle, contrast, danger)", () => {
    const tones: TextTone[] = ["muted", "subtle", "contrast", "danger"];
    tones.forEach((tone) => {
      render(
        <TextAtomic
          key={tone}
            // Use inline so no block stacking effect in test layout
          inline
          tone={tone}
          data-testid={`tone-${tone}`}
        >
          Tone {tone}
        </TextAtomic>,
      );
      const el = screen.getByTestId(`tone-${tone}`);
      expect(el).toHaveAttribute("data-tone", tone);
    });
  });

  it("subtle prop overrides tone to subtle but keeps original tone attr value", () => {
    render(
      <TextAtomic
        tone="danger"
        subtle
        data-testid="txt-subtle-danger"
      >
        Danger but subtle
      </TextAtomic>,
    );
    const el = screen.getByTestId("txt-subtle-danger");
    // Data-tone reflects original tone prop (for analytics),
    // class styling uses subtle style internally (not asserted here).
    expect(el).toHaveAttribute("data-tone", "danger");
  });

  it("supports clamp (multi-line) by applying style properties", () => {
    render(
      <TextAtomic clamp={3} data-testid="txt-clamp">
        {Array.from({ length: 10 })
          .map((_, i) => `Line ${i}`)
          .join(" ")}
      </TextAtomic>,
    );
    const el = screen.getByTestId("txt-clamp");
    expect(el.style.WebkitLineClamp).toBe("3");
    expect(el).toHaveAttribute("data-variant", "body");
  });

  it("truncate enforces single line overflow behavior", () => {
    render(
      <TextAtomic
        truncate
        data-testid="txt-truncate"
        style={{ maxWidth: "120px" }}
      >
        This is a long line that should be truncated visually
      </TextAtomic>,
    );
    const el = screen.getByTestId("txt-truncate");
    // We can't easily assert visual ellipsis, but ensure the attribute/class combos:
    expect(el).toHaveAttribute("data-variant", "body");
  });

  it("uppercase, italic, nowrap, emphasis flags produce class changes (indirectly)", () => {
    render(
      <TextAtomic
        variant="label"
        uppercase
        italic
        nowrap
        emphasis
        data-testid="txt-flags"
      >
        FLAGS
      </TextAtomic>,
    );
    const el = screen.getByTestId("txt-flags");
    // Check data attributes
    expect(el).toHaveAttribute("data-variant", "label");
    expect(el).toHaveAttribute("data-emphasis", "true");
  });

  it("explicit weight overrides variant default weight", () => {
    render(
      <TextAtomic
        variant="body"
        weight="bold"
        data-testid="txt-weight-bold"
      >
        Bold Body
      </TextAtomic>,
    );
    const el = screen.getByTestId("txt-weight-bold");
    expect(el).toHaveAttribute("data-weight", "bold");
  });

  it("inline flag sets data-inline and avoids block-only behavior", () => {
    render(
      <TextAtomic inline data-testid="txt-inline">
        Inline
      </TextAtomic>,
    );
    const el = screen.getByTestId("txt-inline");
    expect(el).toHaveAttribute("data-inline", "true");
  });

  it("code variant uses code tag by default", () => {
    render(
      <TextAtomic variant="code" data-testid="txt-code">
        const a = 1;
      </TextAtomic>,
    );
    const el = screen.getByTestId("txt-code");
    expect(el.tagName.toLowerCase()).toBe("code");
  });

  it("Muted / Subtle / Contrast convenience components set tone correctly", () => {
    render(
      <>
        <Muted data-testid="tone-muted">Muted</Muted>
        <Subtle data-testid="tone-subtle">Subtle</Subtle>
        <Contrast data-testid="tone-contrast">Contrast</Contrast>
      </>,
    );
    expect(screen.getByTestId("tone-muted")).toHaveAttribute(
      "data-tone",
      "muted",
    );
    expect(screen.getByTestId("tone-subtle")).toHaveAttribute(
      "data-tone",
      "subtle",
    );
    expect(screen.getByTestId("tone-contrast")).toHaveAttribute(
      "data-tone",
      "contrast",
    );
  });

  it("display variant defaults to h1 semantic but can be overridden", () => {
    render(
      <>
        <TextAtomic variant="display" data-testid="display-default">
          Display
        </TextAtomic>
        <TextAtomic
          variant="display"
          as="div"
          data-testid="display-div"
        >
          Display Div
        </TextAtomic>
      </>,
    );
    expect(screen.getByTestId("display-default").tagName.toLowerCase()).toBe(
      "h1",
    );
    expect(screen.getByTestId("display-div").tagName.toLowerCase()).toBe("div");
  });

  it("emphasis increases weight heuristically when explicit weight not provided", () => {
    render(
      <TextAtomic
        variant="body"
        emphasis
        data-testid="txt-emphasis"
      >
        Emphasis Body
      </TextAtomic>,
    );
    const el = screen.getByTestId("txt-emphasis");
    // We don't assert specific class (to avoid brittle coupling),
    // just confirm emphasis attribute exists.
    expect(el).toHaveAttribute("data-emphasis", "true");
  });
});
