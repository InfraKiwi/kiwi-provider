/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

declare module 'postject' {
  interface InjectOptions {
    machoSegmentName?: string;
    overwrite?: boolean;
    sentinelFuse?: string;
  }

  function inject(filename: string, resourceName: string, resourceData: Buffer, options?: InjectOptions): Promise<void>;
}
