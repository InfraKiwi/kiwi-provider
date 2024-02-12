/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import type { NunjucksContext } from './tpl';
import { nunjucksAddFilter } from './tpl';
import { bytesToHuman } from '../bytesToHuman';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toJSON(this: NunjucksContext, value: any) {
  return JSON.stringify(value);
}

nunjucksAddFilter('toJSON', toJSON);
nunjucksAddFilter('toJson', toJSON);

function fromJSON(this: NunjucksContext, value: string) {
  return JSON.parse(value);
}

nunjucksAddFilter('fromJSON', fromJSON);
nunjucksAddFilter('fromJson', fromJSON);

function keys(this: NunjucksContext, value: object) {
  return Object.keys(value);
}

nunjucksAddFilter('keys', keys);

function values(this: NunjucksContext, value: object) {
  return Object.values(value);
}

nunjucksAddFilter('values', values);

function entries(this: NunjucksContext, value: object) {
  return Object.entries(value);
}

nunjucksAddFilter('entries', entries);

function setAttribute(this: NunjucksContext, dictionary: Record<string, unknown>, key: string, value: unknown) {
  dictionary[key] = value;
  return dictionary;
}

nunjucksAddFilter('setAttribute', setAttribute);

function typeOf(this: NunjucksContext, value: object) {
  return typeof value;
}

nunjucksAddFilter('typeOf', typeOf);

function isArray(this: NunjucksContext, value: object) {
  return Array.isArray(value);
}

nunjucksAddFilter('isArray', isArray);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function instanceOf(this: NunjucksContext, value: any, other: any) {
  return value instanceof other;
}

nunjucksAddFilter('instanceOf', instanceOf);

function bytesToHumanFn(this: NunjucksContext, value: number, decimals?: number) {
  return bytesToHuman(value, decimals);
}

nunjucksAddFilter('bytesToHuman', bytesToHumanFn);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isDate(this: NunjucksContext, value: any) {
  return value instanceof Date;
}

nunjucksAddFilter('isDate', isDate);
