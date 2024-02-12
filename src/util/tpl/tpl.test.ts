/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { describe, expect, test } from '@jest/globals';
import type { ResolveTemplatesOptions } from './tpl';
import { extractAllTemplates, resolveTemplates, Template } from './tpl';
import traverse from 'traverse';
import { arrayCompare } from '../array';

describe('processes templates correctly', () => {
  describe('processes string templates correctly', () => {
    interface TplTestEntry {
      str: string;
      isTpl: boolean;
      exp?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      context?: any;
    }

    const templates: TplTestEntry[] = [
      {
        str: 'Hello ${{ getVars() }}',
        isTpl: true,
      },
      {
        str: 'Hello ${{ "${{ world }}" | tpl }}',
        isTpl: true,
        exp: 'Hello hey',
      },
      {
        str: 'Text: ${{ [__dirname, "test", "file.txt"] | join("/") | fileRead }}',
        isTpl: true,
        exp: 'Text: Hello text',
        context: { __dirname },
      },
      {
        str: 'File: ${{ [__dirname, "test", "eval.js"] | join("/") | evalFile }}',
        isTpl: true,
        exp: 'File: hey',
        context: { __dirname },
      },
      {
        str: 'Hello',
        isTpl: false,
      },
      {
        str: 'Hello {{ world }}',
        isTpl: false,
      },
      {
        str: 'Hello ${{ world }}',
        isTpl: true,
        exp: 'Hello hey',
      },
      {
        str: 'Hello ${{ world | upper }}',
        isTpl: true,
        exp: 'Hello HEY',
      },
      {
        str: 'Template of templates, hello ${{ world }}',
        isTpl: true,
        exp: 'Template of templates, hello world mars',
        context: {
          worldName: 'mars',
          world: extractAllTemplates('world ${{ worldName }}'),
        },
      },
      {
        str: 'Template of templates, ${{ nested1 }}',
        isTpl: true,
        exp: 'Template of templates, nested1 nested2 n3 nestedA nested4 nested5',
        context: {
          a: 'nestedA',
          nested5: 'nested5',
          aVeryLongNameVarNested3: 'n3 ${{ a }}',
          nested4: 'nested4 ${{ nested5 }}',
          nested2: 'nested2 ${{ aVeryLongNameVarNested3 }} ${{ nested4 }}',
          nested1: 'nested1 ${{ nested2 }}',
        },
      },
    ];

    test.each(templates)('%#', async (el) => {
      const extract = extractAllTemplates(el.str);
      if (el.isTpl) {
        expect(extract).toBeInstanceOf(Template);
        const rendered = await resolveTemplates(
          extract,
          el.context ? extractAllTemplates(el.context) : { world: 'hey' }
        );
        if (el.exp) {
          expect(rendered).toEqual(el.exp);
        }
      } else {
        expect(extract).not.toBeInstanceOf(Template);
      }
    });
  });

  describe('handles skipping paths', () => {
    interface TplTestEntry {
      el: object;
      expTplPaths?: string[][];
      options?: ResolveTemplatesOptions;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      context?: any;
    }

    const templates: TplTestEntry[] = [
      {
        el: {
          str: 'Hello ${{ getVars() }}',
          lower: {
            anoth: 'Anoth ${{ a }}',
          },
        },
        options: {
          skipPaths: [['lower', 'anoth']],
        },
        expTplPaths: [['lower', 'anoth']],
      },
    ];

    test.each(templates)('%#', async (el) => {
      const extract = extractAllTemplates(el.el);
      const rendered = await resolveTemplates(
        extract,
        el.context ? extractAllTemplates(el.context) : { world: 'hey' },
        el.options
      );
      if (el.expTplPaths) {
        for (const expTplPath of el.expTplPaths) {
          const elAtPath = traverse.get(rendered, expTplPath);
          // Path should be skipped
          expect(elAtPath).toBeInstanceOf(Template);
        }
        // Find other non-mapped template
        const otherTpl: string[][] = [];
        traverse.forEach(rendered, function (p) {
          if (el.expTplPaths!.find((p) => arrayCompare(this.path, p))) {
            // Path already covered in expected ones
            return;
          }
          if (p instanceof Template) {
            otherTpl.push(this.path);
          }
        });
        expect(otherTpl.length).toEqual(0);
      }
    });
  });
});
