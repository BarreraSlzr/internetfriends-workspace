#!/usr/bin/env bun
/**
 * scaffold-schema.ts
 * InternetFriends Schema Scaffolder
 *
 * Purpose:
 *  - Rapidly create a new Zod schema file following project conventions.
 *  - Supports standard domain schemas + form schemas.
 *  - Encourages explicit registry addition (no implicit glob import).
 *
 * Usage:
 *  bun run scripts/scaffold-schema.ts <Name> [domain] [description...]
 *
 * Examples:
 *  bun run scripts/scaffold-schema.ts UserProfile auth "Primary user profile record"
 *  bun run scripts/scaffold-schema.ts FeedbackForm forms "User feedback form" --form
 *  bun run scripts/scaffold-schema.ts AiJob compute "AI job tracking payload"
 *
 * Flags:
 *  --form        Generate as a form schema (suffix: .form.schema.ts)
 *  --force       Overwrite if file already exists
 *  --dry-run     Print planned output without writing
 *  --help        Show help
 *
 * File Naming:
 *  Standard:  <kebab-name>.schema.ts
 *  Form:      <kebab-name>.form.schema.ts
 *
 * Post-Create Steps (IMPORTANT):
 *  1. Open schemas/registry.ts
 *  2. Import the new schema
 *  3. Add an entry to SchemaRegistry (include domain, description, tags)
 *  4. (Optional) Add fixtures/<Name>.json for validation
 *
 * Exit Codes:
 *  0 success
 *  1 invalid arguments
 *  2 file exists (and not forced)
 *  3 write error
 */

import * as fs from "fs";
import * as path from "path";

interface Options {
  name: string;
  domain: string;
  description: string;
  isForm: boolean;
  force: boolean;
  dryRun: boolean;
}

const VALID_DOMAIN_PATTERN = /^[a-z][a-z0-9-]*$/;
const VALID_NAME_PATTERN = /^[A-Z][A-Za-z0-9]+$/;

function printHelp() {
  console.log(`InternetFriends Schema Scaffolder

Usage:
  bun run scripts/scaffold-schema.ts <Name> [domain] [description...] [--flags]

Arguments:
  <Name>          PascalCase schema name (exported as <Name>Schema)
  [domain]        Domain key (auth|compute|design-system|events|forms|ui|analytics|misc) default: misc
  [description]   Free-form description text (optional)

Flags:
  --form          Create a form schema (adds ".form.schema.ts" suffix)
  --force         Overwrite existing file
  --dry-run       Show what would be written without creating file
  --help          Show this help

Examples:
  bun run scripts/scaffold-schema.ts UserAuth auth "Authentication envelope"
  bun run scripts/scaffold-schema.ts FeedbackForm forms "Feedback capture" --form

`);
}

function parseArgs(argv: string[]): Options | null {
  if (argv.includes("--help") || argv.length === 0) {
    printHelp();
    return null;
  }

  const flags = new Set(argv.filter((a) => a.startsWith("--")));
  const positional = argv.filter((a) => !a.startsWith("--"));

  if (positional.length === 0) {
    console.error("ERROR: Missing <Name> argument.");
    printHelp();
    return null;
  }

  const name = positional[0];
  const domain = positional[1] || "misc";
  const description = positional.slice(2).join(" ") || "TODO: Add description";

  if (!VALID_NAME_PATTERN.test(name)) {
    console.error(
      `ERROR: Invalid name '${name}'. Use PascalCase (e.g., UserProfile, ComputeJob).`,
    );
    return null;
  }

  if (!VALID_DOMAIN_PATTERN.test(domain)) {
    console.error(
      `ERROR: Invalid domain '${domain}'. Use lowercase alphanumerics / hyphen (e.g., compute, auth, forms).`,
    );
    return null;
  }

  return {
    name,
    domain,
    description,
    isForm: flags.has("--form"),
    force: flags.has("--force"),
    dryRun: flags.has("--dry-run"),
  };
}

function pascalToKebab(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function buildFilePath(name: string, isForm: boolean): string {
  const kebab = pascalToKebab(name);
  const suffix = isForm ? ".form.schema.ts" : ".schema.ts";
  return path.join("schemas", `${kebab}${suffix}`);
}

function buildContent(opts: Options): string {
  const { name, domain, description, isForm } = opts;

  const tags = isForm ? `["form","${domain}"]` : `["${domain}"]`;

  return `/**
 * ${name} Schema
 * Domain: ${domain}
 * Description: ${description}
 *
 * Conventions:
 *  - Add this schema to schemas/registry.ts after creation.
 *  - Keep fields minimal / purposeful. Expand only with real use-cases.
 *  - Provide a fixture under /schemas/fixtures/${name}.json (optional but recommended).
 *
 * Tags: ${tags}
 */

import { z } from "zod";

// TODO: Adjust fields appropriately for real domain usage.
export const ${name}Schema = z.object({
  id: z.string().uuid().describe("Unique identifier"),
  created_at: z.string().optional().describe("ISO timestamp"),
  updated_at: z.string().optional().describe("ISO timestamp"),
  // Add fields below:
  // example_field: z.string()
})${
    isForm
      ? `
  .describe("${name} form schema base")`
      : `.describe("${name} schema base")`
  };

export type ${name} = z.infer<typeof ${name}Schema>;

/**
 * Registration Instructions:
 *
 * 1. Open schemas/registry.ts
 * 2. Add: import { ${name}Schema } from "./${pascalToKebab(name)}${
   isForm ? ".form.schema" : ".schema"
 }";
 * 3. Append registry entry:
 *
 *    {
 *      name: "${name}",
 *      schema: ${name}Schema,
 *      domain: "${domain}",
 *      description: "${description}",
 *      tags: ${tags}
 *    }
 *
 * 4. (Optional) Create fixture: schemas/fixtures/${name}.json
 * 5. Run: bun -e "import { printSummary } from './schemas/registry'; printSummary()"
 */
`;
}

async function main() {
  const rawArgs = process.argv.slice(2);
  const opts = parseArgs(rawArgs);
  if (!opts) {
    process.exit(rawArgs.includes("--help") ? 0 : 1);
  }

  const outPath = buildFilePath(opts.name, opts.isForm);

  if (fs.existsSync(outPath) && !opts.force) {
    console.error(
      `ERROR: File already exists at ${outPath} (use --force to overwrite)`,
    );
    process.exit(2);
  }

  const content = buildContent(opts);

  if (opts.dryRun) {
    console.log(`[DRY-RUN] Would write: ${outPath}\n\n${content}`);
    process.exit(0);
  }

  try {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, content, "utf-8");
    console.log(`✅ Created schema file: ${outPath}`);
    console.log(
      "Next: Register schema in schemas/registry.ts and (optionally) add a fixture.",
    );
  } catch (e: unknown) {
    console.error(
      "ERROR: Failed to scaffold schema:",
      e instanceof Error ? e.message : String(e),
    );
    process.exit(3);
  }
}

main();
