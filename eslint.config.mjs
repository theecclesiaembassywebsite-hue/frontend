import { fileURLToPath } from "node:url";
import { includeIgnoreFile } from "@eslint/compat";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Anything git refuses to track is build output or local scratch, and linting
// it is never useful. Deriving the ignores from .gitignore rather than
// restating them keeps the two lists from drifting apart -- which is exactly
// what had happened: .open-next/ (67MB of bundled, minified Cloudflare build
// output, including vendored node_modules chunks) was gitignored but not
// eslint-ignored, and produced 19,023 of the repo's 19,025 lint problems. The
// two real warnings in src/ were invisible underneath it.
const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));

const eslintConfig = defineConfig([
  includeIgnoreFile(gitignorePath),
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          caughtErrors: "none",
        },
      ],
      "@next/next/no-img-element": "off",
      "react/no-unescaped-entities": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  //
  // Kept alongside the .gitignore-derived list above, not replaced by it:
  // these are the entries that must hold even if .gitignore stops covering
  // them, and `out/`/`build/` are conventional Next output dirs this repo
  // doesn't currently produce, so git has no opinion on them.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Repo-local generated or non-frontend code:
    ".codex-temp/**",
    ".claude/**",
    "backend/**",
    "backend-output.log",
  ]),
]);

export default eslintConfig;
