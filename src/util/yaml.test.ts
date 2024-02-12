/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { dumpYAML, loadYAML } from './yaml';
import { deIndentString } from './indent';
import type { Template } from './tpl';
import { resolveTemplates } from './tpl';
import { newLogger } from './logger';
import Joi from 'joi';

const logger = newLogger();
describe('test yaml tags', () => {
  const tests: {
    str: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    convert?: ((obj: any) => any) | ((obj: any) => Promise<any>);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect: ((v: any) => boolean) | any;
    expectSerialized?: string;
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
    {
      str: `
      hey: !var myVar
      `,
      convert: async (o) =>
        await (o.hey as Template).render({
          myVar: true,
        }),
      expect: true,
    },
    {
      str: `
      hey: !v myVar
      `,
      convert: async (o) =>
        resolveTemplates(o, {
          myVar: true,
        }),
      expect: {
        hey: true,
      },
    },
    {
      str: `
      hey: !joi Joi.string()
      `,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect: (v: any) => Joi.isSchema(v.hey),
    },
    {
      str: `
      hey: !joi Joi.string().custom(joiValidateSyncFSExists)
      `,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect: (v: any) => Joi.isSchema(v.hey),
    },
  ];

  test.each(tests)('%#', async (t) => {
    const deindent = deIndentString(t.str);
    const parsed = loadYAML(deindent);
    const serialized = dumpYAML(parsed);
    logger.info('Parsed YAML', {
      str: deindent,
      parsed,
      serialized,
    });

    {
      const expectValue = t.convert ? await t.convert(parsed) : parsed;
      logger.info('Converted YAML', {
        expectValue,
      });
      if (typeof t.expect == 'function') {
        expect(t.expect(expectValue)).toEqual(true);
      } else {
        expect(expectValue).toEqual(t.expect);
      }
    }

    // Process serialized
    {
      const parsed = loadYAML(serialized);
      const expectValue = t.convert ? await t.convert(parsed) : parsed;
      logger.info('Converted YAML (from serialized)', {
        expectValue,
      });
      if (typeof t.expect == 'function') {
        expect(t.expect(expectValue)).toEqual(true);
      } else {
        expect(expectValue).toEqual(t.expect);
      }
    }
  });
});
