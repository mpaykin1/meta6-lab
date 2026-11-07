'use strict';
// Only packaged local game pages can request fullscreen or pointer capture.
function localGamePage(raw) {
  try {
    const uri = new URL(raw);
    return uri.protocol === 'app:' && uri.host === 'meta-games' &&
      (uri.pathname.endsWith('/') || uri.pathname.endsWith('.html')) &&
      uri.pathname !== '/' && !uri.username && !uri.password &&
      !uri.search && !uri.hash;
  } catch { return false; }
}
function allowLocalGamePermission(pageUrl, requestingUrl, permission) {
  return (permission === 'fullscreen' || permission === 'pointerLock') &&
    localGamePage(pageUrl) && localGamePage(requestingUrl || pageUrl);
}
module.exports = {allowLocalGamePermission};
