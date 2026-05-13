import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "plugin:prettier/recommended"
  ),
  {
    rules: {
      // Allows 'any' types but flags them as warnings for visibility
      "@typescript-eslint/no-explicit-any": "warn",

      // Comprehensive rule to ignore unused variables if they are prefixed with '_'
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_", // Specifically handles your 'catch (_err)' logic
        },
      ],

      // Enforces Prettier formatting; errors here will still stop the build
      "prettier/prettier": "error",
    },
  },
];

export default eslintConfig;
