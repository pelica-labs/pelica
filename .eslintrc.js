module.exports = {
  extends: ["plugin:@typescript-eslint/recommended", "plugin:react/recommended", "plugin:prettier/recommended"],
  parser: "@typescript-eslint/parser",
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
  plugins: ["simple-import-sort"],
  rules: {
    "simple-import-sort/sort": "warn",
    "prettier/prettier": "warn",
    "react/prop-types": "off",
  },
};
