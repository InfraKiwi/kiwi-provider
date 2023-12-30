/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { RecipeInterface } from '../../../components/recipe.schema.gen';
import type { EvalFunctionInterface } from '../schema.gen';
import type { RunContextPublicVarsInterface } from '../../../util/runContext.schema.gen';

const myFn: EvalFunctionInterface = ({ context, result }) => {
  context.logger.info('Hello world!');
  result.vars.hello = 'world';
};

export const recipe: RecipeInterface = {
  tasks: [
    {
      eval: {
        code: myFn,
      },
      out: 'result',
    },
    {
      debug: 'Hello ${{ result.hello }}!',
    },
    {
      test: (c: RunContextPublicVarsInterface) => c.vars.result.hello == 'world',
    },
  ],
};
