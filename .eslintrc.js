module.exports = {
  root: true,
  extends: ['plugin:@clux/recommended/common'],
  env: {
    browser: false,
    node: false,
  },
  parserOptions: {
    project: './tsconfig-eslint.json',
  },
  rules: {},
  ignorePatterns: ['**/dist', '**/types', '**/docs', './storage'],
};
