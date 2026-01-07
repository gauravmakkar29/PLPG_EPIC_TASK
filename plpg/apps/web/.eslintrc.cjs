module.exports = {
  root: true,
  extends: ['@plpg/config/eslint/react'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
