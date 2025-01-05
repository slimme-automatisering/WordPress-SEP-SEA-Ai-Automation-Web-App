import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginCypress from "eslint-plugin-cypress";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      react: pluginReact,
      cypress: pluginCypress,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        NetworkFirst: true,
        CacheFirst: true,
        workbox: true,
      },
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "react/prop-types": "warn",
      "no-unused-vars": "warn",
      indent: ["error", 4],
      "linebreak-style": ["error", "windows"],
      quotes: ["error", "single"],
      semi: ["error", "always"],
    },
  },
  {
    files: ["cypress/**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        cy: true,
        Cypress: true,
        expect: true,
        assert: true,
        beforeEach: true,
        afterEach: true,
        describe: true,
        it: true,
      },
    },
    rules: {
      "cypress/no-unnecessary-waiting": "off",
    },
  },
  {
    files: ["**/*.test.{js,jsx}", "**/__tests__/**"],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
];
