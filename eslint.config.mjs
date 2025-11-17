import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports" },
      ],

      "unused-imports/no-unused-imports": "error",

      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      "import/no-unresolved": "error",
      "import/no-duplicates": "error",
      "import/no-cycle": "error",
      "import/order": [
        "error",
        {
          "newlines-between": "always",
          alphabetize: { order: "asc" },
        },
      ],

      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-restricted-imports": ["error", { patterns: ["../..*", "../../..*"] }],

      "@next/next/no-async-client-component": "error",
      "@next/next/no-server-import-in-client-component": "error",
    },

    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: {},
      },
    },
  },

  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
