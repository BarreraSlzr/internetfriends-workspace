#!/usr/bin/env bun
/**
 * scaffold-component.ts
 * InternetFriends Component Scaffolder
 *
 * Purpose:
 *  - Rapidly scaffold Atomic / Molecular / Organism / Template level components
 *  - Enforce naming + directory conventions defined in project architecture
 *  - Optionally associate component with an epic via data attributes
 *
 * Usage:
 *  bun run scripts/scaffold-component.ts <level> <name> [--flags]
 *
 * Examples:
 *  bun run scripts/scaffold-component.ts atomic button
 *  bun run scripts/scaffold-component.ts molecular navigation
 *  bun run scripts/scaffold-component.ts organism header --epic=types-schemas-events-v1
 *  bun run scripts/scaffold-component.ts template landing.page
 *
 * Levels:
 *  - atomic        => components/atomic/<name>/<name>.atomic.tsx
 *  - molecular     => components/molecular/<name>/<name>.molecular.tsx
 *  - organism      => components/organisms/<name>/<name>.organism.tsx
 *  - template      => components/templates/<name>/<name>.template.tsx
 *
 * Flags:
 *  --force         Overwrite existing files (default: prevent overwrite)
 *  --dry-run       Show what would be written without creating files
 *  --epic=<name>   Set data-epic attribute on root element
 *  --phase=<phase> Set data-epic-phase (development|review|complete)
 *  --desc="..."    Provide component description (added to file header)
 *  --slots=a,b,c   Generate typed slot prop placeholders
 *  --style=glass   Preload style variant (glass | panel | minimal)
 *
 * Conventions:
 *  - Directory name == component slug (kebab or token chain)
 *  - File naming follows: <component>.<level>.tsx
 *  - SCSS module: <component>.styles.module.scss
 *  - Types file: types.ts (or <component>.types.ts in future)
 *  - Index barrel: re-exports component
 *
 * Exit Codes:
 *  0 success
 *  1 bad arguments
 *  2 already exists (and not forced)
 *  3 file system write error
 */

import * as fs from "fs";
import * as path from "path";

interface Options {
  level: string;
  name: string;
  force: boolean;
  dryRun: boolean;
  epic?: string;
  phase?: string;
  desc?: string;
  slots: string[];
  styleVariant: "glass" | "panel" | "minimal";
}

const VALID_LEVELS = ["atomic", "molecular", "organism", "template"];
const PHASES = ["development", "review", "complete"];
const STYLE_VARIANTS = ["glass", "panel", "minimal"];

function help() {
  console.log(`InternetFriends Component Scaffolder

Usage:
  bun run scripts/scaffold-component.ts <level> <name> [--flags]

Levels: atomic | molecular | organism | template

Flags:
  --force                Overwrite existing component directory
  --dry-run              Print planned output only
  --epic=<name>          Attach data-epic attribute
  --phase=<phase>        Epic phase (development|review|complete)
  --desc="text"          Description comment in component file
  --slots=slotA,slotB    Generate typed slot props
  --style=glass|panel|minimal  Style preset
  --help                 Show this help

Examples:
  bun run scripts/scaffold-component.ts atomic button
  bun run scripts/scaffold-component.ts organism header --epic=ui-architecture --phase=development
`);
}

function parseArgs(argv: string[]): Options | null {
  if (argv.includes("--help")) {
    help();
    return null;
  }

  const positional = argv.filter((a) => !a.startsWith("--"));
  const flags = argv.filter((a) => a.startsWith("--"));

  if (positional.length < 2) {
    console.error("ERROR: Must provide <level> and <name>.");
    help();
    return null;
  }

  const level = positional[0].toLowerCase();
  const name = positional[1];

  if (!VALID_LEVELS.includes(level)) {
    console.error(
      `ERROR: Invalid level '${level}'. Valid: ${VALID_LEVELS.join(", ")}`,
    );
    return null;
  }

  const opts: Options = {
    level,
    name,
    force: flags.includes("--force"),
    dryRun: flags.includes("--dry-run"),
    epic: extractFlagValue(flags, "epic"),
    phase: extractFlagValue(flags, "phase"),
    desc: extractFlagValue(flags, "desc") || "",
    slots: (extractFlagValue(flags, "slots") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    styleVariant:
      (extractFlagValue(flags, "style") as "glass" | "panel" | "minimal") ||
      "glass",
  };

  if (opts.phase && !PHASES.includes(opts.phase)) {
    console.error(
      `ERROR: Invalid phase '${opts.phase}'. Valid phases: ${PHASES.join(", ")}`,
    );
    return null;
  }

  if (!STYLE_VARIANTS.includes(opts.styleVariant)) {
    console.error(
      `ERROR: Invalid style variant '${opts.styleVariant}'. Options: ${STYLE_VARIANTS.join(", ")}`,
    );
    return null;
  }

  return opts;
}

function extractFlagValue(flags: string[], key: string): string | undefined {
  const prefix = `--${key}=`;
  const f = flags.find((f) => f.startsWith(prefix));
  return f ? f.slice(prefix.length) : undefined;
}

function resolveDirs(level: string): { baseDir: string; suffix: string } {
  switch (level) {
    case "atomic":
      return { baseDir: "components/atomic", suffix: "atomic" };
    case "molecular":
      return { baseDir: "components/molecular", suffix: "molecular" };
    case "organism":
      return { baseDir: "components/organisms", suffix: "organism" };
    case "template":
      return { baseDir: "components/templates", suffix: "template" };
    default:
      throw new Error("Unsupported level");
  }
}

function toPascal(s: string): string {
  return s
    .replace(/[-_.]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("");
}

function buildComponentTSX(opts: Options, suffix: string): string {
  const pascal = toPascal(opts.name);
  const compName = `${pascal}${capitalize(suffix)}`;
  const epicAttrs = opts.epic
    ? `data-epic="${opts.epic}"${opts.phase ? ` data-epic-phase="${opts.phase}"` : ""}`
    : "";
  const description = opts.desc || `${compName} component`;

  const slotInterface =
    opts.slots.length > 0
      ? `
export interface ${pascal}Slots {
${opts.slots.map((s) => `  ${s}?: React.ReactNode;`).join("\n")}
}
`
      : "";

  const slotDestructuring =
    opts.slots.length > 0
      ? `{ ${opts.slots.join(", ")}, children, className, epicName, epicPhase, ...rest }`
      : `{ children, className, epicName, epicPhase, ...rest }`;

  const slotRender =
    opts.slots.length > 0
      ? `
      {/* Slots */}
${opts.slots
  .map(
    (s) =>
      `      {${s} && <div data-slot="${s}" className={styles.slot}>${s}</div>}`,
  )
  .join("\n")}`
      : "";

  return `/**
 * ${description}
 * Level: ${opts.level}
 * Generated: ${new Date().toISOString()}
 * Style Variant: ${opts.styleVariant}
 */
import React from "react";
import styles from "./${opts.name}.styles.module.scss";
${slotInterface}

interface EpicContext {
  epicName?: string;
  epicPhase?: "development" | "review" | "complete";
}

export interface ${pascal}Props ${opts.slots.length ? `extends ${pascal}Slots ` : ""}{
  className?: string;
  children?: React.ReactNode;
}

export const ${compName}: React.FC<${pascal}Props & EpicContext> = ${slotDestructuring} => {
  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      ${epicAttrs}
      data-component="${opts.name}"
      data-level="${opts.level}"
      data-style="${opts.styleVariant}"
      {...rest}
    >
      {children}
${slotRender}
    </div>
  );
};

${compName}.displayName = "${compName}";
`;
}

function buildStyles(opts: Options): string {
  const base = {
    glass: `
.root {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 0.9rem;
  background: var(--if-primary-light);
  backdrop-filter: blur(8px) saturate(160%);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  transition: background 160ms ease, border-color 160ms ease;
}
.root:hover {
  background: rgba(59,130,246,0.12);
}
.root:focus-visible {
  outline: 2px dashed var(--if-primary);
  outline-offset: 2px;
}
.slot {
  display: inline-flex;
  padding: 0.25rem 0.4rem;
  background: rgba(0,0,0,0.04);
  border-radius: var(--radius-xs);
  font-size: 0.75rem;
  line-height: 1;
}
`,
    panel: `
.root {
  display: flex;
  flex-direction: column;
  padding: 1rem 1.1rem;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  box-shadow: 0 2px 6px rgba(0,0,0,0.07);
}
.slot {
  margin-top: 0.4rem;
}
`,
    minimal: `
.root {
  display: inline-flex;
  padding: 0.25rem 0.4rem;
  border-radius: var(--radius-xs);
  font-size: 0.85rem;
  background: transparent;
  border: 1px dashed rgba(0,0,0,0.15);
}
.slot {
  display: inline-block;
  margin-left: 0.25rem;
  font-size: 0.7rem;
  opacity: 0.7;
}
`,
  }[opts.styleVariant];

  return `/* ${opts.name}.styles.module.scss */
/* Style Variant: ${opts.styleVariant} */

${base}

`;
}

function buildIndex(opts: Options, suffix: string): string {
  return `export * from "./${opts.name}.${suffix}";\n`;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function main() {
  const args = process.argv.slice(2);
  const opts = parseArgs(args);
  if (!opts) process.exit(args.includes("--help") ? 0 : 1);

  const { baseDir, suffix } = resolveDirs(opts.level);
  const componentDir = path.join(baseDir, opts.name);
  const componentFile = path.join(componentDir, `${opts.name}.${suffix}.tsx`);
  const stylesFile = path.join(componentDir, `${opts.name}.styles.module.scss`);
  const indexFile = path.join(componentDir, `index.ts`);

  if (fs.existsSync(componentDir) && !opts.force) {
    console.error(
      `ERROR: Component directory already exists: ${componentDir} (use --force to overwrite)`,
    );
    process.exit(2);
  }

  const tsxContent = buildComponentTSX(opts, suffix);
  const styleContent = buildStyles(opts);
  const indexContent = buildIndex(opts, suffix);

  if (opts.dryRun) {
    console.log("DRY RUN - Planned files:\n");
    console.log(componentFile + "\n" + tsxContent);
    console.log(stylesFile + "\n" + styleContent);
    console.log(indexFile + "\n" + indexContent);
    process.exit(0);
  }

  try {
    fs.mkdirSync(componentDir, { recursive: true });
    fs.writeFileSync(componentFile, tsxContent, "utf-8");
    fs.writeFileSync(stylesFile, styleContent, "utf-8");
    fs.writeFileSync(indexFile, indexContent, "utf-8");
    console.log(
      `✅ Scaffolded component '${opts.name}' at level '${opts.level}' (${opts.styleVariant})`,
    );
    console.log("Files:");
    console.log(" - " + componentFile);
    console.log(" - " + stylesFile);
    console.log(" - " + indexFile);
    if (opts.epic) {
      console.log(
        `Epic Attributes: data-epic="${opts.epic}"${
          opts.phase ? ` data-epic-phase="${opts.phase}"` : ""
        }`,
      );
    }
    console.log(
      `Next steps: Import & use <${toPascal(opts.name)}${capitalize(
        suffix,
      )}> in a page or parent component.`,
    );
  } catch (e: unknown) {
    console.error(
      "ERROR: Failed to scaffold component:",
      e instanceof Error ? e.message : String(e),
    );
    process.exit(3);
  }
}

main();
