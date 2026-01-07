module.exports = {
  extends: ['./base.js'],
  env: {
    node: true,
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-require-imports': 'error',
    'no-process-exit': 'error',
  },
};
