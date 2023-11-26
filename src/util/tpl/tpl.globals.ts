import { newDebug } from '../debug';
import type { NunjucksContext } from './tpl';
import { nunjucksAddGlobal } from './tpl';
import path from 'node:path';

const debug = newDebug(__filename);

function getVars(this: NunjucksContext) {
  return this.getVariables();
}

nunjucksAddGlobal('getVars', getVars);

function pathJoin(this: NunjucksContext, ...params: string[]) {
  return path.join(...params);
}

nunjucksAddGlobal('pathJoin', pathJoin);
