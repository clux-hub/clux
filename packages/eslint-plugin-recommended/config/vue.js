const common = require('./common');

module.exports = {
  ...common,
  parser: 'vue-eslint-parser',
  parserOptions: {
    ...common.parserOptions,
    ecmaFeatures: {
      jsx: true,
    },
    extraFileExtensions: ['.vue'],
    parser: '@typescript-eslint/parser',
  },
  extends: ['airbnb-typescript', 'plugin:@typescript-eslint/recommended', 'plugin:vue/vue3-recommended', 'plugin:prettier/recommended'],
  rules: {
    ...common.rules,
  },
  settings: {
    react: {
      pragma: 'React',
      version: 'detect',
    },
  },
};
