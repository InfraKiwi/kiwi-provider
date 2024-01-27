/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { NunjucksContext } from './tpl';
import { nunjucksAddGlobal } from './tpl';
import path from 'node:path';
import { getOSInfo, getProcessInfo } from '../os';
import { get10InfraInfo } from '../10infra';

function getVars(this: NunjucksContext) {
  return this.getVariables();
}

nunjucksAddGlobal('getVars', getVars);

function fnOs(this: NunjucksContext) {
  return getOSInfo();
}

nunjucksAddGlobal('os', fnOs);

function fnProcess(this: NunjucksContext) {
  return getProcessInfo();
}

nunjucksAddGlobal('process', fnProcess);

function env(this: NunjucksContext) {
  return { ...process.env };
}

nunjucksAddGlobal('env', env);

function fn10InfraInfo(this: NunjucksContext) {
  return get10InfraInfo();
}

nunjucksAddGlobal('tenInfraInfo', fn10InfraInfo);

function pathJoin(this: NunjucksContext, ...params: string[]) {
  return path.join(...params);
}

nunjucksAddGlobal('pathJoin', pathJoin);

function date(this: NunjucksContext, date?: number | string) {
  if (date == null) {
    return new Date();
  }
  return new Date(date);
}

nunjucksAddGlobal('date', date);
