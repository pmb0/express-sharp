# Changelog

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
