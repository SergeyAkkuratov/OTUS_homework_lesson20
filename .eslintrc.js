module.exports = {
  env: {
    browser: true,
    es2021: true,
    "jest/globals": true,
  },
  extends: ["airbnb-base", "eslint:recommended", "prettier"],
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["jest", "eslint-plugin-html"],
  rules: {
    "import/extensions": [
      "off",
      {
        ignorePackages: true,
      },
    ],
    "import/no-extraneous-dependencies": [
      "off",
      {
        devDependencies: [
          "**/*.test.ts?(x)",
          "**/*.spec.ts?(x)",
          "**/test-utils.ts",
          "webpack.config.js",
        ],
      },
    ],
  },
};
