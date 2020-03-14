# Changelog

## v3.1.1, 2020-03-14

- Fixed a bug that occurred when the express-sharp middleware was called without arguments (`scale()`).
- Replaced [deprecated request module](https://github.com/request/request#deprecated) with `got`.

## v3.1.0, 2020-03-09

- Fixed express-sharp to not return always jpeg. (kriscarle, [#23](https://github.com/pmb0/express-sharp/pull/23))
- Made `baseHost` an optional parameter. (northamerican, [#8](https://github.com/pmb0/express-sharp/pull/8))

## v3.0.0, 2020-03-09

This release contains breaking changes:

- Dropped support for Node.js < 10. (kriscarle, [#15](https://github.com/pmb0/express-sharp/pull/15)/[#14](https://github.com/pmb0/express-sharp/issues/14))

Other changes:

- Upgraded `sharp@^0.24`.
- Upgraded dependencies.

## v2.1.1, 2017-10-26

- Fixed Travis CI setup.

## v2.1.0, 2017-10-26

- Added support for https image sources. (michaseel, [#5](https://github.com/pmb0/express-sharp/pull/5))
- Changed default output to `image/webp` if no other format is specified.

## v2.0.0, 2017-10-25

- Added support for cropping images. (michaseel, [#4](https://github.com/pmb0/express-sharp/pull/4))

### Breaking changes

The auto-enabled `withoutEnlargement` option is only used when cropping is disabled.

## v1.2.2, 2017-02-19

- Fixed original image test by comparing Content-Length header with a string.
- Fixed image height to default to image width. Fixes #2.
- Upgraded dependencies and tests.

## v1.2.1, 2017-02-06

- Upgraded `express-sharp` to `0.17.1`.

## v1.2.0, 2015-12-05

- Added CORS support.

## v1.1.0, 2015-12-05

- Added tests.
- Added Travic CI test runner.
- Improved docs.
- Improved error handling.
- Refactored API.

## v1.0.1, 2015-11-27

- Added `.withoutEnlargement()` to prevent sharp from enlarging images.
- Fixed docs issues.

## v1.0.0, 2015-11-27

First release
