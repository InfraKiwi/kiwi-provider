/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

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
