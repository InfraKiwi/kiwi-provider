export function bytesToHuman(bytes: number, decimals?: number) {
  if (bytes == 0) {
    return '0B';
  }
  const k = 1024,
    dm = decimals ?? 2,
    sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
}
