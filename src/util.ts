export function camelToSnake(string: string) {
  return string
    .replace(/\w([A-Z])/g, (m) => {
      return `${m[0]}_${m[1]}`
    })
    .toLowerCase()
}
