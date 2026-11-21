/** Pinned meshoptimizer decoder, GLB preservation and safe source fallback.
 * The authored assets are never modified or replaced without verified manifest entries.
 */
export function configureAssetLoader(loader) {
  const originalLoad=loader.load.bind(loader);
  const manifestReady=fetch('./assets/optimized/manifest.json')
    .then(async r=>r.ok?await r.json():{assets:{}})
    .catch(()=>({assets:{}}));
  let decoderReady;
  function ensureDecoder(){
    if(decoderReady)return decoderReady;
    decoderReady=(async()=>{
      const sources=[
        ()=>import('meshoptimizer/decoder'),
        ()=>import('three/addons/libs/meshopt_decoder.module.js')
      ];
      for(const getModule of sources){
        try{
          const module=await getModule();
          const decoder=module.MeshoptDecoder;
          if(!decoder || decoder.supported===false) continue;
          await decoder.ready;
          loader.setMeshoptDecoder(decoder);
          return true;
        }catch(error){console.warn('Meshopt decoder source unavailable',error);}
      }
      return false;
    })();
    return decoderReady;
  }
  loader.load=function(url,onLoad,onProgress,onError){
    let canceled=false, request=null;
    const start=(path,fallbackPath)=>{
      if(canceled)return;
      request=originalLoad(path,gltf=>{if(!canceled)onLoad?.(gltf)},onProgress,error=>{
        if(canceled)return;
        if(fallbackPath && path!==fallbackPath){
          console.warn('Compressed GLB failed, reverting to original',url,error);
          start(fallbackPath,null);
        }else onError?.(error);
      });
    };
    manifestReady.then(async manifest=>{
      if(canceled)return;
      const entry=manifest?.assets?.[url];
      if(!entry || !entry.path || !entry.sourceSha256){start(url,null);return;}
      if(entry.meshopt && !(await ensureDecoder())){start(url,null);return;}
      start(entry.path,url);
    }).catch(()=>start(url,null));
    return {abort(){canceled=true;request?.abort?.()}};
  };
  return loader;
}
