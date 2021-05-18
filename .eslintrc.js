module.exports = {
  root: true,
  extends: ['@heise'],
  plugins: ['sort-keys-fix', 'eslint-plugin-no-only-tests'],
  rules: {
    'sort-keys-fix/sort-keys-fix': 'error',
    'no-prototype-builtins': 'off',
    'no-unused-vars': 'off',
    'security/detect-non-literal-fs-filename': 'off',
    'unicorn/import-style': 'off',
    'unicorn/no-null': 'off',
    'unicorn/prevent-abbreviations': 'off',
    'unicorn/prefer-module': 'off',
  },
  env: {
    node: true,
    es6: true,
  },
  overrides: [
    {
      files: ['*.test.ts', '*.js', '__tests__/**/*.ts'],
      rules: {
        'toplevel/no-toplevel-side-effect': 'off',
        'no-magic-numbers': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/unbound-method': 'off',
      },
    },
  ],
}
