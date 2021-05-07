module.exports = {
  root: true,
  extends: ['plugin:@clux/recommended/react'],
  env: {
    browser: false,
    node: false,
  },
  parserOptions: {
    project: `${__dirname}/tsconfig.json`,
  },
  rules: {
    'react/sort-comp': 'off',
  },
  ignorePatterns: ['/.eslintrc.js'],
};
