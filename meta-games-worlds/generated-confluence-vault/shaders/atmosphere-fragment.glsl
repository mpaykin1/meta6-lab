#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform float uTime;
uniform float uFogDensity;
uniform vec3 uFogColor;
uniform vec3 uAccentColor;
float hash(vec2 p){
  return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453);
}
float noise2(vec2 p){
  vec2 i=floor(p), f=fract(p);
  f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),
             mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y);
}
void main(){
  vec2 drift = vec2(vUv.x*3.2 + uTime*0.018, vUv.y*2.1-uTime*0.009);
  float mist = noise2(drift);
  float bands = mist;
  float horizon = smoothstep(0.0, 1.0, 1.0-vUv.y);
  float opacity = clamp((0.10 + bands*0.42) * horizon *
     (uFogDensity/0.045), 0.0, 0.68);
  vec3 mistColor = mix(uFogColor, uAccentColor, bands*0.18);
  fragColor = vec4(mistColor, opacity);
}