import util from 'node:util';

export function getErrorPrintfClass(name: string, message: string) {
  return class extends Error {
    constructor(...args: unknown[]) {
      // https://stackoverflow.com/a/26673461
      // Prevent inspect depth issues
      for (const k in args) {
        if (typeof args[k] !== 'string') {
          args[k] = util.inspect(args[k], { depth: null });
        }
      }
      const formatted = util.format.apply(null, [message, ...args]);
      super(formatted);
      this.name = name;
      Error.captureStackTrace(this, this.constructor);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static withCause(cause: any, ...args: unknown[]) {
      const err = new this(...args);
      err.cause = cause;
      return err;
    }
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function instanceOfNodeError<T extends new (...args: any) => Error>(
  value: Error,
  errorType: T,
): value is InstanceType<T> & NodeJS.ErrnoException {
  return value instanceof errorType;
}
