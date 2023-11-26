declare module 'postject' {
  interface InjectOptions {
    machoSegmentName?: string;
    overwrite?: boolean;
    sentinelFuse?: string;
  }

  function inject(filename: string, resourceName: string, resourceData: Buffer, options?: InjectOptions): Promise<void>;
}
