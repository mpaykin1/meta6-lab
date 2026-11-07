/* META GAMES shared loader: original browser scripts, not recompiled or modified. */
(function (root) {
  'use strict';
  const current=document.currentScript;
  const base=new URL('./',current?.src||location.href);
  const entries=Object.freeze({
    'observer-story':Object.freeze({file:'components/observer-story/story-system.js',global:'ObserverStorySystem'}),
    'observer-mobile-input':Object.freeze({file:'components/observer-mobile-input/mobile-controls.js',global:'ObserverMobileControls'})
  });
  const cache=new Map();
  function use(id) {
    if (!Object.hasOwn(entries,id)) return Promise.reject(new Error('Unregistered shared component'));
    if(cache.has(id))return cache.get(id);
    const entry=entries[id];
    const promise=new Promise((resolve,reject)=>{
      if(root[entry.global])return resolve(root[entry.global]);
      const el=document.createElement('script');
      el.async=true;
      el.src=new URL(entry.file,base).href;
      el.onload=()=>root[entry.global]?resolve(root[entry.global]):reject(new Error('Missing shared export '+id));
      el.onerror=()=>reject(new Error('Shared script failed to load '+id));
      document.head.appendChild(el);
    });
    cache.set(id,promise);
    promise.catch(()=>cache.delete(id));
    return promise;
  }
  Object.defineProperty(root,'MetaShared',{value:Object.freeze({use,available:Object.keys(entries)}),
    writable:false,configurable:false});
})(window);
