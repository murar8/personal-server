module.exports = {
    root: true,
    ignorePatterns: [".eslintrc.js"],
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    extends: [
        "eslint:recommended",
        "plugin:node/recommended-module",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "prettier",
    ],
    parserOptions: {
        project: ["./tsconfig.json"],
    },
    rules: {
        "@typescript-eslint/no-non-null-assertion": "off",
        "node/no-missing-import": ["error", { tryExtensions: [".js", ".ts"] }],
    },
};
