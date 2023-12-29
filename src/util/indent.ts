/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

export interface GetStringIndentationResult {
  deIndentedString: string;
  indent: string;
}

/**
 * Given an indented string, uses the first line's indentation as base to de-indent
 * the rest of the string, and returns both the de-indented string and the
 * indentation found as prefix.
 */
export function getStringIndentation(value: string): GetStringIndentationResult {
  const lines = value.split('\n');
  let indent = '';
  for (const line of lines) {
    // Skip initial newlines
    if (line.trim() == '') {
      continue;
    }
    const match = /^(\s+)[^ ]/.exec(line);
    if (match) {
      indent = match[1];
    }
    break;
  }

  const deIndentedString = lines
    .map((line) => (line.startsWith(indent) ? line.substring(indent.length) : line).trimEnd())
    .join('\n');

  return {
    deIndentedString,
    indent,
  };
}

export function deIndentString(value: string): string {
  return getStringIndentation(value).deIndentedString;
}

export function indentString(value: string, indent: number): string {
  const deIndented = getStringIndentation(value).deIndentedString;
  return deIndented
    .split('\n')
    .map((s) => (' '.repeat(indent) + s).trimEnd())
    .join('\n');
}
