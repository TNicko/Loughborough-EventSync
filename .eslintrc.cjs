module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended', // Add prettier support
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['prettier', 'react-refresh'], // Add prettier plugin
  rules: {
    'react/react-in-jsx-scope': 'off',
    'prettier/prettier': 'error', // Configure prettier rule
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
  overrides: [
    {
      files: ['.*rc.js', '.*rc.cjs', '*.config.js', '*.config.cjs'],
      env: {
        node: true,
      },
    },
  ],
  ignorePatterns: ['dist/**', 'dist-firefox-v2'],
}
