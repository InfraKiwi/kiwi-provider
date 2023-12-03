import type { Matchers, BaseExpect, AsymmetricMatchers } from 'expect';

declare namespace expect {
  interface PromiseMatchers<T = unknown> {
    /**
     * Unwraps the reason of a rejected promise so any other matcher can be chained.
     * If the promise is fulfilled the assertion fails.
     */
    rejects: Matchers<Promise<void>, T> & Inverse<Matchers<Promise<void>, T>>;

    /**
     * Unwraps the value of a fulfilled promise so any other matcher can be chained.
     * If the promise is rejected the assertion fails.
     */
    resolves: Matchers<Promise<void>, T> & Inverse<Matchers<Promise<void>, T>>;
  }

  interface Inverse<Matchers> {
    /**
     * Inverse next matcher. If you know how to test something, `.not` lets you test its opposite.
     */
    not: Matchers;
  }
}

declare namespace jest {
  interface ExpectCustomMessageOptions {
    showMatcherMessage?: boolean;
    showPrefix?: boolean;
    showStack?: boolean;
  }

  type Expect = (<T = unknown>(
    actual: T,
    message?: string,
    options?: ExpectCustomMessageOptions,
  ) => import('expect').Matchers<void, T> & expect.Inverse<Matchers<void, T>> & expect.PromiseMatchers<T>) &
  BaseExpect &
  AsymmetricMatchers &
  expect.Inverse<Omit<AsymmetricMatchers, 'any' | 'anything'>>;
}
