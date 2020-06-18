import 'reflect-metadata'

function makePropertyMapper<T, U>(
  prototype: unknown,
  key: string,
  mapper: (value: U) => T
) {
  Object.defineProperty(prototype, key, {
    set(value: U) {
      Object.defineProperty(this, key, {
        get() {
          return Reflect.getMetadata(key, this) as T
        },
        set(value: U) {
          Reflect.defineMetadata(key, mapper(value), this)
        },
        enumerable: true,
      })

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      this[key] = value
    },
    enumerable: true,
  })
}

export function Transform<T, U = string>(transformer: (value: U) => T) {
  return function (target: any, key: string): void {
    makePropertyMapper<T, U>(target, key, transformer)
  }
}

export function ToNumber() {
  return function (target: any, key: string): void {
    makePropertyMapper(target, key, Number)
  }
}
