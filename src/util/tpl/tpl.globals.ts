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
