module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
    project: "./tsconfig.json",
  },
  ignorePatterns: [
    "node_modules/",
    ".next/",
    "out/",
    "dist/",
    "*.config.js",
    "*.config.cjs",
    "scripts/",
    "__tests__/",
  ],
  rules: {
    // Code quality
    "eqeqeq": ["error", "always"],
    "no-var": "error",
    "prefer-const": ["error", { destructuring: "all" }],
    "@typescript-eslint/explicit-function-return-type": [
      "warn",
      { allowExpressions: true, allowTypedFunctionExpressions: true },
    ],
    "@typescript-eslint/no-explicit-any": ["warn", { ignoreRestArgs: true }],
    // Security-focused rules
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-new-func": "error",
  },
};

