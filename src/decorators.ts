import 'reflect-metadata'

function makePropertyMapper<T, U>(
  prototype: unknown,
  key: string,
  mapper: (value: U) => T
) {
  Object.defineProperty(prototype, key, {
    enumerable: true,
    set(value: U) {
      Object.defineProperty(this, key, {
        enumerable: true,
        get() {
          return Reflect.getMetadata(key, this) as T
        },
        set(value: U) {
          Reflect.defineMetadata(key, mapper(value), this)
        },
      })

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      this[key] = value
    },
  })
}

export function Transform<T, U = string>(transformer: (value: U) => T) {
  return function (target: unknown, key: string): void {
    makePropertyMapper<T, U>(target, key, transformer)
  }
}

export function ToNumber() {
  return function (target: unknown, key: string): void {
    makePropertyMapper(target, key, Number)
  }
}
