/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import Joi from 'joi';

export const RecipeSourceWrapperSchema = Joi.object({
  // If true, will preserve loaded recipe group/host variables
  trusted: Joi.boolean(),

  // If true, this source will not be forwarded to any recipes downstream
  skipPropagate: Joi.boolean(),

  // A string that can be used to uniquely identify this source
  id: Joi.string().regex(/^[\w-]+$/),

  /*
   * If the source performs any fs-related operations, they will be based on this directory.
   * Will default to the recipe's own folder.
   */
  workDir: Joi.string(),
})
  .unknown(true)
  .meta({ className: 'RecipeSourceWrapperInterface' });
