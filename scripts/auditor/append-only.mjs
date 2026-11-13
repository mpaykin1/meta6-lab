export function assertAppendOnly(before, after) {
  const oldLines = before.replace(/\r\n/g, '\n').split('\n');
  const newLines = after.replace(/\r\n/g, '\n').split('\n');
  let cursor = 0;
  for (const line of oldLines) {
    while (cursor < newLines.length && newLines[cursor] !== line) cursor++;
    if (cursor === newLines.length) throw Error('Existing test line removed or changed: ' + line);
    cursor++;
  }
}
