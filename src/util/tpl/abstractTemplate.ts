export abstract class AbstractTemplate {
  protected readonly original: string;

  constructor(value: string) {
    this.original = value;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract render(context?: Record<string, unknown>): Promise<any>;
}
export abstract class AbstractTemplateSync {
  protected readonly original: string;

  constructor(value: string) {
    this.original = value;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract render(context?: Record<string, unknown>): any;
}
