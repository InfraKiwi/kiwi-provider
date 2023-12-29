/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

function z(n: number) {
  return (n < 10 ? '0' : '') + n;
}

export function secondsToHMS(secs: number) {
  const sign = secs < 0 ? '-' : '';
  secs = Math.abs(secs);

  const parts: string[] = [sign];

  const h = (secs / 3600) | 0;
  if (h) {
    parts.push(`${z(h)}h`);
  }
  const m = ((secs % 3600) / 60) | 0;
  if (h || m) {
    parts.push(`${z(m)}m`);
  }
  const s = secs % 60;
  parts.push(`${z(s)}s`);

  return parts.join('');
}
