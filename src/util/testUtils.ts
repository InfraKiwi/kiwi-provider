export function areWeTestingWithJest() {
  return process.env.JEST_WORKER_ID !== undefined;
}

export const testTimeoutLong = 60 * 1000;
