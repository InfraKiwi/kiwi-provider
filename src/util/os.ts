export const platformIsWin = process.platform === 'win32';
export const platformIsMacOS = process.platform === 'darwin';

export const platformNewLine = (platformIsWin ? '\r' : '') + '\n';
