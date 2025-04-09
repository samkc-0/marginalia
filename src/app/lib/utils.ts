export function choose<T>(arr: T[]): T {
  const i = Math.floor(Math.random() * arr.length)
  return arr[i]
}
