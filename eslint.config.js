import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginJsxA11y from "eslint-plugin-jsx-a11y";
import eslintPluginReact from "eslint-plugin-react";
import tseslint from "typescript-eslint";
import reactRefresh from "eslint-plugin-react-refresh";
import eslintPluginUnusedImports from "eslint-plugin-unused-imports";
import eslintPluginPerfectionist from "eslint-plugin-perfectionist";
import eslintPluginDepends from "eslint-plugin-depend";
import eslintPluginImport from "eslint-plugin-import";
import css from "@eslint/css";
import { tailwind4 } from "tailwind-csstree";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import eslintPluginAiGuard from "eslint-plugin-ai-guard";
import unicorn from "eslint-plugin-unicorn";
import eslintJson from "@eslint/json";

export default defineConfig([
  globalIgnores([
    "dist",
    "node_modules",
    ".vscode",
    ".claude",
    ".agents",
    "docs",
    "scripts",
    "test-results",
    ".localstorage.*",
    "target",
    "data",
    "server",
    "dev-target",
  ]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      eslintPluginReact.configs.flat.recommended,
      eslintPluginJsxA11y.flatConfigs.recommended,
    ],
    plugins: {
      "unused-imports": eslintPluginUnusedImports,
      "react-refresh": reactRefresh,
      perfectionist: eslintPluginPerfectionist,
      depend: eslintPluginDepends,
      import: eslintPluginImport,
      aiGuard: eslintPluginAiGuard,
      unicorn,
    },
    rules: {
      ...eslintConfigPrettier.rules,
      //* BASE STUFF
      eqeqeq: ["error", "always"],
      curly: ["error", "multi"],
      camelcase: [
        "error",
        {
          allow: [
            "^relation__",
            "^_RS__",
            "^RS_",
            "^UK_",
            "^CLIENT_",
            "^MANGO_",
            "^TENANT_",
            "auth_url",
            "expires_at",
            "login_failed",
          ],
        },
      ],
      "object-shorthand": ["error", "properties"],
      "arrow-body-style": ["error", "as-needed"],
      "func-style": ["error", "declaration", { allowArrowFunctions: false }],
      quotes: ["error", "double", { avoidEscape: true }],
      "no-nested-ternary": "error",
      "no-console": ["error", { allow: ["info", "error"] }],
      "unused-imports/no-unused-vars": [
        "error",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "import/no-self-import": "error",
      "import/no-duplicates": "error",
      "depend/ban-dependencies": [
        "error",
        {
          presets: ["native"],
        },
      ],
      //* REACT
      "react/hook-use-state": "error",
      "react/jsx-boolean-value": "error",
      "react/jsx-closing-tag-location": "error",
      "react/jsx-key": "error",
      "react/jsx-no-undef": "error",
      "react/jsx-pascal-case": "error",
      "react/no-array-index-key": "error",
      "react/no-danger": "error",
      "react/no-deprecated": "error",
      "react/no-typos": "error",
      "react/react-in-jsx-scope": "off",
      "react/jsx-sort-props": "off",
      "react/no-unstable-nested-components": "error",
      "react/jsx-no-leaked-render": ["error", { validStrategies: ["ternary"] }],
      "react/jsx-no-useless-fragment": "error",
      "react/destructuring-assignment": "error",
      "react/function-component-definition": ["error", { namedComponents: "function-declaration" }],
      "react/no-children-prop": ["error", { allowFunctions: true }],
      "react/jsx-curly-brace-presence": ["error", { props: "never", children: "never" }],
      "react/prop-types": "off",
      //* REACT HOOKS
      "react-hooks/incompatible-library": "off",
      "react-hooks/exhaustive-deps": ["off"],

      //* REACT REFRESH
      "react-refresh/only-export-components": ["error"],

      //* TYPESCRIPT
      "@typescript-eslint/triple-slash-reference": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      //* SORTING
      "perfectionist/sort-arrays": [
        "error",
        {
          type: "alphabetical",
          order: "asc",
          fallbackSort: { type: "line-length" },
          ignoreCase: true,
          specialCharacters: "keep",
          partitionByNewLine: false,
          newlinesBetween: "ignore",
          newlinesInside: "ignore",
          useConfigurationIf: {
            matchesAstSelector:
              "ArrayExpression:not(:has(> :not(Literal))):not(:has(> Literal[regex])):not(:has(> Literal[value=true])):not(:has(> Literal[value=false])):not(:has(> Literal[value=null]))",
          },
          groups: ["literal"],
          customGroups: [],
        },
        {
          useConfigurationIf: {
            matchesAstSelector: 'VariableDeclaration[kind="const"] > VariableDeclarator[id.name=/Enum$/] > ArrayExpression',
          },
          type: "unsorted",
        },
      ],
      "perfectionist/sort-array-includes": "error",
      "perfectionist/sort-imports": "error",
      "perfectionist/sort-interfaces": "error",
      "perfectionist/sort-object-types": "error",
      "perfectionist/sort-objects": [
        "error",
        {
          useConfigurationIf: {
            matchesAstSelector: "CallExpression[callee.name=/^tv$/] ObjectExpression",
          },
          type: "unsorted",
        },
        {
          type: "alphabetical",
          order: "asc",
        },
      ],
      "perfectionist/sort-intersection-types": "error",
      "perfectionist/sort-jsx-props": [
        "error",
        {
          type: "alphabetical",
          order: "asc",
          groups: ["react-props", "unknown"],
          customGroups: [
            {
              groupName: "react-props",
              elementNamePattern: "^(children|key|ref)$",
            },
          ],
        },
      ],
      "perfectionist/sort-named-exports": "error",
      "perfectionist/sort-named-imports": "error",
      "perfectionist/sort-switch-case": "error",
      "perfectionist/sort-union-types": [
        "error",
        {
          useConfigurationIf: {
            matchesAstSelector: "TSTypeAliasDeclaration[id.name=/^(Variant|Size)$/] > TSUnionType",
          },
          type: "unsorted",
        },
        {
          type: "alphabetical",
          order: "asc",
          groups: ["keyword", "literal", "named", "object", "operator", "unknown", "nullish"],
        },
      ],
      //* STYLE
      "unicorn/catch-error-name": ["error", { name: "error" }],
      "unicorn/comment-content": "error",
      "unicorn/consistent-boolean-name": "error",
      "unicorn/consistent-compound-words": "error",
      "unicorn/consistent-destructuring": "error",
      "unicorn/consistent-function-scoping": "error",
      "unicorn/empty-brace-spaces": "error",
      "unicorn/no-array-concat-in-loop": "error",
      "unicorn/no-chained-comparison": "error",
      "unicorn/no-empty-file": "error",
      "unicorn/no-for-each": "error",
      "unicorn/no-impossible-length-comparison": "error",
      "unicorn/no-incorrect-template-string-interpolation": "error",
      "unicorn/no-invalid-character-comparison": "error",
      "unicorn/no-invalid-remove-event-listener": "error",
    },
    settings: {
      react: {
        version: "^19.2.1",
      },
    },
    languageOptions: {
      ecmaVersion: "latest",
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },
  {
    files: ["**/__tests__/**/*.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    rules: {
      "perfectionist/sort-arrays": "off",
    },
  },
  {
    files: ["**/*.css"],
    language: "css/css",
    plugins: { css },
    extends: [css.configs.recommended],
    languageOptions: {
      customSyntax: tailwind4,
    },
    rules: {
      "css/relative-font-units": "error",
      "css/no-invalid-properties": "off",
      "css/no-invalid-at-rules": "off",
    },
  },
  {
    plugins: {
      json: eslintJson,
    },
    files: ["**/*.json"],
    ignores: ["package-lock.json", "**/tsconfig.*.json"],
    language: "json/json",
    extends: ["json/recommended"],
    rules: {
      "json/no-duplicate-keys": "error",
    },
  },
]);
