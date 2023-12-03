// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function expectCatch<T = unknown>(actual: T, err: any) {
  // eslint-disable-next-line jest/valid-expect,@typescript-eslint/no-unsafe-call
  return expect(actual, err.toString());
}
