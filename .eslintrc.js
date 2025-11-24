module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
    },
    plugins: ["@typescript-eslint"],
    extends: ["next/core-web-vitals", "plugin:@typescript-eslint/recommended"],
    rules: {
        "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
        "no-console": ["warn", { allow: ["warn", "error"] }],
    },
    ignorePatterns: [".next/", "out/", "build/", "node_modules/"],
};
