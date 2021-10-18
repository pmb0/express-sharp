export function optionalRequire<T>(
  packageName: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
): T {
  try {
    // eslint-disable-next-line security/detect-non-literal-require,  @typescript-eslint/no-var-requires
    return require(packageName) as unknown as T
  } catch {
    return {} as unknown as T
  }
}
