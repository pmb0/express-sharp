import url from 'url'

export function imageUrl(basePath: string) {
  return function (width: number | number[], query?: any) {
    let height

    if (typeof width !== 'number') [width, height] = width

    let pathname = `${basePath}/resize/${width}`
    if (height) pathname += `/${height}`

    return url.format({
      query,
      pathname,
    })
  }
}
