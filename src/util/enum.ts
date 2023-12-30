/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

// https://github.com/microsoft/TypeScript/issues/30611
export function getEnumValuesArray<TEnumValue extends string | number>(e: { [key in string]: TEnumValue }): string[] {
  return [
    ...(Object.values(e).filter((el) => typeof el == 'string') as string[]),
    ...Object.values(e)
      .filter((el) => typeof el == 'number')
      .map((el) => (el as number).toString(10)),
  ];
}
