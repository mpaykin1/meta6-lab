// One source of truth for the commands copied from Connect and exercised by CI.
export const serverRelativePath = 'shared/approved/mcp.mjs';

export function buildClientConfigs(cloneDirectory) {
  const dir = String(cloneDirectory || '').trim().replace(/([\\/])(?:[\\/])+$/, '$1').replace(/([^:\\/])[\\/]$/, '$1');
  if (!/^(?:\/|[a-zA-Z]:[\\/])/.test(dir) || /[\r\n"'<>`$;&|()]/.test(dir)) {
    throw new Error('Укажите абсолютный путь к локальной папке meta6-lab.');
  }
  const slash = dir.includes('\\') ? '\\' : '/';
  const file = dir + slash + serverRelativePath.replaceAll('/', slash);
  const launch = {command: 'node', args: [file]};
  return {
    launch,
    desktop: {mcpServers: {'meta-games': launch}},
    cursor: {mcpServers: {'meta-games': launch}},
    vscode: {servers: {'meta-games': {type: 'stdio', ...launch}}},
    claudeCode: 'claude mcp add meta-games -- node "' + file + '"'
  };
}
