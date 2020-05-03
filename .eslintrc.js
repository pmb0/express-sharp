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
    es6: true
  }
}
