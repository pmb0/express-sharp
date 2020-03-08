module.exports = {
  root: true,
  extends: '@heise',
  rules: {
    'no-prototype-builtins': 'off'
  },
  env: {
    node: true,
    mocha: true,
    es6: true
  }
}
