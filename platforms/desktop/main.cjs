'use strict';

const { app, BrowserWindow, protocol, net, shell, session } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');

const ORIGIN = 'app://meta-games';
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } }
]);

const webRoot = app.isPackaged
  ? path.join(process.resourcesPath, 'web')
  : path.resolve(__dirname, '..', 'dist', 'www');

const adHosts = [
  'doubleclick.net', 'googlesyndication.com', 'googleadservices.com',
  'adsterra.com', 'highperformanceformat.com', 'profitableratecpm.com',
  'monetag.com', 'propellerads.com', 'popcash.net'
];
function hasAdHost(host) {
  return adHosts.some((domain) => host === domain || host.endsWith('.' + domain));
}
function localFileFromUrl(raw) {
  const url = new URL(raw);
  if (url.protocol !== 'app:' || url.host !== 'meta-games') return null;
  const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '');
  const absolute = path.resolve(webRoot, relative);
  if (absolute !== webRoot && !absolute.startsWith(webRoot + path.sep)) return null;
  if (fs.existsSync(absolute) && fs.statSync(absolute).isDirectory()) {
    return path.join(absolute, 'index.html');
  }
  return absolute;
}

app.whenReady().then(async () => {
  protocol.handle('app', (request) => {
    const file = localFileFromUrl(request.url);
    if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      return new Response('Not found', { status: 404 });
    }
    return net.fetch(pathToFileURL(file).toString(), { bypassCustomProtocolHandlers: true });
  });

  // Steam edition must never display or reward viewing ads.
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    try {
      const url = new URL(details.url);
      callback({ cancel: (url.protocol === 'http:' || url.protocol === 'https:') && hasAdHost(url.hostname.toLowerCase()) });
    } catch {
      callback({ cancel: true });
    }
  });
  session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));

  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 500,
    autoHideMenuBar: true,
    backgroundColor: '#050a12',
    title: 'META GAMES',
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  const openExternal = (url) => {
    try {
      if (new URL(url).protocol === 'https:') void shell.openExternal(url);
    } catch { /* refuse malformed URLs */ }
  };
  window.webContents.setWindowOpenHandler(({ url }) => {
    openExternal(url);
    return { action: 'deny' };
  });
  window.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith(ORIGIN + '/')) return;
    event.preventDefault();
    openExternal(url);
  });

  await window.loadURL(ORIGIN + '/meta-games/index.html');
});

app.on('window-all-closed', () => app.quit());
