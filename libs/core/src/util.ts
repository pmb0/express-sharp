export function camelToSnake(string: string): string {
  return string
    .replace(/\w([A-Z])/g, (m) => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return `${m[0]}_${m[1]}`
    })
    .toLowerCase()
}
