module.exports = {
  root: true,
  extends: ['plugin:@clux/recommended/vue'],
  env: {
    browser: false,
    node: false,
  },
  parserOptions: {
    project: `${__dirname}/tsconfig.json`,
  },
  rules: {},
  ignorePatterns: ['/.eslintrc.js'],
};
