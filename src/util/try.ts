import { areWeTestingWithJest } from './testUtils';

export async function tryOrThrowAsync<T>(fn: () => Promise<T>, wrapMessage: string): Promise<T> {
  try {
    return await fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    const errIsError = err instanceof Error;
    throw new Error(
      wrapMessage + (areWeTestingWithJest() ? `\n\nCaused by: ${err}${errIsError ? `\n\n` + err.stack : ''}` : ''),
      { cause: err },
    );
  }
}

export function tryOrThrow<T>(fn: () => T, wrapMessage: string): T {
  try {
    return fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    const errIsError = err instanceof Error;
    throw new Error(
      wrapMessage + (areWeTestingWithJest() ? `\n\nCaused by: ${err}${errIsError ? `\n\n` + err.stack : ''}` : ''),
      { cause: err },
    );
  }
}
