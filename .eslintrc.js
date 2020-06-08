module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: 'tsconfig.json',
  },
  extends: ['@heise'],
  rules: {
    'no-prototype-builtins': 'off',
    'no-unused-vars': 'off',
    'security/detect-non-literal-fs-filename': 'off',
    'unicorn/no-null': 'off',
  },
  env: {
    node: true,
    browser: true,
    es6: true,
  },
  overrides: [
    {
      files: ['src/**/*.ts', '*.tsx'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'prettier/@typescript-eslint',
      ]
    },
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
