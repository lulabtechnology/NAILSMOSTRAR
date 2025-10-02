export function formatMoney(n: number) {
  return `$${n.toFixed(2)}`;
}

export function safe<T>(fn: () => Promise<T>) {
  return fn().then<[T|null, null]>(d => [d, null]).catch<[null, Error]>(e => [null, e]);
}
