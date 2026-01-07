module.exports = {
  root: true,
  extends: ['@plpg/config/eslint/node'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
