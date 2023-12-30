/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { loadYAML } from './yaml';
import { deIndentString } from './indent';
import type { Template } from './tpl';
import { newLogger } from './logger';

const logger = newLogger();
describe('test yaml tags', () => {
  const tests: {
    str: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    convert?: ((obj: any) => any) | ((obj: any) => Promise<any>);
    expect: object;
    context?: object;
  }[] = [
    {
      str: `
        hello: world
      `,
      expect: { hello: 'world' },
    },
    {
      str: `
      hey: !var myObj
      `,
      convert: async (o) =>
        await (o.hey as Template).render({
          myObj: { hello: 'world' },
        }),
      expect: { hello: 'world' },
    },
  ];

  test.each(tests)('%#', async (t) => {
    const deindent = deIndentString(t.str);
    const parsed = loadYAML(deindent);
    logger.info('Parsed YAML', {
      str: deindent,
      parsed,
    });
    const expectValue = t.convert ? await t.convert(parsed) : parsed;
    logger.info('Converted YAML', {
      expectValue,
    });
    expect(expectValue).toEqual(t.expect);
  });
});
