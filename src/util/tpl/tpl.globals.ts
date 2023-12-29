/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { NunjucksContext } from './tpl';
import { nunjucksAddGlobal } from './tpl';
import path from 'node:path';
import { getOSInfo } from '../os';

function getVars(this: NunjucksContext) {
  return this.getVariables();
}

nunjucksAddGlobal('getVars', getVars);

function os(this: NunjucksContext) {
  return getOSInfo();
}

nunjucksAddGlobal('os', os);

function pathJoin(this: NunjucksContext, ...params: string[]) {
  return path.join(...params);
}

nunjucksAddGlobal('pathJoin', pathJoin);
