/**
 * Game Style Forge / MiDaS optional depth scene.
 * Relative inverse depth (white=nearer) drives an atmospheric 2.5D backdrop.
 * NEVER creates gameplay colliders; Rapier remains the sole physics authority.
 */
import * as THREE from 'three';
import noise2D from './noise.js';

const fallbackNoise = `float snoise(vec2 v){return sin(v.x*7.1)*sin(v.y*8.3)*.4;}`;
const noise = noise2D || fallbackNoise;

export async function createDepthLayers(scene, camera, meta) {
  if (!meta?.enabled || meta?.metric_depth) return null;
  const loader = new THREE.TextureLoader();
  const [colorMap, depthMap] = await Promise.all([
    loader.loadAsync(new URL('./depth/reference.png', import.meta.url).href),
    loader.loadAsync(new URL('./depth/relative-depth.png', import.meta.url).href)
  ]);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.anisotropy = 2;
  depthMap.colorSpace = THREE.NoColorSpace;
  depthMap.magFilter = THREE.LinearFilter;
  depthMap.minFilter = THREE.LinearFilter;
  const fog = new THREE.Color(meta.fog || '#7f8f98');
  const layers=[];
  for (let band=0;band<3;band++) {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        image: {value:colorMap}, depth: {value:depthMap},
        parallax: {value:new THREE.Vector2()}, uTime:{value:0},
        fogColor:{value:fog}, layer:{value:band}
      },
      vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader:`
        varying vec2 vUv;
        uniform sampler2D image,depth;
        uniform vec2 parallax;
        uniform vec3 fogColor;
        uniform float uTime,layer;
        ${noise}
        void main(){
          vec2 p=vUv;
          float preliminary=texture2D(depth,p).r;
          vec2 uv=clamp(p+(preliminary-.5)*parallax,vec2(.002),vec2(.998));
          float z=texture2D(depth,uv).r;
          float far=1.-smoothstep(.31,.52,z);
          float mid=smoothstep(.25,.46,z)*(1.-smoothstep(.57,.78,z));
          float near=smoothstep(.61,.83,z);
          float mask=mix(mix(far,mid,step(.5,layer)),near,step(1.5,layer));
          float border=smoothstep(.0,.03,uv.x)*smoothstep(.0,.03,uv.y)*
                      smoothstep(.0,.03,1.-uv.x)*smoothstep(.0,.03,1.-uv.y);
          vec3 c=texture2D(image,uv).rgb;
          float cloud=snoise(uv*4.+vec2(uTime*.012,-uTime*.008));
          float haze=clamp(.07+.07*cloud+.05*(1.-z),0.,.19);
          c=mix(c,fogColor,haze);
          gl_FragColor=vec4(c,mask*border*.74);
        }`,
      transparent:true,depthWrite:false,depthTest:true,side:THREE.DoubleSide
    });
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1,1,1),mat);
    mesh.renderOrder=-12+band;
    mesh.frustumCulled=false;
    scene.add(mesh);
    layers.push(mesh);
  }
  const initialHero=new THREE.Vector3();
  let initialized=false;
  const forward=new THREE.Vector3();
  const isMobile=typeof window!=='undefined' && window.matchMedia('(pointer: coarse)').matches;
  return {
    update(heroPosition,elapsed) {
      if(!initialized){initialHero.copy(heroPosition);initialized=true;}
      camera.getWorldDirection(forward);
      const aspect=Math.max(.5, camera.aspect);
      const tan=Math.tan(THREE.MathUtils.degToRad(camera.fov)*.5);
      const deltaX=THREE.MathUtils.clamp(heroPosition.x-initialHero.x,-40,40);
      const deltaZ=THREE.MathUtils.clamp(heroPosition.z-initialHero.z,-40,40);
      for(let i=0;i<layers.length;i++) {
        const distance=[105,98,91][i];
        const plane=layers[i];
        plane.position.copy(camera.position).addScaledVector(forward,distance);
        plane.quaternion.copy(camera.quaternion);
        plane.scale.set(distance*tan*2*aspect*1.25,distance*tan*2*1.25,1);
        plane.material.uniforms.parallax.value.set(
          THREE.MathUtils.clamp(deltaX*.0018*(i+1)+(isMobile?0:Math.sin(elapsed*.10)*.0015),-.12,.12),
          THREE.MathUtils.clamp(deltaZ*.0011*(i+1),-.10,.10)
        );
        plane.material.uniforms.uTime.value=elapsed;
      }
    },
    dispose(){for(const mesh of layers){scene.remove(mesh);mesh.geometry.dispose();mesh.material.dispose();}colorMap.dispose();depthMap.dispose();}
  };
}
