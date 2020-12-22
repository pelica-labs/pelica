module.exports = {
  extends: ["plugin:@typescript-eslint/recommended", "plugin:react/recommended", "plugin:prettier/recommended"],
  parser: "@typescript-eslint/parser",
  ignorePatterns: ["src/icons/*.json"],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  plugins: ["simple-import-sort", "prefer-arrow"],
  rules: {
    "simple-import-sort/sort": "warn",
    "prefer-arrow/prefer-arrow-functions": "warn",
    "prettier/prettier": "warn",
    "react/prop-types": "off",
    "react/no-unescaped-entities": "off",
    "react/jsx-sort-props": [
      "warn",
      {
        callbacksLast: true,
        shorthandFirst: true,
        reservedFirst: true,
      },
    ],
  },
};
