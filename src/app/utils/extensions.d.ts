// Monkey-patch built-in types https://github.com/Microsoft/TypeScript/issues/5944

interface Array<T> {
  intersperse(data: T | ((item: T, i: number) => any)): Array<T>
}
