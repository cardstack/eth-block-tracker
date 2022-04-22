module.exports = {
  root: true,

  extends: ['@metamask/eslint-config'],

  overrides: [
    {
      files: ['*.ts'],
      extends: ['@metamask/eslint-config-typescript'],
      rules: {
        // TODO: Move this to our shared config
        'no-invalid-this': 'off',
        '@typescript-eslint/no-invalid-this': ['error'],
      },
    },

    {
      files: ['*.js'],
      extends: ['@metamask/eslint-config-nodejs'],
    },

    {
      files: ['*.test.ts', '*.test.js', './tests/setupAfterEnv.ts'],
      extends: ['@metamask/eslint-config-jest'],
    },

    {
      files: './tests/setupAfterEnv.ts',
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],

  ignorePatterns: ['!.eslintrc.js', '!.prettierrc.js', 'dist/'],
};
