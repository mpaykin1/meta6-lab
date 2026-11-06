'use strict';

const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('META_GAMES_NATIVE', Object.freeze({
  platform: 'steam',
  adsEnabled: false
}));
