/*
 * (c) 2024 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */
export async function asyncStringReplace(
  str: string,
  regex: RegExp,
  aReplacer: (...matches: string[]) => string | Promise<string>
): Promise<string> {
  const substrings: ReturnType<typeof aReplacer>[] = [];
  let match;
  let i = 0;
  while ((match = regex.exec(str)) !== null) {
    // put non matching string
    substrings.push(str.slice(i, match.index));
    // call the async replacer function with the matched array spreaded
    substrings.push(aReplacer(...match));
    i = regex.lastIndex;
  }
  // put the rest of str
  substrings.push(str.slice(i));
  // wait for aReplacer calls to finish and join them back into string
  return (await Promise.all(substrings)).join('');
}
