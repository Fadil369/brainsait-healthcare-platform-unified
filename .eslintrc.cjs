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
  },
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
    "@typescript-eslint/naming-convention": [
      "warn",
      { selector: "typeLike", format: ["PascalCase"] },
      { selector: "variable", format: ["camelCase", "UPPER_CASE"], leadingUnderscore: "allow" },
      { selector: "function", format: ["camelCase", "PascalCase"] },
      { selector: "enumMember", format: ["PascalCase", "UPPER_CASE"] },
    ],
  },
};

