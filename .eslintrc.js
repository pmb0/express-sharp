module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: '@heise',
  rules: {
    'no-prototype-builtins': 'off',
    'no-unused-vars': 'off',
    'security/detect-non-literal-fs-filename': 'off'
  },
  env: {
    node: true,
    browser: true,
    es6: true
  },
  overrides: [{
    files: [ '*.test.ts', '*.js', '__tests__/**/*.ts' ],
    rules: {
      'toplevel/no-toplevel-side-effect': 'off',
      'no-magic-numbers': 'off'
    }
  }]
}
