import { createHash } from 'node:crypto';

export function sha1Hex(str: string): string {
  return createHash('sha1').update(str).digest('hex');
}

export function sha256Hex(str: string): string {
  return createHash('sha256').update(str).digest('hex');
}
