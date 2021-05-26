const tsconfig = require('./tsconfig.json');

module.exports = {
  root: true,
  extends: ['plugin:@clux/recommended/common'],
  env: {
    browser: false,
    node: true,
  },
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {'@typescript-eslint/no-namespace': 'off'},
  ignorePatterns: tsconfig.exclude,
};
