<div align="center">
  <img src="https://raw.github.com/pmb0/express-sharp/master/docs/express-sharp.gif" width="100%" />
  <p>Real-time image processing for your express application.</p>
</div>

[![npm version](https://badge.fury.io/js/express-sharp.svg)](https://www.npmjs.com/package/express-sharp)
[![Test Coverage][coveralls-image]][coveralls-url]
[![Build Status][build-image]][build-url]

# Description <!-- omit in toc -->

express-sharp adds real-time image processing routes to your express application. Images are processed with [sharp](https://github.com/lovell/sharp), a fast Node.js module for resizing images.

```
                      express-sharp
    Express app         endpoint          image path    transformation                
┌─────────────────┐┌────────────────┐┌──────────────────┐ ┌────────┐
https://example.com/path/to/my-scaler/images/my-image.jpg?w=100&h=50
```

Original images are loaded via an image adapter. Currently this includes HTTP and file system adapters.

# Highlights

- Fast resizing of images (see [sharp Performance](https://sharp.pixelplumbing.com/performance))
- [Supports multiple backends, from which the original images are downloaded](#image-adapters)
- [Supports multiple caching backends](#caching)
- [Image URLs can be signed to prevent attacks](#url-signing)


# Table of contents <!-- omit in toc -->

- [Highlights](#highlights)
- [Install](#install)
- [Express server integration](#express-server-integration)
  - [Server configuration](#server-configuration)
  - [Image Adapters](#image-adapters)
    - [File System](#file-system)
    - [HTTP](#http)
    - [Amazon S3](#amazon-s3)
    - [Custom](#custom)
  - [Caching](#caching)
  - [URL signing](#url-signing)
  - [Debug logging](#debug-logging)
- [Client integration](#client-integration)
- [License](#license)

# Install

```sh
$ yarn add express-sharp
```

See [sharp installation](https://sharp.pixelplumbing.com/install) for additional installation instructions.

# Express server integration

Example *app.js* (See also `example/app.ts` in this project):

```js
import express from 'express'
import { expressSharp, FsAdapter, HttpAdapter } from 'express-sharp'

const app = express()

// Fetch original images via HTTP
app.use(
  '/some-http-endpoint',
  expressSharp({
    imageAdapter: new HttpAdapter({
      prefixUrl: 'http://example.com/images',
    }),
  })
)

// Alternative: Load original images from disk
app.use(
  '/fs-endpoint',
  expressSharp({
    imageAdapter: new FsAdapter(path.join(__dirname, 'images')),
  })
)

app.listen(3000)
```

Render `/images/image.jpg` with 400x400 pixels:

```sh
curl http://my-server/express-sharp-endpoint/images/image.jpg?w=400&h=400
```

Same as above, but with 80% quality, `webp` image type and with progressive enabled:

```sh
curl http://my-server/express-sharp-endpoint/images/image.jpg?w=400&h=400&f=webp&q=80&p
```

## Server configuration

```js
import { expressSharp } from 'express-sharp'

app.use('/some-http-endpoint', expressSharp(options))
```

Supported `options`:

| Name | Description | Default |
|------|-------------|---------|
| `autoUseWebp` | Specifies whether images should automatically be rendered in webp format when supported by the browser. | `true` |
| `cache` | If specified, the [keyv cache]((https://github.com/lukechilds/keyv)) configured here is used to cache the retrieval of the original images and the transformations. | - |
| `cors` | Any valid [CORS configuration option](https://expressjs.com/en/resources/middleware/cors.html) | - |
| `imageAdapter` | Configures the image adapter to be used (see below). Must be specified. | - |
| `secret` | If specified, express-sharp will validate the incoming request to verify that a valid signature has been provided. The secret is used to compute this signature. | - |

## Image Adapters

express-sharp contains the following standard image adapters.

### File System

With this adapter original images are loaded from the hard disk.

```js
import { FsAdapter } from 'express-sharp'

const adapter = new FsAdapter('/path/to/images')
```

### HTTP

Loads original images via HTTP.

```js
import { HttpAdapter } from 'express-sharp'

const adapter = new HttpAdapter({
  prefixUrl: 'http://localhost:3000/images',
})
```

The constructor can be passed any [got options](https://github.com/sindresorhus/got#options).

### Amazon S3

Loads images from Amazon S3. To use this adapter, the optional dependency `aws-sdk` must be installed:

```sh
$ yarn add aws-sdk
```

```js
import { S3Adapter } from 'express-sharp'

const bucketName = 'my-bucketname'
const adapter = new S3Adapter(bucketname)
```

The AWS SDK expects the environment variables `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` to be set.

### Custom

If you needed your own adapters can be used. An "image adapter" is a class that implements the `ImageAdapter` interface:

```ts
import { ImageAdapter } from 'express-sharp'

class MyAdapter implements ImageAdapter {
  async fetch(id: string): Promise<Buffer | undefined> {
    if (imageDoesNotExist(id)) {
      return undefined
    }

    return Buffer.from('my image blob')
  }
}
```

## Caching

The fetching of the original images and the transformations can be cached. To enable this feature, the `cache` option must be passed to the `expressSharp` middleware. Any [keyv cache stores](https://github.com/lukechilds/keyv) can be passed.


In-memory cache example:

```js
const cache = new Keyv({ namespace: 'express-sharp' })

app.use(
  '/my-endpoint',
  expressSharp({
    cache,
    imageAdapter: ...
  })
)
```

Redis example:

```js
const cache = new Keyv('redis://', { namespace: 'express-sharp' }

app.use(
  '/my-endpoint',
  expressSharp({
    cache,
    imageAdapter: ...
  })
)
```

## URL signing

By setting the environment variable `EXPRESS_SHARP_SIGNED_URL_SECRET` or by specifying the `secret` option when calling the `express-sharp` middleware, signed URLs are activated. This reduces the attack surface on the server, since the caller cannot produce an unlimited number of URLs that cause load on the server.

In order to compute the signature, the supplied client should be used:

```js
import { createClient } from 'express-sharp'

const endpoint = 'https://example.com/my-express-sharp-endpoint'
const secret = 'test'
const client = createClient(endpoint, secret)

const imageUrl = client.url('/foo.png', { width: 500 })

// https://example.com/my-express-sharp-endpoint/foo.png?w=500&s=Of3ty8QY-NDhCsIrgIHvPvbokkDcxV8KtaYUB4NFRd8
```

## Debug logging

This project uses [debug](https://www.npmjs.com/package/debug). To display debug messages from `express-sharp`, the `DEBUG` environment variable must be exported so that it contains the value `express-sharp*`. Example:

```sh
$ export DEBUG='my-app:*,express-sharp*'
```


# Client integration

express-sharp comes with a client that can be used to generate URLs for images.

```js
import { createClient } from 'express-sharp'

const client = createClient('http://my-base-host', 'optional secret')

const originalImageUrl = '/foo.png'
const options = { width: 500 }
const fooUrl = client.url(originalImageUrl, options)
```

Currently the following transformations can be applied to images:

| Client option name | Query param name | Description |
|--------------------|------------------|-------------|
| quality | `q` | Quality is a number between 1 and 100 (see [sharp docs](https://sharp.pixelplumbing.com/en/stable/api-output/)). |
| width | `w` |
| height | `h` |
| format | `f` | Output image format. Valid values: every valid [sharp output format string](https://sharp.pixelplumbing.com/api-output#toformat), i.e. `jpeg`, `gif`, `webp` or `raw`. |
| progressive | `p` | Only available for jpeg and png formats. Enable progressive scan by passing `true`. |
| crop | `c` | Setting crop to `true` enables the [sharp cropping feature](https://sharp.pixelplumbing.com/api-resize#crop). Note: Both `width` and `height` params are neccessary for crop to work. Default is `false`. |
| gravity | `g` | When the crop option is activated you can specify the gravity of the cropping. Possible attributes of the optional `gravity` are `north`, `northeast`, `east`, `southeast`, `south`, `southwest`, `west`, `northwest`, `center` and `centre`. Default is `center`. |

# License

express-sharp is distributed under the MIT license. [See LICENSE](./LICENSE) for details.

[coveralls-image]: https://img.shields.io/coveralls/pmb0/express-sharp/master.svg
[coveralls-url]: https://coveralls.io/r/pmb0/express-sharp?branch=master
[build-image]: https://github.com/pmb0/express-sharp/workflows/Tests/badge.svg
[build-url]: https://github.com/pmb0/express-sharp/actions?query=workflow%3ATests
