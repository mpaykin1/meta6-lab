(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))i(a);new MutationObserver(a=>{for(const s of a)if(s.type==="childList")for(const l of s.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&i(l)}).observe(document,{childList:!0,subtree:!0});function t(a){const s={};return a.integrity&&(s.integrity=a.integrity),a.referrerPolicy&&(s.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?s.credentials="include":a.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(a){if(a.ep)return;a.ep=!0;const s=t(a);fetch(a.href,s)}})();/**
 * @license
 * Copyright 2010-2023 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const REVISION="160",CullFaceNone=0,CullFaceBack=1,CullFaceFront=2,PCFShadowMap=1,PCFSoftShadowMap=2,VSMShadowMap=3,FrontSide=0,BackSide=1,DoubleSide=2,NoBlending=0,NormalBlending=1,AdditiveBlending=2,SubtractiveBlending=3,MultiplyBlending=4,CustomBlending=5,AddEquation=100,SubtractEquation=101,ReverseSubtractEquation=102,MinEquation=103,MaxEquation=104,ZeroFactor=200,OneFactor=201,SrcColorFactor=202,OneMinusSrcColorFactor=203,SrcAlphaFactor=204,OneMinusSrcAlphaFactor=205,DstAlphaFactor=206,OneMinusDstAlphaFactor=207,DstColorFactor=208,OneMinusDstColorFactor=209,SrcAlphaSaturateFactor=210,ConstantColorFactor=211,OneMinusConstantColorFactor=212,ConstantAlphaFactor=213,OneMinusConstantAlphaFactor=214,NeverDepth=0,AlwaysDepth=1,LessDepth=2,LessEqualDepth=3,EqualDepth=4,GreaterEqualDepth=5,GreaterDepth=6,NotEqualDepth=7,MultiplyOperation=0,MixOperation=1,AddOperation=2,NoToneMapping=0,LinearToneMapping=1,ReinhardToneMapping=2,CineonToneMapping=3,ACESFilmicToneMapping=4,CustomToneMapping=5,AgXToneMapping=6,UVMapping=300,CubeReflectionMapping=301,CubeRefractionMapping=302,EquirectangularReflectionMapping=303,EquirectangularRefractionMapping=304,CubeUVReflectionMapping=306,RepeatWrapping=1e3,ClampToEdgeWrapping=1001,MirroredRepeatWrapping=1002,NearestFilter=1003,NearestMipmapNearestFilter=1004,NearestMipmapLinearFilter=1005,LinearFilter=1006,LinearMipmapNearestFilter=1007,LinearMipmapLinearFilter=1008,UnsignedByteType=1009,ByteType=1010,ShortType=1011,UnsignedShortType=1012,IntType=1013,UnsignedIntType=1014,FloatType=1015,HalfFloatType=1016,UnsignedShort4444Type=1017,UnsignedShort5551Type=1018,UnsignedInt248Type=1020,AlphaFormat=1021,RGBAFormat=1023,LuminanceFormat=1024,LuminanceAlphaFormat=1025,DepthFormat=1026,DepthStencilFormat=1027,RedFormat=1028,RedIntegerFormat=1029,RGFormat=1030,RGIntegerFormat=1031,RGBAIntegerFormat=1033,RGB_S3TC_DXT1_Format=33776,RGBA_S3TC_DXT1_Format=33777,RGBA_S3TC_DXT3_Format=33778,RGBA_S3TC_DXT5_Format=33779,RGB_PVRTC_4BPPV1_Format=35840,RGB_PVRTC_2BPPV1_Format=35841,RGBA_PVRTC_4BPPV1_Format=35842,RGBA_PVRTC_2BPPV1_Format=35843,RGB_ETC1_Format=36196,RGB_ETC2_Format=37492,RGBA_ETC2_EAC_Format=37496,RGBA_ASTC_4x4_Format=37808,RGBA_ASTC_5x4_Format=37809,RGBA_ASTC_5x5_Format=37810,RGBA_ASTC_6x5_Format=37811,RGBA_ASTC_6x6_Format=37812,RGBA_ASTC_8x5_Format=37813,RGBA_ASTC_8x6_Format=37814,RGBA_ASTC_8x8_Format=37815,RGBA_ASTC_10x5_Format=37816,RGBA_ASTC_10x6_Format=37817,RGBA_ASTC_10x8_Format=37818,RGBA_ASTC_10x10_Format=37819,RGBA_ASTC_12x10_Format=37820,RGBA_ASTC_12x12_Format=37821,RGBA_BPTC_Format=36492,RGB_BPTC_SIGNED_Format=36494,RGB_BPTC_UNSIGNED_Format=36495,RED_RGTC1_Format=36283,SIGNED_RED_RGTC1_Format=36284,RED_GREEN_RGTC2_Format=36285,SIGNED_RED_GREEN_RGTC2_Format=36286,LinearEncoding=3e3,sRGBEncoding=3001,BasicDepthPacking=3200,RGBADepthPacking=3201,TangentSpaceNormalMap=0,ObjectSpaceNormalMap=1,NoColorSpace="",SRGBColorSpace="srgb",LinearSRGBColorSpace="srgb-linear",DisplayP3ColorSpace="display-p3",LinearDisplayP3ColorSpace="display-p3-linear",LinearTransfer="linear",SRGBTransfer="srgb",Rec709Primaries="rec709",P3Primaries="p3",KeepStencilOp=7680,AlwaysStencilFunc=519,NeverCompare=512,LessCompare=513,EqualCompare=514,LessEqualCompare=515,GreaterCompare=516,NotEqualCompare=517,GreaterEqualCompare=518,AlwaysCompare=519,StaticDrawUsage=35044,DynamicDrawUsage=35048,GLSL3="300 es",_SRGBAFormat=1035,WebGLCoordinateSystem=2e3,WebGPUCoordinateSystem=2001;class EventDispatcher{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const i=this._listeners;return i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const a=this._listeners[e];if(a!==void 0){const s=a.indexOf(t);s!==-1&&a.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const i=this._listeners[e.type];if(i!==void 0){e.target=this;const a=i.slice(0);for(let s=0,l=a.length;s<l;s++)a[s].call(this,e);e.target=null}}}const _lut=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let _seed=1234567;const DEG2RAD=Math.PI/180,RAD2DEG=180/Math.PI;function generateUUID(){const r=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(_lut[r&255]+_lut[r>>8&255]+_lut[r>>16&255]+_lut[r>>24&255]+"-"+_lut[e&255]+_lut[e>>8&255]+"-"+_lut[e>>16&15|64]+_lut[e>>24&255]+"-"+_lut[t&63|128]+_lut[t>>8&255]+"-"+_lut[t>>16&255]+_lut[t>>24&255]+_lut[i&255]+_lut[i>>8&255]+_lut[i>>16&255]+_lut[i>>24&255]).toLowerCase()}function clamp$1(r,e,t){return Math.max(e,Math.min(t,r))}function euclideanModulo(r,e){return(r%e+e)%e}function mapLinear(r,e,t,i,a){return i+(r-e)*(a-i)/(t-e)}function inverseLerp(r,e,t){return r!==e?(t-r)/(e-r):0}function lerp(r,e,t){return(1-t)*r+t*e}function damp$1(r,e,t,i){return lerp(r,e,1-Math.exp(-t*i))}function pingpong(r,e=1){return e-Math.abs(euclideanModulo(r,e*2)-e)}function smoothstep(r,e,t){return r<=e?0:r>=t?1:(r=(r-e)/(t-e),r*r*(3-2*r))}function smootherstep(r,e,t){return r<=e?0:r>=t?1:(r=(r-e)/(t-e),r*r*r*(r*(r*6-15)+10))}function randInt(r,e){return r+Math.floor(Math.random()*(e-r+1))}function randFloat(r,e){return r+Math.random()*(e-r)}function randFloatSpread(r){return r*(.5-Math.random())}function seededRandom(r){r!==void 0&&(_seed=r);let e=_seed+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function degToRad(r){return r*DEG2RAD}function radToDeg(r){return r*RAD2DEG}function isPowerOfTwo(r){return(r&r-1)===0&&r!==0}function ceilPowerOfTwo(r){return Math.pow(2,Math.ceil(Math.log(r)/Math.LN2))}function floorPowerOfTwo(r){return Math.pow(2,Math.floor(Math.log(r)/Math.LN2))}function setQuaternionFromProperEuler(r,e,t,i,a){const s=Math.cos,l=Math.sin,o=s(t/2),c=l(t/2),h=s((e+i)/2),f=l((e+i)/2),u=s((e-i)/2),d=l((e-i)/2),g=s((i-e)/2),_=l((i-e)/2);switch(a){case"XYX":r.set(o*f,c*u,c*d,o*h);break;case"YZY":r.set(c*d,o*f,c*u,o*h);break;case"ZXZ":r.set(c*u,c*d,o*f,o*h);break;case"XZX":r.set(o*f,c*_,c*g,o*h);break;case"YXY":r.set(c*g,o*f,c*_,o*h);break;case"ZYZ":r.set(c*_,c*g,o*f,o*h);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+a)}}function denormalize(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return r/4294967295;case Uint16Array:return r/65535;case Uint8Array:return r/255;case Int32Array:return Math.max(r/2147483647,-1);case Int16Array:return Math.max(r/32767,-1);case Int8Array:return Math.max(r/127,-1);default:throw new Error("Invalid component type.")}}function normalize(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return Math.round(r*4294967295);case Uint16Array:return Math.round(r*65535);case Uint8Array:return Math.round(r*255);case Int32Array:return Math.round(r*2147483647);case Int16Array:return Math.round(r*32767);case Int8Array:return Math.round(r*127);default:throw new Error("Invalid component type.")}}const MathUtils={DEG2RAD,RAD2DEG,generateUUID,clamp:clamp$1,euclideanModulo,mapLinear,inverseLerp,lerp,damp:damp$1,pingpong,smoothstep,smootherstep,randInt,randFloat,randFloatSpread,seededRandom,degToRad,radToDeg,isPowerOfTwo,ceilPowerOfTwo,floorPowerOfTwo,setQuaternionFromProperEuler,normalize,denormalize};class Vector2{constructor(e=0,t=0){Vector2.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,a=e.elements;return this.x=a[0]*t+a[3]*i+a[6],this.y=a[1]*t+a[4]*i+a[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(clamp$1(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),a=Math.sin(t),s=this.x-e.x,l=this.y-e.y;return this.x=s*i-l*a+e.x,this.y=s*a+l*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Matrix3{constructor(e,t,i,a,s,l,o,c,h){Matrix3.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,a,s,l,o,c,h)}set(e,t,i,a,s,l,o,c,h){const f=this.elements;return f[0]=e,f[1]=a,f[2]=o,f[3]=t,f[4]=s,f[5]=c,f[6]=i,f[7]=l,f[8]=h,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,a=t.elements,s=this.elements,l=i[0],o=i[3],c=i[6],h=i[1],f=i[4],u=i[7],d=i[2],g=i[5],_=i[8],v=a[0],m=a[3],p=a[6],E=a[1],x=a[4],w=a[7],L=a[2],C=a[5],R=a[8];return s[0]=l*v+o*E+c*L,s[3]=l*m+o*x+c*C,s[6]=l*p+o*w+c*R,s[1]=h*v+f*E+u*L,s[4]=h*m+f*x+u*C,s[7]=h*p+f*w+u*R,s[2]=d*v+g*E+_*L,s[5]=d*m+g*x+_*C,s[8]=d*p+g*w+_*R,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],a=e[2],s=e[3],l=e[4],o=e[5],c=e[6],h=e[7],f=e[8];return t*l*f-t*o*h-i*s*f+i*o*c+a*s*h-a*l*c}invert(){const e=this.elements,t=e[0],i=e[1],a=e[2],s=e[3],l=e[4],o=e[5],c=e[6],h=e[7],f=e[8],u=f*l-o*h,d=o*c-f*s,g=h*s-l*c,_=t*u+i*d+a*g;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/_;return e[0]=u*v,e[1]=(a*h-f*i)*v,e[2]=(o*i-a*l)*v,e[3]=d*v,e[4]=(f*t-a*c)*v,e[5]=(a*s-o*t)*v,e[6]=g*v,e[7]=(i*c-h*t)*v,e[8]=(l*t-i*s)*v,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,a,s,l,o){const c=Math.cos(s),h=Math.sin(s);return this.set(i*c,i*h,-i*(c*l+h*o)+l+e,-a*h,a*c,-a*(-h*l+c*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(_m3.makeScale(e,t)),this}rotate(e){return this.premultiply(_m3.makeRotation(-e)),this}translate(e,t){return this.premultiply(_m3.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let a=0;a<9;a++)if(t[a]!==i[a])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const _m3=new Matrix3;function arrayNeedsUint32(r){for(let e=r.length-1;e>=0;--e)if(r[e]>=65535)return!0;return!1}function createElementNS(r){return document.createElementNS("http://www.w3.org/1999/xhtml",r)}function createCanvasElement(){const r=createElementNS("canvas");return r.style.display="block",r}const _cache={};function warnOnce(r){r in _cache||(_cache[r]=!0,console.warn(r))}const LINEAR_SRGB_TO_LINEAR_DISPLAY_P3=new Matrix3().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),LINEAR_DISPLAY_P3_TO_LINEAR_SRGB=new Matrix3().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),COLOR_SPACES={[LinearSRGBColorSpace]:{transfer:LinearTransfer,primaries:Rec709Primaries,toReference:r=>r,fromReference:r=>r},[SRGBColorSpace]:{transfer:SRGBTransfer,primaries:Rec709Primaries,toReference:r=>r.convertSRGBToLinear(),fromReference:r=>r.convertLinearToSRGB()},[LinearDisplayP3ColorSpace]:{transfer:LinearTransfer,primaries:P3Primaries,toReference:r=>r.applyMatrix3(LINEAR_DISPLAY_P3_TO_LINEAR_SRGB),fromReference:r=>r.applyMatrix3(LINEAR_SRGB_TO_LINEAR_DISPLAY_P3)},[DisplayP3ColorSpace]:{transfer:SRGBTransfer,primaries:P3Primaries,toReference:r=>r.convertSRGBToLinear().applyMatrix3(LINEAR_DISPLAY_P3_TO_LINEAR_SRGB),fromReference:r=>r.applyMatrix3(LINEAR_SRGB_TO_LINEAR_DISPLAY_P3).convertLinearToSRGB()}},SUPPORTED_WORKING_COLOR_SPACES=new Set([LinearSRGBColorSpace,LinearDisplayP3ColorSpace]),ColorManagement={enabled:!0,_workingColorSpace:LinearSRGBColorSpace,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(r){if(!SUPPORTED_WORKING_COLOR_SPACES.has(r))throw new Error(`Unsupported working color space, "${r}".`);this._workingColorSpace=r},convert:function(r,e,t){if(this.enabled===!1||e===t||!e||!t)return r;const i=COLOR_SPACES[e].toReference,a=COLOR_SPACES[t].fromReference;return a(i(r))},fromWorkingColorSpace:function(r,e){return this.convert(r,this._workingColorSpace,e)},toWorkingColorSpace:function(r,e){return this.convert(r,e,this._workingColorSpace)},getPrimaries:function(r){return COLOR_SPACES[r].primaries},getTransfer:function(r){return r===NoColorSpace?LinearTransfer:COLOR_SPACES[r].transfer}};function SRGBToLinear(r){return r<.04045?r*.0773993808:Math.pow(r*.9478672986+.0521327014,2.4)}function LinearToSRGB(r){return r<.0031308?r*12.92:1.055*Math.pow(r,.41666)-.055}let _canvas;class ImageUtils{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{_canvas===void 0&&(_canvas=createElementNS("canvas")),_canvas.width=e.width,_canvas.height=e.height;const i=_canvas.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),t=_canvas}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=createElementNS("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const a=i.getImageData(0,0,e.width,e.height),s=a.data;for(let l=0;l<s.length;l++)s[l]=SRGBToLinear(s[l]/255)*255;return i.putImageData(a,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(SRGBToLinear(t[i]/255)*255):t[i]=SRGBToLinear(t[i]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let _sourceId=0;class Source{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:_sourceId++}),this.uuid=generateUUID(),this.data=e,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},a=this.data;if(a!==null){let s;if(Array.isArray(a)){s=[];for(let l=0,o=a.length;l<o;l++)a[l].isDataTexture?s.push(serializeImage(a[l].image)):s.push(serializeImage(a[l]))}else s=serializeImage(a);i.url=s}return t||(e.images[this.uuid]=i),i}}function serializeImage(r){return typeof HTMLImageElement<"u"&&r instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&r instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&r instanceof ImageBitmap?ImageUtils.getDataURL(r):r.data?{data:Array.from(r.data),width:r.width,height:r.height,type:r.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let _textureId=0;class Texture extends EventDispatcher{constructor(e=Texture.DEFAULT_IMAGE,t=Texture.DEFAULT_MAPPING,i=ClampToEdgeWrapping,a=ClampToEdgeWrapping,s=LinearFilter,l=LinearMipmapLinearFilter,o=RGBAFormat,c=UnsignedByteType,h=Texture.DEFAULT_ANISOTROPY,f=NoColorSpace){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:_textureId++}),this.uuid=generateUUID(),this.name="",this.source=new Source(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=a,this.magFilter=s,this.minFilter=l,this.anisotropy=h,this.format=o,this.internalFormat=null,this.type=c,this.offset=new Vector2(0,0),this.repeat=new Vector2(1,1),this.center=new Vector2(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Matrix3,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,typeof f=="string"?this.colorSpace=f:(warnOnce("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=f===sRGBEncoding?SRGBColorSpace:NoColorSpace),this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.needsPMREMUpdate=!1}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==UVMapping)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case RepeatWrapping:e.x=e.x-Math.floor(e.x);break;case ClampToEdgeWrapping:e.x=e.x<0?0:1;break;case MirroredRepeatWrapping:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case RepeatWrapping:e.y=e.y-Math.floor(e.y);break;case ClampToEdgeWrapping:e.y=e.y<0?0:1;break;case MirroredRepeatWrapping:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}get encoding(){return warnOnce("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace===SRGBColorSpace?sRGBEncoding:LinearEncoding}set encoding(e){warnOnce("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=e===sRGBEncoding?SRGBColorSpace:NoColorSpace}}Texture.DEFAULT_IMAGE=null,Texture.DEFAULT_MAPPING=UVMapping,Texture.DEFAULT_ANISOTROPY=1;class Vector4{constructor(e=0,t=0,i=0,a=1){Vector4.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=a}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,a){return this.x=e,this.y=t,this.z=i,this.w=a,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,a=this.z,s=this.w,l=e.elements;return this.x=l[0]*t+l[4]*i+l[8]*a+l[12]*s,this.y=l[1]*t+l[5]*i+l[9]*a+l[13]*s,this.z=l[2]*t+l[6]*i+l[10]*a+l[14]*s,this.w=l[3]*t+l[7]*i+l[11]*a+l[15]*s,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,a,s;const c=e.elements,h=c[0],f=c[4],u=c[8],d=c[1],g=c[5],_=c[9],v=c[2],m=c[6],p=c[10];if(Math.abs(f-d)<.01&&Math.abs(u-v)<.01&&Math.abs(_-m)<.01){if(Math.abs(f+d)<.1&&Math.abs(u+v)<.1&&Math.abs(_+m)<.1&&Math.abs(h+g+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const x=(h+1)/2,w=(g+1)/2,L=(p+1)/2,C=(f+d)/4,R=(u+v)/4,z=(_+m)/4;return x>w&&x>L?x<.01?(i=0,a=.707106781,s=.707106781):(i=Math.sqrt(x),a=C/i,s=R/i):w>L?w<.01?(i=.707106781,a=0,s=.707106781):(a=Math.sqrt(w),i=C/a,s=z/a):L<.01?(i=.707106781,a=.707106781,s=0):(s=Math.sqrt(L),i=R/s,a=z/s),this.set(i,a,s,t),this}let E=Math.sqrt((m-_)*(m-_)+(u-v)*(u-v)+(d-f)*(d-f));return Math.abs(E)<.001&&(E=1),this.x=(m-_)/E,this.y=(u-v)/E,this.z=(d-f)/E,this.w=Math.acos((h+g+p-1)/2),this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class RenderTarget extends EventDispatcher{constructor(e=1,t=1,i={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new Vector4(0,0,e,t),this.scissorTest=!1,this.viewport=new Vector4(0,0,e,t);const a={width:e,height:t,depth:1};i.encoding!==void 0&&(warnOnce("THREE.WebGLRenderTarget: option.encoding has been replaced by option.colorSpace."),i.colorSpace=i.encoding===sRGBEncoding?SRGBColorSpace:NoColorSpace),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:LinearFilter,depthBuffer:!0,stencilBuffer:!1,depthTexture:null,samples:0},i),this.texture=new Texture(a,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.flipY=!1,this.texture.generateMipmaps=i.generateMipmaps,this.texture.internalFormat=i.internalFormat,this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}setSize(e,t,i=1){(this.width!==e||this.height!==t||this.depth!==i)&&(this.width=e,this.height=t,this.depth=i,this.texture.image.width=e,this.texture.image.height=t,this.texture.image.depth=i,this.dispose()),this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.texture=e.texture.clone(),this.texture.isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new Source(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class WebGLRenderTarget extends RenderTarget{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class DataArrayTexture extends Texture{constructor(e=null,t=1,i=1,a=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:a},this.magFilter=NearestFilter,this.minFilter=NearestFilter,this.wrapR=ClampToEdgeWrapping,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Data3DTexture extends Texture{constructor(e=null,t=1,i=1,a=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:a},this.magFilter=NearestFilter,this.minFilter=NearestFilter,this.wrapR=ClampToEdgeWrapping,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Quaternion{constructor(e=0,t=0,i=0,a=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=a}static slerpFlat(e,t,i,a,s,l,o){let c=i[a+0],h=i[a+1],f=i[a+2],u=i[a+3];const d=s[l+0],g=s[l+1],_=s[l+2],v=s[l+3];if(o===0){e[t+0]=c,e[t+1]=h,e[t+2]=f,e[t+3]=u;return}if(o===1){e[t+0]=d,e[t+1]=g,e[t+2]=_,e[t+3]=v;return}if(u!==v||c!==d||h!==g||f!==_){let m=1-o;const p=c*d+h*g+f*_+u*v,E=p>=0?1:-1,x=1-p*p;if(x>Number.EPSILON){const L=Math.sqrt(x),C=Math.atan2(L,p*E);m=Math.sin(m*C)/L,o=Math.sin(o*C)/L}const w=o*E;if(c=c*m+d*w,h=h*m+g*w,f=f*m+_*w,u=u*m+v*w,m===1-o){const L=1/Math.sqrt(c*c+h*h+f*f+u*u);c*=L,h*=L,f*=L,u*=L}}e[t]=c,e[t+1]=h,e[t+2]=f,e[t+3]=u}static multiplyQuaternionsFlat(e,t,i,a,s,l){const o=i[a],c=i[a+1],h=i[a+2],f=i[a+3],u=s[l],d=s[l+1],g=s[l+2],_=s[l+3];return e[t]=o*_+f*u+c*g-h*d,e[t+1]=c*_+f*d+h*u-o*g,e[t+2]=h*_+f*g+o*d-c*u,e[t+3]=f*_-o*u-c*d-h*g,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,a){return this._x=e,this._y=t,this._z=i,this._w=a,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,a=e._y,s=e._z,l=e._order,o=Math.cos,c=Math.sin,h=o(i/2),f=o(a/2),u=o(s/2),d=c(i/2),g=c(a/2),_=c(s/2);switch(l){case"XYZ":this._x=d*f*u+h*g*_,this._y=h*g*u-d*f*_,this._z=h*f*_+d*g*u,this._w=h*f*u-d*g*_;break;case"YXZ":this._x=d*f*u+h*g*_,this._y=h*g*u-d*f*_,this._z=h*f*_-d*g*u,this._w=h*f*u+d*g*_;break;case"ZXY":this._x=d*f*u-h*g*_,this._y=h*g*u+d*f*_,this._z=h*f*_+d*g*u,this._w=h*f*u-d*g*_;break;case"ZYX":this._x=d*f*u-h*g*_,this._y=h*g*u+d*f*_,this._z=h*f*_-d*g*u,this._w=h*f*u+d*g*_;break;case"YZX":this._x=d*f*u+h*g*_,this._y=h*g*u+d*f*_,this._z=h*f*_-d*g*u,this._w=h*f*u-d*g*_;break;case"XZY":this._x=d*f*u-h*g*_,this._y=h*g*u-d*f*_,this._z=h*f*_+d*g*u,this._w=h*f*u+d*g*_;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+l)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,a=Math.sin(i);return this._x=e.x*a,this._y=e.y*a,this._z=e.z*a,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],a=t[4],s=t[8],l=t[1],o=t[5],c=t[9],h=t[2],f=t[6],u=t[10],d=i+o+u;if(d>0){const g=.5/Math.sqrt(d+1);this._w=.25/g,this._x=(f-c)*g,this._y=(s-h)*g,this._z=(l-a)*g}else if(i>o&&i>u){const g=2*Math.sqrt(1+i-o-u);this._w=(f-c)/g,this._x=.25*g,this._y=(a+l)/g,this._z=(s+h)/g}else if(o>u){const g=2*Math.sqrt(1+o-i-u);this._w=(s-h)/g,this._x=(a+l)/g,this._y=.25*g,this._z=(c+f)/g}else{const g=2*Math.sqrt(1+u-i-o);this._w=(l-a)/g,this._x=(s+h)/g,this._y=(c+f)/g,this._z=.25*g}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<Number.EPSILON?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(clamp$1(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const a=Math.min(1,t/i);return this.slerp(e,a),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,a=e._y,s=e._z,l=e._w,o=t._x,c=t._y,h=t._z,f=t._w;return this._x=i*f+l*o+a*h-s*c,this._y=a*f+l*c+s*o-i*h,this._z=s*f+l*h+i*c-a*o,this._w=l*f-i*o-a*c-s*h,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const i=this._x,a=this._y,s=this._z,l=this._w;let o=l*e._w+i*e._x+a*e._y+s*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=l,this._x=i,this._y=a,this._z=s,this;const c=1-o*o;if(c<=Number.EPSILON){const g=1-t;return this._w=g*l+t*this._w,this._x=g*i+t*this._x,this._y=g*a+t*this._y,this._z=g*s+t*this._z,this.normalize(),this}const h=Math.sqrt(c),f=Math.atan2(h,o),u=Math.sin((1-t)*f)/h,d=Math.sin(t*f)/h;return this._w=l*u+this._w*d,this._x=i*u+this._x*d,this._y=a*u+this._y*d,this._z=s*u+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=Math.random(),t=Math.sqrt(1-e),i=Math.sqrt(e),a=2*Math.PI*Math.random(),s=2*Math.PI*Math.random();return this.set(t*Math.cos(a),i*Math.sin(s),i*Math.cos(s),t*Math.sin(a))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class Vector3{constructor(e=0,t=0,i=0){Vector3.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(_quaternion$4.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(_quaternion$4.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,a=this.z,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6]*a,this.y=s[1]*t+s[4]*i+s[7]*a,this.z=s[2]*t+s[5]*i+s[8]*a,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,a=this.z,s=e.elements,l=1/(s[3]*t+s[7]*i+s[11]*a+s[15]);return this.x=(s[0]*t+s[4]*i+s[8]*a+s[12])*l,this.y=(s[1]*t+s[5]*i+s[9]*a+s[13])*l,this.z=(s[2]*t+s[6]*i+s[10]*a+s[14])*l,this}applyQuaternion(e){const t=this.x,i=this.y,a=this.z,s=e.x,l=e.y,o=e.z,c=e.w,h=2*(l*a-o*i),f=2*(o*t-s*a),u=2*(s*i-l*t);return this.x=t+c*h+l*u-o*f,this.y=i+c*f+o*h-s*u,this.z=a+c*u+s*f-l*h,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,a=this.z,s=e.elements;return this.x=s[0]*t+s[4]*i+s[8]*a,this.y=s[1]*t+s[5]*i+s[9]*a,this.z=s[2]*t+s[6]*i+s[10]*a,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,a=e.y,s=e.z,l=t.x,o=t.y,c=t.z;return this.x=a*c-s*o,this.y=s*l-i*c,this.z=i*o-a*l,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return _vector$c.copy(this).projectOnVector(e),this.sub(_vector$c)}reflect(e){return this.sub(_vector$c.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(clamp$1(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,a=this.z-e.z;return t*t+i*i+a*a}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const a=Math.sin(t)*e;return this.x=a*Math.sin(i),this.y=Math.cos(t)*e,this.z=a*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),a=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=a,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=(Math.random()-.5)*2,t=Math.random()*Math.PI*2,i=Math.sqrt(1-e**2);return this.x=i*Math.cos(t),this.y=i*Math.sin(t),this.z=e,this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const _vector$c=new Vector3,_quaternion$4=new Quaternion;class Box3{constructor(e=new Vector3(1/0,1/0,1/0),t=new Vector3(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(_vector$b.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(_vector$b.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=_vector$b.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const s=i.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let l=0,o=s.count;l<o;l++)e.isMesh===!0?e.getVertexPosition(l,_vector$b):_vector$b.fromBufferAttribute(s,l),_vector$b.applyMatrix4(e.matrixWorld),this.expandByPoint(_vector$b);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),_box$4.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),_box$4.copy(i.boundingBox)),_box$4.applyMatrix4(e.matrixWorld),this.union(_box$4)}const a=e.children;for(let s=0,l=a.length;s<l;s++)this.expandByObject(a[s],t);return this}containsPoint(e){return!(e.x<this.min.x||e.x>this.max.x||e.y<this.min.y||e.y>this.max.y||e.z<this.min.z||e.z>this.max.z)}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return!(e.max.x<this.min.x||e.min.x>this.max.x||e.max.y<this.min.y||e.min.y>this.max.y||e.max.z<this.min.z||e.min.z>this.max.z)}intersectsSphere(e){return this.clampPoint(e.center,_vector$b),_vector$b.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(_center),_extents.subVectors(this.max,_center),_v0$2.subVectors(e.a,_center),_v1$7.subVectors(e.b,_center),_v2$4.subVectors(e.c,_center),_f0.subVectors(_v1$7,_v0$2),_f1.subVectors(_v2$4,_v1$7),_f2.subVectors(_v0$2,_v2$4);let t=[0,-_f0.z,_f0.y,0,-_f1.z,_f1.y,0,-_f2.z,_f2.y,_f0.z,0,-_f0.x,_f1.z,0,-_f1.x,_f2.z,0,-_f2.x,-_f0.y,_f0.x,0,-_f1.y,_f1.x,0,-_f2.y,_f2.x,0];return!satForAxes(t,_v0$2,_v1$7,_v2$4,_extents)||(t=[1,0,0,0,1,0,0,0,1],!satForAxes(t,_v0$2,_v1$7,_v2$4,_extents))?!1:(_triangleNormal.crossVectors(_f0,_f1),t=[_triangleNormal.x,_triangleNormal.y,_triangleNormal.z],satForAxes(t,_v0$2,_v1$7,_v2$4,_extents))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,_vector$b).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(_vector$b).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(_points[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),_points[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),_points[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),_points[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),_points[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),_points[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),_points[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),_points[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(_points),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const _points=[new Vector3,new Vector3,new Vector3,new Vector3,new Vector3,new Vector3,new Vector3,new Vector3],_vector$b=new Vector3,_box$4=new Box3,_v0$2=new Vector3,_v1$7=new Vector3,_v2$4=new Vector3,_f0=new Vector3,_f1=new Vector3,_f2=new Vector3,_center=new Vector3,_extents=new Vector3,_triangleNormal=new Vector3,_testAxis=new Vector3;function satForAxes(r,e,t,i,a){for(let s=0,l=r.length-3;s<=l;s+=3){_testAxis.fromArray(r,s);const o=a.x*Math.abs(_testAxis.x)+a.y*Math.abs(_testAxis.y)+a.z*Math.abs(_testAxis.z),c=e.dot(_testAxis),h=t.dot(_testAxis),f=i.dot(_testAxis);if(Math.max(-Math.max(c,h,f),Math.min(c,h,f))>o)return!1}return!0}const _box$3=new Box3,_v1$6=new Vector3,_v2$3=new Vector3;class Sphere{constructor(e=new Vector3,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):_box$3.setFromPoints(e).getCenter(i);let a=0;for(let s=0,l=e.length;s<l;s++)a=Math.max(a,i.distanceToSquared(e[s]));return this.radius=Math.sqrt(a),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;_v1$6.subVectors(e,this.center);const t=_v1$6.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),a=(i-this.radius)*.5;this.center.addScaledVector(_v1$6,a/i),this.radius+=a}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(_v2$3.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(_v1$6.copy(e.center).add(_v2$3)),this.expandByPoint(_v1$6.copy(e.center).sub(_v2$3))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const _vector$a=new Vector3,_segCenter=new Vector3,_segDir=new Vector3,_diff=new Vector3,_edge1=new Vector3,_edge2=new Vector3,_normal$1=new Vector3;class Ray{constructor(e=new Vector3,t=new Vector3(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,_vector$a)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=_vector$a.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(_vector$a.copy(this.origin).addScaledVector(this.direction,t),_vector$a.distanceToSquared(e))}distanceSqToSegment(e,t,i,a){_segCenter.copy(e).add(t).multiplyScalar(.5),_segDir.copy(t).sub(e).normalize(),_diff.copy(this.origin).sub(_segCenter);const s=e.distanceTo(t)*.5,l=-this.direction.dot(_segDir),o=_diff.dot(this.direction),c=-_diff.dot(_segDir),h=_diff.lengthSq(),f=Math.abs(1-l*l);let u,d,g,_;if(f>0)if(u=l*c-o,d=l*o-c,_=s*f,u>=0)if(d>=-_)if(d<=_){const v=1/f;u*=v,d*=v,g=u*(u+l*d+2*o)+d*(l*u+d+2*c)+h}else d=s,u=Math.max(0,-(l*d+o)),g=-u*u+d*(d+2*c)+h;else d=-s,u=Math.max(0,-(l*d+o)),g=-u*u+d*(d+2*c)+h;else d<=-_?(u=Math.max(0,-(-l*s+o)),d=u>0?-s:Math.min(Math.max(-s,-c),s),g=-u*u+d*(d+2*c)+h):d<=_?(u=0,d=Math.min(Math.max(-s,-c),s),g=d*(d+2*c)+h):(u=Math.max(0,-(l*s+o)),d=u>0?s:Math.min(Math.max(-s,-c),s),g=-u*u+d*(d+2*c)+h);else d=l>0?-s:s,u=Math.max(0,-(l*d+o)),g=-u*u+d*(d+2*c)+h;return i&&i.copy(this.origin).addScaledVector(this.direction,u),a&&a.copy(_segCenter).addScaledVector(_segDir,d),g}intersectSphere(e,t){_vector$a.subVectors(e.center,this.origin);const i=_vector$a.dot(this.direction),a=_vector$a.dot(_vector$a)-i*i,s=e.radius*e.radius;if(a>s)return null;const l=Math.sqrt(s-a),o=i-l,c=i+l;return c<0?null:o<0?this.at(c,t):this.at(o,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,a,s,l,o,c;const h=1/this.direction.x,f=1/this.direction.y,u=1/this.direction.z,d=this.origin;return h>=0?(i=(e.min.x-d.x)*h,a=(e.max.x-d.x)*h):(i=(e.max.x-d.x)*h,a=(e.min.x-d.x)*h),f>=0?(s=(e.min.y-d.y)*f,l=(e.max.y-d.y)*f):(s=(e.max.y-d.y)*f,l=(e.min.y-d.y)*f),i>l||s>a||((s>i||isNaN(i))&&(i=s),(l<a||isNaN(a))&&(a=l),u>=0?(o=(e.min.z-d.z)*u,c=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,c=(e.min.z-d.z)*u),i>c||o>a)||((o>i||i!==i)&&(i=o),(c<a||a!==a)&&(a=c),a<0)?null:this.at(i>=0?i:a,t)}intersectsBox(e){return this.intersectBox(e,_vector$a)!==null}intersectTriangle(e,t,i,a,s){_edge1.subVectors(t,e),_edge2.subVectors(i,e),_normal$1.crossVectors(_edge1,_edge2);let l=this.direction.dot(_normal$1),o;if(l>0){if(a)return null;o=1}else if(l<0)o=-1,l=-l;else return null;_diff.subVectors(this.origin,e);const c=o*this.direction.dot(_edge2.crossVectors(_diff,_edge2));if(c<0)return null;const h=o*this.direction.dot(_edge1.cross(_diff));if(h<0||c+h>l)return null;const f=-o*_diff.dot(_normal$1);return f<0?null:this.at(f/l,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Matrix4{constructor(e,t,i,a,s,l,o,c,h,f,u,d,g,_,v,m){Matrix4.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,a,s,l,o,c,h,f,u,d,g,_,v,m)}set(e,t,i,a,s,l,o,c,h,f,u,d,g,_,v,m){const p=this.elements;return p[0]=e,p[4]=t,p[8]=i,p[12]=a,p[1]=s,p[5]=l,p[9]=o,p[13]=c,p[2]=h,p[6]=f,p[10]=u,p[14]=d,p[3]=g,p[7]=_,p[11]=v,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Matrix4().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,i=e.elements,a=1/_v1$5.setFromMatrixColumn(e,0).length(),s=1/_v1$5.setFromMatrixColumn(e,1).length(),l=1/_v1$5.setFromMatrixColumn(e,2).length();return t[0]=i[0]*a,t[1]=i[1]*a,t[2]=i[2]*a,t[3]=0,t[4]=i[4]*s,t[5]=i[5]*s,t[6]=i[6]*s,t[7]=0,t[8]=i[8]*l,t[9]=i[9]*l,t[10]=i[10]*l,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,a=e.y,s=e.z,l=Math.cos(i),o=Math.sin(i),c=Math.cos(a),h=Math.sin(a),f=Math.cos(s),u=Math.sin(s);if(e.order==="XYZ"){const d=l*f,g=l*u,_=o*f,v=o*u;t[0]=c*f,t[4]=-c*u,t[8]=h,t[1]=g+_*h,t[5]=d-v*h,t[9]=-o*c,t[2]=v-d*h,t[6]=_+g*h,t[10]=l*c}else if(e.order==="YXZ"){const d=c*f,g=c*u,_=h*f,v=h*u;t[0]=d+v*o,t[4]=_*o-g,t[8]=l*h,t[1]=l*u,t[5]=l*f,t[9]=-o,t[2]=g*o-_,t[6]=v+d*o,t[10]=l*c}else if(e.order==="ZXY"){const d=c*f,g=c*u,_=h*f,v=h*u;t[0]=d-v*o,t[4]=-l*u,t[8]=_+g*o,t[1]=g+_*o,t[5]=l*f,t[9]=v-d*o,t[2]=-l*h,t[6]=o,t[10]=l*c}else if(e.order==="ZYX"){const d=l*f,g=l*u,_=o*f,v=o*u;t[0]=c*f,t[4]=_*h-g,t[8]=d*h+v,t[1]=c*u,t[5]=v*h+d,t[9]=g*h-_,t[2]=-h,t[6]=o*c,t[10]=l*c}else if(e.order==="YZX"){const d=l*c,g=l*h,_=o*c,v=o*h;t[0]=c*f,t[4]=v-d*u,t[8]=_*u+g,t[1]=u,t[5]=l*f,t[9]=-o*f,t[2]=-h*f,t[6]=g*u+_,t[10]=d-v*u}else if(e.order==="XZY"){const d=l*c,g=l*h,_=o*c,v=o*h;t[0]=c*f,t[4]=-u,t[8]=h*f,t[1]=d*u+v,t[5]=l*f,t[9]=g*u-_,t[2]=_*u-g,t[6]=o*f,t[10]=v*u+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(_zero,e,_one)}lookAt(e,t,i){const a=this.elements;return _z.subVectors(e,t),_z.lengthSq()===0&&(_z.z=1),_z.normalize(),_x.crossVectors(i,_z),_x.lengthSq()===0&&(Math.abs(i.z)===1?_z.x+=1e-4:_z.z+=1e-4,_z.normalize(),_x.crossVectors(i,_z)),_x.normalize(),_y.crossVectors(_z,_x),a[0]=_x.x,a[4]=_y.x,a[8]=_z.x,a[1]=_x.y,a[5]=_y.y,a[9]=_z.y,a[2]=_x.z,a[6]=_y.z,a[10]=_z.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,a=t.elements,s=this.elements,l=i[0],o=i[4],c=i[8],h=i[12],f=i[1],u=i[5],d=i[9],g=i[13],_=i[2],v=i[6],m=i[10],p=i[14],E=i[3],x=i[7],w=i[11],L=i[15],C=a[0],R=a[4],z=a[8],S=a[12],A=a[1],V=a[5],X=a[9],ne=a[13],D=a[2],F=a[6],W=a[10],j=a[14],Y=a[3],q=a[7],J=a[11],ie=a[15];return s[0]=l*C+o*A+c*D+h*Y,s[4]=l*R+o*V+c*F+h*q,s[8]=l*z+o*X+c*W+h*J,s[12]=l*S+o*ne+c*j+h*ie,s[1]=f*C+u*A+d*D+g*Y,s[5]=f*R+u*V+d*F+g*q,s[9]=f*z+u*X+d*W+g*J,s[13]=f*S+u*ne+d*j+g*ie,s[2]=_*C+v*A+m*D+p*Y,s[6]=_*R+v*V+m*F+p*q,s[10]=_*z+v*X+m*W+p*J,s[14]=_*S+v*ne+m*j+p*ie,s[3]=E*C+x*A+w*D+L*Y,s[7]=E*R+x*V+w*F+L*q,s[11]=E*z+x*X+w*W+L*J,s[15]=E*S+x*ne+w*j+L*ie,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],a=e[8],s=e[12],l=e[1],o=e[5],c=e[9],h=e[13],f=e[2],u=e[6],d=e[10],g=e[14],_=e[3],v=e[7],m=e[11],p=e[15];return _*(+s*c*u-a*h*u-s*o*d+i*h*d+a*o*g-i*c*g)+v*(+t*c*g-t*h*d+s*l*d-a*l*g+a*h*f-s*c*f)+m*(+t*h*u-t*o*g-s*l*u+i*l*g+s*o*f-i*h*f)+p*(-a*o*f-t*c*u+t*o*d+a*l*u-i*l*d+i*c*f)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const a=this.elements;return e.isVector3?(a[12]=e.x,a[13]=e.y,a[14]=e.z):(a[12]=e,a[13]=t,a[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],a=e[2],s=e[3],l=e[4],o=e[5],c=e[6],h=e[7],f=e[8],u=e[9],d=e[10],g=e[11],_=e[12],v=e[13],m=e[14],p=e[15],E=u*m*h-v*d*h+v*c*g-o*m*g-u*c*p+o*d*p,x=_*d*h-f*m*h-_*c*g+l*m*g+f*c*p-l*d*p,w=f*v*h-_*u*h+_*o*g-l*v*g-f*o*p+l*u*p,L=_*u*c-f*v*c-_*o*d+l*v*d+f*o*m-l*u*m,C=t*E+i*x+a*w+s*L;if(C===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const R=1/C;return e[0]=E*R,e[1]=(v*d*s-u*m*s-v*a*g+i*m*g+u*a*p-i*d*p)*R,e[2]=(o*m*s-v*c*s+v*a*h-i*m*h-o*a*p+i*c*p)*R,e[3]=(u*c*s-o*d*s-u*a*h+i*d*h+o*a*g-i*c*g)*R,e[4]=x*R,e[5]=(f*m*s-_*d*s+_*a*g-t*m*g-f*a*p+t*d*p)*R,e[6]=(_*c*s-l*m*s-_*a*h+t*m*h+l*a*p-t*c*p)*R,e[7]=(l*d*s-f*c*s+f*a*h-t*d*h-l*a*g+t*c*g)*R,e[8]=w*R,e[9]=(_*u*s-f*v*s-_*i*g+t*v*g+f*i*p-t*u*p)*R,e[10]=(l*v*s-_*o*s+_*i*h-t*v*h-l*i*p+t*o*p)*R,e[11]=(f*o*s-l*u*s-f*i*h+t*u*h+l*i*g-t*o*g)*R,e[12]=L*R,e[13]=(f*v*a-_*u*a+_*i*d-t*v*d-f*i*m+t*u*m)*R,e[14]=(_*o*a-l*v*a-_*i*c+t*v*c+l*i*m-t*o*m)*R,e[15]=(l*u*a-f*o*a+f*i*c-t*u*c-l*i*d+t*o*d)*R,this}scale(e){const t=this.elements,i=e.x,a=e.y,s=e.z;return t[0]*=i,t[4]*=a,t[8]*=s,t[1]*=i,t[5]*=a,t[9]*=s,t[2]*=i,t[6]*=a,t[10]*=s,t[3]*=i,t[7]*=a,t[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],a=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,a))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),a=Math.sin(t),s=1-i,l=e.x,o=e.y,c=e.z,h=s*l,f=s*o;return this.set(h*l+i,h*o-a*c,h*c+a*o,0,h*o+a*c,f*o+i,f*c-a*l,0,h*c-a*o,f*c+a*l,s*c*c+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,a,s,l){return this.set(1,i,s,0,e,1,l,0,t,a,1,0,0,0,0,1),this}compose(e,t,i){const a=this.elements,s=t._x,l=t._y,o=t._z,c=t._w,h=s+s,f=l+l,u=o+o,d=s*h,g=s*f,_=s*u,v=l*f,m=l*u,p=o*u,E=c*h,x=c*f,w=c*u,L=i.x,C=i.y,R=i.z;return a[0]=(1-(v+p))*L,a[1]=(g+w)*L,a[2]=(_-x)*L,a[3]=0,a[4]=(g-w)*C,a[5]=(1-(d+p))*C,a[6]=(m+E)*C,a[7]=0,a[8]=(_+x)*R,a[9]=(m-E)*R,a[10]=(1-(d+v))*R,a[11]=0,a[12]=e.x,a[13]=e.y,a[14]=e.z,a[15]=1,this}decompose(e,t,i){const a=this.elements;let s=_v1$5.set(a[0],a[1],a[2]).length();const l=_v1$5.set(a[4],a[5],a[6]).length(),o=_v1$5.set(a[8],a[9],a[10]).length();this.determinant()<0&&(s=-s),e.x=a[12],e.y=a[13],e.z=a[14],_m1$2.copy(this);const h=1/s,f=1/l,u=1/o;return _m1$2.elements[0]*=h,_m1$2.elements[1]*=h,_m1$2.elements[2]*=h,_m1$2.elements[4]*=f,_m1$2.elements[5]*=f,_m1$2.elements[6]*=f,_m1$2.elements[8]*=u,_m1$2.elements[9]*=u,_m1$2.elements[10]*=u,t.setFromRotationMatrix(_m1$2),i.x=s,i.y=l,i.z=o,this}makePerspective(e,t,i,a,s,l,o=WebGLCoordinateSystem){const c=this.elements,h=2*s/(t-e),f=2*s/(i-a),u=(t+e)/(t-e),d=(i+a)/(i-a);let g,_;if(o===WebGLCoordinateSystem)g=-(l+s)/(l-s),_=-2*l*s/(l-s);else if(o===WebGPUCoordinateSystem)g=-l/(l-s),_=-l*s/(l-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=f,c[9]=d,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,i,a,s,l,o=WebGLCoordinateSystem){const c=this.elements,h=1/(t-e),f=1/(i-a),u=1/(l-s),d=(t+e)*h,g=(i+a)*f;let _,v;if(o===WebGLCoordinateSystem)_=(l+s)*u,v=-2*u;else if(o===WebGPUCoordinateSystem)_=s*u,v=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=2*h,c[4]=0,c[8]=0,c[12]=-d,c[1]=0,c[5]=2*f,c[9]=0,c[13]=-g,c[2]=0,c[6]=0,c[10]=v,c[14]=-_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let a=0;a<16;a++)if(t[a]!==i[a])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}}const _v1$5=new Vector3,_m1$2=new Matrix4,_zero=new Vector3(0,0,0),_one=new Vector3(1,1,1),_x=new Vector3,_y=new Vector3,_z=new Vector3,_matrix$1=new Matrix4,_quaternion$3=new Quaternion;class Euler{constructor(e=0,t=0,i=0,a=Euler.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=a}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,a=this._order){return this._x=e,this._y=t,this._z=i,this._order=a,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const a=e.elements,s=a[0],l=a[4],o=a[8],c=a[1],h=a[5],f=a[9],u=a[2],d=a[6],g=a[10];switch(t){case"XYZ":this._y=Math.asin(clamp$1(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-f,g),this._z=Math.atan2(-l,s)):(this._x=Math.atan2(d,h),this._z=0);break;case"YXZ":this._x=Math.asin(-clamp$1(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(o,g),this._z=Math.atan2(c,h)):(this._y=Math.atan2(-u,s),this._z=0);break;case"ZXY":this._x=Math.asin(clamp$1(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,g),this._z=Math.atan2(-l,h)):(this._y=0,this._z=Math.atan2(c,s));break;case"ZYX":this._y=Math.asin(-clamp$1(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,g),this._z=Math.atan2(c,s)):(this._x=0,this._z=Math.atan2(-l,h));break;case"YZX":this._z=Math.asin(clamp$1(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-f,h),this._y=Math.atan2(-u,s)):(this._x=0,this._y=Math.atan2(o,g));break;case"XZY":this._z=Math.asin(-clamp$1(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(d,h),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-f,g),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return _matrix$1.makeRotationFromQuaternion(e),this.setFromRotationMatrix(_matrix$1,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return _quaternion$3.setFromEuler(this),this.setFromQuaternion(_quaternion$3,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Euler.DEFAULT_ORDER="XYZ";class Layers{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let _object3DId=0;const _v1$4=new Vector3,_q1=new Quaternion,_m1$1=new Matrix4,_target=new Vector3,_position$3=new Vector3,_scale$2=new Vector3,_quaternion$2=new Quaternion,_xAxis=new Vector3(1,0,0),_yAxis=new Vector3(0,1,0),_zAxis=new Vector3(0,0,1),_addedEvent={type:"added"},_removedEvent={type:"removed"};class Object3D extends EventDispatcher{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:_object3DId++}),this.uuid=generateUUID(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Object3D.DEFAULT_UP.clone();const e=new Vector3,t=new Euler,i=new Quaternion,a=new Vector3(1,1,1);function s(){i.setFromEuler(t,!1)}function l(){t.setFromQuaternion(i,void 0,!1)}t._onChange(s),i._onChange(l),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:a},modelViewMatrix:{value:new Matrix4},normalMatrix:{value:new Matrix3}}),this.matrix=new Matrix4,this.matrixWorld=new Matrix4,this.matrixAutoUpdate=Object3D.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Layers,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return _q1.setFromAxisAngle(e,t),this.quaternion.multiply(_q1),this}rotateOnWorldAxis(e,t){return _q1.setFromAxisAngle(e,t),this.quaternion.premultiply(_q1),this}rotateX(e){return this.rotateOnAxis(_xAxis,e)}rotateY(e){return this.rotateOnAxis(_yAxis,e)}rotateZ(e){return this.rotateOnAxis(_zAxis,e)}translateOnAxis(e,t){return _v1$4.copy(e).applyQuaternion(this.quaternion),this.position.add(_v1$4.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(_xAxis,e)}translateY(e){return this.translateOnAxis(_yAxis,e)}translateZ(e){return this.translateOnAxis(_zAxis,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(_m1$1.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?_target.copy(e):_target.set(e,t,i);const a=this.parent;this.updateWorldMatrix(!0,!1),_position$3.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?_m1$1.lookAt(_position$3,_target,this.up):_m1$1.lookAt(_target,_position$3,this.up),this.quaternion.setFromRotationMatrix(_m1$1),a&&(_m1$1.extractRotation(a.matrixWorld),_q1.setFromRotationMatrix(_m1$1),this.quaternion.premultiply(_q1.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.parent!==null&&e.parent.remove(e),e.parent=this,this.children.push(e),e.dispatchEvent(_addedEvent)):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(_removedEvent)),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),_m1$1.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),_m1$1.multiply(e.parent.matrixWorld)),e.applyMatrix4(_m1$1),this.add(e),e.updateWorldMatrix(!1,!0),this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,a=this.children.length;i<a;i++){const l=this.children[i].getObjectByProperty(e,t);if(l!==void 0)return l}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const a=this.children;for(let s=0,l=a.length;s<l;s++)a[s].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(_position$3,e,_scale$2),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(_position$3,_quaternion$2,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let i=0,a=t.length;i<a;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,a=t.length;i<a;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,a=t.length;i<a;i++){const s=t[i];(s.matrixWorldAutoUpdate===!0||e===!0)&&s.updateMatrixWorld(e)}}updateWorldMatrix(e,t){const i=this.parent;if(e===!0&&i!==null&&i.matrixWorldAutoUpdate===!0&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),t===!0){const a=this.children;for(let s=0,l=a.length;s<l;s++){const o=a[s];o.matrixWorldAutoUpdate===!0&&o.updateWorldMatrix(!1,!0)}}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const a={};a.uuid=this.uuid,a.type=this.type,this.name!==""&&(a.name=this.name),this.castShadow===!0&&(a.castShadow=!0),this.receiveShadow===!0&&(a.receiveShadow=!0),this.visible===!1&&(a.visible=!1),this.frustumCulled===!1&&(a.frustumCulled=!1),this.renderOrder!==0&&(a.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(a.userData=this.userData),a.layers=this.layers.mask,a.matrix=this.matrix.toArray(),a.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(a.matrixAutoUpdate=!1),this.isInstancedMesh&&(a.type="InstancedMesh",a.count=this.count,a.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(a.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(a.type="BatchedMesh",a.perObjectFrustumCulled=this.perObjectFrustumCulled,a.sortObjects=this.sortObjects,a.drawRanges=this._drawRanges,a.reservedRanges=this._reservedRanges,a.visibility=this._visibility,a.active=this._active,a.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),a.maxGeometryCount=this._maxGeometryCount,a.maxVertexCount=this._maxVertexCount,a.maxIndexCount=this._maxIndexCount,a.geometryInitialized=this._geometryInitialized,a.geometryCount=this._geometryCount,a.matricesTexture=this._matricesTexture.toJSON(e),this.boundingSphere!==null&&(a.boundingSphere={center:a.boundingSphere.center.toArray(),radius:a.boundingSphere.radius}),this.boundingBox!==null&&(a.boundingBox={min:a.boundingBox.min.toArray(),max:a.boundingBox.max.toArray()}));function s(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?a.background=this.background.toJSON():this.background.isTexture&&(a.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(a.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){a.geometry=s(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const c=o.shapes;if(Array.isArray(c))for(let h=0,f=c.length;h<f;h++){const u=c[h];s(e.shapes,u)}else s(e.shapes,c)}}if(this.isSkinnedMesh&&(a.bindMode=this.bindMode,a.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),a.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let c=0,h=this.material.length;c<h;c++)o.push(s(e.materials,this.material[c]));a.material=o}else a.material=s(e.materials,this.material);if(this.children.length>0){a.children=[];for(let o=0;o<this.children.length;o++)a.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){a.animations=[];for(let o=0;o<this.animations.length;o++){const c=this.animations[o];a.animations.push(s(e.animations,c))}}if(t){const o=l(e.geometries),c=l(e.materials),h=l(e.textures),f=l(e.images),u=l(e.shapes),d=l(e.skeletons),g=l(e.animations),_=l(e.nodes);o.length>0&&(i.geometries=o),c.length>0&&(i.materials=c),h.length>0&&(i.textures=h),f.length>0&&(i.images=f),u.length>0&&(i.shapes=u),d.length>0&&(i.skeletons=d),g.length>0&&(i.animations=g),_.length>0&&(i.nodes=_)}return i.object=a,i;function l(o){const c=[];for(const h in o){const f=o[h];delete f.metadata,c.push(f)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const a=e.children[i];this.add(a.clone())}return this}}Object3D.DEFAULT_UP=new Vector3(0,1,0),Object3D.DEFAULT_MATRIX_AUTO_UPDATE=!0,Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const _v0$1=new Vector3,_v1$3=new Vector3,_v2$2=new Vector3,_v3$1=new Vector3,_vab=new Vector3,_vac=new Vector3,_vbc=new Vector3,_vap=new Vector3,_vbp=new Vector3,_vcp=new Vector3;let warnedGetUV=!1;class Triangle{constructor(e=new Vector3,t=new Vector3,i=new Vector3){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,a){a.subVectors(i,t),_v0$1.subVectors(e,t),a.cross(_v0$1);const s=a.lengthSq();return s>0?a.multiplyScalar(1/Math.sqrt(s)):a.set(0,0,0)}static getBarycoord(e,t,i,a,s){_v0$1.subVectors(a,t),_v1$3.subVectors(i,t),_v2$2.subVectors(e,t);const l=_v0$1.dot(_v0$1),o=_v0$1.dot(_v1$3),c=_v0$1.dot(_v2$2),h=_v1$3.dot(_v1$3),f=_v1$3.dot(_v2$2),u=l*h-o*o;if(u===0)return s.set(0,0,0),null;const d=1/u,g=(h*c-o*f)*d,_=(l*f-o*c)*d;return s.set(1-g-_,_,g)}static containsPoint(e,t,i,a){return this.getBarycoord(e,t,i,a,_v3$1)===null?!1:_v3$1.x>=0&&_v3$1.y>=0&&_v3$1.x+_v3$1.y<=1}static getUV(e,t,i,a,s,l,o,c){return warnedGetUV===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),warnedGetUV=!0),this.getInterpolation(e,t,i,a,s,l,o,c)}static getInterpolation(e,t,i,a,s,l,o,c){return this.getBarycoord(e,t,i,a,_v3$1)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(s,_v3$1.x),c.addScaledVector(l,_v3$1.y),c.addScaledVector(o,_v3$1.z),c)}static isFrontFacing(e,t,i,a){return _v0$1.subVectors(i,t),_v1$3.subVectors(e,t),_v0$1.cross(_v1$3).dot(a)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,a){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[a]),this}setFromAttributeAndIndices(e,t,i,a){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,a),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return _v0$1.subVectors(this.c,this.b),_v1$3.subVectors(this.a,this.b),_v0$1.cross(_v1$3).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Triangle.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return Triangle.getBarycoord(e,this.a,this.b,this.c,t)}getUV(e,t,i,a,s){return warnedGetUV===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),warnedGetUV=!0),Triangle.getInterpolation(e,this.a,this.b,this.c,t,i,a,s)}getInterpolation(e,t,i,a,s){return Triangle.getInterpolation(e,this.a,this.b,this.c,t,i,a,s)}containsPoint(e){return Triangle.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Triangle.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,a=this.b,s=this.c;let l,o;_vab.subVectors(a,i),_vac.subVectors(s,i),_vap.subVectors(e,i);const c=_vab.dot(_vap),h=_vac.dot(_vap);if(c<=0&&h<=0)return t.copy(i);_vbp.subVectors(e,a);const f=_vab.dot(_vbp),u=_vac.dot(_vbp);if(f>=0&&u<=f)return t.copy(a);const d=c*u-f*h;if(d<=0&&c>=0&&f<=0)return l=c/(c-f),t.copy(i).addScaledVector(_vab,l);_vcp.subVectors(e,s);const g=_vab.dot(_vcp),_=_vac.dot(_vcp);if(_>=0&&g<=_)return t.copy(s);const v=g*h-c*_;if(v<=0&&h>=0&&_<=0)return o=h/(h-_),t.copy(i).addScaledVector(_vac,o);const m=f*_-g*u;if(m<=0&&u-f>=0&&g-_>=0)return _vbc.subVectors(s,a),o=(u-f)/(u-f+(g-_)),t.copy(a).addScaledVector(_vbc,o);const p=1/(m+v+d);return l=v*p,o=d*p,t.copy(i).addScaledVector(_vab,l).addScaledVector(_vac,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const _colorKeywords={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},_hslA={h:0,s:0,l:0},_hslB={h:0,s:0,l:0};function hue2rgb(r,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?r+(e-r)*6*t:t<1/2?e:t<2/3?r+(e-r)*6*(2/3-t):r}class Color{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const a=e;a&&a.isColor?this.copy(a):typeof a=="number"?this.setHex(a):typeof a=="string"&&this.setStyle(a)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=SRGBColorSpace){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,ColorManagement.toWorkingColorSpace(this,t),this}setRGB(e,t,i,a=ColorManagement.workingColorSpace){return this.r=e,this.g=t,this.b=i,ColorManagement.toWorkingColorSpace(this,a),this}setHSL(e,t,i,a=ColorManagement.workingColorSpace){if(e=euclideanModulo(e,1),t=clamp$1(t,0,1),i=clamp$1(i,0,1),t===0)this.r=this.g=this.b=i;else{const s=i<=.5?i*(1+t):i+t-i*t,l=2*i-s;this.r=hue2rgb(l,s,e+1/3),this.g=hue2rgb(l,s,e),this.b=hue2rgb(l,s,e-1/3)}return ColorManagement.toWorkingColorSpace(this,a),this}setStyle(e,t=SRGBColorSpace){function i(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let a;if(a=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const l=a[1],o=a[2];switch(l){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(a=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=a[1],l=s.length;if(l===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(l===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=SRGBColorSpace){const i=_colorKeywords[e.toLowerCase()];return i!==void 0?this.setHex(i,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=SRGBToLinear(e.r),this.g=SRGBToLinear(e.g),this.b=SRGBToLinear(e.b),this}copyLinearToSRGB(e){return this.r=LinearToSRGB(e.r),this.g=LinearToSRGB(e.g),this.b=LinearToSRGB(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=SRGBColorSpace){return ColorManagement.fromWorkingColorSpace(_color.copy(this),e),Math.round(clamp$1(_color.r*255,0,255))*65536+Math.round(clamp$1(_color.g*255,0,255))*256+Math.round(clamp$1(_color.b*255,0,255))}getHexString(e=SRGBColorSpace){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ColorManagement.workingColorSpace){ColorManagement.fromWorkingColorSpace(_color.copy(this),t);const i=_color.r,a=_color.g,s=_color.b,l=Math.max(i,a,s),o=Math.min(i,a,s);let c,h;const f=(o+l)/2;if(o===l)c=0,h=0;else{const u=l-o;switch(h=f<=.5?u/(l+o):u/(2-l-o),l){case i:c=(a-s)/u+(a<s?6:0);break;case a:c=(s-i)/u+2;break;case s:c=(i-a)/u+4;break}c/=6}return e.h=c,e.s=h,e.l=f,e}getRGB(e,t=ColorManagement.workingColorSpace){return ColorManagement.fromWorkingColorSpace(_color.copy(this),t),e.r=_color.r,e.g=_color.g,e.b=_color.b,e}getStyle(e=SRGBColorSpace){ColorManagement.fromWorkingColorSpace(_color.copy(this),e);const t=_color.r,i=_color.g,a=_color.b;return e!==SRGBColorSpace?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${a.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(a*255)})`}offsetHSL(e,t,i){return this.getHSL(_hslA),this.setHSL(_hslA.h+e,_hslA.s+t,_hslA.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(_hslA),e.getHSL(_hslB);const i=lerp(_hslA.h,_hslB.h,t),a=lerp(_hslA.s,_hslB.s,t),s=lerp(_hslA.l,_hslB.l,t);return this.setHSL(i,a,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,a=this.b,s=e.elements;return this.r=s[0]*t+s[3]*i+s[6]*a,this.g=s[1]*t+s[4]*i+s[7]*a,this.b=s[2]*t+s[5]*i+s[8]*a,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const _color=new Color;Color.NAMES=_colorKeywords;let _materialId=0;class Material extends EventDispatcher{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:_materialId++}),this.uuid=generateUUID(),this.name="",this.type="Material",this.blending=NormalBlending,this.side=FrontSide,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=SrcAlphaFactor,this.blendDst=OneMinusSrcAlphaFactor,this.blendEquation=AddEquation,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Color(0,0,0),this.blendAlpha=0,this.depthFunc=LessEqualDepth,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=AlwaysStencilFunc,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=KeepStencilOp,this.stencilZFail=KeepStencilOp,this.stencilZPass=KeepStencilOp,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const a=this[t];if(a===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}a&&a.isColor?a.set(i):a&&a.isVector3&&i&&i.isVector3?a.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==NormalBlending&&(i.blending=this.blending),this.side!==FrontSide&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==SrcAlphaFactor&&(i.blendSrc=this.blendSrc),this.blendDst!==OneMinusSrcAlphaFactor&&(i.blendDst=this.blendDst),this.blendEquation!==AddEquation&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==LessEqualDepth&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==AlwaysStencilFunc&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==KeepStencilOp&&(i.stencilFail=this.stencilFail),this.stencilZFail!==KeepStencilOp&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==KeepStencilOp&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function a(s){const l=[];for(const o in s){const c=s[o];delete c.metadata,l.push(c)}return l}if(t){const s=a(e.textures),l=a(e.images);s.length>0&&(i.textures=s),l.length>0&&(i.images=l)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const a=t.length;i=new Array(a);for(let s=0;s!==a;++s)i[s]=t[s].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class MeshBasicMaterial extends Material{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Color(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=MultiplyOperation,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const _vector$9=new Vector3,_vector2$1=new Vector2;class BufferAttribute{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=StaticDrawUsage,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.gpuType=FloatType,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return console.warn("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let a=0,s=this.itemSize;a<s;a++)this.array[e+a]=t.array[i+a];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)_vector2$1.fromBufferAttribute(this,t),_vector2$1.applyMatrix3(e),this.setXY(t,_vector2$1.x,_vector2$1.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)_vector$9.fromBufferAttribute(this,t),_vector$9.applyMatrix3(e),this.setXYZ(t,_vector$9.x,_vector$9.y,_vector$9.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)_vector$9.fromBufferAttribute(this,t),_vector$9.applyMatrix4(e),this.setXYZ(t,_vector$9.x,_vector$9.y,_vector$9.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)_vector$9.fromBufferAttribute(this,t),_vector$9.applyNormalMatrix(e),this.setXYZ(t,_vector$9.x,_vector$9.y,_vector$9.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)_vector$9.fromBufferAttribute(this,t),_vector$9.transformDirection(e),this.setXYZ(t,_vector$9.x,_vector$9.y,_vector$9.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=denormalize(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=normalize(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=denormalize(t,this.array)),t}setX(e,t){return this.normalized&&(t=normalize(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=denormalize(t,this.array)),t}setY(e,t){return this.normalized&&(t=normalize(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=denormalize(t,this.array)),t}setZ(e,t){return this.normalized&&(t=normalize(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=denormalize(t,this.array)),t}setW(e,t){return this.normalized&&(t=normalize(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=normalize(t,this.array),i=normalize(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,a){return e*=this.itemSize,this.normalized&&(t=normalize(t,this.array),i=normalize(i,this.array),a=normalize(a,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=a,this}setXYZW(e,t,i,a,s){return e*=this.itemSize,this.normalized&&(t=normalize(t,this.array),i=normalize(i,this.array),a=normalize(a,this.array),s=normalize(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=a,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==StaticDrawUsage&&(e.usage=this.usage),e}}class Uint16BufferAttribute extends BufferAttribute{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class Uint32BufferAttribute extends BufferAttribute{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class Float32BufferAttribute extends BufferAttribute{constructor(e,t,i){super(new Float32Array(e),t,i)}}let _id$2=0;const _m1=new Matrix4,_obj=new Object3D,_offset=new Vector3,_box$2=new Box3,_boxMorphTargets=new Box3,_vector$8=new Vector3;class BufferGeometry extends EventDispatcher{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:_id$2++}),this.uuid=generateUUID(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(arrayNeedsUint32(e)?Uint32BufferAttribute:Uint16BufferAttribute)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const s=new Matrix3().getNormalMatrix(e);i.applyNormalMatrix(s),i.needsUpdate=!0}const a=this.attributes.tangent;return a!==void 0&&(a.transformDirection(e),a.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return _m1.makeRotationFromQuaternion(e),this.applyMatrix4(_m1),this}rotateX(e){return _m1.makeRotationX(e),this.applyMatrix4(_m1),this}rotateY(e){return _m1.makeRotationY(e),this.applyMatrix4(_m1),this}rotateZ(e){return _m1.makeRotationZ(e),this.applyMatrix4(_m1),this}translate(e,t,i){return _m1.makeTranslation(e,t,i),this.applyMatrix4(_m1),this}scale(e,t,i){return _m1.makeScale(e,t,i),this.applyMatrix4(_m1),this}lookAt(e){return _obj.lookAt(e),_obj.updateMatrix(),this.applyMatrix4(_obj.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(_offset).negate(),this.translate(_offset.x,_offset.y,_offset.z),this}setFromPoints(e){const t=[];for(let i=0,a=e.length;i<a;i++){const s=e[i];t.push(s.x,s.y,s.z||0)}return this.setAttribute("position",new Float32BufferAttribute(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Box3);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingBox.set(new Vector3(-1/0,-1/0,-1/0),new Vector3(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,a=t.length;i<a;i++){const s=t[i];_box$2.setFromBufferAttribute(s),this.morphTargetsRelative?(_vector$8.addVectors(this.boundingBox.min,_box$2.min),this.boundingBox.expandByPoint(_vector$8),_vector$8.addVectors(this.boundingBox.max,_box$2.max),this.boundingBox.expandByPoint(_vector$8)):(this.boundingBox.expandByPoint(_box$2.min),this.boundingBox.expandByPoint(_box$2.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Sphere);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingSphere.set(new Vector3,1/0);return}if(e){const i=this.boundingSphere.center;if(_box$2.setFromBufferAttribute(e),t)for(let s=0,l=t.length;s<l;s++){const o=t[s];_boxMorphTargets.setFromBufferAttribute(o),this.morphTargetsRelative?(_vector$8.addVectors(_box$2.min,_boxMorphTargets.min),_box$2.expandByPoint(_vector$8),_vector$8.addVectors(_box$2.max,_boxMorphTargets.max),_box$2.expandByPoint(_vector$8)):(_box$2.expandByPoint(_boxMorphTargets.min),_box$2.expandByPoint(_boxMorphTargets.max))}_box$2.getCenter(i);let a=0;for(let s=0,l=e.count;s<l;s++)_vector$8.fromBufferAttribute(e,s),a=Math.max(a,i.distanceToSquared(_vector$8));if(t)for(let s=0,l=t.length;s<l;s++){const o=t[s],c=this.morphTargetsRelative;for(let h=0,f=o.count;h<f;h++)_vector$8.fromBufferAttribute(o,h),c&&(_offset.fromBufferAttribute(e,h),_vector$8.add(_offset)),a=Math.max(a,i.distanceToSquared(_vector$8))}this.boundingSphere.radius=Math.sqrt(a),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=e.array,a=t.position.array,s=t.normal.array,l=t.uv.array,o=a.length/3;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new BufferAttribute(new Float32Array(4*o),4));const c=this.getAttribute("tangent").array,h=[],f=[];for(let A=0;A<o;A++)h[A]=new Vector3,f[A]=new Vector3;const u=new Vector3,d=new Vector3,g=new Vector3,_=new Vector2,v=new Vector2,m=new Vector2,p=new Vector3,E=new Vector3;function x(A,V,X){u.fromArray(a,A*3),d.fromArray(a,V*3),g.fromArray(a,X*3),_.fromArray(l,A*2),v.fromArray(l,V*2),m.fromArray(l,X*2),d.sub(u),g.sub(u),v.sub(_),m.sub(_);const ne=1/(v.x*m.y-m.x*v.y);isFinite(ne)&&(p.copy(d).multiplyScalar(m.y).addScaledVector(g,-v.y).multiplyScalar(ne),E.copy(g).multiplyScalar(v.x).addScaledVector(d,-m.x).multiplyScalar(ne),h[A].add(p),h[V].add(p),h[X].add(p),f[A].add(E),f[V].add(E),f[X].add(E))}let w=this.groups;w.length===0&&(w=[{start:0,count:i.length}]);for(let A=0,V=w.length;A<V;++A){const X=w[A],ne=X.start,D=X.count;for(let F=ne,W=ne+D;F<W;F+=3)x(i[F+0],i[F+1],i[F+2])}const L=new Vector3,C=new Vector3,R=new Vector3,z=new Vector3;function S(A){R.fromArray(s,A*3),z.copy(R);const V=h[A];L.copy(V),L.sub(R.multiplyScalar(R.dot(V))).normalize(),C.crossVectors(z,V);const ne=C.dot(f[A])<0?-1:1;c[A*4]=L.x,c[A*4+1]=L.y,c[A*4+2]=L.z,c[A*4+3]=ne}for(let A=0,V=w.length;A<V;++A){const X=w[A],ne=X.start,D=X.count;for(let F=ne,W=ne+D;F<W;F+=3)S(i[F+0]),S(i[F+1]),S(i[F+2])}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new BufferAttribute(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let d=0,g=i.count;d<g;d++)i.setXYZ(d,0,0,0);const a=new Vector3,s=new Vector3,l=new Vector3,o=new Vector3,c=new Vector3,h=new Vector3,f=new Vector3,u=new Vector3;if(e)for(let d=0,g=e.count;d<g;d+=3){const _=e.getX(d+0),v=e.getX(d+1),m=e.getX(d+2);a.fromBufferAttribute(t,_),s.fromBufferAttribute(t,v),l.fromBufferAttribute(t,m),f.subVectors(l,s),u.subVectors(a,s),f.cross(u),o.fromBufferAttribute(i,_),c.fromBufferAttribute(i,v),h.fromBufferAttribute(i,m),o.add(f),c.add(f),h.add(f),i.setXYZ(_,o.x,o.y,o.z),i.setXYZ(v,c.x,c.y,c.z),i.setXYZ(m,h.x,h.y,h.z)}else for(let d=0,g=t.count;d<g;d+=3)a.fromBufferAttribute(t,d+0),s.fromBufferAttribute(t,d+1),l.fromBufferAttribute(t,d+2),f.subVectors(l,s),u.subVectors(a,s),f.cross(u),i.setXYZ(d+0,f.x,f.y,f.z),i.setXYZ(d+1,f.x,f.y,f.z),i.setXYZ(d+2,f.x,f.y,f.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)_vector$8.fromBufferAttribute(e,t),_vector$8.normalize(),e.setXYZ(t,_vector$8.x,_vector$8.y,_vector$8.z)}toNonIndexed(){function e(o,c){const h=o.array,f=o.itemSize,u=o.normalized,d=new h.constructor(c.length*f);let g=0,_=0;for(let v=0,m=c.length;v<m;v++){o.isInterleavedBufferAttribute?g=c[v]*o.data.stride+o.offset:g=c[v]*f;for(let p=0;p<f;p++)d[_++]=h[g++]}return new BufferAttribute(d,f,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new BufferGeometry,i=this.index.array,a=this.attributes;for(const o in a){const c=a[o],h=e(c,i);t.setAttribute(o,h)}const s=this.morphAttributes;for(const o in s){const c=[],h=s[o];for(let f=0,u=h.length;f<u;f++){const d=h[f],g=e(d,i);c.push(g)}t.morphAttributes[o]=c}t.morphTargetsRelative=this.morphTargetsRelative;const l=this.groups;for(let o=0,c=l.length;o<c;o++){const h=l[o];t.addGroup(h.start,h.count,h.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const c=this.parameters;for(const h in c)c[h]!==void 0&&(e[h]=c[h]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const c in i){const h=i[c];e.data.attributes[c]=h.toJSON(e.data)}const a={};let s=!1;for(const c in this.morphAttributes){const h=this.morphAttributes[c],f=[];for(let u=0,d=h.length;u<d;u++){const g=h[u];f.push(g.toJSON(e.data))}f.length>0&&(a[c]=f,s=!0)}s&&(e.data.morphAttributes=a,e.data.morphTargetsRelative=this.morphTargetsRelative);const l=this.groups;l.length>0&&(e.data.groups=JSON.parse(JSON.stringify(l)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone(t));const a=e.attributes;for(const h in a){const f=a[h];this.setAttribute(h,f.clone(t))}const s=e.morphAttributes;for(const h in s){const f=[],u=s[h];for(let d=0,g=u.length;d<g;d++)f.push(u[d].clone(t));this.morphAttributes[h]=f}this.morphTargetsRelative=e.morphTargetsRelative;const l=e.groups;for(let h=0,f=l.length;h<f;h++){const u=l[h];this.addGroup(u.start,u.count,u.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const _inverseMatrix$3=new Matrix4,_ray$3=new Ray,_sphere$6=new Sphere,_sphereHitAt=new Vector3,_vA$1=new Vector3,_vB$1=new Vector3,_vC$1=new Vector3,_tempA=new Vector3,_morphA=new Vector3,_uvA$1=new Vector2,_uvB$1=new Vector2,_uvC$1=new Vector2,_normalA=new Vector3,_normalB=new Vector3,_normalC=new Vector3,_intersectionPoint=new Vector3,_intersectionPointWorld=new Vector3;class Mesh extends Object3D{constructor(e=new BufferGeometry,t=new MeshBasicMaterial){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const a=t[i[0]];if(a!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,l=a.length;s<l;s++){const o=a[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}getVertexPosition(e,t){const i=this.geometry,a=i.attributes.position,s=i.morphAttributes.position,l=i.morphTargetsRelative;t.fromBufferAttribute(a,e);const o=this.morphTargetInfluences;if(s&&o){_morphA.set(0,0,0);for(let c=0,h=s.length;c<h;c++){const f=o[c],u=s[c];f!==0&&(_tempA.fromBufferAttribute(u,e),l?_morphA.addScaledVector(_tempA,f):_morphA.addScaledVector(_tempA.sub(t),f))}t.add(_morphA)}return t}raycast(e,t){const i=this.geometry,a=this.material,s=this.matrixWorld;a!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),_sphere$6.copy(i.boundingSphere),_sphere$6.applyMatrix4(s),_ray$3.copy(e.ray).recast(e.near),!(_sphere$6.containsPoint(_ray$3.origin)===!1&&(_ray$3.intersectSphere(_sphere$6,_sphereHitAt)===null||_ray$3.origin.distanceToSquared(_sphereHitAt)>(e.far-e.near)**2))&&(_inverseMatrix$3.copy(s).invert(),_ray$3.copy(e.ray).applyMatrix4(_inverseMatrix$3),!(i.boundingBox!==null&&_ray$3.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,_ray$3)))}_computeIntersections(e,t,i){let a;const s=this.geometry,l=this.material,o=s.index,c=s.attributes.position,h=s.attributes.uv,f=s.attributes.uv1,u=s.attributes.normal,d=s.groups,g=s.drawRange;if(o!==null)if(Array.isArray(l))for(let _=0,v=d.length;_<v;_++){const m=d[_],p=l[m.materialIndex],E=Math.max(m.start,g.start),x=Math.min(o.count,Math.min(m.start+m.count,g.start+g.count));for(let w=E,L=x;w<L;w+=3){const C=o.getX(w),R=o.getX(w+1),z=o.getX(w+2);a=checkGeometryIntersection(this,p,e,i,h,f,u,C,R,z),a&&(a.faceIndex=Math.floor(w/3),a.face.materialIndex=m.materialIndex,t.push(a))}}else{const _=Math.max(0,g.start),v=Math.min(o.count,g.start+g.count);for(let m=_,p=v;m<p;m+=3){const E=o.getX(m),x=o.getX(m+1),w=o.getX(m+2);a=checkGeometryIntersection(this,l,e,i,h,f,u,E,x,w),a&&(a.faceIndex=Math.floor(m/3),t.push(a))}}else if(c!==void 0)if(Array.isArray(l))for(let _=0,v=d.length;_<v;_++){const m=d[_],p=l[m.materialIndex],E=Math.max(m.start,g.start),x=Math.min(c.count,Math.min(m.start+m.count,g.start+g.count));for(let w=E,L=x;w<L;w+=3){const C=w,R=w+1,z=w+2;a=checkGeometryIntersection(this,p,e,i,h,f,u,C,R,z),a&&(a.faceIndex=Math.floor(w/3),a.face.materialIndex=m.materialIndex,t.push(a))}}else{const _=Math.max(0,g.start),v=Math.min(c.count,g.start+g.count);for(let m=_,p=v;m<p;m+=3){const E=m,x=m+1,w=m+2;a=checkGeometryIntersection(this,l,e,i,h,f,u,E,x,w),a&&(a.faceIndex=Math.floor(m/3),t.push(a))}}}}function checkIntersection(r,e,t,i,a,s,l,o){let c;if(e.side===BackSide?c=i.intersectTriangle(l,s,a,!0,o):c=i.intersectTriangle(a,s,l,e.side===FrontSide,o),c===null)return null;_intersectionPointWorld.copy(o),_intersectionPointWorld.applyMatrix4(r.matrixWorld);const h=t.ray.origin.distanceTo(_intersectionPointWorld);return h<t.near||h>t.far?null:{distance:h,point:_intersectionPointWorld.clone(),object:r}}function checkGeometryIntersection(r,e,t,i,a,s,l,o,c,h){r.getVertexPosition(o,_vA$1),r.getVertexPosition(c,_vB$1),r.getVertexPosition(h,_vC$1);const f=checkIntersection(r,e,t,i,_vA$1,_vB$1,_vC$1,_intersectionPoint);if(f){a&&(_uvA$1.fromBufferAttribute(a,o),_uvB$1.fromBufferAttribute(a,c),_uvC$1.fromBufferAttribute(a,h),f.uv=Triangle.getInterpolation(_intersectionPoint,_vA$1,_vB$1,_vC$1,_uvA$1,_uvB$1,_uvC$1,new Vector2)),s&&(_uvA$1.fromBufferAttribute(s,o),_uvB$1.fromBufferAttribute(s,c),_uvC$1.fromBufferAttribute(s,h),f.uv1=Triangle.getInterpolation(_intersectionPoint,_vA$1,_vB$1,_vC$1,_uvA$1,_uvB$1,_uvC$1,new Vector2),f.uv2=f.uv1),l&&(_normalA.fromBufferAttribute(l,o),_normalB.fromBufferAttribute(l,c),_normalC.fromBufferAttribute(l,h),f.normal=Triangle.getInterpolation(_intersectionPoint,_vA$1,_vB$1,_vC$1,_normalA,_normalB,_normalC,new Vector3),f.normal.dot(i.direction)>0&&f.normal.multiplyScalar(-1));const u={a:o,b:c,c:h,normal:new Vector3,materialIndex:0};Triangle.getNormal(_vA$1,_vB$1,_vC$1,u.normal),f.face=u}return f}class BoxGeometry extends BufferGeometry{constructor(e=1,t=1,i=1,a=1,s=1,l=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:a,heightSegments:s,depthSegments:l};const o=this;a=Math.floor(a),s=Math.floor(s),l=Math.floor(l);const c=[],h=[],f=[],u=[];let d=0,g=0;_("z","y","x",-1,-1,i,t,e,l,s,0),_("z","y","x",1,-1,i,t,-e,l,s,1),_("x","z","y",1,1,e,i,t,a,l,2),_("x","z","y",1,-1,e,i,-t,a,l,3),_("x","y","z",1,-1,e,t,i,a,s,4),_("x","y","z",-1,-1,e,t,-i,a,s,5),this.setIndex(c),this.setAttribute("position",new Float32BufferAttribute(h,3)),this.setAttribute("normal",new Float32BufferAttribute(f,3)),this.setAttribute("uv",new Float32BufferAttribute(u,2));function _(v,m,p,E,x,w,L,C,R,z,S){const A=w/R,V=L/z,X=w/2,ne=L/2,D=C/2,F=R+1,W=z+1;let j=0,Y=0;const q=new Vector3;for(let J=0;J<W;J++){const ie=J*V-ne;for(let he=0;he<F;he++){const H=he*A-X;q[v]=H*E,q[m]=ie*x,q[p]=D,h.push(q.x,q.y,q.z),q[v]=0,q[m]=0,q[p]=C>0?1:-1,f.push(q.x,q.y,q.z),u.push(he/R),u.push(1-J/z),j+=1}}for(let J=0;J<z;J++)for(let ie=0;ie<R;ie++){const he=d+ie+F*J,H=d+ie+F*(J+1),K=d+(ie+1)+F*(J+1),le=d+(ie+1)+F*J;c.push(he,H,le),c.push(H,K,le),Y+=6}o.addGroup(g,Y,S),g+=Y,d+=j}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new BoxGeometry(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function cloneUniforms(r){const e={};for(const t in r){e[t]={};for(const i in r[t]){const a=r[t][i];a&&(a.isColor||a.isMatrix3||a.isMatrix4||a.isVector2||a.isVector3||a.isVector4||a.isTexture||a.isQuaternion)?a.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=a.clone():Array.isArray(a)?e[t][i]=a.slice():e[t][i]=a}}return e}function mergeUniforms(r){const e={};for(let t=0;t<r.length;t++){const i=cloneUniforms(r[t]);for(const a in i)e[a]=i[a]}return e}function cloneUniformsGroups(r){const e=[];for(let t=0;t<r.length;t++)e.push(r[t].clone());return e}function getUnlitUniformColorSpace(r){return r.getRenderTarget()===null?r.outputColorSpace:ColorManagement.workingColorSpace}const UniformsUtils={clone:cloneUniforms,merge:mergeUniforms};var default_vertex=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,default_fragment=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class ShaderMaterial extends Material{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=default_vertex,this.fragmentShader=default_fragment,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1,clipCullDistance:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=cloneUniforms(e.uniforms),this.uniformsGroups=cloneUniformsGroups(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const a in this.uniforms){const l=this.uniforms[a].value;l&&l.isTexture?t.uniforms[a]={type:"t",value:l.toJSON(e).uuid}:l&&l.isColor?t.uniforms[a]={type:"c",value:l.getHex()}:l&&l.isVector2?t.uniforms[a]={type:"v2",value:l.toArray()}:l&&l.isVector3?t.uniforms[a]={type:"v3",value:l.toArray()}:l&&l.isVector4?t.uniforms[a]={type:"v4",value:l.toArray()}:l&&l.isMatrix3?t.uniforms[a]={type:"m3",value:l.toArray()}:l&&l.isMatrix4?t.uniforms[a]={type:"m4",value:l.toArray()}:t.uniforms[a]={value:l}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const a in this.extensions)this.extensions[a]===!0&&(i[a]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}}class Camera extends Object3D{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Matrix4,this.projectionMatrix=new Matrix4,this.projectionMatrixInverse=new Matrix4,this.coordinateSystem=WebGLCoordinateSystem}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}class PerspectiveCamera extends Camera{constructor(e=50,t=1,i=.1,a=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=a,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=RAD2DEG*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(DEG2RAD*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return RAD2DEG*2*Math.atan(Math.tan(DEG2RAD*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}setViewOffset(e,t,i,a,s,l){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=a,this.view.width=s,this.view.height=l,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(DEG2RAD*.5*this.fov)/this.zoom,i=2*t,a=this.aspect*i,s=-.5*a;const l=this.view;if(this.view!==null&&this.view.enabled){const c=l.fullWidth,h=l.fullHeight;s+=l.offsetX*a/c,t-=l.offsetY*i/h,a*=l.width/c,i*=l.height/h}const o=this.filmOffset;o!==0&&(s+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+a,t,t-i,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const fov=-90,aspect=1;class CubeCamera extends Object3D{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const a=new PerspectiveCamera(fov,aspect,e,t);a.layers=this.layers,this.add(a);const s=new PerspectiveCamera(fov,aspect,e,t);s.layers=this.layers,this.add(s);const l=new PerspectiveCamera(fov,aspect,e,t);l.layers=this.layers,this.add(l);const o=new PerspectiveCamera(fov,aspect,e,t);o.layers=this.layers,this.add(o);const c=new PerspectiveCamera(fov,aspect,e,t);c.layers=this.layers,this.add(c);const h=new PerspectiveCamera(fov,aspect,e,t);h.layers=this.layers,this.add(h)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,a,s,l,o,c]=t;for(const h of t)this.remove(h);if(e===WebGLCoordinateSystem)i.up.set(0,1,0),i.lookAt(1,0,0),a.up.set(0,1,0),a.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),l.up.set(0,0,1),l.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===WebGPUCoordinateSystem)i.up.set(0,-1,0),i.lookAt(-1,0,0),a.up.set(0,-1,0),a.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),l.up.set(0,0,-1),l.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const h of t)this.add(h),h.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:a}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,l,o,c,h,f]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),g=e.getActiveMipmapLevel(),_=e.xr.enabled;e.xr.enabled=!1;const v=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,a),e.render(t,s),e.setRenderTarget(i,1,a),e.render(t,l),e.setRenderTarget(i,2,a),e.render(t,o),e.setRenderTarget(i,3,a),e.render(t,c),e.setRenderTarget(i,4,a),e.render(t,h),i.texture.generateMipmaps=v,e.setRenderTarget(i,5,a),e.render(t,f),e.setRenderTarget(u,d,g),e.xr.enabled=_,i.texture.needsPMREMUpdate=!0}}class CubeTexture extends Texture{constructor(e,t,i,a,s,l,o,c,h,f){e=e!==void 0?e:[],t=t!==void 0?t:CubeReflectionMapping,super(e,t,i,a,s,l,o,c,h,f),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class WebGLCubeRenderTarget extends WebGLRenderTarget{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},a=[i,i,i,i,i,i];t.encoding!==void 0&&(warnOnce("THREE.WebGLCubeRenderTarget: option.encoding has been replaced by option.colorSpace."),t.colorSpace=t.encoding===sRGBEncoding?SRGBColorSpace:NoColorSpace),this.texture=new CubeTexture(a,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:LinearFilter}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},a=new BoxGeometry(5,5,5),s=new ShaderMaterial({name:"CubemapFromEquirect",uniforms:cloneUniforms(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:BackSide,blending:NoBlending});s.uniforms.tEquirect.value=t;const l=new Mesh(a,s),o=t.minFilter;return t.minFilter===LinearMipmapLinearFilter&&(t.minFilter=LinearFilter),new CubeCamera(1,10,this).update(e,l),t.minFilter=o,l.geometry.dispose(),l.material.dispose(),this}clear(e,t,i,a){const s=e.getRenderTarget();for(let l=0;l<6;l++)e.setRenderTarget(this,l),e.clear(t,i,a);e.setRenderTarget(s)}}const _vector1=new Vector3,_vector2=new Vector3,_normalMatrix=new Matrix3;class Plane{constructor(e=new Vector3(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,a){return this.normal.set(e,t,i),this.constant=a,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const a=_vector1.subVectors(i,t).cross(_vector2.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(a,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const i=e.delta(_vector1),a=this.normal.dot(i);if(a===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/a;return s<0||s>1?null:t.copy(e.start).addScaledVector(i,s)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||_normalMatrix.getNormalMatrix(e),a=this.coplanarPoint(_vector1).applyMatrix4(e),s=this.normal.applyMatrix3(i).normalize();return this.constant=-a.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const _sphere$5=new Sphere,_vector$7=new Vector3;class Frustum{constructor(e=new Plane,t=new Plane,i=new Plane,a=new Plane,s=new Plane,l=new Plane){this.planes=[e,t,i,a,s,l]}set(e,t,i,a,s,l){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(i),o[3].copy(a),o[4].copy(s),o[5].copy(l),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=WebGLCoordinateSystem){const i=this.planes,a=e.elements,s=a[0],l=a[1],o=a[2],c=a[3],h=a[4],f=a[5],u=a[6],d=a[7],g=a[8],_=a[9],v=a[10],m=a[11],p=a[12],E=a[13],x=a[14],w=a[15];if(i[0].setComponents(c-s,d-h,m-g,w-p).normalize(),i[1].setComponents(c+s,d+h,m+g,w+p).normalize(),i[2].setComponents(c+l,d+f,m+_,w+E).normalize(),i[3].setComponents(c-l,d-f,m-_,w-E).normalize(),i[4].setComponents(c-o,d-u,m-v,w-x).normalize(),t===WebGLCoordinateSystem)i[5].setComponents(c+o,d+u,m+v,w+x).normalize();else if(t===WebGPUCoordinateSystem)i[5].setComponents(o,u,v,x).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),_sphere$5.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),_sphere$5.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(_sphere$5)}intersectsSprite(e){return _sphere$5.center.set(0,0,0),_sphere$5.radius=.7071067811865476,_sphere$5.applyMatrix4(e.matrixWorld),this.intersectsSphere(_sphere$5)}intersectsSphere(e){const t=this.planes,i=e.center,a=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(i)<a)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const a=t[i];if(_vector$7.x=a.normal.x>0?e.max.x:e.min.x,_vector$7.y=a.normal.y>0?e.max.y:e.min.y,_vector$7.z=a.normal.z>0?e.max.z:e.min.z,a.distanceToPoint(_vector$7)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function WebGLAnimation(){let r=null,e=!1,t=null,i=null;function a(s,l){t(s,l),i=r.requestAnimationFrame(a)}return{start:function(){e!==!0&&t!==null&&(i=r.requestAnimationFrame(a),e=!0)},stop:function(){r.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){r=s}}}function WebGLAttributes(r,e){const t=e.isWebGL2,i=new WeakMap;function a(h,f){const u=h.array,d=h.usage,g=u.byteLength,_=r.createBuffer();r.bindBuffer(f,_),r.bufferData(f,u,d),h.onUploadCallback();let v;if(u instanceof Float32Array)v=r.FLOAT;else if(u instanceof Uint16Array)if(h.isFloat16BufferAttribute)if(t)v=r.HALF_FLOAT;else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");else v=r.UNSIGNED_SHORT;else if(u instanceof Int16Array)v=r.SHORT;else if(u instanceof Uint32Array)v=r.UNSIGNED_INT;else if(u instanceof Int32Array)v=r.INT;else if(u instanceof Int8Array)v=r.BYTE;else if(u instanceof Uint8Array)v=r.UNSIGNED_BYTE;else if(u instanceof Uint8ClampedArray)v=r.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+u);return{buffer:_,type:v,bytesPerElement:u.BYTES_PER_ELEMENT,version:h.version,size:g}}function s(h,f,u){const d=f.array,g=f._updateRange,_=f.updateRanges;if(r.bindBuffer(u,h),g.count===-1&&_.length===0&&r.bufferSubData(u,0,d),_.length!==0){for(let v=0,m=_.length;v<m;v++){const p=_[v];t?r.bufferSubData(u,p.start*d.BYTES_PER_ELEMENT,d,p.start,p.count):r.bufferSubData(u,p.start*d.BYTES_PER_ELEMENT,d.subarray(p.start,p.start+p.count))}f.clearUpdateRanges()}g.count!==-1&&(t?r.bufferSubData(u,g.offset*d.BYTES_PER_ELEMENT,d,g.offset,g.count):r.bufferSubData(u,g.offset*d.BYTES_PER_ELEMENT,d.subarray(g.offset,g.offset+g.count)),g.count=-1),f.onUploadCallback()}function l(h){return h.isInterleavedBufferAttribute&&(h=h.data),i.get(h)}function o(h){h.isInterleavedBufferAttribute&&(h=h.data);const f=i.get(h);f&&(r.deleteBuffer(f.buffer),i.delete(h))}function c(h,f){if(h.isGLBufferAttribute){const d=i.get(h);(!d||d.version<h.version)&&i.set(h,{buffer:h.buffer,type:h.type,bytesPerElement:h.elementSize,version:h.version});return}h.isInterleavedBufferAttribute&&(h=h.data);const u=i.get(h);if(u===void 0)i.set(h,a(h,f));else if(u.version<h.version){if(u.size!==h.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");s(u.buffer,h,f),u.version=h.version}}return{get:l,remove:o,update:c}}class PlaneGeometry extends BufferGeometry{constructor(e=1,t=1,i=1,a=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:a};const s=e/2,l=t/2,o=Math.floor(i),c=Math.floor(a),h=o+1,f=c+1,u=e/o,d=t/c,g=[],_=[],v=[],m=[];for(let p=0;p<f;p++){const E=p*d-l;for(let x=0;x<h;x++){const w=x*u-s;_.push(w,-E,0),v.push(0,0,1),m.push(x/o),m.push(1-p/c)}}for(let p=0;p<c;p++)for(let E=0;E<o;E++){const x=E+h*p,w=E+h*(p+1),L=E+1+h*(p+1),C=E+1+h*p;g.push(x,w,C),g.push(w,L,C)}this.setIndex(g),this.setAttribute("position",new Float32BufferAttribute(_,3)),this.setAttribute("normal",new Float32BufferAttribute(v,3)),this.setAttribute("uv",new Float32BufferAttribute(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new PlaneGeometry(e.width,e.height,e.widthSegments,e.heightSegments)}}var alphahash_fragment=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment=`#ifdef USE_ALPHATEST
	if ( diffuseColor.a < alphaTest ) discard;
#endif`,alphatest_pars_fragment=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex=`#ifdef USE_BATCHING
	attribute float batchId;
	uniform highp sampler2D batchingTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,batching_vertex=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif`,begin_vertex=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#pragma unroll_loop_start
	for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
		plane = clippingPlanes[ i ];
		if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
	}
	#pragma unroll_loop_end
	#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
		bool clipped = true;
		#pragma unroll_loop_start
		for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
		}
		#pragma unroll_loop_end
		if ( clipped ) discard;
	#endif
#endif`,clipping_planes_pars_fragment=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,color_pars_fragment=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,color_pars_vertex=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,color_vertex=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,common=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
float luminance( const in vec3 rgb ) {
	const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );
	return dot( weights, rgb );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,cube_uv_reflection_fragment=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,defaultnormal_vertex=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,displacementmap_pars_vertex=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment="gl_FragColor = linearToOutputTexel( gl_FragColor );",colorspace_pars_fragment=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}
vec4 LinearToLinear( in vec4 value ) {
	return value;
}
vec4 LinearTosRGB( in vec4 value ) {
	return sRGBTransferOETF( value );
}`,envmap_fragment=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,envmap_common_pars_fragment=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,envmap_pars_fragment=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_vertex=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_fragment=`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,lightmap_pars_fragment=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	#if defined ( LEGACY_LIGHTS )
		if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {
			return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );
		}
		return 1.0;
	#else
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
		if ( cutoffDistance > 0.0 ) {
			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
		}
		return distanceFalloff;
	#endif
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,envmap_physical_pars_fragment=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,lights_toon_fragment=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,logdepthbuf_fragment=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,logdepthbuf_vertex=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,map_fragment=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphcolor_vertex=`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		objectNormal += morphNormal0 * morphTargetInfluences[ 0 ];
		objectNormal += morphNormal1 * morphTargetInfluences[ 1 ];
		objectNormal += morphNormal2 * morphTargetInfluences[ 2 ];
		objectNormal += morphNormal3 * morphTargetInfluences[ 3 ];
	#endif
#endif`,morphtarget_pars_vertex=`#ifdef USE_MORPHTARGETS
	uniform float morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
		uniform sampler2DArray morphTargetsTexture;
		uniform ivec2 morphTargetsTextureSize;
		vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
			int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
			int y = texelIndex / morphTargetsTextureSize.x;
			int x = texelIndex - y * morphTargetsTextureSize.x;
			ivec3 morphUV = ivec3( x, y, morphTargetIndex );
			return texelFetch( morphTargetsTexture, morphUV, 0 );
		}
	#else
		#ifndef USE_MORPHNORMALS
			uniform float morphTargetInfluences[ 8 ];
		#else
			uniform float morphTargetInfluences[ 4 ];
		#endif
	#endif
#endif`,morphtarget_vertex=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		transformed += morphTarget0 * morphTargetInfluences[ 0 ];
		transformed += morphTarget1 * morphTargetInfluences[ 1 ];
		transformed += morphTarget2 * morphTargetInfluences[ 2 ];
		transformed += morphTarget3 * morphTargetInfluences[ 3 ];
		#ifndef USE_MORPHNORMALS
			transformed += morphTarget4 * morphTargetInfluences[ 4 ];
			transformed += morphTarget5 * morphTargetInfluences[ 5 ];
			transformed += morphTarget6 * morphTargetInfluences[ 6 ];
			transformed += morphTarget7 * morphTargetInfluences[ 7 ];
		#endif
	#endif
#endif`,normal_fragment_begin=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,normalmap_pars_fragment=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;
vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}
vec2 packDepthToRG( in highp float v ) {
	return packDepthToRGBA( v ).yx;
}
float unpackRGToDepth( const in highp vec2 v ) {
	return unpackRGBAToDepth( vec4( v.xy, 0.0, 0.0 ) );
}
vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,premultiplied_alpha_fragment=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return shadow;
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
		vec3 lightToPosition = shadowCoord.xyz;
		float dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );		dp += shadowBias;
		vec3 bd3D = normalize( lightToPosition );
		#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
			vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
			return (
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
			) * ( 1.0 / 9.0 );
		#else
			return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
		#endif
	}
#endif`,shadowmap_pars_vertex=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 OptimizedCineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color *= toneMappingExposure;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	return color;
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
		vec3 refractedRayExit = position + transmissionRay;
		vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
		vec2 refractionCoords = ndcPos.xy / ndcPos.w;
		refractionCoords += 1.0;
		refractionCoords /= 2.0;
		vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
		vec3 transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const vertex$h=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,fragment$h=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,vertex$g=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,fragment$g=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,vertex$f=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,fragment$f=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,vertex$e=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,fragment$e=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#endif
}`,vertex$d=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,fragment$d=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,vertex$c=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,fragment$c=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,vertex$b=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,fragment$b=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,vertex$a=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,fragment$a=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,vertex$9=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,fragment$9=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,vertex$8=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,fragment$8=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,vertex$7=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,fragment$7=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), opacity );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,vertex$6=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,fragment$6=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,vertex$5=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,fragment$5=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,vertex$4=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,fragment$4=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,vertex$3=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,fragment$3=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,vertex$2=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,fragment$2=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,vertex$1=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,fragment$1=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,ShaderChunk={alphahash_fragment,alphahash_pars_fragment,alphamap_fragment,alphamap_pars_fragment,alphatest_fragment,alphatest_pars_fragment,aomap_fragment,aomap_pars_fragment,batching_pars_vertex,batching_vertex,begin_vertex,beginnormal_vertex,bsdfs,iridescence_fragment,bumpmap_pars_fragment,clipping_planes_fragment,clipping_planes_pars_fragment,clipping_planes_pars_vertex,clipping_planes_vertex,color_fragment,color_pars_fragment,color_pars_vertex,color_vertex,common,cube_uv_reflection_fragment,defaultnormal_vertex,displacementmap_pars_vertex,displacementmap_vertex,emissivemap_fragment,emissivemap_pars_fragment,colorspace_fragment,colorspace_pars_fragment,envmap_fragment,envmap_common_pars_fragment,envmap_pars_fragment,envmap_pars_vertex,envmap_physical_pars_fragment,envmap_vertex,fog_vertex,fog_pars_vertex,fog_fragment,fog_pars_fragment,gradientmap_pars_fragment,lightmap_fragment,lightmap_pars_fragment,lights_lambert_fragment,lights_lambert_pars_fragment,lights_pars_begin,lights_toon_fragment,lights_toon_pars_fragment,lights_phong_fragment,lights_phong_pars_fragment,lights_physical_fragment,lights_physical_pars_fragment,lights_fragment_begin,lights_fragment_maps,lights_fragment_end,logdepthbuf_fragment,logdepthbuf_pars_fragment,logdepthbuf_pars_vertex,logdepthbuf_vertex,map_fragment,map_pars_fragment,map_particle_fragment,map_particle_pars_fragment,metalnessmap_fragment,metalnessmap_pars_fragment,morphcolor_vertex,morphnormal_vertex,morphtarget_pars_vertex,morphtarget_vertex,normal_fragment_begin,normal_fragment_maps,normal_pars_fragment,normal_pars_vertex,normal_vertex,normalmap_pars_fragment,clearcoat_normal_fragment_begin,clearcoat_normal_fragment_maps,clearcoat_pars_fragment,iridescence_pars_fragment,opaque_fragment,packing,premultiplied_alpha_fragment,project_vertex,dithering_fragment,dithering_pars_fragment,roughnessmap_fragment,roughnessmap_pars_fragment,shadowmap_pars_fragment,shadowmap_pars_vertex,shadowmap_vertex,shadowmask_pars_fragment,skinbase_vertex,skinning_pars_vertex,skinning_vertex,skinnormal_vertex,specularmap_fragment,specularmap_pars_fragment,tonemapping_fragment,tonemapping_pars_fragment,transmission_fragment,transmission_pars_fragment,uv_pars_fragment,uv_pars_vertex,uv_vertex,worldpos_vertex,background_vert:vertex$h,background_frag:fragment$h,backgroundCube_vert:vertex$g,backgroundCube_frag:fragment$g,cube_vert:vertex$f,cube_frag:fragment$f,depth_vert:vertex$e,depth_frag:fragment$e,distanceRGBA_vert:vertex$d,distanceRGBA_frag:fragment$d,equirect_vert:vertex$c,equirect_frag:fragment$c,linedashed_vert:vertex$b,linedashed_frag:fragment$b,meshbasic_vert:vertex$a,meshbasic_frag:fragment$a,meshlambert_vert:vertex$9,meshlambert_frag:fragment$9,meshmatcap_vert:vertex$8,meshmatcap_frag:fragment$8,meshnormal_vert:vertex$7,meshnormal_frag:fragment$7,meshphong_vert:vertex$6,meshphong_frag:fragment$6,meshphysical_vert:vertex$5,meshphysical_frag:fragment$5,meshtoon_vert:vertex$4,meshtoon_frag:fragment$4,points_vert:vertex$3,points_frag:fragment$3,shadow_vert:vertex$2,shadow_frag:fragment$2,sprite_vert:vertex$1,sprite_frag:fragment$1},UniformsLib={common:{diffuse:{value:new Color(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Matrix3},alphaMap:{value:null},alphaMapTransform:{value:new Matrix3},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Matrix3}},envmap:{envMap:{value:null},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Matrix3}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Matrix3}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Matrix3},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Matrix3},normalScale:{value:new Vector2(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Matrix3},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Matrix3}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Matrix3}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Matrix3}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Color(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Color(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Matrix3},alphaTest:{value:0},uvTransform:{value:new Matrix3}},sprite:{diffuse:{value:new Color(16777215)},opacity:{value:1},center:{value:new Vector2(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Matrix3},alphaMap:{value:null},alphaMapTransform:{value:new Matrix3},alphaTest:{value:0}}},ShaderLib={basic:{uniforms:mergeUniforms([UniformsLib.common,UniformsLib.specularmap,UniformsLib.envmap,UniformsLib.aomap,UniformsLib.lightmap,UniformsLib.fog]),vertexShader:ShaderChunk.meshbasic_vert,fragmentShader:ShaderChunk.meshbasic_frag},lambert:{uniforms:mergeUniforms([UniformsLib.common,UniformsLib.specularmap,UniformsLib.envmap,UniformsLib.aomap,UniformsLib.lightmap,UniformsLib.emissivemap,UniformsLib.bumpmap,UniformsLib.normalmap,UniformsLib.displacementmap,UniformsLib.fog,UniformsLib.lights,{emissive:{value:new Color(0)}}]),vertexShader:ShaderChunk.meshlambert_vert,fragmentShader:ShaderChunk.meshlambert_frag},phong:{uniforms:mergeUniforms([UniformsLib.common,UniformsLib.specularmap,UniformsLib.envmap,UniformsLib.aomap,UniformsLib.lightmap,UniformsLib.emissivemap,UniformsLib.bumpmap,UniformsLib.normalmap,UniformsLib.displacementmap,UniformsLib.fog,UniformsLib.lights,{emissive:{value:new Color(0)},specular:{value:new Color(1118481)},shininess:{value:30}}]),vertexShader:ShaderChunk.meshphong_vert,fragmentShader:ShaderChunk.meshphong_frag},standard:{uniforms:mergeUniforms([UniformsLib.common,UniformsLib.envmap,UniformsLib.aomap,UniformsLib.lightmap,UniformsLib.emissivemap,UniformsLib.bumpmap,UniformsLib.normalmap,UniformsLib.displacementmap,UniformsLib.roughnessmap,UniformsLib.metalnessmap,UniformsLib.fog,UniformsLib.lights,{emissive:{value:new Color(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ShaderChunk.meshphysical_vert,fragmentShader:ShaderChunk.meshphysical_frag},toon:{uniforms:mergeUniforms([UniformsLib.common,UniformsLib.aomap,UniformsLib.lightmap,UniformsLib.emissivemap,UniformsLib.bumpmap,UniformsLib.normalmap,UniformsLib.displacementmap,UniformsLib.gradientmap,UniformsLib.fog,UniformsLib.lights,{emissive:{value:new Color(0)}}]),vertexShader:ShaderChunk.meshtoon_vert,fragmentShader:ShaderChunk.meshtoon_frag},matcap:{uniforms:mergeUniforms([UniformsLib.common,UniformsLib.bumpmap,UniformsLib.normalmap,UniformsLib.displacementmap,UniformsLib.fog,{matcap:{value:null}}]),vertexShader:ShaderChunk.meshmatcap_vert,fragmentShader:ShaderChunk.meshmatcap_frag},points:{uniforms:mergeUniforms([UniformsLib.points,UniformsLib.fog]),vertexShader:ShaderChunk.points_vert,fragmentShader:ShaderChunk.points_frag},dashed:{uniforms:mergeUniforms([UniformsLib.common,UniformsLib.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ShaderChunk.linedashed_vert,fragmentShader:ShaderChunk.linedashed_frag},depth:{uniforms:mergeUniforms([UniformsLib.common,UniformsLib.displacementmap]),vertexShader:ShaderChunk.depth_vert,fragmentShader:ShaderChunk.depth_frag},normal:{uniforms:mergeUniforms([UniformsLib.common,UniformsLib.bumpmap,UniformsLib.normalmap,UniformsLib.displacementmap,{opacity:{value:1}}]),vertexShader:ShaderChunk.meshnormal_vert,fragmentShader:ShaderChunk.meshnormal_frag},sprite:{uniforms:mergeUniforms([UniformsLib.sprite,UniformsLib.fog]),vertexShader:ShaderChunk.sprite_vert,fragmentShader:ShaderChunk.sprite_frag},background:{uniforms:{uvTransform:{value:new Matrix3},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ShaderChunk.background_vert,fragmentShader:ShaderChunk.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1}},vertexShader:ShaderChunk.backgroundCube_vert,fragmentShader:ShaderChunk.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ShaderChunk.cube_vert,fragmentShader:ShaderChunk.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ShaderChunk.equirect_vert,fragmentShader:ShaderChunk.equirect_frag},distanceRGBA:{uniforms:mergeUniforms([UniformsLib.common,UniformsLib.displacementmap,{referencePosition:{value:new Vector3},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ShaderChunk.distanceRGBA_vert,fragmentShader:ShaderChunk.distanceRGBA_frag},shadow:{uniforms:mergeUniforms([UniformsLib.lights,UniformsLib.fog,{color:{value:new Color(0)},opacity:{value:1}}]),vertexShader:ShaderChunk.shadow_vert,fragmentShader:ShaderChunk.shadow_frag}};ShaderLib.physical={uniforms:mergeUniforms([ShaderLib.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Matrix3},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Matrix3},clearcoatNormalScale:{value:new Vector2(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Matrix3},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Matrix3},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Matrix3},sheen:{value:0},sheenColor:{value:new Color(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Matrix3},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Matrix3},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Matrix3},transmissionSamplerSize:{value:new Vector2},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Matrix3},attenuationDistance:{value:0},attenuationColor:{value:new Color(0)},specularColor:{value:new Color(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Matrix3},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Matrix3},anisotropyVector:{value:new Vector2},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Matrix3}}]),vertexShader:ShaderChunk.meshphysical_vert,fragmentShader:ShaderChunk.meshphysical_frag};const _rgb={r:0,b:0,g:0};function WebGLBackground(r,e,t,i,a,s,l){const o=new Color(0);let c=s===!0?0:1,h,f,u=null,d=0,g=null;function _(m,p){let E=!1,x=p.isScene===!0?p.background:null;x&&x.isTexture&&(x=(p.backgroundBlurriness>0?t:e).get(x)),x===null?v(o,c):x&&x.isColor&&(v(x,1),E=!0);const w=r.xr.getEnvironmentBlendMode();w==="additive"?i.buffers.color.setClear(0,0,0,1,l):w==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,l),(r.autoClear||E)&&r.clear(r.autoClearColor,r.autoClearDepth,r.autoClearStencil),x&&(x.isCubeTexture||x.mapping===CubeUVReflectionMapping)?(f===void 0&&(f=new Mesh(new BoxGeometry(1,1,1),new ShaderMaterial({name:"BackgroundCubeMaterial",uniforms:cloneUniforms(ShaderLib.backgroundCube.uniforms),vertexShader:ShaderLib.backgroundCube.vertexShader,fragmentShader:ShaderLib.backgroundCube.fragmentShader,side:BackSide,depthTest:!1,depthWrite:!1,fog:!1})),f.geometry.deleteAttribute("normal"),f.geometry.deleteAttribute("uv"),f.onBeforeRender=function(L,C,R){this.matrixWorld.copyPosition(R.matrixWorld)},Object.defineProperty(f.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),a.update(f)),f.material.uniforms.envMap.value=x,f.material.uniforms.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,f.material.uniforms.backgroundBlurriness.value=p.backgroundBlurriness,f.material.uniforms.backgroundIntensity.value=p.backgroundIntensity,f.material.toneMapped=ColorManagement.getTransfer(x.colorSpace)!==SRGBTransfer,(u!==x||d!==x.version||g!==r.toneMapping)&&(f.material.needsUpdate=!0,u=x,d=x.version,g=r.toneMapping),f.layers.enableAll(),m.unshift(f,f.geometry,f.material,0,0,null)):x&&x.isTexture&&(h===void 0&&(h=new Mesh(new PlaneGeometry(2,2),new ShaderMaterial({name:"BackgroundMaterial",uniforms:cloneUniforms(ShaderLib.background.uniforms),vertexShader:ShaderLib.background.vertexShader,fragmentShader:ShaderLib.background.fragmentShader,side:FrontSide,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),Object.defineProperty(h.material,"map",{get:function(){return this.uniforms.t2D.value}}),a.update(h)),h.material.uniforms.t2D.value=x,h.material.uniforms.backgroundIntensity.value=p.backgroundIntensity,h.material.toneMapped=ColorManagement.getTransfer(x.colorSpace)!==SRGBTransfer,x.matrixAutoUpdate===!0&&x.updateMatrix(),h.material.uniforms.uvTransform.value.copy(x.matrix),(u!==x||d!==x.version||g!==r.toneMapping)&&(h.material.needsUpdate=!0,u=x,d=x.version,g=r.toneMapping),h.layers.enableAll(),m.unshift(h,h.geometry,h.material,0,0,null))}function v(m,p){m.getRGB(_rgb,getUnlitUniformColorSpace(r)),i.buffers.color.setClear(_rgb.r,_rgb.g,_rgb.b,p,l)}return{getClearColor:function(){return o},setClearColor:function(m,p=1){o.set(m),c=p,v(o,c)},getClearAlpha:function(){return c},setClearAlpha:function(m){c=m,v(o,c)},render:_}}function WebGLBindingStates(r,e,t,i){const a=r.getParameter(r.MAX_VERTEX_ATTRIBS),s=i.isWebGL2?null:e.get("OES_vertex_array_object"),l=i.isWebGL2||s!==null,o={},c=m(null);let h=c,f=!1;function u(D,F,W,j,Y){let q=!1;if(l){const J=v(j,W,F);h!==J&&(h=J,g(h.object)),q=p(D,j,W,Y),q&&E(D,j,W,Y)}else{const J=F.wireframe===!0;(h.geometry!==j.id||h.program!==W.id||h.wireframe!==J)&&(h.geometry=j.id,h.program=W.id,h.wireframe=J,q=!0)}Y!==null&&t.update(Y,r.ELEMENT_ARRAY_BUFFER),(q||f)&&(f=!1,z(D,F,W,j),Y!==null&&r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,t.get(Y).buffer))}function d(){return i.isWebGL2?r.createVertexArray():s.createVertexArrayOES()}function g(D){return i.isWebGL2?r.bindVertexArray(D):s.bindVertexArrayOES(D)}function _(D){return i.isWebGL2?r.deleteVertexArray(D):s.deleteVertexArrayOES(D)}function v(D,F,W){const j=W.wireframe===!0;let Y=o[D.id];Y===void 0&&(Y={},o[D.id]=Y);let q=Y[F.id];q===void 0&&(q={},Y[F.id]=q);let J=q[j];return J===void 0&&(J=m(d()),q[j]=J),J}function m(D){const F=[],W=[],j=[];for(let Y=0;Y<a;Y++)F[Y]=0,W[Y]=0,j[Y]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:F,enabledAttributes:W,attributeDivisors:j,object:D,attributes:{},index:null}}function p(D,F,W,j){const Y=h.attributes,q=F.attributes;let J=0;const ie=W.getAttributes();for(const he in ie)if(ie[he].location>=0){const K=Y[he];let le=q[he];if(le===void 0&&(he==="instanceMatrix"&&D.instanceMatrix&&(le=D.instanceMatrix),he==="instanceColor"&&D.instanceColor&&(le=D.instanceColor)),K===void 0||K.attribute!==le||le&&K.data!==le.data)return!0;J++}return h.attributesNum!==J||h.index!==j}function E(D,F,W,j){const Y={},q=F.attributes;let J=0;const ie=W.getAttributes();for(const he in ie)if(ie[he].location>=0){let K=q[he];K===void 0&&(he==="instanceMatrix"&&D.instanceMatrix&&(K=D.instanceMatrix),he==="instanceColor"&&D.instanceColor&&(K=D.instanceColor));const le={};le.attribute=K,K&&K.data&&(le.data=K.data),Y[he]=le,J++}h.attributes=Y,h.attributesNum=J,h.index=j}function x(){const D=h.newAttributes;for(let F=0,W=D.length;F<W;F++)D[F]=0}function w(D){L(D,0)}function L(D,F){const W=h.newAttributes,j=h.enabledAttributes,Y=h.attributeDivisors;W[D]=1,j[D]===0&&(r.enableVertexAttribArray(D),j[D]=1),Y[D]!==F&&((i.isWebGL2?r:e.get("ANGLE_instanced_arrays"))[i.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](D,F),Y[D]=F)}function C(){const D=h.newAttributes,F=h.enabledAttributes;for(let W=0,j=F.length;W<j;W++)F[W]!==D[W]&&(r.disableVertexAttribArray(W),F[W]=0)}function R(D,F,W,j,Y,q,J){J===!0?r.vertexAttribIPointer(D,F,W,Y,q):r.vertexAttribPointer(D,F,W,j,Y,q)}function z(D,F,W,j){if(i.isWebGL2===!1&&(D.isInstancedMesh||j.isInstancedBufferGeometry)&&e.get("ANGLE_instanced_arrays")===null)return;x();const Y=j.attributes,q=W.getAttributes(),J=F.defaultAttributeValues;for(const ie in q){const he=q[ie];if(he.location>=0){let H=Y[ie];if(H===void 0&&(ie==="instanceMatrix"&&D.instanceMatrix&&(H=D.instanceMatrix),ie==="instanceColor"&&D.instanceColor&&(H=D.instanceColor)),H!==void 0){const K=H.normalized,le=H.itemSize,_e=t.get(H);if(_e===void 0)continue;const ge=_e.buffer,Re=_e.type,Pe=_e.bytesPerElement,Te=i.isWebGL2===!0&&(Re===r.INT||Re===r.UNSIGNED_INT||H.gpuType===IntType);if(H.isInterleavedBufferAttribute){const Oe=H.data,I=Oe.stride,Je=H.offset;if(Oe.isInstancedInterleavedBuffer){for(let xe=0;xe<he.locationSize;xe++)L(he.location+xe,Oe.meshPerAttribute);D.isInstancedMesh!==!0&&j._maxInstanceCount===void 0&&(j._maxInstanceCount=Oe.meshPerAttribute*Oe.count)}else for(let xe=0;xe<he.locationSize;xe++)w(he.location+xe);r.bindBuffer(r.ARRAY_BUFFER,ge);for(let xe=0;xe<he.locationSize;xe++)R(he.location+xe,le/he.locationSize,Re,K,I*Pe,(Je+le/he.locationSize*xe)*Pe,Te)}else{if(H.isInstancedBufferAttribute){for(let Oe=0;Oe<he.locationSize;Oe++)L(he.location+Oe,H.meshPerAttribute);D.isInstancedMesh!==!0&&j._maxInstanceCount===void 0&&(j._maxInstanceCount=H.meshPerAttribute*H.count)}else for(let Oe=0;Oe<he.locationSize;Oe++)w(he.location+Oe);r.bindBuffer(r.ARRAY_BUFFER,ge);for(let Oe=0;Oe<he.locationSize;Oe++)R(he.location+Oe,le/he.locationSize,Re,K,le*Pe,le/he.locationSize*Oe*Pe,Te)}}else if(J!==void 0){const K=J[ie];if(K!==void 0)switch(K.length){case 2:r.vertexAttrib2fv(he.location,K);break;case 3:r.vertexAttrib3fv(he.location,K);break;case 4:r.vertexAttrib4fv(he.location,K);break;default:r.vertexAttrib1fv(he.location,K)}}}}C()}function S(){X();for(const D in o){const F=o[D];for(const W in F){const j=F[W];for(const Y in j)_(j[Y].object),delete j[Y];delete F[W]}delete o[D]}}function A(D){if(o[D.id]===void 0)return;const F=o[D.id];for(const W in F){const j=F[W];for(const Y in j)_(j[Y].object),delete j[Y];delete F[W]}delete o[D.id]}function V(D){for(const F in o){const W=o[F];if(W[D.id]===void 0)continue;const j=W[D.id];for(const Y in j)_(j[Y].object),delete j[Y];delete W[D.id]}}function X(){ne(),f=!0,h!==c&&(h=c,g(h.object))}function ne(){c.geometry=null,c.program=null,c.wireframe=!1}return{setup:u,reset:X,resetDefaultState:ne,dispose:S,releaseStatesOfGeometry:A,releaseStatesOfProgram:V,initAttributes:x,enableAttribute:w,disableUnusedAttributes:C}}function WebGLBufferRenderer(r,e,t,i){const a=i.isWebGL2;let s;function l(f){s=f}function o(f,u){r.drawArrays(s,f,u),t.update(u,s,1)}function c(f,u,d){if(d===0)return;let g,_;if(a)g=r,_="drawArraysInstanced";else if(g=e.get("ANGLE_instanced_arrays"),_="drawArraysInstancedANGLE",g===null){console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}g[_](s,f,u,d),t.update(u,s,d)}function h(f,u,d){if(d===0)return;const g=e.get("WEBGL_multi_draw");if(g===null)for(let _=0;_<d;_++)this.render(f[_],u[_]);else{g.multiDrawArraysWEBGL(s,f,0,u,0,d);let _=0;for(let v=0;v<d;v++)_+=u[v];t.update(_,s,1)}}this.setMode=l,this.render=o,this.renderInstances=c,this.renderMultiDraw=h}function WebGLCapabilities(r,e,t){let i;function a(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){const R=e.get("EXT_texture_filter_anisotropic");i=r.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function s(R){if(R==="highp"){if(r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.HIGH_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.HIGH_FLOAT).precision>0)return"highp";R="mediump"}return R==="mediump"&&r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.MEDIUM_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}const l=typeof WebGL2RenderingContext<"u"&&r.constructor.name==="WebGL2RenderingContext";let o=t.precision!==void 0?t.precision:"highp";const c=s(o);c!==o&&(console.warn("THREE.WebGLRenderer:",o,"not supported, using",c,"instead."),o=c);const h=l||e.has("WEBGL_draw_buffers"),f=t.logarithmicDepthBuffer===!0,u=r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS),d=r.getParameter(r.MAX_VERTEX_TEXTURE_IMAGE_UNITS),g=r.getParameter(r.MAX_TEXTURE_SIZE),_=r.getParameter(r.MAX_CUBE_MAP_TEXTURE_SIZE),v=r.getParameter(r.MAX_VERTEX_ATTRIBS),m=r.getParameter(r.MAX_VERTEX_UNIFORM_VECTORS),p=r.getParameter(r.MAX_VARYING_VECTORS),E=r.getParameter(r.MAX_FRAGMENT_UNIFORM_VECTORS),x=d>0,w=l||e.has("OES_texture_float"),L=x&&w,C=l?r.getParameter(r.MAX_SAMPLES):0;return{isWebGL2:l,drawBuffers:h,getMaxAnisotropy:a,getMaxPrecision:s,precision:o,logarithmicDepthBuffer:f,maxTextures:u,maxVertexTextures:d,maxTextureSize:g,maxCubemapSize:_,maxAttributes:v,maxVertexUniforms:m,maxVaryings:p,maxFragmentUniforms:E,vertexTextures:x,floatFragmentTextures:w,floatVertexTextures:L,maxSamples:C}}function WebGLClipping(r){const e=this;let t=null,i=0,a=!1,s=!1;const l=new Plane,o=new Matrix3,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){const g=u.length!==0||d||i!==0||a;return a=d,i=u.length,g},this.beginShadows=function(){s=!0,f(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(u,d){t=f(u,d,0)},this.setState=function(u,d,g){const _=u.clippingPlanes,v=u.clipIntersection,m=u.clipShadows,p=r.get(u);if(!a||_===null||_.length===0||s&&!m)s?f(null):h();else{const E=s?0:i,x=E*4;let w=p.clippingState||null;c.value=w,w=f(_,d,x,g);for(let L=0;L!==x;++L)w[L]=t[L];p.clippingState=w,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=E}};function h(){c.value!==t&&(c.value=t,c.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function f(u,d,g,_){const v=u!==null?u.length:0;let m=null;if(v!==0){if(m=c.value,_!==!0||m===null){const p=g+v*4,E=d.matrixWorldInverse;o.getNormalMatrix(E),(m===null||m.length<p)&&(m=new Float32Array(p));for(let x=0,w=g;x!==v;++x,w+=4)l.copy(u[x]).applyMatrix4(E,o),l.normal.toArray(m,w),m[w+3]=l.constant}c.value=m,c.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,m}}function WebGLCubeMaps(r){let e=new WeakMap;function t(l,o){return o===EquirectangularReflectionMapping?l.mapping=CubeReflectionMapping:o===EquirectangularRefractionMapping&&(l.mapping=CubeRefractionMapping),l}function i(l){if(l&&l.isTexture){const o=l.mapping;if(o===EquirectangularReflectionMapping||o===EquirectangularRefractionMapping)if(e.has(l)){const c=e.get(l).texture;return t(c,l.mapping)}else{const c=l.image;if(c&&c.height>0){const h=new WebGLCubeRenderTarget(c.height/2);return h.fromEquirectangularTexture(r,l),e.set(l,h),l.addEventListener("dispose",a),t(h.texture,l.mapping)}else return null}}return l}function a(l){const o=l.target;o.removeEventListener("dispose",a);const c=e.get(o);c!==void 0&&(e.delete(o),c.dispose())}function s(){e=new WeakMap}return{get:i,dispose:s}}class OrthographicCamera extends Camera{constructor(e=-1,t=1,i=1,a=-1,s=.1,l=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=a,this.near=s,this.far=l,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,a,s,l){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=a,this.view.width=s,this.view.height=l,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,a=(this.top+this.bottom)/2;let s=i-e,l=i+e,o=a+t,c=a-t;if(this.view!==null&&this.view.enabled){const h=(this.right-this.left)/this.view.fullWidth/this.zoom,f=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=h*this.view.offsetX,l=s+h*this.view.width,o-=f*this.view.offsetY,c=o-f*this.view.height}this.projectionMatrix.makeOrthographic(s,l,o,c,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const LOD_MIN=4,EXTRA_LOD_SIGMA=[.125,.215,.35,.446,.526,.582],MAX_SAMPLES=20,_flatCamera=new OrthographicCamera,_clearColor=new Color;let _oldTarget=null,_oldActiveCubeFace=0,_oldActiveMipmapLevel=0;const PHI=(1+Math.sqrt(5))/2,INV_PHI=1/PHI,_axisDirections=[new Vector3(1,1,1),new Vector3(-1,1,1),new Vector3(1,1,-1),new Vector3(-1,1,-1),new Vector3(0,PHI,INV_PHI),new Vector3(0,PHI,-INV_PHI),new Vector3(INV_PHI,0,PHI),new Vector3(-INV_PHI,0,PHI),new Vector3(PHI,INV_PHI,0),new Vector3(-PHI,INV_PHI,0)];class PMREMGenerator{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,i=.1,a=100){_oldTarget=this._renderer.getRenderTarget(),_oldActiveCubeFace=this._renderer.getActiveCubeFace(),_oldActiveMipmapLevel=this._renderer.getActiveMipmapLevel(),this._setSize(256);const s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,i,a,s),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=_getCubemapMaterial(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=_getEquirectMaterial(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(_oldTarget,_oldActiveCubeFace,_oldActiveMipmapLevel),e.scissorTest=!1,_setViewport(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===CubeReflectionMapping||e.mapping===CubeRefractionMapping?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),_oldTarget=this._renderer.getRenderTarget(),_oldActiveCubeFace=this._renderer.getActiveCubeFace(),_oldActiveMipmapLevel=this._renderer.getActiveMipmapLevel();const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:LinearFilter,minFilter:LinearFilter,generateMipmaps:!1,type:HalfFloatType,format:RGBAFormat,colorSpace:LinearSRGBColorSpace,depthBuffer:!1},a=_createRenderTarget(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=_createRenderTarget(e,t,i);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=_createPlanes(s)),this._blurMaterial=_getBlurShader(s,e,t)}return a}_compileMaterial(e){const t=new Mesh(this._lodPlanes[0],e);this._renderer.compile(t,_flatCamera)}_sceneToCubeUV(e,t,i,a){const o=new PerspectiveCamera(90,1,t,i),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],f=this._renderer,u=f.autoClear,d=f.toneMapping;f.getClearColor(_clearColor),f.toneMapping=NoToneMapping,f.autoClear=!1;const g=new MeshBasicMaterial({name:"PMREM.Background",side:BackSide,depthWrite:!1,depthTest:!1}),_=new Mesh(new BoxGeometry,g);let v=!1;const m=e.background;m?m.isColor&&(g.color.copy(m),e.background=null,v=!0):(g.color.copy(_clearColor),v=!0);for(let p=0;p<6;p++){const E=p%3;E===0?(o.up.set(0,c[p],0),o.lookAt(h[p],0,0)):E===1?(o.up.set(0,0,c[p]),o.lookAt(0,h[p],0)):(o.up.set(0,c[p],0),o.lookAt(0,0,h[p]));const x=this._cubeSize;_setViewport(a,E*x,p>2?x:0,x,x),f.setRenderTarget(a),v&&f.render(_,o),f.render(e,o)}_.geometry.dispose(),_.material.dispose(),f.toneMapping=d,f.autoClear=u,e.background=m}_textureToCubeUV(e,t){const i=this._renderer,a=e.mapping===CubeReflectionMapping||e.mapping===CubeRefractionMapping;a?(this._cubemapMaterial===null&&(this._cubemapMaterial=_getCubemapMaterial()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=_getEquirectMaterial());const s=a?this._cubemapMaterial:this._equirectMaterial,l=new Mesh(this._lodPlanes[0],s),o=s.uniforms;o.envMap.value=e;const c=this._cubeSize;_setViewport(t,0,0,3*c,2*c),i.setRenderTarget(t),i.render(l,_flatCamera)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;for(let a=1;a<this._lodPlanes.length;a++){const s=Math.sqrt(this._sigmas[a]*this._sigmas[a]-this._sigmas[a-1]*this._sigmas[a-1]),l=_axisDirections[(a-1)%_axisDirections.length];this._blur(e,a-1,a,s,l)}t.autoClear=i}_blur(e,t,i,a,s){const l=this._pingPongRenderTarget;this._halfBlur(e,l,t,i,a,"latitudinal",s),this._halfBlur(l,e,i,i,a,"longitudinal",s)}_halfBlur(e,t,i,a,s,l,o){const c=this._renderer,h=this._blurMaterial;l!=="latitudinal"&&l!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const f=3,u=new Mesh(this._lodPlanes[a],h),d=h.uniforms,g=this._sizeLods[i]-1,_=isFinite(s)?Math.PI/(2*g):2*Math.PI/(2*MAX_SAMPLES-1),v=s/_,m=isFinite(s)?1+Math.floor(f*v):MAX_SAMPLES;m>MAX_SAMPLES&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${MAX_SAMPLES}`);const p=[];let E=0;for(let R=0;R<MAX_SAMPLES;++R){const z=R/v,S=Math.exp(-z*z/2);p.push(S),R===0?E+=S:R<m&&(E+=2*S)}for(let R=0;R<p.length;R++)p[R]=p[R]/E;d.envMap.value=e.texture,d.samples.value=m,d.weights.value=p,d.latitudinal.value=l==="latitudinal",o&&(d.poleAxis.value=o);const{_lodMax:x}=this;d.dTheta.value=_,d.mipInt.value=x-i;const w=this._sizeLods[a],L=3*w*(a>x-LOD_MIN?a-x+LOD_MIN:0),C=4*(this._cubeSize-w);_setViewport(t,L,C,3*w,2*w),c.setRenderTarget(t),c.render(u,_flatCamera)}}function _createPlanes(r){const e=[],t=[],i=[];let a=r;const s=r-LOD_MIN+1+EXTRA_LOD_SIGMA.length;for(let l=0;l<s;l++){const o=Math.pow(2,a);t.push(o);let c=1/o;l>r-LOD_MIN?c=EXTRA_LOD_SIGMA[l-r+LOD_MIN-1]:l===0&&(c=0),i.push(c);const h=1/(o-2),f=-h,u=1+h,d=[f,f,u,f,u,u,f,f,u,u,f,u],g=6,_=6,v=3,m=2,p=1,E=new Float32Array(v*_*g),x=new Float32Array(m*_*g),w=new Float32Array(p*_*g);for(let C=0;C<g;C++){const R=C%3*2/3-1,z=C>2?0:-1,S=[R,z,0,R+2/3,z,0,R+2/3,z+1,0,R,z,0,R+2/3,z+1,0,R,z+1,0];E.set(S,v*_*C),x.set(d,m*_*C);const A=[C,C,C,C,C,C];w.set(A,p*_*C)}const L=new BufferGeometry;L.setAttribute("position",new BufferAttribute(E,v)),L.setAttribute("uv",new BufferAttribute(x,m)),L.setAttribute("faceIndex",new BufferAttribute(w,p)),e.push(L),a>LOD_MIN&&a--}return{lodPlanes:e,sizeLods:t,sigmas:i}}function _createRenderTarget(r,e,t){const i=new WebGLRenderTarget(r,e,t);return i.texture.mapping=CubeUVReflectionMapping,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function _setViewport(r,e,t,i,a){r.viewport.set(e,t,i,a),r.scissor.set(e,t,i,a)}function _getBlurShader(r,e,t){const i=new Float32Array(MAX_SAMPLES),a=new Vector3(0,1,0);return new ShaderMaterial({name:"SphericalGaussianBlur",defines:{n:MAX_SAMPLES,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${r}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:a}},vertexShader:_getCommonVertexShader(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:NoBlending,depthTest:!1,depthWrite:!1})}function _getEquirectMaterial(){return new ShaderMaterial({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:_getCommonVertexShader(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:NoBlending,depthTest:!1,depthWrite:!1})}function _getCubemapMaterial(){return new ShaderMaterial({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:_getCommonVertexShader(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:NoBlending,depthTest:!1,depthWrite:!1})}function _getCommonVertexShader(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function WebGLCubeUVMaps(r){let e=new WeakMap,t=null;function i(o){if(o&&o.isTexture){const c=o.mapping,h=c===EquirectangularReflectionMapping||c===EquirectangularRefractionMapping,f=c===CubeReflectionMapping||c===CubeRefractionMapping;if(h||f)if(o.isRenderTargetTexture&&o.needsPMREMUpdate===!0){o.needsPMREMUpdate=!1;let u=e.get(o);return t===null&&(t=new PMREMGenerator(r)),u=h?t.fromEquirectangular(o,u):t.fromCubemap(o,u),e.set(o,u),u.texture}else{if(e.has(o))return e.get(o).texture;{const u=o.image;if(h&&u&&u.height>0||f&&u&&a(u)){t===null&&(t=new PMREMGenerator(r));const d=h?t.fromEquirectangular(o):t.fromCubemap(o);return e.set(o,d),o.addEventListener("dispose",s),d.texture}else return null}}}return o}function a(o){let c=0;const h=6;for(let f=0;f<h;f++)o[f]!==void 0&&c++;return c===h}function s(o){const c=o.target;c.removeEventListener("dispose",s);const h=e.get(c);h!==void 0&&(e.delete(c),h.dispose())}function l(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:l}}function WebGLExtensions(r){const e={};function t(i){if(e[i]!==void 0)return e[i];let a;switch(i){case"WEBGL_depth_texture":a=r.getExtension("WEBGL_depth_texture")||r.getExtension("MOZ_WEBGL_depth_texture")||r.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":a=r.getExtension("EXT_texture_filter_anisotropic")||r.getExtension("MOZ_EXT_texture_filter_anisotropic")||r.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":a=r.getExtension("WEBGL_compressed_texture_s3tc")||r.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":a=r.getExtension("WEBGL_compressed_texture_pvrtc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:a=r.getExtension(i)}return e[i]=a,a}return{has:function(i){return t(i)!==null},init:function(i){i.isWebGL2?(t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance")):(t("WEBGL_depth_texture"),t("OES_texture_float"),t("OES_texture_half_float"),t("OES_texture_half_float_linear"),t("OES_standard_derivatives"),t("OES_element_index_uint"),t("OES_vertex_array_object"),t("ANGLE_instanced_arrays")),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture")},get:function(i){const a=t(i);return a===null&&console.warn("THREE.WebGLRenderer: "+i+" extension not supported."),a}}}function WebGLGeometries(r,e,t,i){const a={},s=new WeakMap;function l(u){const d=u.target;d.index!==null&&e.remove(d.index);for(const _ in d.attributes)e.remove(d.attributes[_]);for(const _ in d.morphAttributes){const v=d.morphAttributes[_];for(let m=0,p=v.length;m<p;m++)e.remove(v[m])}d.removeEventListener("dispose",l),delete a[d.id];const g=s.get(d);g&&(e.remove(g),s.delete(d)),i.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function o(u,d){return a[d.id]===!0||(d.addEventListener("dispose",l),a[d.id]=!0,t.memory.geometries++),d}function c(u){const d=u.attributes;for(const _ in d)e.update(d[_],r.ARRAY_BUFFER);const g=u.morphAttributes;for(const _ in g){const v=g[_];for(let m=0,p=v.length;m<p;m++)e.update(v[m],r.ARRAY_BUFFER)}}function h(u){const d=[],g=u.index,_=u.attributes.position;let v=0;if(g!==null){const E=g.array;v=g.version;for(let x=0,w=E.length;x<w;x+=3){const L=E[x+0],C=E[x+1],R=E[x+2];d.push(L,C,C,R,R,L)}}else if(_!==void 0){const E=_.array;v=_.version;for(let x=0,w=E.length/3-1;x<w;x+=3){const L=x+0,C=x+1,R=x+2;d.push(L,C,C,R,R,L)}}else return;const m=new(arrayNeedsUint32(d)?Uint32BufferAttribute:Uint16BufferAttribute)(d,1);m.version=v;const p=s.get(u);p&&e.remove(p),s.set(u,m)}function f(u){const d=s.get(u);if(d){const g=u.index;g!==null&&d.version<g.version&&h(u)}else h(u);return s.get(u)}return{get:o,update:c,getWireframeAttribute:f}}function WebGLIndexedBufferRenderer(r,e,t,i){const a=i.isWebGL2;let s;function l(g){s=g}let o,c;function h(g){o=g.type,c=g.bytesPerElement}function f(g,_){r.drawElements(s,_,o,g*c),t.update(_,s,1)}function u(g,_,v){if(v===0)return;let m,p;if(a)m=r,p="drawElementsInstanced";else if(m=e.get("ANGLE_instanced_arrays"),p="drawElementsInstancedANGLE",m===null){console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}m[p](s,_,o,g*c,v),t.update(_,s,v)}function d(g,_,v){if(v===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<v;p++)this.render(g[p]/c,_[p]);else{m.multiDrawElementsWEBGL(s,_,0,o,g,0,v);let p=0;for(let E=0;E<v;E++)p+=_[E];t.update(p,s,1)}}this.setMode=l,this.setIndex=h,this.render=f,this.renderInstances=u,this.renderMultiDraw=d}function WebGLInfo(r){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,l,o){switch(t.calls++,l){case r.TRIANGLES:t.triangles+=o*(s/3);break;case r.LINES:t.lines+=o*(s/2);break;case r.LINE_STRIP:t.lines+=o*(s-1);break;case r.LINE_LOOP:t.lines+=o*s;break;case r.POINTS:t.points+=o*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",l);break}}function a(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:a,update:i}}function numericalSort(r,e){return r[0]-e[0]}function absNumericalSort(r,e){return Math.abs(e[1])-Math.abs(r[1])}function WebGLMorphtargets(r,e,t){const i={},a=new Float32Array(8),s=new WeakMap,l=new Vector4,o=[];for(let h=0;h<8;h++)o[h]=[h,0];function c(h,f,u){const d=h.morphTargetInfluences;if(e.isWebGL2===!0){const g=f.morphAttributes.position||f.morphAttributes.normal||f.morphAttributes.color,_=g!==void 0?g.length:0;let v=s.get(f);if(v===void 0||v.count!==_){let D=function(){X.dispose(),s.delete(f),f.removeEventListener("dispose",D)};v!==void 0&&v.texture.dispose();const E=f.morphAttributes.position!==void 0,x=f.morphAttributes.normal!==void 0,w=f.morphAttributes.color!==void 0,L=f.morphAttributes.position||[],C=f.morphAttributes.normal||[],R=f.morphAttributes.color||[];let z=0;E===!0&&(z=1),x===!0&&(z=2),w===!0&&(z=3);let S=f.attributes.position.count*z,A=1;S>e.maxTextureSize&&(A=Math.ceil(S/e.maxTextureSize),S=e.maxTextureSize);const V=new Float32Array(S*A*4*_),X=new DataArrayTexture(V,S,A,_);X.type=FloatType,X.needsUpdate=!0;const ne=z*4;for(let F=0;F<_;F++){const W=L[F],j=C[F],Y=R[F],q=S*A*4*F;for(let J=0;J<W.count;J++){const ie=J*ne;E===!0&&(l.fromBufferAttribute(W,J),V[q+ie+0]=l.x,V[q+ie+1]=l.y,V[q+ie+2]=l.z,V[q+ie+3]=0),x===!0&&(l.fromBufferAttribute(j,J),V[q+ie+4]=l.x,V[q+ie+5]=l.y,V[q+ie+6]=l.z,V[q+ie+7]=0),w===!0&&(l.fromBufferAttribute(Y,J),V[q+ie+8]=l.x,V[q+ie+9]=l.y,V[q+ie+10]=l.z,V[q+ie+11]=Y.itemSize===4?l.w:1)}}v={count:_,texture:X,size:new Vector2(S,A)},s.set(f,v),f.addEventListener("dispose",D)}let m=0;for(let E=0;E<d.length;E++)m+=d[E];const p=f.morphTargetsRelative?1:1-m;u.getUniforms().setValue(r,"morphTargetBaseInfluence",p),u.getUniforms().setValue(r,"morphTargetInfluences",d),u.getUniforms().setValue(r,"morphTargetsTexture",v.texture,t),u.getUniforms().setValue(r,"morphTargetsTextureSize",v.size)}else{const g=d===void 0?0:d.length;let _=i[f.id];if(_===void 0||_.length!==g){_=[];for(let x=0;x<g;x++)_[x]=[x,0];i[f.id]=_}for(let x=0;x<g;x++){const w=_[x];w[0]=x,w[1]=d[x]}_.sort(absNumericalSort);for(let x=0;x<8;x++)x<g&&_[x][1]?(o[x][0]=_[x][0],o[x][1]=_[x][1]):(o[x][0]=Number.MAX_SAFE_INTEGER,o[x][1]=0);o.sort(numericalSort);const v=f.morphAttributes.position,m=f.morphAttributes.normal;let p=0;for(let x=0;x<8;x++){const w=o[x],L=w[0],C=w[1];L!==Number.MAX_SAFE_INTEGER&&C?(v&&f.getAttribute("morphTarget"+x)!==v[L]&&f.setAttribute("morphTarget"+x,v[L]),m&&f.getAttribute("morphNormal"+x)!==m[L]&&f.setAttribute("morphNormal"+x,m[L]),a[x]=C,p+=C):(v&&f.hasAttribute("morphTarget"+x)===!0&&f.deleteAttribute("morphTarget"+x),m&&f.hasAttribute("morphNormal"+x)===!0&&f.deleteAttribute("morphNormal"+x),a[x]=0)}const E=f.morphTargetsRelative?1:1-p;u.getUniforms().setValue(r,"morphTargetBaseInfluence",E),u.getUniforms().setValue(r,"morphTargetInfluences",a)}}return{update:c}}function WebGLObjects(r,e,t,i){let a=new WeakMap;function s(c){const h=i.render.frame,f=c.geometry,u=e.get(c,f);if(a.get(u)!==h&&(e.update(u),a.set(u,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",o)===!1&&c.addEventListener("dispose",o),a.get(c)!==h&&(t.update(c.instanceMatrix,r.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,r.ARRAY_BUFFER),a.set(c,h))),c.isSkinnedMesh){const d=c.skeleton;a.get(d)!==h&&(d.update(),a.set(d,h))}return u}function l(){a=new WeakMap}function o(c){const h=c.target;h.removeEventListener("dispose",o),t.remove(h.instanceMatrix),h.instanceColor!==null&&t.remove(h.instanceColor)}return{update:s,dispose:l}}class DepthTexture extends Texture{constructor(e,t,i,a,s,l,o,c,h,f){if(f=f!==void 0?f:DepthFormat,f!==DepthFormat&&f!==DepthStencilFormat)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&f===DepthFormat&&(i=UnsignedIntType),i===void 0&&f===DepthStencilFormat&&(i=UnsignedInt248Type),super(null,a,s,l,o,c,f,i,h),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=o!==void 0?o:NearestFilter,this.minFilter=c!==void 0?c:NearestFilter,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const emptyTexture=new Texture,emptyShadowTexture=new DepthTexture(1,1);emptyShadowTexture.compareFunction=LessEqualCompare;const emptyArrayTexture=new DataArrayTexture,empty3dTexture=new Data3DTexture,emptyCubeTexture=new CubeTexture,arrayCacheF32=[],arrayCacheI32=[],mat4array=new Float32Array(16),mat3array=new Float32Array(9),mat2array=new Float32Array(4);function flatten(r,e,t){const i=r[0];if(i<=0||i>0)return r;const a=e*t;let s=arrayCacheF32[a];if(s===void 0&&(s=new Float32Array(a),arrayCacheF32[a]=s),e!==0){i.toArray(s,0);for(let l=1,o=0;l!==e;++l)o+=t,r[l].toArray(s,o)}return s}function arraysEqual(r,e){if(r.length!==e.length)return!1;for(let t=0,i=r.length;t<i;t++)if(r[t]!==e[t])return!1;return!0}function copyArray(r,e){for(let t=0,i=e.length;t<i;t++)r[t]=e[t]}function allocTexUnits(r,e){let t=arrayCacheI32[e];t===void 0&&(t=new Int32Array(e),arrayCacheI32[e]=t);for(let i=0;i!==e;++i)t[i]=r.allocateTextureUnit();return t}function setValueV1f(r,e){const t=this.cache;t[0]!==e&&(r.uniform1f(this.addr,e),t[0]=e)}function setValueV2f(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(arraysEqual(t,e))return;r.uniform2fv(this.addr,e),copyArray(t,e)}}function setValueV3f(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(r.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(arraysEqual(t,e))return;r.uniform3fv(this.addr,e),copyArray(t,e)}}function setValueV4f(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(arraysEqual(t,e))return;r.uniform4fv(this.addr,e),copyArray(t,e)}}function setValueM2(r,e){const t=this.cache,i=e.elements;if(i===void 0){if(arraysEqual(t,e))return;r.uniformMatrix2fv(this.addr,!1,e),copyArray(t,e)}else{if(arraysEqual(t,i))return;mat2array.set(i),r.uniformMatrix2fv(this.addr,!1,mat2array),copyArray(t,i)}}function setValueM3(r,e){const t=this.cache,i=e.elements;if(i===void 0){if(arraysEqual(t,e))return;r.uniformMatrix3fv(this.addr,!1,e),copyArray(t,e)}else{if(arraysEqual(t,i))return;mat3array.set(i),r.uniformMatrix3fv(this.addr,!1,mat3array),copyArray(t,i)}}function setValueM4(r,e){const t=this.cache,i=e.elements;if(i===void 0){if(arraysEqual(t,e))return;r.uniformMatrix4fv(this.addr,!1,e),copyArray(t,e)}else{if(arraysEqual(t,i))return;mat4array.set(i),r.uniformMatrix4fv(this.addr,!1,mat4array),copyArray(t,i)}}function setValueV1i(r,e){const t=this.cache;t[0]!==e&&(r.uniform1i(this.addr,e),t[0]=e)}function setValueV2i(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(arraysEqual(t,e))return;r.uniform2iv(this.addr,e),copyArray(t,e)}}function setValueV3i(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(arraysEqual(t,e))return;r.uniform3iv(this.addr,e),copyArray(t,e)}}function setValueV4i(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(arraysEqual(t,e))return;r.uniform4iv(this.addr,e),copyArray(t,e)}}function setValueV1ui(r,e){const t=this.cache;t[0]!==e&&(r.uniform1ui(this.addr,e),t[0]=e)}function setValueV2ui(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(arraysEqual(t,e))return;r.uniform2uiv(this.addr,e),copyArray(t,e)}}function setValueV3ui(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(arraysEqual(t,e))return;r.uniform3uiv(this.addr,e),copyArray(t,e)}}function setValueV4ui(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(arraysEqual(t,e))return;r.uniform4uiv(this.addr,e),copyArray(t,e)}}function setValueT1(r,e,t){const i=this.cache,a=t.allocateTextureUnit();i[0]!==a&&(r.uniform1i(this.addr,a),i[0]=a);const s=this.type===r.SAMPLER_2D_SHADOW?emptyShadowTexture:emptyTexture;t.setTexture2D(e||s,a)}function setValueT3D1(r,e,t){const i=this.cache,a=t.allocateTextureUnit();i[0]!==a&&(r.uniform1i(this.addr,a),i[0]=a),t.setTexture3D(e||empty3dTexture,a)}function setValueT6(r,e,t){const i=this.cache,a=t.allocateTextureUnit();i[0]!==a&&(r.uniform1i(this.addr,a),i[0]=a),t.setTextureCube(e||emptyCubeTexture,a)}function setValueT2DArray1(r,e,t){const i=this.cache,a=t.allocateTextureUnit();i[0]!==a&&(r.uniform1i(this.addr,a),i[0]=a),t.setTexture2DArray(e||emptyArrayTexture,a)}function getSingularSetter(r){switch(r){case 5126:return setValueV1f;case 35664:return setValueV2f;case 35665:return setValueV3f;case 35666:return setValueV4f;case 35674:return setValueM2;case 35675:return setValueM3;case 35676:return setValueM4;case 5124:case 35670:return setValueV1i;case 35667:case 35671:return setValueV2i;case 35668:case 35672:return setValueV3i;case 35669:case 35673:return setValueV4i;case 5125:return setValueV1ui;case 36294:return setValueV2ui;case 36295:return setValueV3ui;case 36296:return setValueV4ui;case 35678:case 36198:case 36298:case 36306:case 35682:return setValueT1;case 35679:case 36299:case 36307:return setValueT3D1;case 35680:case 36300:case 36308:case 36293:return setValueT6;case 36289:case 36303:case 36311:case 36292:return setValueT2DArray1}}function setValueV1fArray(r,e){r.uniform1fv(this.addr,e)}function setValueV2fArray(r,e){const t=flatten(e,this.size,2);r.uniform2fv(this.addr,t)}function setValueV3fArray(r,e){const t=flatten(e,this.size,3);r.uniform3fv(this.addr,t)}function setValueV4fArray(r,e){const t=flatten(e,this.size,4);r.uniform4fv(this.addr,t)}function setValueM2Array(r,e){const t=flatten(e,this.size,4);r.uniformMatrix2fv(this.addr,!1,t)}function setValueM3Array(r,e){const t=flatten(e,this.size,9);r.uniformMatrix3fv(this.addr,!1,t)}function setValueM4Array(r,e){const t=flatten(e,this.size,16);r.uniformMatrix4fv(this.addr,!1,t)}function setValueV1iArray(r,e){r.uniform1iv(this.addr,e)}function setValueV2iArray(r,e){r.uniform2iv(this.addr,e)}function setValueV3iArray(r,e){r.uniform3iv(this.addr,e)}function setValueV4iArray(r,e){r.uniform4iv(this.addr,e)}function setValueV1uiArray(r,e){r.uniform1uiv(this.addr,e)}function setValueV2uiArray(r,e){r.uniform2uiv(this.addr,e)}function setValueV3uiArray(r,e){r.uniform3uiv(this.addr,e)}function setValueV4uiArray(r,e){r.uniform4uiv(this.addr,e)}function setValueT1Array(r,e,t){const i=this.cache,a=e.length,s=allocTexUnits(t,a);arraysEqual(i,s)||(r.uniform1iv(this.addr,s),copyArray(i,s));for(let l=0;l!==a;++l)t.setTexture2D(e[l]||emptyTexture,s[l])}function setValueT3DArray(r,e,t){const i=this.cache,a=e.length,s=allocTexUnits(t,a);arraysEqual(i,s)||(r.uniform1iv(this.addr,s),copyArray(i,s));for(let l=0;l!==a;++l)t.setTexture3D(e[l]||empty3dTexture,s[l])}function setValueT6Array(r,e,t){const i=this.cache,a=e.length,s=allocTexUnits(t,a);arraysEqual(i,s)||(r.uniform1iv(this.addr,s),copyArray(i,s));for(let l=0;l!==a;++l)t.setTextureCube(e[l]||emptyCubeTexture,s[l])}function setValueT2DArrayArray(r,e,t){const i=this.cache,a=e.length,s=allocTexUnits(t,a);arraysEqual(i,s)||(r.uniform1iv(this.addr,s),copyArray(i,s));for(let l=0;l!==a;++l)t.setTexture2DArray(e[l]||emptyArrayTexture,s[l])}function getPureArraySetter(r){switch(r){case 5126:return setValueV1fArray;case 35664:return setValueV2fArray;case 35665:return setValueV3fArray;case 35666:return setValueV4fArray;case 35674:return setValueM2Array;case 35675:return setValueM3Array;case 35676:return setValueM4Array;case 5124:case 35670:return setValueV1iArray;case 35667:case 35671:return setValueV2iArray;case 35668:case 35672:return setValueV3iArray;case 35669:case 35673:return setValueV4iArray;case 5125:return setValueV1uiArray;case 36294:return setValueV2uiArray;case 36295:return setValueV3uiArray;case 36296:return setValueV4uiArray;case 35678:case 36198:case 36298:case 36306:case 35682:return setValueT1Array;case 35679:case 36299:case 36307:return setValueT3DArray;case 35680:case 36300:case 36308:case 36293:return setValueT6Array;case 36289:case 36303:case 36311:case 36292:return setValueT2DArrayArray}}class SingleUniform{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=getSingularSetter(t.type)}}class PureArrayUniform{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=getPureArraySetter(t.type)}}class StructuredUniform{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const a=this.seq;for(let s=0,l=a.length;s!==l;++s){const o=a[s];o.setValue(e,t[o.id],i)}}}const RePathPart=/(\w+)(\])?(\[|\.)?/g;function addUniform(r,e){r.seq.push(e),r.map[e.id]=e}function parseUniform(r,e,t){const i=r.name,a=i.length;for(RePathPart.lastIndex=0;;){const s=RePathPart.exec(i),l=RePathPart.lastIndex;let o=s[1];const c=s[2]==="]",h=s[3];if(c&&(o=o|0),h===void 0||h==="["&&l+2===a){addUniform(t,h===void 0?new SingleUniform(o,r,e):new PureArrayUniform(o,r,e));break}else{let u=t.map[o];u===void 0&&(u=new StructuredUniform(o),addUniform(t,u)),t=u}}}class WebGLUniforms{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<i;++a){const s=e.getActiveUniform(t,a),l=e.getUniformLocation(t,s.name);parseUniform(s,l,this)}}setValue(e,t,i,a){const s=this.map[t];s!==void 0&&s.setValue(e,i,a)}setOptional(e,t,i){const a=t[i];a!==void 0&&this.setValue(e,i,a)}static upload(e,t,i,a){for(let s=0,l=t.length;s!==l;++s){const o=t[s],c=i[o.id];c.needsUpdate!==!1&&o.setValue(e,c.value,a)}}static seqWithValue(e,t){const i=[];for(let a=0,s=e.length;a!==s;++a){const l=e[a];l.id in t&&i.push(l)}return i}}function WebGLShader(r,e,t){const i=r.createShader(e);return r.shaderSource(i,t),r.compileShader(i),i}const COMPLETION_STATUS_KHR=37297;let programIdCount=0;function handleSource(r,e){const t=r.split(`
`),i=[],a=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let l=a;l<s;l++){const o=l+1;i.push(`${o===e?">":" "} ${o}: ${t[l]}`)}return i.join(`
`)}function getEncodingComponents(r){const e=ColorManagement.getPrimaries(ColorManagement.workingColorSpace),t=ColorManagement.getPrimaries(r);let i;switch(e===t?i="":e===P3Primaries&&t===Rec709Primaries?i="LinearDisplayP3ToLinearSRGB":e===Rec709Primaries&&t===P3Primaries&&(i="LinearSRGBToLinearDisplayP3"),r){case LinearSRGBColorSpace:case LinearDisplayP3ColorSpace:return[i,"LinearTransferOETF"];case SRGBColorSpace:case DisplayP3ColorSpace:return[i,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",r),[i,"LinearTransferOETF"]}}function getShaderErrors(r,e,t){const i=r.getShaderParameter(e,r.COMPILE_STATUS),a=r.getShaderInfoLog(e).trim();if(i&&a==="")return"";const s=/ERROR: 0:(\d+)/.exec(a);if(s){const l=parseInt(s[1]);return t.toUpperCase()+`

`+a+`

`+handleSource(r.getShaderSource(e),l)}else return a}function getTexelEncodingFunction(r,e){const t=getEncodingComponents(e);return`vec4 ${r}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`}function getToneMappingFunction(r,e){let t;switch(e){case LinearToneMapping:t="Linear";break;case ReinhardToneMapping:t="Reinhard";break;case CineonToneMapping:t="OptimizedCineon";break;case ACESFilmicToneMapping:t="ACESFilmic";break;case AgXToneMapping:t="AgX";break;case CustomToneMapping:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+r+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}function generateExtensions(r){return[r.extensionDerivatives||r.envMapCubeUVHeight||r.bumpMap||r.normalMapTangentSpace||r.clearcoatNormalMap||r.flatShading||r.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(r.extensionFragDepth||r.logarithmicDepthBuffer)&&r.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",r.extensionDrawBuffers&&r.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(r.extensionShaderTextureLOD||r.envMap||r.transmission)&&r.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter(filterEmptyLine).join(`
`)}function generateVertexExtensions(r){return[r.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":""].filter(filterEmptyLine).join(`
`)}function generateDefines(r){const e=[];for(const t in r){const i=r[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function fetchAttributeLocations(r,e){const t={},i=r.getProgramParameter(e,r.ACTIVE_ATTRIBUTES);for(let a=0;a<i;a++){const s=r.getActiveAttrib(e,a),l=s.name;let o=1;s.type===r.FLOAT_MAT2&&(o=2),s.type===r.FLOAT_MAT3&&(o=3),s.type===r.FLOAT_MAT4&&(o=4),t[l]={type:s.type,location:r.getAttribLocation(e,l),locationSize:o}}return t}function filterEmptyLine(r){return r!==""}function replaceLightNums(r,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return r.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function replaceClippingPlaneNums(r,e){return r.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const includePattern=/^[ \t]*#include +<([\w\d./]+)>/gm;function resolveIncludes(r){return r.replace(includePattern,includeReplacer)}const shaderChunkMap=new Map([["encodings_fragment","colorspace_fragment"],["encodings_pars_fragment","colorspace_pars_fragment"],["output_fragment","opaque_fragment"]]);function includeReplacer(r,e){let t=ShaderChunk[e];if(t===void 0){const i=shaderChunkMap.get(e);if(i!==void 0)t=ShaderChunk[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return resolveIncludes(t)}const unrollLoopPattern=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function unrollLoops(r){return r.replace(unrollLoopPattern,loopReplacer)}function loopReplacer(r,e,t,i){let a="";for(let s=parseInt(e);s<parseInt(t);s++)a+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return a}function generatePrecision(r){let e="precision "+r.precision+` float;
precision `+r.precision+" int;";return r.precision==="highp"?e+=`
#define HIGH_PRECISION`:r.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:r.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function generateShadowMapTypeDefine(r){let e="SHADOWMAP_TYPE_BASIC";return r.shadowMapType===PCFShadowMap?e="SHADOWMAP_TYPE_PCF":r.shadowMapType===PCFSoftShadowMap?e="SHADOWMAP_TYPE_PCF_SOFT":r.shadowMapType===VSMShadowMap&&(e="SHADOWMAP_TYPE_VSM"),e}function generateEnvMapTypeDefine(r){let e="ENVMAP_TYPE_CUBE";if(r.envMap)switch(r.envMapMode){case CubeReflectionMapping:case CubeRefractionMapping:e="ENVMAP_TYPE_CUBE";break;case CubeUVReflectionMapping:e="ENVMAP_TYPE_CUBE_UV";break}return e}function generateEnvMapModeDefine(r){let e="ENVMAP_MODE_REFLECTION";if(r.envMap)switch(r.envMapMode){case CubeRefractionMapping:e="ENVMAP_MODE_REFRACTION";break}return e}function generateEnvMapBlendingDefine(r){let e="ENVMAP_BLENDING_NONE";if(r.envMap)switch(r.combine){case MultiplyOperation:e="ENVMAP_BLENDING_MULTIPLY";break;case MixOperation:e="ENVMAP_BLENDING_MIX";break;case AddOperation:e="ENVMAP_BLENDING_ADD";break}return e}function generateCubeUVSize(r){const e=r.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function WebGLProgram(r,e,t,i){const a=r.getContext(),s=t.defines;let l=t.vertexShader,o=t.fragmentShader;const c=generateShadowMapTypeDefine(t),h=generateEnvMapTypeDefine(t),f=generateEnvMapModeDefine(t),u=generateEnvMapBlendingDefine(t),d=generateCubeUVSize(t),g=t.isWebGL2?"":generateExtensions(t),_=generateVertexExtensions(t),v=generateDefines(s),m=a.createProgram();let p,E,x=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,v].filter(filterEmptyLine).join(`
`),p.length>0&&(p+=`
`),E=[g,"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,v].filter(filterEmptyLine).join(`
`),E.length>0&&(E+=`
`)):(p=[generatePrecision(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,v,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+f:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors&&t.isWebGL2?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(filterEmptyLine).join(`
`),E=[g,generatePrecision(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,v,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.envMap?"#define "+f:"",t.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==NoToneMapping?"#define TONE_MAPPING":"",t.toneMapping!==NoToneMapping?ShaderChunk.tonemapping_pars_fragment:"",t.toneMapping!==NoToneMapping?getToneMappingFunction("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",ShaderChunk.colorspace_pars_fragment,getTexelEncodingFunction("linearToOutputTexel",t.outputColorSpace),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(filterEmptyLine).join(`
`)),l=resolveIncludes(l),l=replaceLightNums(l,t),l=replaceClippingPlaneNums(l,t),o=resolveIncludes(o),o=replaceLightNums(o,t),o=replaceClippingPlaneNums(o,t),l=unrollLoops(l),o=unrollLoops(o),t.isWebGL2&&t.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,p=[_,"precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,E=["precision mediump sampler2DArray;","#define varying in",t.glslVersion===GLSL3?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===GLSL3?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+E);const w=x+p+l,L=x+E+o,C=WebGLShader(a,a.VERTEX_SHADER,w),R=WebGLShader(a,a.FRAGMENT_SHADER,L);a.attachShader(m,C),a.attachShader(m,R),t.index0AttributeName!==void 0?a.bindAttribLocation(m,0,t.index0AttributeName):t.morphTargets===!0&&a.bindAttribLocation(m,0,"position"),a.linkProgram(m);function z(X){if(r.debug.checkShaderErrors){const ne=a.getProgramInfoLog(m).trim(),D=a.getShaderInfoLog(C).trim(),F=a.getShaderInfoLog(R).trim();let W=!0,j=!0;if(a.getProgramParameter(m,a.LINK_STATUS)===!1)if(W=!1,typeof r.debug.onShaderError=="function")r.debug.onShaderError(a,m,C,R);else{const Y=getShaderErrors(a,C,"vertex"),q=getShaderErrors(a,R,"fragment");console.error("THREE.WebGLProgram: Shader Error "+a.getError()+" - VALIDATE_STATUS "+a.getProgramParameter(m,a.VALIDATE_STATUS)+`

Program Info Log: `+ne+`
`+Y+`
`+q)}else ne!==""?console.warn("THREE.WebGLProgram: Program Info Log:",ne):(D===""||F==="")&&(j=!1);j&&(X.diagnostics={runnable:W,programLog:ne,vertexShader:{log:D,prefix:p},fragmentShader:{log:F,prefix:E}})}a.deleteShader(C),a.deleteShader(R),S=new WebGLUniforms(a,m),A=fetchAttributeLocations(a,m)}let S;this.getUniforms=function(){return S===void 0&&z(this),S};let A;this.getAttributes=function(){return A===void 0&&z(this),A};let V=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return V===!1&&(V=a.getProgramParameter(m,COMPLETION_STATUS_KHR)),V},this.destroy=function(){i.releaseStatesOfProgram(this),a.deleteProgram(m),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=programIdCount++,this.cacheKey=e,this.usedTimes=1,this.program=m,this.vertexShader=C,this.fragmentShader=R,this}let _id$1=0;class WebGLShaderCache{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,i=e.fragmentShader,a=this._getShaderStage(t),s=this._getShaderStage(i),l=this._getShaderCacheForMaterial(e);return l.has(a)===!1&&(l.add(a),a.usedTimes++),l.has(s)===!1&&(l.add(s),s.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new WebGLShaderStage(e),t.set(e,i)),i}}class WebGLShaderStage{constructor(e){this.id=_id$1++,this.code=e,this.usedTimes=0}}function WebGLPrograms(r,e,t,i,a,s,l){const o=new Layers,c=new WebGLShaderCache,h=[],f=a.isWebGL2,u=a.logarithmicDepthBuffer,d=a.vertexTextures;let g=a.precision;const _={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(S){return S===0?"uv":`uv${S}`}function m(S,A,V,X,ne){const D=X.fog,F=ne.geometry,W=S.isMeshStandardMaterial?X.environment:null,j=(S.isMeshStandardMaterial?t:e).get(S.envMap||W),Y=j&&j.mapping===CubeUVReflectionMapping?j.image.height:null,q=_[S.type];S.precision!==null&&(g=a.getMaxPrecision(S.precision),g!==S.precision&&console.warn("THREE.WebGLProgram.getParameters:",S.precision,"not supported, using",g,"instead."));const J=F.morphAttributes.position||F.morphAttributes.normal||F.morphAttributes.color,ie=J!==void 0?J.length:0;let he=0;F.morphAttributes.position!==void 0&&(he=1),F.morphAttributes.normal!==void 0&&(he=2),F.morphAttributes.color!==void 0&&(he=3);let H,K,le,_e;if(q){const et=ShaderLib[q];H=et.vertexShader,K=et.fragmentShader}else H=S.vertexShader,K=S.fragmentShader,c.update(S),le=c.getVertexShaderID(S),_e=c.getFragmentShaderID(S);const ge=r.getRenderTarget(),Re=ne.isInstancedMesh===!0,Pe=ne.isBatchedMesh===!0,Te=!!S.map,Oe=!!S.matcap,I=!!j,Je=!!S.aoMap,xe=!!S.lightMap,we=!!S.bumpMap,de=!!S.normalMap,$e=!!S.displacementMap,Ue=!!S.emissiveMap,b=!!S.metalnessMap,M=!!S.roughnessMap,B=S.anisotropy>0,ee=S.clearcoat>0,Q=S.iridescence>0,te=S.sheen>0,pe=S.transmission>0,oe=B&&!!S.anisotropyMap,ue=ee&&!!S.clearcoatMap,ye=ee&&!!S.clearcoatNormalMap,Fe=ee&&!!S.clearcoatRoughnessMap,Z=Q&&!!S.iridescenceMap,ze=Q&&!!S.iridescenceThicknessMap,Be=te&&!!S.sheenColorMap,Ae=te&&!!S.sheenRoughnessMap,ve=!!S.specularMap,fe=!!S.specularColorMap,De=!!S.specularIntensityMap,Ve=pe&&!!S.transmissionMap,qe=pe&&!!S.thicknessMap,Ne=!!S.gradientMap,re=!!S.alphaMap,P=S.alphaTest>0,ae=!!S.alphaHash,se=!!S.extensions,be=!!F.attributes.uv1,Me=!!F.attributes.uv2,ke=!!F.attributes.uv3;let He=NoToneMapping;return S.toneMapped&&(ge===null||ge.isXRRenderTarget===!0)&&(He=r.toneMapping),{isWebGL2:f,shaderID:q,shaderType:S.type,shaderName:S.name,vertexShader:H,fragmentShader:K,defines:S.defines,customVertexShaderID:le,customFragmentShaderID:_e,isRawShaderMaterial:S.isRawShaderMaterial===!0,glslVersion:S.glslVersion,precision:g,batching:Pe,instancing:Re,instancingColor:Re&&ne.instanceColor!==null,supportsVertexTextures:d,outputColorSpace:ge===null?r.outputColorSpace:ge.isXRRenderTarget===!0?ge.texture.colorSpace:LinearSRGBColorSpace,map:Te,matcap:Oe,envMap:I,envMapMode:I&&j.mapping,envMapCubeUVHeight:Y,aoMap:Je,lightMap:xe,bumpMap:we,normalMap:de,displacementMap:d&&$e,emissiveMap:Ue,normalMapObjectSpace:de&&S.normalMapType===ObjectSpaceNormalMap,normalMapTangentSpace:de&&S.normalMapType===TangentSpaceNormalMap,metalnessMap:b,roughnessMap:M,anisotropy:B,anisotropyMap:oe,clearcoat:ee,clearcoatMap:ue,clearcoatNormalMap:ye,clearcoatRoughnessMap:Fe,iridescence:Q,iridescenceMap:Z,iridescenceThicknessMap:ze,sheen:te,sheenColorMap:Be,sheenRoughnessMap:Ae,specularMap:ve,specularColorMap:fe,specularIntensityMap:De,transmission:pe,transmissionMap:Ve,thicknessMap:qe,gradientMap:Ne,opaque:S.transparent===!1&&S.blending===NormalBlending,alphaMap:re,alphaTest:P,alphaHash:ae,combine:S.combine,mapUv:Te&&v(S.map.channel),aoMapUv:Je&&v(S.aoMap.channel),lightMapUv:xe&&v(S.lightMap.channel),bumpMapUv:we&&v(S.bumpMap.channel),normalMapUv:de&&v(S.normalMap.channel),displacementMapUv:$e&&v(S.displacementMap.channel),emissiveMapUv:Ue&&v(S.emissiveMap.channel),metalnessMapUv:b&&v(S.metalnessMap.channel),roughnessMapUv:M&&v(S.roughnessMap.channel),anisotropyMapUv:oe&&v(S.anisotropyMap.channel),clearcoatMapUv:ue&&v(S.clearcoatMap.channel),clearcoatNormalMapUv:ye&&v(S.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Fe&&v(S.clearcoatRoughnessMap.channel),iridescenceMapUv:Z&&v(S.iridescenceMap.channel),iridescenceThicknessMapUv:ze&&v(S.iridescenceThicknessMap.channel),sheenColorMapUv:Be&&v(S.sheenColorMap.channel),sheenRoughnessMapUv:Ae&&v(S.sheenRoughnessMap.channel),specularMapUv:ve&&v(S.specularMap.channel),specularColorMapUv:fe&&v(S.specularColorMap.channel),specularIntensityMapUv:De&&v(S.specularIntensityMap.channel),transmissionMapUv:Ve&&v(S.transmissionMap.channel),thicknessMapUv:qe&&v(S.thicknessMap.channel),alphaMapUv:re&&v(S.alphaMap.channel),vertexTangents:!!F.attributes.tangent&&(de||B),vertexColors:S.vertexColors,vertexAlphas:S.vertexColors===!0&&!!F.attributes.color&&F.attributes.color.itemSize===4,vertexUv1s:be,vertexUv2s:Me,vertexUv3s:ke,pointsUvs:ne.isPoints===!0&&!!F.attributes.uv&&(Te||re),fog:!!D,useFog:S.fog===!0,fogExp2:D&&D.isFogExp2,flatShading:S.flatShading===!0,sizeAttenuation:S.sizeAttenuation===!0,logarithmicDepthBuffer:u,skinning:ne.isSkinnedMesh===!0,morphTargets:F.morphAttributes.position!==void 0,morphNormals:F.morphAttributes.normal!==void 0,morphColors:F.morphAttributes.color!==void 0,morphTargetsCount:ie,morphTextureStride:he,numDirLights:A.directional.length,numPointLights:A.point.length,numSpotLights:A.spot.length,numSpotLightMaps:A.spotLightMap.length,numRectAreaLights:A.rectArea.length,numHemiLights:A.hemi.length,numDirLightShadows:A.directionalShadowMap.length,numPointLightShadows:A.pointShadowMap.length,numSpotLightShadows:A.spotShadowMap.length,numSpotLightShadowsWithMaps:A.numSpotLightShadowsWithMaps,numLightProbes:A.numLightProbes,numClippingPlanes:l.numPlanes,numClipIntersection:l.numIntersection,dithering:S.dithering,shadowMapEnabled:r.shadowMap.enabled&&V.length>0,shadowMapType:r.shadowMap.type,toneMapping:He,useLegacyLights:r._useLegacyLights,decodeVideoTexture:Te&&S.map.isVideoTexture===!0&&ColorManagement.getTransfer(S.map.colorSpace)===SRGBTransfer,premultipliedAlpha:S.premultipliedAlpha,doubleSided:S.side===DoubleSide,flipSided:S.side===BackSide,useDepthPacking:S.depthPacking>=0,depthPacking:S.depthPacking||0,index0AttributeName:S.index0AttributeName,extensionDerivatives:se&&S.extensions.derivatives===!0,extensionFragDepth:se&&S.extensions.fragDepth===!0,extensionDrawBuffers:se&&S.extensions.drawBuffers===!0,extensionShaderTextureLOD:se&&S.extensions.shaderTextureLOD===!0,extensionClipCullDistance:se&&S.extensions.clipCullDistance&&i.has("WEBGL_clip_cull_distance"),rendererExtensionFragDepth:f||i.has("EXT_frag_depth"),rendererExtensionDrawBuffers:f||i.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:f||i.has("EXT_shader_texture_lod"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:S.customProgramCacheKey()}}function p(S){const A=[];if(S.shaderID?A.push(S.shaderID):(A.push(S.customVertexShaderID),A.push(S.customFragmentShaderID)),S.defines!==void 0)for(const V in S.defines)A.push(V),A.push(S.defines[V]);return S.isRawShaderMaterial===!1&&(E(A,S),x(A,S),A.push(r.outputColorSpace)),A.push(S.customProgramCacheKey),A.join()}function E(S,A){S.push(A.precision),S.push(A.outputColorSpace),S.push(A.envMapMode),S.push(A.envMapCubeUVHeight),S.push(A.mapUv),S.push(A.alphaMapUv),S.push(A.lightMapUv),S.push(A.aoMapUv),S.push(A.bumpMapUv),S.push(A.normalMapUv),S.push(A.displacementMapUv),S.push(A.emissiveMapUv),S.push(A.metalnessMapUv),S.push(A.roughnessMapUv),S.push(A.anisotropyMapUv),S.push(A.clearcoatMapUv),S.push(A.clearcoatNormalMapUv),S.push(A.clearcoatRoughnessMapUv),S.push(A.iridescenceMapUv),S.push(A.iridescenceThicknessMapUv),S.push(A.sheenColorMapUv),S.push(A.sheenRoughnessMapUv),S.push(A.specularMapUv),S.push(A.specularColorMapUv),S.push(A.specularIntensityMapUv),S.push(A.transmissionMapUv),S.push(A.thicknessMapUv),S.push(A.combine),S.push(A.fogExp2),S.push(A.sizeAttenuation),S.push(A.morphTargetsCount),S.push(A.morphAttributeCount),S.push(A.numDirLights),S.push(A.numPointLights),S.push(A.numSpotLights),S.push(A.numSpotLightMaps),S.push(A.numHemiLights),S.push(A.numRectAreaLights),S.push(A.numDirLightShadows),S.push(A.numPointLightShadows),S.push(A.numSpotLightShadows),S.push(A.numSpotLightShadowsWithMaps),S.push(A.numLightProbes),S.push(A.shadowMapType),S.push(A.toneMapping),S.push(A.numClippingPlanes),S.push(A.numClipIntersection),S.push(A.depthPacking)}function x(S,A){o.disableAll(),A.isWebGL2&&o.enable(0),A.supportsVertexTextures&&o.enable(1),A.instancing&&o.enable(2),A.instancingColor&&o.enable(3),A.matcap&&o.enable(4),A.envMap&&o.enable(5),A.normalMapObjectSpace&&o.enable(6),A.normalMapTangentSpace&&o.enable(7),A.clearcoat&&o.enable(8),A.iridescence&&o.enable(9),A.alphaTest&&o.enable(10),A.vertexColors&&o.enable(11),A.vertexAlphas&&o.enable(12),A.vertexUv1s&&o.enable(13),A.vertexUv2s&&o.enable(14),A.vertexUv3s&&o.enable(15),A.vertexTangents&&o.enable(16),A.anisotropy&&o.enable(17),A.alphaHash&&o.enable(18),A.batching&&o.enable(19),S.push(o.mask),o.disableAll(),A.fog&&o.enable(0),A.useFog&&o.enable(1),A.flatShading&&o.enable(2),A.logarithmicDepthBuffer&&o.enable(3),A.skinning&&o.enable(4),A.morphTargets&&o.enable(5),A.morphNormals&&o.enable(6),A.morphColors&&o.enable(7),A.premultipliedAlpha&&o.enable(8),A.shadowMapEnabled&&o.enable(9),A.useLegacyLights&&o.enable(10),A.doubleSided&&o.enable(11),A.flipSided&&o.enable(12),A.useDepthPacking&&o.enable(13),A.dithering&&o.enable(14),A.transmission&&o.enable(15),A.sheen&&o.enable(16),A.opaque&&o.enable(17),A.pointsUvs&&o.enable(18),A.decodeVideoTexture&&o.enable(19),S.push(o.mask)}function w(S){const A=_[S.type];let V;if(A){const X=ShaderLib[A];V=UniformsUtils.clone(X.uniforms)}else V=S.uniforms;return V}function L(S,A){let V;for(let X=0,ne=h.length;X<ne;X++){const D=h[X];if(D.cacheKey===A){V=D,++V.usedTimes;break}}return V===void 0&&(V=new WebGLProgram(r,A,S,s),h.push(V)),V}function C(S){if(--S.usedTimes===0){const A=h.indexOf(S);h[A]=h[h.length-1],h.pop(),S.destroy()}}function R(S){c.remove(S)}function z(){c.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:w,acquireProgram:L,releaseProgram:C,releaseShaderCache:R,programs:h,dispose:z}}function WebGLProperties(){let r=new WeakMap;function e(s){let l=r.get(s);return l===void 0&&(l={},r.set(s,l)),l}function t(s){r.delete(s)}function i(s,l,o){r.get(s)[l]=o}function a(){r=new WeakMap}return{get:e,remove:t,update:i,dispose:a}}function painterSortStable(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.material.id!==e.material.id?r.material.id-e.material.id:r.z!==e.z?r.z-e.z:r.id-e.id}function reversePainterSortStable(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.z!==e.z?e.z-r.z:r.id-e.id}function WebGLRenderList(){const r=[];let e=0;const t=[],i=[],a=[];function s(){e=0,t.length=0,i.length=0,a.length=0}function l(u,d,g,_,v,m){let p=r[e];return p===void 0?(p={id:u.id,object:u,geometry:d,material:g,groupOrder:_,renderOrder:u.renderOrder,z:v,group:m},r[e]=p):(p.id=u.id,p.object=u,p.geometry=d,p.material=g,p.groupOrder=_,p.renderOrder=u.renderOrder,p.z=v,p.group=m),e++,p}function o(u,d,g,_,v,m){const p=l(u,d,g,_,v,m);g.transmission>0?i.push(p):g.transparent===!0?a.push(p):t.push(p)}function c(u,d,g,_,v,m){const p=l(u,d,g,_,v,m);g.transmission>0?i.unshift(p):g.transparent===!0?a.unshift(p):t.unshift(p)}function h(u,d){t.length>1&&t.sort(u||painterSortStable),i.length>1&&i.sort(d||reversePainterSortStable),a.length>1&&a.sort(d||reversePainterSortStable)}function f(){for(let u=e,d=r.length;u<d;u++){const g=r[u];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:i,transparent:a,init:s,push:o,unshift:c,finish:f,sort:h}}function WebGLRenderLists(){let r=new WeakMap;function e(i,a){const s=r.get(i);let l;return s===void 0?(l=new WebGLRenderList,r.set(i,[l])):a>=s.length?(l=new WebGLRenderList,s.push(l)):l=s[a],l}function t(){r=new WeakMap}return{get:e,dispose:t}}function UniformsCache(){const r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new Vector3,color:new Color};break;case"SpotLight":t={position:new Vector3,direction:new Vector3,color:new Color,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new Vector3,color:new Color,distance:0,decay:0};break;case"HemisphereLight":t={direction:new Vector3,skyColor:new Color,groundColor:new Color};break;case"RectAreaLight":t={color:new Color,position:new Vector3,halfWidth:new Vector3,halfHeight:new Vector3};break}return r[e.id]=t,t}}}function ShadowUniformsCache(){const r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Vector2};break;case"SpotLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Vector2};break;case"PointLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Vector2,shadowCameraNear:1,shadowCameraFar:1e3};break}return r[e.id]=t,t}}}let nextVersion=0;function shadowCastingAndTexturingLightsFirst(r,e){return(e.castShadow?2:0)-(r.castShadow?2:0)+(e.map?1:0)-(r.map?1:0)}function WebGLLights(r,e){const t=new UniformsCache,i=ShadowUniformsCache(),a={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let f=0;f<9;f++)a.probe.push(new Vector3);const s=new Vector3,l=new Matrix4,o=new Matrix4;function c(f,u){let d=0,g=0,_=0;for(let X=0;X<9;X++)a.probe[X].set(0,0,0);let v=0,m=0,p=0,E=0,x=0,w=0,L=0,C=0,R=0,z=0,S=0;f.sort(shadowCastingAndTexturingLightsFirst);const A=u===!0?Math.PI:1;for(let X=0,ne=f.length;X<ne;X++){const D=f[X],F=D.color,W=D.intensity,j=D.distance,Y=D.shadow&&D.shadow.map?D.shadow.map.texture:null;if(D.isAmbientLight)d+=F.r*W*A,g+=F.g*W*A,_+=F.b*W*A;else if(D.isLightProbe){for(let q=0;q<9;q++)a.probe[q].addScaledVector(D.sh.coefficients[q],W);S++}else if(D.isDirectionalLight){const q=t.get(D);if(q.color.copy(D.color).multiplyScalar(D.intensity*A),D.castShadow){const J=D.shadow,ie=i.get(D);ie.shadowBias=J.bias,ie.shadowNormalBias=J.normalBias,ie.shadowRadius=J.radius,ie.shadowMapSize=J.mapSize,a.directionalShadow[v]=ie,a.directionalShadowMap[v]=Y,a.directionalShadowMatrix[v]=D.shadow.matrix,w++}a.directional[v]=q,v++}else if(D.isSpotLight){const q=t.get(D);q.position.setFromMatrixPosition(D.matrixWorld),q.color.copy(F).multiplyScalar(W*A),q.distance=j,q.coneCos=Math.cos(D.angle),q.penumbraCos=Math.cos(D.angle*(1-D.penumbra)),q.decay=D.decay,a.spot[p]=q;const J=D.shadow;if(D.map&&(a.spotLightMap[R]=D.map,R++,J.updateMatrices(D),D.castShadow&&z++),a.spotLightMatrix[p]=J.matrix,D.castShadow){const ie=i.get(D);ie.shadowBias=J.bias,ie.shadowNormalBias=J.normalBias,ie.shadowRadius=J.radius,ie.shadowMapSize=J.mapSize,a.spotShadow[p]=ie,a.spotShadowMap[p]=Y,C++}p++}else if(D.isRectAreaLight){const q=t.get(D);q.color.copy(F).multiplyScalar(W),q.halfWidth.set(D.width*.5,0,0),q.halfHeight.set(0,D.height*.5,0),a.rectArea[E]=q,E++}else if(D.isPointLight){const q=t.get(D);if(q.color.copy(D.color).multiplyScalar(D.intensity*A),q.distance=D.distance,q.decay=D.decay,D.castShadow){const J=D.shadow,ie=i.get(D);ie.shadowBias=J.bias,ie.shadowNormalBias=J.normalBias,ie.shadowRadius=J.radius,ie.shadowMapSize=J.mapSize,ie.shadowCameraNear=J.camera.near,ie.shadowCameraFar=J.camera.far,a.pointShadow[m]=ie,a.pointShadowMap[m]=Y,a.pointShadowMatrix[m]=D.shadow.matrix,L++}a.point[m]=q,m++}else if(D.isHemisphereLight){const q=t.get(D);q.skyColor.copy(D.color).multiplyScalar(W*A),q.groundColor.copy(D.groundColor).multiplyScalar(W*A),a.hemi[x]=q,x++}}E>0&&(e.isWebGL2?r.has("OES_texture_float_linear")===!0?(a.rectAreaLTC1=UniformsLib.LTC_FLOAT_1,a.rectAreaLTC2=UniformsLib.LTC_FLOAT_2):(a.rectAreaLTC1=UniformsLib.LTC_HALF_1,a.rectAreaLTC2=UniformsLib.LTC_HALF_2):r.has("OES_texture_float_linear")===!0?(a.rectAreaLTC1=UniformsLib.LTC_FLOAT_1,a.rectAreaLTC2=UniformsLib.LTC_FLOAT_2):r.has("OES_texture_half_float_linear")===!0?(a.rectAreaLTC1=UniformsLib.LTC_HALF_1,a.rectAreaLTC2=UniformsLib.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),a.ambient[0]=d,a.ambient[1]=g,a.ambient[2]=_;const V=a.hash;(V.directionalLength!==v||V.pointLength!==m||V.spotLength!==p||V.rectAreaLength!==E||V.hemiLength!==x||V.numDirectionalShadows!==w||V.numPointShadows!==L||V.numSpotShadows!==C||V.numSpotMaps!==R||V.numLightProbes!==S)&&(a.directional.length=v,a.spot.length=p,a.rectArea.length=E,a.point.length=m,a.hemi.length=x,a.directionalShadow.length=w,a.directionalShadowMap.length=w,a.pointShadow.length=L,a.pointShadowMap.length=L,a.spotShadow.length=C,a.spotShadowMap.length=C,a.directionalShadowMatrix.length=w,a.pointShadowMatrix.length=L,a.spotLightMatrix.length=C+R-z,a.spotLightMap.length=R,a.numSpotLightShadowsWithMaps=z,a.numLightProbes=S,V.directionalLength=v,V.pointLength=m,V.spotLength=p,V.rectAreaLength=E,V.hemiLength=x,V.numDirectionalShadows=w,V.numPointShadows=L,V.numSpotShadows=C,V.numSpotMaps=R,V.numLightProbes=S,a.version=nextVersion++)}function h(f,u){let d=0,g=0,_=0,v=0,m=0;const p=u.matrixWorldInverse;for(let E=0,x=f.length;E<x;E++){const w=f[E];if(w.isDirectionalLight){const L=a.directional[d];L.direction.setFromMatrixPosition(w.matrixWorld),s.setFromMatrixPosition(w.target.matrixWorld),L.direction.sub(s),L.direction.transformDirection(p),d++}else if(w.isSpotLight){const L=a.spot[_];L.position.setFromMatrixPosition(w.matrixWorld),L.position.applyMatrix4(p),L.direction.setFromMatrixPosition(w.matrixWorld),s.setFromMatrixPosition(w.target.matrixWorld),L.direction.sub(s),L.direction.transformDirection(p),_++}else if(w.isRectAreaLight){const L=a.rectArea[v];L.position.setFromMatrixPosition(w.matrixWorld),L.position.applyMatrix4(p),o.identity(),l.copy(w.matrixWorld),l.premultiply(p),o.extractRotation(l),L.halfWidth.set(w.width*.5,0,0),L.halfHeight.set(0,w.height*.5,0),L.halfWidth.applyMatrix4(o),L.halfHeight.applyMatrix4(o),v++}else if(w.isPointLight){const L=a.point[g];L.position.setFromMatrixPosition(w.matrixWorld),L.position.applyMatrix4(p),g++}else if(w.isHemisphereLight){const L=a.hemi[m];L.direction.setFromMatrixPosition(w.matrixWorld),L.direction.transformDirection(p),m++}}}return{setup:c,setupView:h,state:a}}function WebGLRenderState(r,e){const t=new WebGLLights(r,e),i=[],a=[];function s(){i.length=0,a.length=0}function l(u){i.push(u)}function o(u){a.push(u)}function c(u){t.setup(i,u)}function h(u){t.setupView(i,u)}return{init:s,state:{lightsArray:i,shadowsArray:a,lights:t},setupLights:c,setupLightsView:h,pushLight:l,pushShadow:o}}function WebGLRenderStates(r,e){let t=new WeakMap;function i(s,l=0){const o=t.get(s);let c;return o===void 0?(c=new WebGLRenderState(r,e),t.set(s,[c])):l>=o.length?(c=new WebGLRenderState(r,e),o.push(c)):c=o[l],c}function a(){t=new WeakMap}return{get:i,dispose:a}}class MeshDepthMaterial extends Material{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=BasicDepthPacking,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class MeshDistanceMaterial extends Material{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const vertex=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,fragment=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function WebGLShadowMap(r,e,t){let i=new Frustum;const a=new Vector2,s=new Vector2,l=new Vector4,o=new MeshDepthMaterial({depthPacking:RGBADepthPacking}),c=new MeshDistanceMaterial,h={},f=t.maxTextureSize,u={[FrontSide]:BackSide,[BackSide]:FrontSide,[DoubleSide]:DoubleSide},d=new ShaderMaterial({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Vector2},radius:{value:4}},vertexShader:vertex,fragmentShader:fragment}),g=d.clone();g.defines.HORIZONTAL_PASS=1;const _=new BufferGeometry;_.setAttribute("position",new BufferAttribute(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new Mesh(_,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=PCFShadowMap;let p=this.type;this.render=function(C,R,z){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||C.length===0)return;const S=r.getRenderTarget(),A=r.getActiveCubeFace(),V=r.getActiveMipmapLevel(),X=r.state;X.setBlending(NoBlending),X.buffers.color.setClear(1,1,1,1),X.buffers.depth.setTest(!0),X.setScissorTest(!1);const ne=p!==VSMShadowMap&&this.type===VSMShadowMap,D=p===VSMShadowMap&&this.type!==VSMShadowMap;for(let F=0,W=C.length;F<W;F++){const j=C[F],Y=j.shadow;if(Y===void 0){console.warn("THREE.WebGLShadowMap:",j,"has no shadow.");continue}if(Y.autoUpdate===!1&&Y.needsUpdate===!1)continue;a.copy(Y.mapSize);const q=Y.getFrameExtents();if(a.multiply(q),s.copy(Y.mapSize),(a.x>f||a.y>f)&&(a.x>f&&(s.x=Math.floor(f/q.x),a.x=s.x*q.x,Y.mapSize.x=s.x),a.y>f&&(s.y=Math.floor(f/q.y),a.y=s.y*q.y,Y.mapSize.y=s.y)),Y.map===null||ne===!0||D===!0){const ie=this.type!==VSMShadowMap?{minFilter:NearestFilter,magFilter:NearestFilter}:{};Y.map!==null&&Y.map.dispose(),Y.map=new WebGLRenderTarget(a.x,a.y,ie),Y.map.texture.name=j.name+".shadowMap",Y.camera.updateProjectionMatrix()}r.setRenderTarget(Y.map),r.clear();const J=Y.getViewportCount();for(let ie=0;ie<J;ie++){const he=Y.getViewport(ie);l.set(s.x*he.x,s.y*he.y,s.x*he.z,s.y*he.w),X.viewport(l),Y.updateMatrices(j,ie),i=Y.getFrustum(),w(R,z,Y.camera,j,this.type)}Y.isPointLightShadow!==!0&&this.type===VSMShadowMap&&E(Y,z),Y.needsUpdate=!1}p=this.type,m.needsUpdate=!1,r.setRenderTarget(S,A,V)};function E(C,R){const z=e.update(v);d.defines.VSM_SAMPLES!==C.blurSamples&&(d.defines.VSM_SAMPLES=C.blurSamples,g.defines.VSM_SAMPLES=C.blurSamples,d.needsUpdate=!0,g.needsUpdate=!0),C.mapPass===null&&(C.mapPass=new WebGLRenderTarget(a.x,a.y)),d.uniforms.shadow_pass.value=C.map.texture,d.uniforms.resolution.value=C.mapSize,d.uniforms.radius.value=C.radius,r.setRenderTarget(C.mapPass),r.clear(),r.renderBufferDirect(R,null,z,d,v,null),g.uniforms.shadow_pass.value=C.mapPass.texture,g.uniforms.resolution.value=C.mapSize,g.uniforms.radius.value=C.radius,r.setRenderTarget(C.map),r.clear(),r.renderBufferDirect(R,null,z,g,v,null)}function x(C,R,z,S){let A=null;const V=z.isPointLight===!0?C.customDistanceMaterial:C.customDepthMaterial;if(V!==void 0)A=V;else if(A=z.isPointLight===!0?c:o,r.localClippingEnabled&&R.clipShadows===!0&&Array.isArray(R.clippingPlanes)&&R.clippingPlanes.length!==0||R.displacementMap&&R.displacementScale!==0||R.alphaMap&&R.alphaTest>0||R.map&&R.alphaTest>0){const X=A.uuid,ne=R.uuid;let D=h[X];D===void 0&&(D={},h[X]=D);let F=D[ne];F===void 0&&(F=A.clone(),D[ne]=F,R.addEventListener("dispose",L)),A=F}if(A.visible=R.visible,A.wireframe=R.wireframe,S===VSMShadowMap?A.side=R.shadowSide!==null?R.shadowSide:R.side:A.side=R.shadowSide!==null?R.shadowSide:u[R.side],A.alphaMap=R.alphaMap,A.alphaTest=R.alphaTest,A.map=R.map,A.clipShadows=R.clipShadows,A.clippingPlanes=R.clippingPlanes,A.clipIntersection=R.clipIntersection,A.displacementMap=R.displacementMap,A.displacementScale=R.displacementScale,A.displacementBias=R.displacementBias,A.wireframeLinewidth=R.wireframeLinewidth,A.linewidth=R.linewidth,z.isPointLight===!0&&A.isMeshDistanceMaterial===!0){const X=r.properties.get(A);X.light=z}return A}function w(C,R,z,S,A){if(C.visible===!1)return;if(C.layers.test(R.layers)&&(C.isMesh||C.isLine||C.isPoints)&&(C.castShadow||C.receiveShadow&&A===VSMShadowMap)&&(!C.frustumCulled||i.intersectsObject(C))){C.modelViewMatrix.multiplyMatrices(z.matrixWorldInverse,C.matrixWorld);const ne=e.update(C),D=C.material;if(Array.isArray(D)){const F=ne.groups;for(let W=0,j=F.length;W<j;W++){const Y=F[W],q=D[Y.materialIndex];if(q&&q.visible){const J=x(C,q,S,A);C.onBeforeShadow(r,C,R,z,ne,J,Y),r.renderBufferDirect(z,null,ne,J,C,Y),C.onAfterShadow(r,C,R,z,ne,J,Y)}}}else if(D.visible){const F=x(C,D,S,A);C.onBeforeShadow(r,C,R,z,ne,F,null),r.renderBufferDirect(z,null,ne,F,C,null),C.onAfterShadow(r,C,R,z,ne,F,null)}}const X=C.children;for(let ne=0,D=X.length;ne<D;ne++)w(X[ne],R,z,S,A)}function L(C){C.target.removeEventListener("dispose",L);for(const z in h){const S=h[z],A=C.target.uuid;A in S&&(S[A].dispose(),delete S[A])}}}function WebGLState(r,e,t){const i=t.isWebGL2;function a(){let P=!1;const ae=new Vector4;let se=null;const be=new Vector4(0,0,0,0);return{setMask:function(Me){se!==Me&&!P&&(r.colorMask(Me,Me,Me,Me),se=Me)},setLocked:function(Me){P=Me},setClear:function(Me,ke,He,Ke,et){et===!0&&(Me*=Ke,ke*=Ke,He*=Ke),ae.set(Me,ke,He,Ke),be.equals(ae)===!1&&(r.clearColor(Me,ke,He,Ke),be.copy(ae))},reset:function(){P=!1,se=null,be.set(-1,0,0,0)}}}function s(){let P=!1,ae=null,se=null,be=null;return{setTest:function(Me){Me?Pe(r.DEPTH_TEST):Te(r.DEPTH_TEST)},setMask:function(Me){ae!==Me&&!P&&(r.depthMask(Me),ae=Me)},setFunc:function(Me){if(se!==Me){switch(Me){case NeverDepth:r.depthFunc(r.NEVER);break;case AlwaysDepth:r.depthFunc(r.ALWAYS);break;case LessDepth:r.depthFunc(r.LESS);break;case LessEqualDepth:r.depthFunc(r.LEQUAL);break;case EqualDepth:r.depthFunc(r.EQUAL);break;case GreaterEqualDepth:r.depthFunc(r.GEQUAL);break;case GreaterDepth:r.depthFunc(r.GREATER);break;case NotEqualDepth:r.depthFunc(r.NOTEQUAL);break;default:r.depthFunc(r.LEQUAL)}se=Me}},setLocked:function(Me){P=Me},setClear:function(Me){be!==Me&&(r.clearDepth(Me),be=Me)},reset:function(){P=!1,ae=null,se=null,be=null}}}function l(){let P=!1,ae=null,se=null,be=null,Me=null,ke=null,He=null,Ke=null,et=null;return{setTest:function(We){P||(We?Pe(r.STENCIL_TEST):Te(r.STENCIL_TEST))},setMask:function(We){ae!==We&&!P&&(r.stencilMask(We),ae=We)},setFunc:function(We,tt,rt){(se!==We||be!==tt||Me!==rt)&&(r.stencilFunc(We,tt,rt),se=We,be=tt,Me=rt)},setOp:function(We,tt,rt){(ke!==We||He!==tt||Ke!==rt)&&(r.stencilOp(We,tt,rt),ke=We,He=tt,Ke=rt)},setLocked:function(We){P=We},setClear:function(We){et!==We&&(r.clearStencil(We),et=We)},reset:function(){P=!1,ae=null,se=null,be=null,Me=null,ke=null,He=null,Ke=null,et=null}}}const o=new a,c=new s,h=new l,f=new WeakMap,u=new WeakMap;let d={},g={},_=new WeakMap,v=[],m=null,p=!1,E=null,x=null,w=null,L=null,C=null,R=null,z=null,S=new Color(0,0,0),A=0,V=!1,X=null,ne=null,D=null,F=null,W=null;const j=r.getParameter(r.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let Y=!1,q=0;const J=r.getParameter(r.VERSION);J.indexOf("WebGL")!==-1?(q=parseFloat(/^WebGL (\d)/.exec(J)[1]),Y=q>=1):J.indexOf("OpenGL ES")!==-1&&(q=parseFloat(/^OpenGL ES (\d)/.exec(J)[1]),Y=q>=2);let ie=null,he={};const H=r.getParameter(r.SCISSOR_BOX),K=r.getParameter(r.VIEWPORT),le=new Vector4().fromArray(H),_e=new Vector4().fromArray(K);function ge(P,ae,se,be){const Me=new Uint8Array(4),ke=r.createTexture();r.bindTexture(P,ke),r.texParameteri(P,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(P,r.TEXTURE_MAG_FILTER,r.NEAREST);for(let He=0;He<se;He++)i&&(P===r.TEXTURE_3D||P===r.TEXTURE_2D_ARRAY)?r.texImage3D(ae,0,r.RGBA,1,1,be,0,r.RGBA,r.UNSIGNED_BYTE,Me):r.texImage2D(ae+He,0,r.RGBA,1,1,0,r.RGBA,r.UNSIGNED_BYTE,Me);return ke}const Re={};Re[r.TEXTURE_2D]=ge(r.TEXTURE_2D,r.TEXTURE_2D,1),Re[r.TEXTURE_CUBE_MAP]=ge(r.TEXTURE_CUBE_MAP,r.TEXTURE_CUBE_MAP_POSITIVE_X,6),i&&(Re[r.TEXTURE_2D_ARRAY]=ge(r.TEXTURE_2D_ARRAY,r.TEXTURE_2D_ARRAY,1,1),Re[r.TEXTURE_3D]=ge(r.TEXTURE_3D,r.TEXTURE_3D,1,1)),o.setClear(0,0,0,1),c.setClear(1),h.setClear(0),Pe(r.DEPTH_TEST),c.setFunc(LessEqualDepth),Ue(!1),b(CullFaceBack),Pe(r.CULL_FACE),de(NoBlending);function Pe(P){d[P]!==!0&&(r.enable(P),d[P]=!0)}function Te(P){d[P]!==!1&&(r.disable(P),d[P]=!1)}function Oe(P,ae){return g[P]!==ae?(r.bindFramebuffer(P,ae),g[P]=ae,i&&(P===r.DRAW_FRAMEBUFFER&&(g[r.FRAMEBUFFER]=ae),P===r.FRAMEBUFFER&&(g[r.DRAW_FRAMEBUFFER]=ae)),!0):!1}function I(P,ae){let se=v,be=!1;if(P)if(se=_.get(ae),se===void 0&&(se=[],_.set(ae,se)),P.isWebGLMultipleRenderTargets){const Me=P.texture;if(se.length!==Me.length||se[0]!==r.COLOR_ATTACHMENT0){for(let ke=0,He=Me.length;ke<He;ke++)se[ke]=r.COLOR_ATTACHMENT0+ke;se.length=Me.length,be=!0}}else se[0]!==r.COLOR_ATTACHMENT0&&(se[0]=r.COLOR_ATTACHMENT0,be=!0);else se[0]!==r.BACK&&(se[0]=r.BACK,be=!0);be&&(t.isWebGL2?r.drawBuffers(se):e.get("WEBGL_draw_buffers").drawBuffersWEBGL(se))}function Je(P){return m!==P?(r.useProgram(P),m=P,!0):!1}const xe={[AddEquation]:r.FUNC_ADD,[SubtractEquation]:r.FUNC_SUBTRACT,[ReverseSubtractEquation]:r.FUNC_REVERSE_SUBTRACT};if(i)xe[MinEquation]=r.MIN,xe[MaxEquation]=r.MAX;else{const P=e.get("EXT_blend_minmax");P!==null&&(xe[MinEquation]=P.MIN_EXT,xe[MaxEquation]=P.MAX_EXT)}const we={[ZeroFactor]:r.ZERO,[OneFactor]:r.ONE,[SrcColorFactor]:r.SRC_COLOR,[SrcAlphaFactor]:r.SRC_ALPHA,[SrcAlphaSaturateFactor]:r.SRC_ALPHA_SATURATE,[DstColorFactor]:r.DST_COLOR,[DstAlphaFactor]:r.DST_ALPHA,[OneMinusSrcColorFactor]:r.ONE_MINUS_SRC_COLOR,[OneMinusSrcAlphaFactor]:r.ONE_MINUS_SRC_ALPHA,[OneMinusDstColorFactor]:r.ONE_MINUS_DST_COLOR,[OneMinusDstAlphaFactor]:r.ONE_MINUS_DST_ALPHA,[ConstantColorFactor]:r.CONSTANT_COLOR,[OneMinusConstantColorFactor]:r.ONE_MINUS_CONSTANT_COLOR,[ConstantAlphaFactor]:r.CONSTANT_ALPHA,[OneMinusConstantAlphaFactor]:r.ONE_MINUS_CONSTANT_ALPHA};function de(P,ae,se,be,Me,ke,He,Ke,et,We){if(P===NoBlending){p===!0&&(Te(r.BLEND),p=!1);return}if(p===!1&&(Pe(r.BLEND),p=!0),P!==CustomBlending){if(P!==E||We!==V){if((x!==AddEquation||C!==AddEquation)&&(r.blendEquation(r.FUNC_ADD),x=AddEquation,C=AddEquation),We)switch(P){case NormalBlending:r.blendFuncSeparate(r.ONE,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case AdditiveBlending:r.blendFunc(r.ONE,r.ONE);break;case SubtractiveBlending:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case MultiplyBlending:r.blendFuncSeparate(r.ZERO,r.SRC_COLOR,r.ZERO,r.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",P);break}else switch(P){case NormalBlending:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case AdditiveBlending:r.blendFunc(r.SRC_ALPHA,r.ONE);break;case SubtractiveBlending:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case MultiplyBlending:r.blendFunc(r.ZERO,r.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",P);break}w=null,L=null,R=null,z=null,S.set(0,0,0),A=0,E=P,V=We}return}Me=Me||ae,ke=ke||se,He=He||be,(ae!==x||Me!==C)&&(r.blendEquationSeparate(xe[ae],xe[Me]),x=ae,C=Me),(se!==w||be!==L||ke!==R||He!==z)&&(r.blendFuncSeparate(we[se],we[be],we[ke],we[He]),w=se,L=be,R=ke,z=He),(Ke.equals(S)===!1||et!==A)&&(r.blendColor(Ke.r,Ke.g,Ke.b,et),S.copy(Ke),A=et),E=P,V=!1}function $e(P,ae){P.side===DoubleSide?Te(r.CULL_FACE):Pe(r.CULL_FACE);let se=P.side===BackSide;ae&&(se=!se),Ue(se),P.blending===NormalBlending&&P.transparent===!1?de(NoBlending):de(P.blending,P.blendEquation,P.blendSrc,P.blendDst,P.blendEquationAlpha,P.blendSrcAlpha,P.blendDstAlpha,P.blendColor,P.blendAlpha,P.premultipliedAlpha),c.setFunc(P.depthFunc),c.setTest(P.depthTest),c.setMask(P.depthWrite),o.setMask(P.colorWrite);const be=P.stencilWrite;h.setTest(be),be&&(h.setMask(P.stencilWriteMask),h.setFunc(P.stencilFunc,P.stencilRef,P.stencilFuncMask),h.setOp(P.stencilFail,P.stencilZFail,P.stencilZPass)),B(P.polygonOffset,P.polygonOffsetFactor,P.polygonOffsetUnits),P.alphaToCoverage===!0?Pe(r.SAMPLE_ALPHA_TO_COVERAGE):Te(r.SAMPLE_ALPHA_TO_COVERAGE)}function Ue(P){X!==P&&(P?r.frontFace(r.CW):r.frontFace(r.CCW),X=P)}function b(P){P!==CullFaceNone?(Pe(r.CULL_FACE),P!==ne&&(P===CullFaceBack?r.cullFace(r.BACK):P===CullFaceFront?r.cullFace(r.FRONT):r.cullFace(r.FRONT_AND_BACK))):Te(r.CULL_FACE),ne=P}function M(P){P!==D&&(Y&&r.lineWidth(P),D=P)}function B(P,ae,se){P?(Pe(r.POLYGON_OFFSET_FILL),(F!==ae||W!==se)&&(r.polygonOffset(ae,se),F=ae,W=se)):Te(r.POLYGON_OFFSET_FILL)}function ee(P){P?Pe(r.SCISSOR_TEST):Te(r.SCISSOR_TEST)}function Q(P){P===void 0&&(P=r.TEXTURE0+j-1),ie!==P&&(r.activeTexture(P),ie=P)}function te(P,ae,se){se===void 0&&(ie===null?se=r.TEXTURE0+j-1:se=ie);let be=he[se];be===void 0&&(be={type:void 0,texture:void 0},he[se]=be),(be.type!==P||be.texture!==ae)&&(ie!==se&&(r.activeTexture(se),ie=se),r.bindTexture(P,ae||Re[P]),be.type=P,be.texture=ae)}function pe(){const P=he[ie];P!==void 0&&P.type!==void 0&&(r.bindTexture(P.type,null),P.type=void 0,P.texture=void 0)}function oe(){try{r.compressedTexImage2D.apply(r,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function ue(){try{r.compressedTexImage3D.apply(r,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function ye(){try{r.texSubImage2D.apply(r,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function Fe(){try{r.texSubImage3D.apply(r,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function Z(){try{r.compressedTexSubImage2D.apply(r,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function ze(){try{r.compressedTexSubImage3D.apply(r,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function Be(){try{r.texStorage2D.apply(r,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function Ae(){try{r.texStorage3D.apply(r,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function ve(){try{r.texImage2D.apply(r,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function fe(){try{r.texImage3D.apply(r,arguments)}catch(P){console.error("THREE.WebGLState:",P)}}function De(P){le.equals(P)===!1&&(r.scissor(P.x,P.y,P.z,P.w),le.copy(P))}function Ve(P){_e.equals(P)===!1&&(r.viewport(P.x,P.y,P.z,P.w),_e.copy(P))}function qe(P,ae){let se=u.get(ae);se===void 0&&(se=new WeakMap,u.set(ae,se));let be=se.get(P);be===void 0&&(be=r.getUniformBlockIndex(ae,P.name),se.set(P,be))}function Ne(P,ae){const be=u.get(ae).get(P);f.get(ae)!==be&&(r.uniformBlockBinding(ae,be,P.__bindingPointIndex),f.set(ae,be))}function re(){r.disable(r.BLEND),r.disable(r.CULL_FACE),r.disable(r.DEPTH_TEST),r.disable(r.POLYGON_OFFSET_FILL),r.disable(r.SCISSOR_TEST),r.disable(r.STENCIL_TEST),r.disable(r.SAMPLE_ALPHA_TO_COVERAGE),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ZERO),r.blendFuncSeparate(r.ONE,r.ZERO,r.ONE,r.ZERO),r.blendColor(0,0,0,0),r.colorMask(!0,!0,!0,!0),r.clearColor(0,0,0,0),r.depthMask(!0),r.depthFunc(r.LESS),r.clearDepth(1),r.stencilMask(4294967295),r.stencilFunc(r.ALWAYS,0,4294967295),r.stencilOp(r.KEEP,r.KEEP,r.KEEP),r.clearStencil(0),r.cullFace(r.BACK),r.frontFace(r.CCW),r.polygonOffset(0,0),r.activeTexture(r.TEXTURE0),r.bindFramebuffer(r.FRAMEBUFFER,null),i===!0&&(r.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),r.bindFramebuffer(r.READ_FRAMEBUFFER,null)),r.useProgram(null),r.lineWidth(1),r.scissor(0,0,r.canvas.width,r.canvas.height),r.viewport(0,0,r.canvas.width,r.canvas.height),d={},ie=null,he={},g={},_=new WeakMap,v=[],m=null,p=!1,E=null,x=null,w=null,L=null,C=null,R=null,z=null,S=new Color(0,0,0),A=0,V=!1,X=null,ne=null,D=null,F=null,W=null,le.set(0,0,r.canvas.width,r.canvas.height),_e.set(0,0,r.canvas.width,r.canvas.height),o.reset(),c.reset(),h.reset()}return{buffers:{color:o,depth:c,stencil:h},enable:Pe,disable:Te,bindFramebuffer:Oe,drawBuffers:I,useProgram:Je,setBlending:de,setMaterial:$e,setFlipSided:Ue,setCullFace:b,setLineWidth:M,setPolygonOffset:B,setScissorTest:ee,activeTexture:Q,bindTexture:te,unbindTexture:pe,compressedTexImage2D:oe,compressedTexImage3D:ue,texImage2D:ve,texImage3D:fe,updateUBOMapping:qe,uniformBlockBinding:Ne,texStorage2D:Be,texStorage3D:Ae,texSubImage2D:ye,texSubImage3D:Fe,compressedTexSubImage2D:Z,compressedTexSubImage3D:ze,scissor:De,viewport:Ve,reset:re}}function WebGLTextures(r,e,t,i,a,s,l){const o=a.isWebGL2,c=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,h=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),f=new WeakMap;let u;const d=new WeakMap;let g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function _(b,M){return g?new OffscreenCanvas(b,M):createElementNS("canvas")}function v(b,M,B,ee){let Q=1;if((b.width>ee||b.height>ee)&&(Q=ee/Math.max(b.width,b.height)),Q<1||M===!0)if(typeof HTMLImageElement<"u"&&b instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&b instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&b instanceof ImageBitmap){const te=M?floorPowerOfTwo:Math.floor,pe=te(Q*b.width),oe=te(Q*b.height);u===void 0&&(u=_(pe,oe));const ue=B?_(pe,oe):u;return ue.width=pe,ue.height=oe,ue.getContext("2d").drawImage(b,0,0,pe,oe),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+b.width+"x"+b.height+") to ("+pe+"x"+oe+")."),ue}else return"data"in b&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+b.width+"x"+b.height+")."),b;return b}function m(b){return isPowerOfTwo(b.width)&&isPowerOfTwo(b.height)}function p(b){return o?!1:b.wrapS!==ClampToEdgeWrapping||b.wrapT!==ClampToEdgeWrapping||b.minFilter!==NearestFilter&&b.minFilter!==LinearFilter}function E(b,M){return b.generateMipmaps&&M&&b.minFilter!==NearestFilter&&b.minFilter!==LinearFilter}function x(b){r.generateMipmap(b)}function w(b,M,B,ee,Q=!1){if(o===!1)return M;if(b!==null){if(r[b]!==void 0)return r[b];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+b+"'")}let te=M;if(M===r.RED&&(B===r.FLOAT&&(te=r.R32F),B===r.HALF_FLOAT&&(te=r.R16F),B===r.UNSIGNED_BYTE&&(te=r.R8)),M===r.RED_INTEGER&&(B===r.UNSIGNED_BYTE&&(te=r.R8UI),B===r.UNSIGNED_SHORT&&(te=r.R16UI),B===r.UNSIGNED_INT&&(te=r.R32UI),B===r.BYTE&&(te=r.R8I),B===r.SHORT&&(te=r.R16I),B===r.INT&&(te=r.R32I)),M===r.RG&&(B===r.FLOAT&&(te=r.RG32F),B===r.HALF_FLOAT&&(te=r.RG16F),B===r.UNSIGNED_BYTE&&(te=r.RG8)),M===r.RGBA){const pe=Q?LinearTransfer:ColorManagement.getTransfer(ee);B===r.FLOAT&&(te=r.RGBA32F),B===r.HALF_FLOAT&&(te=r.RGBA16F),B===r.UNSIGNED_BYTE&&(te=pe===SRGBTransfer?r.SRGB8_ALPHA8:r.RGBA8),B===r.UNSIGNED_SHORT_4_4_4_4&&(te=r.RGBA4),B===r.UNSIGNED_SHORT_5_5_5_1&&(te=r.RGB5_A1)}return(te===r.R16F||te===r.R32F||te===r.RG16F||te===r.RG32F||te===r.RGBA16F||te===r.RGBA32F)&&e.get("EXT_color_buffer_float"),te}function L(b,M,B){return E(b,B)===!0||b.isFramebufferTexture&&b.minFilter!==NearestFilter&&b.minFilter!==LinearFilter?Math.log2(Math.max(M.width,M.height))+1:b.mipmaps!==void 0&&b.mipmaps.length>0?b.mipmaps.length:b.isCompressedTexture&&Array.isArray(b.image)?M.mipmaps.length:1}function C(b){return b===NearestFilter||b===NearestMipmapNearestFilter||b===NearestMipmapLinearFilter?r.NEAREST:r.LINEAR}function R(b){const M=b.target;M.removeEventListener("dispose",R),S(M),M.isVideoTexture&&f.delete(M)}function z(b){const M=b.target;M.removeEventListener("dispose",z),V(M)}function S(b){const M=i.get(b);if(M.__webglInit===void 0)return;const B=b.source,ee=d.get(B);if(ee){const Q=ee[M.__cacheKey];Q.usedTimes--,Q.usedTimes===0&&A(b),Object.keys(ee).length===0&&d.delete(B)}i.remove(b)}function A(b){const M=i.get(b);r.deleteTexture(M.__webglTexture);const B=b.source,ee=d.get(B);delete ee[M.__cacheKey],l.memory.textures--}function V(b){const M=b.texture,B=i.get(b),ee=i.get(M);if(ee.__webglTexture!==void 0&&(r.deleteTexture(ee.__webglTexture),l.memory.textures--),b.depthTexture&&b.depthTexture.dispose(),b.isWebGLCubeRenderTarget)for(let Q=0;Q<6;Q++){if(Array.isArray(B.__webglFramebuffer[Q]))for(let te=0;te<B.__webglFramebuffer[Q].length;te++)r.deleteFramebuffer(B.__webglFramebuffer[Q][te]);else r.deleteFramebuffer(B.__webglFramebuffer[Q]);B.__webglDepthbuffer&&r.deleteRenderbuffer(B.__webglDepthbuffer[Q])}else{if(Array.isArray(B.__webglFramebuffer))for(let Q=0;Q<B.__webglFramebuffer.length;Q++)r.deleteFramebuffer(B.__webglFramebuffer[Q]);else r.deleteFramebuffer(B.__webglFramebuffer);if(B.__webglDepthbuffer&&r.deleteRenderbuffer(B.__webglDepthbuffer),B.__webglMultisampledFramebuffer&&r.deleteFramebuffer(B.__webglMultisampledFramebuffer),B.__webglColorRenderbuffer)for(let Q=0;Q<B.__webglColorRenderbuffer.length;Q++)B.__webglColorRenderbuffer[Q]&&r.deleteRenderbuffer(B.__webglColorRenderbuffer[Q]);B.__webglDepthRenderbuffer&&r.deleteRenderbuffer(B.__webglDepthRenderbuffer)}if(b.isWebGLMultipleRenderTargets)for(let Q=0,te=M.length;Q<te;Q++){const pe=i.get(M[Q]);pe.__webglTexture&&(r.deleteTexture(pe.__webglTexture),l.memory.textures--),i.remove(M[Q])}i.remove(M),i.remove(b)}let X=0;function ne(){X=0}function D(){const b=X;return b>=a.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+b+" texture units while this GPU supports only "+a.maxTextures),X+=1,b}function F(b){const M=[];return M.push(b.wrapS),M.push(b.wrapT),M.push(b.wrapR||0),M.push(b.magFilter),M.push(b.minFilter),M.push(b.anisotropy),M.push(b.internalFormat),M.push(b.format),M.push(b.type),M.push(b.generateMipmaps),M.push(b.premultiplyAlpha),M.push(b.flipY),M.push(b.unpackAlignment),M.push(b.colorSpace),M.join()}function W(b,M){const B=i.get(b);if(b.isVideoTexture&&$e(b),b.isRenderTargetTexture===!1&&b.version>0&&B.__version!==b.version){const ee=b.image;if(ee===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(ee.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{le(B,b,M);return}}t.bindTexture(r.TEXTURE_2D,B.__webglTexture,r.TEXTURE0+M)}function j(b,M){const B=i.get(b);if(b.version>0&&B.__version!==b.version){le(B,b,M);return}t.bindTexture(r.TEXTURE_2D_ARRAY,B.__webglTexture,r.TEXTURE0+M)}function Y(b,M){const B=i.get(b);if(b.version>0&&B.__version!==b.version){le(B,b,M);return}t.bindTexture(r.TEXTURE_3D,B.__webglTexture,r.TEXTURE0+M)}function q(b,M){const B=i.get(b);if(b.version>0&&B.__version!==b.version){_e(B,b,M);return}t.bindTexture(r.TEXTURE_CUBE_MAP,B.__webglTexture,r.TEXTURE0+M)}const J={[RepeatWrapping]:r.REPEAT,[ClampToEdgeWrapping]:r.CLAMP_TO_EDGE,[MirroredRepeatWrapping]:r.MIRRORED_REPEAT},ie={[NearestFilter]:r.NEAREST,[NearestMipmapNearestFilter]:r.NEAREST_MIPMAP_NEAREST,[NearestMipmapLinearFilter]:r.NEAREST_MIPMAP_LINEAR,[LinearFilter]:r.LINEAR,[LinearMipmapNearestFilter]:r.LINEAR_MIPMAP_NEAREST,[LinearMipmapLinearFilter]:r.LINEAR_MIPMAP_LINEAR},he={[NeverCompare]:r.NEVER,[AlwaysCompare]:r.ALWAYS,[LessCompare]:r.LESS,[LessEqualCompare]:r.LEQUAL,[EqualCompare]:r.EQUAL,[GreaterEqualCompare]:r.GEQUAL,[GreaterCompare]:r.GREATER,[NotEqualCompare]:r.NOTEQUAL};function H(b,M,B){if(B?(r.texParameteri(b,r.TEXTURE_WRAP_S,J[M.wrapS]),r.texParameteri(b,r.TEXTURE_WRAP_T,J[M.wrapT]),(b===r.TEXTURE_3D||b===r.TEXTURE_2D_ARRAY)&&r.texParameteri(b,r.TEXTURE_WRAP_R,J[M.wrapR]),r.texParameteri(b,r.TEXTURE_MAG_FILTER,ie[M.magFilter]),r.texParameteri(b,r.TEXTURE_MIN_FILTER,ie[M.minFilter])):(r.texParameteri(b,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(b,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE),(b===r.TEXTURE_3D||b===r.TEXTURE_2D_ARRAY)&&r.texParameteri(b,r.TEXTURE_WRAP_R,r.CLAMP_TO_EDGE),(M.wrapS!==ClampToEdgeWrapping||M.wrapT!==ClampToEdgeWrapping)&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),r.texParameteri(b,r.TEXTURE_MAG_FILTER,C(M.magFilter)),r.texParameteri(b,r.TEXTURE_MIN_FILTER,C(M.minFilter)),M.minFilter!==NearestFilter&&M.minFilter!==LinearFilter&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),M.compareFunction&&(r.texParameteri(b,r.TEXTURE_COMPARE_MODE,r.COMPARE_REF_TO_TEXTURE),r.texParameteri(b,r.TEXTURE_COMPARE_FUNC,he[M.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){const ee=e.get("EXT_texture_filter_anisotropic");if(M.magFilter===NearestFilter||M.minFilter!==NearestMipmapLinearFilter&&M.minFilter!==LinearMipmapLinearFilter||M.type===FloatType&&e.has("OES_texture_float_linear")===!1||o===!1&&M.type===HalfFloatType&&e.has("OES_texture_half_float_linear")===!1)return;(M.anisotropy>1||i.get(M).__currentAnisotropy)&&(r.texParameterf(b,ee.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(M.anisotropy,a.getMaxAnisotropy())),i.get(M).__currentAnisotropy=M.anisotropy)}}function K(b,M){let B=!1;b.__webglInit===void 0&&(b.__webglInit=!0,M.addEventListener("dispose",R));const ee=M.source;let Q=d.get(ee);Q===void 0&&(Q={},d.set(ee,Q));const te=F(M);if(te!==b.__cacheKey){Q[te]===void 0&&(Q[te]={texture:r.createTexture(),usedTimes:0},l.memory.textures++,B=!0),Q[te].usedTimes++;const pe=Q[b.__cacheKey];pe!==void 0&&(Q[b.__cacheKey].usedTimes--,pe.usedTimes===0&&A(M)),b.__cacheKey=te,b.__webglTexture=Q[te].texture}return B}function le(b,M,B){let ee=r.TEXTURE_2D;(M.isDataArrayTexture||M.isCompressedArrayTexture)&&(ee=r.TEXTURE_2D_ARRAY),M.isData3DTexture&&(ee=r.TEXTURE_3D);const Q=K(b,M),te=M.source;t.bindTexture(ee,b.__webglTexture,r.TEXTURE0+B);const pe=i.get(te);if(te.version!==pe.__version||Q===!0){t.activeTexture(r.TEXTURE0+B);const oe=ColorManagement.getPrimaries(ColorManagement.workingColorSpace),ue=M.colorSpace===NoColorSpace?null:ColorManagement.getPrimaries(M.colorSpace),ye=M.colorSpace===NoColorSpace||oe===ue?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,M.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,M.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,ye);const Fe=p(M)&&m(M.image)===!1;let Z=v(M.image,Fe,!1,a.maxTextureSize);Z=Ue(M,Z);const ze=m(Z)||o,Be=s.convert(M.format,M.colorSpace);let Ae=s.convert(M.type),ve=w(M.internalFormat,Be,Ae,M.colorSpace,M.isVideoTexture);H(ee,M,ze);let fe;const De=M.mipmaps,Ve=o&&M.isVideoTexture!==!0&&ve!==RGB_ETC1_Format,qe=pe.__version===void 0||Q===!0,Ne=L(M,Z,ze);if(M.isDepthTexture)ve=r.DEPTH_COMPONENT,o?M.type===FloatType?ve=r.DEPTH_COMPONENT32F:M.type===UnsignedIntType?ve=r.DEPTH_COMPONENT24:M.type===UnsignedInt248Type?ve=r.DEPTH24_STENCIL8:ve=r.DEPTH_COMPONENT16:M.type===FloatType&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),M.format===DepthFormat&&ve===r.DEPTH_COMPONENT&&M.type!==UnsignedShortType&&M.type!==UnsignedIntType&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),M.type=UnsignedIntType,Ae=s.convert(M.type)),M.format===DepthStencilFormat&&ve===r.DEPTH_COMPONENT&&(ve=r.DEPTH_STENCIL,M.type!==UnsignedInt248Type&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),M.type=UnsignedInt248Type,Ae=s.convert(M.type))),qe&&(Ve?t.texStorage2D(r.TEXTURE_2D,1,ve,Z.width,Z.height):t.texImage2D(r.TEXTURE_2D,0,ve,Z.width,Z.height,0,Be,Ae,null));else if(M.isDataTexture)if(De.length>0&&ze){Ve&&qe&&t.texStorage2D(r.TEXTURE_2D,Ne,ve,De[0].width,De[0].height);for(let re=0,P=De.length;re<P;re++)fe=De[re],Ve?t.texSubImage2D(r.TEXTURE_2D,re,0,0,fe.width,fe.height,Be,Ae,fe.data):t.texImage2D(r.TEXTURE_2D,re,ve,fe.width,fe.height,0,Be,Ae,fe.data);M.generateMipmaps=!1}else Ve?(qe&&t.texStorage2D(r.TEXTURE_2D,Ne,ve,Z.width,Z.height),t.texSubImage2D(r.TEXTURE_2D,0,0,0,Z.width,Z.height,Be,Ae,Z.data)):t.texImage2D(r.TEXTURE_2D,0,ve,Z.width,Z.height,0,Be,Ae,Z.data);else if(M.isCompressedTexture)if(M.isCompressedArrayTexture){Ve&&qe&&t.texStorage3D(r.TEXTURE_2D_ARRAY,Ne,ve,De[0].width,De[0].height,Z.depth);for(let re=0,P=De.length;re<P;re++)fe=De[re],M.format!==RGBAFormat?Be!==null?Ve?t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,re,0,0,0,fe.width,fe.height,Z.depth,Be,fe.data,0,0):t.compressedTexImage3D(r.TEXTURE_2D_ARRAY,re,ve,fe.width,fe.height,Z.depth,0,fe.data,0,0):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ve?t.texSubImage3D(r.TEXTURE_2D_ARRAY,re,0,0,0,fe.width,fe.height,Z.depth,Be,Ae,fe.data):t.texImage3D(r.TEXTURE_2D_ARRAY,re,ve,fe.width,fe.height,Z.depth,0,Be,Ae,fe.data)}else{Ve&&qe&&t.texStorage2D(r.TEXTURE_2D,Ne,ve,De[0].width,De[0].height);for(let re=0,P=De.length;re<P;re++)fe=De[re],M.format!==RGBAFormat?Be!==null?Ve?t.compressedTexSubImage2D(r.TEXTURE_2D,re,0,0,fe.width,fe.height,Be,fe.data):t.compressedTexImage2D(r.TEXTURE_2D,re,ve,fe.width,fe.height,0,fe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ve?t.texSubImage2D(r.TEXTURE_2D,re,0,0,fe.width,fe.height,Be,Ae,fe.data):t.texImage2D(r.TEXTURE_2D,re,ve,fe.width,fe.height,0,Be,Ae,fe.data)}else if(M.isDataArrayTexture)Ve?(qe&&t.texStorage3D(r.TEXTURE_2D_ARRAY,Ne,ve,Z.width,Z.height,Z.depth),t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,0,Z.width,Z.height,Z.depth,Be,Ae,Z.data)):t.texImage3D(r.TEXTURE_2D_ARRAY,0,ve,Z.width,Z.height,Z.depth,0,Be,Ae,Z.data);else if(M.isData3DTexture)Ve?(qe&&t.texStorage3D(r.TEXTURE_3D,Ne,ve,Z.width,Z.height,Z.depth),t.texSubImage3D(r.TEXTURE_3D,0,0,0,0,Z.width,Z.height,Z.depth,Be,Ae,Z.data)):t.texImage3D(r.TEXTURE_3D,0,ve,Z.width,Z.height,Z.depth,0,Be,Ae,Z.data);else if(M.isFramebufferTexture){if(qe)if(Ve)t.texStorage2D(r.TEXTURE_2D,Ne,ve,Z.width,Z.height);else{let re=Z.width,P=Z.height;for(let ae=0;ae<Ne;ae++)t.texImage2D(r.TEXTURE_2D,ae,ve,re,P,0,Be,Ae,null),re>>=1,P>>=1}}else if(De.length>0&&ze){Ve&&qe&&t.texStorage2D(r.TEXTURE_2D,Ne,ve,De[0].width,De[0].height);for(let re=0,P=De.length;re<P;re++)fe=De[re],Ve?t.texSubImage2D(r.TEXTURE_2D,re,0,0,Be,Ae,fe):t.texImage2D(r.TEXTURE_2D,re,ve,Be,Ae,fe);M.generateMipmaps=!1}else Ve?(qe&&t.texStorage2D(r.TEXTURE_2D,Ne,ve,Z.width,Z.height),t.texSubImage2D(r.TEXTURE_2D,0,0,0,Be,Ae,Z)):t.texImage2D(r.TEXTURE_2D,0,ve,Be,Ae,Z);E(M,ze)&&x(ee),pe.__version=te.version,M.onUpdate&&M.onUpdate(M)}b.__version=M.version}function _e(b,M,B){if(M.image.length!==6)return;const ee=K(b,M),Q=M.source;t.bindTexture(r.TEXTURE_CUBE_MAP,b.__webglTexture,r.TEXTURE0+B);const te=i.get(Q);if(Q.version!==te.__version||ee===!0){t.activeTexture(r.TEXTURE0+B);const pe=ColorManagement.getPrimaries(ColorManagement.workingColorSpace),oe=M.colorSpace===NoColorSpace?null:ColorManagement.getPrimaries(M.colorSpace),ue=M.colorSpace===NoColorSpace||pe===oe?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,M.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,M.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,ue);const ye=M.isCompressedTexture||M.image[0].isCompressedTexture,Fe=M.image[0]&&M.image[0].isDataTexture,Z=[];for(let re=0;re<6;re++)!ye&&!Fe?Z[re]=v(M.image[re],!1,!0,a.maxCubemapSize):Z[re]=Fe?M.image[re].image:M.image[re],Z[re]=Ue(M,Z[re]);const ze=Z[0],Be=m(ze)||o,Ae=s.convert(M.format,M.colorSpace),ve=s.convert(M.type),fe=w(M.internalFormat,Ae,ve,M.colorSpace),De=o&&M.isVideoTexture!==!0,Ve=te.__version===void 0||ee===!0;let qe=L(M,ze,Be);H(r.TEXTURE_CUBE_MAP,M,Be);let Ne;if(ye){De&&Ve&&t.texStorage2D(r.TEXTURE_CUBE_MAP,qe,fe,ze.width,ze.height);for(let re=0;re<6;re++){Ne=Z[re].mipmaps;for(let P=0;P<Ne.length;P++){const ae=Ne[P];M.format!==RGBAFormat?Ae!==null?De?t.compressedTexSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+re,P,0,0,ae.width,ae.height,Ae,ae.data):t.compressedTexImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+re,P,fe,ae.width,ae.height,0,ae.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):De?t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+re,P,0,0,ae.width,ae.height,Ae,ve,ae.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+re,P,fe,ae.width,ae.height,0,Ae,ve,ae.data)}}}else{Ne=M.mipmaps,De&&Ve&&(Ne.length>0&&qe++,t.texStorage2D(r.TEXTURE_CUBE_MAP,qe,fe,Z[0].width,Z[0].height));for(let re=0;re<6;re++)if(Fe){De?t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+re,0,0,0,Z[re].width,Z[re].height,Ae,ve,Z[re].data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+re,0,fe,Z[re].width,Z[re].height,0,Ae,ve,Z[re].data);for(let P=0;P<Ne.length;P++){const se=Ne[P].image[re].image;De?t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+re,P+1,0,0,se.width,se.height,Ae,ve,se.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+re,P+1,fe,se.width,se.height,0,Ae,ve,se.data)}}else{De?t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+re,0,0,0,Ae,ve,Z[re]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+re,0,fe,Ae,ve,Z[re]);for(let P=0;P<Ne.length;P++){const ae=Ne[P];De?t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+re,P+1,0,0,Ae,ve,ae.image[re]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+re,P+1,fe,Ae,ve,ae.image[re])}}}E(M,Be)&&x(r.TEXTURE_CUBE_MAP),te.__version=Q.version,M.onUpdate&&M.onUpdate(M)}b.__version=M.version}function ge(b,M,B,ee,Q,te){const pe=s.convert(B.format,B.colorSpace),oe=s.convert(B.type),ue=w(B.internalFormat,pe,oe,B.colorSpace);if(!i.get(M).__hasExternalTextures){const Fe=Math.max(1,M.width>>te),Z=Math.max(1,M.height>>te);Q===r.TEXTURE_3D||Q===r.TEXTURE_2D_ARRAY?t.texImage3D(Q,te,ue,Fe,Z,M.depth,0,pe,oe,null):t.texImage2D(Q,te,ue,Fe,Z,0,pe,oe,null)}t.bindFramebuffer(r.FRAMEBUFFER,b),de(M)?c.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,ee,Q,i.get(B).__webglTexture,0,we(M)):(Q===r.TEXTURE_2D||Q>=r.TEXTURE_CUBE_MAP_POSITIVE_X&&Q<=r.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&r.framebufferTexture2D(r.FRAMEBUFFER,ee,Q,i.get(B).__webglTexture,te),t.bindFramebuffer(r.FRAMEBUFFER,null)}function Re(b,M,B){if(r.bindRenderbuffer(r.RENDERBUFFER,b),M.depthBuffer&&!M.stencilBuffer){let ee=o===!0?r.DEPTH_COMPONENT24:r.DEPTH_COMPONENT16;if(B||de(M)){const Q=M.depthTexture;Q&&Q.isDepthTexture&&(Q.type===FloatType?ee=r.DEPTH_COMPONENT32F:Q.type===UnsignedIntType&&(ee=r.DEPTH_COMPONENT24));const te=we(M);de(M)?c.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,te,ee,M.width,M.height):r.renderbufferStorageMultisample(r.RENDERBUFFER,te,ee,M.width,M.height)}else r.renderbufferStorage(r.RENDERBUFFER,ee,M.width,M.height);r.framebufferRenderbuffer(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.RENDERBUFFER,b)}else if(M.depthBuffer&&M.stencilBuffer){const ee=we(M);B&&de(M)===!1?r.renderbufferStorageMultisample(r.RENDERBUFFER,ee,r.DEPTH24_STENCIL8,M.width,M.height):de(M)?c.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,ee,r.DEPTH24_STENCIL8,M.width,M.height):r.renderbufferStorage(r.RENDERBUFFER,r.DEPTH_STENCIL,M.width,M.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.RENDERBUFFER,b)}else{const ee=M.isWebGLMultipleRenderTargets===!0?M.texture:[M.texture];for(let Q=0;Q<ee.length;Q++){const te=ee[Q],pe=s.convert(te.format,te.colorSpace),oe=s.convert(te.type),ue=w(te.internalFormat,pe,oe,te.colorSpace),ye=we(M);B&&de(M)===!1?r.renderbufferStorageMultisample(r.RENDERBUFFER,ye,ue,M.width,M.height):de(M)?c.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,ye,ue,M.width,M.height):r.renderbufferStorage(r.RENDERBUFFER,ue,M.width,M.height)}}r.bindRenderbuffer(r.RENDERBUFFER,null)}function Pe(b,M){if(M&&M.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(r.FRAMEBUFFER,b),!(M.depthTexture&&M.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!i.get(M.depthTexture).__webglTexture||M.depthTexture.image.width!==M.width||M.depthTexture.image.height!==M.height)&&(M.depthTexture.image.width=M.width,M.depthTexture.image.height=M.height,M.depthTexture.needsUpdate=!0),W(M.depthTexture,0);const ee=i.get(M.depthTexture).__webglTexture,Q=we(M);if(M.depthTexture.format===DepthFormat)de(M)?c.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,ee,0,Q):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,ee,0);else if(M.depthTexture.format===DepthStencilFormat)de(M)?c.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,ee,0,Q):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,ee,0);else throw new Error("Unknown depthTexture format")}function Te(b){const M=i.get(b),B=b.isWebGLCubeRenderTarget===!0;if(b.depthTexture&&!M.__autoAllocateDepthBuffer){if(B)throw new Error("target.depthTexture not supported in Cube render targets");Pe(M.__webglFramebuffer,b)}else if(B){M.__webglDepthbuffer=[];for(let ee=0;ee<6;ee++)t.bindFramebuffer(r.FRAMEBUFFER,M.__webglFramebuffer[ee]),M.__webglDepthbuffer[ee]=r.createRenderbuffer(),Re(M.__webglDepthbuffer[ee],b,!1)}else t.bindFramebuffer(r.FRAMEBUFFER,M.__webglFramebuffer),M.__webglDepthbuffer=r.createRenderbuffer(),Re(M.__webglDepthbuffer,b,!1);t.bindFramebuffer(r.FRAMEBUFFER,null)}function Oe(b,M,B){const ee=i.get(b);M!==void 0&&ge(ee.__webglFramebuffer,b,b.texture,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,0),B!==void 0&&Te(b)}function I(b){const M=b.texture,B=i.get(b),ee=i.get(M);b.addEventListener("dispose",z),b.isWebGLMultipleRenderTargets!==!0&&(ee.__webglTexture===void 0&&(ee.__webglTexture=r.createTexture()),ee.__version=M.version,l.memory.textures++);const Q=b.isWebGLCubeRenderTarget===!0,te=b.isWebGLMultipleRenderTargets===!0,pe=m(b)||o;if(Q){B.__webglFramebuffer=[];for(let oe=0;oe<6;oe++)if(o&&M.mipmaps&&M.mipmaps.length>0){B.__webglFramebuffer[oe]=[];for(let ue=0;ue<M.mipmaps.length;ue++)B.__webglFramebuffer[oe][ue]=r.createFramebuffer()}else B.__webglFramebuffer[oe]=r.createFramebuffer()}else{if(o&&M.mipmaps&&M.mipmaps.length>0){B.__webglFramebuffer=[];for(let oe=0;oe<M.mipmaps.length;oe++)B.__webglFramebuffer[oe]=r.createFramebuffer()}else B.__webglFramebuffer=r.createFramebuffer();if(te)if(a.drawBuffers){const oe=b.texture;for(let ue=0,ye=oe.length;ue<ye;ue++){const Fe=i.get(oe[ue]);Fe.__webglTexture===void 0&&(Fe.__webglTexture=r.createTexture(),l.memory.textures++)}}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");if(o&&b.samples>0&&de(b)===!1){const oe=te?M:[M];B.__webglMultisampledFramebuffer=r.createFramebuffer(),B.__webglColorRenderbuffer=[],t.bindFramebuffer(r.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let ue=0;ue<oe.length;ue++){const ye=oe[ue];B.__webglColorRenderbuffer[ue]=r.createRenderbuffer(),r.bindRenderbuffer(r.RENDERBUFFER,B.__webglColorRenderbuffer[ue]);const Fe=s.convert(ye.format,ye.colorSpace),Z=s.convert(ye.type),ze=w(ye.internalFormat,Fe,Z,ye.colorSpace,b.isXRRenderTarget===!0),Be=we(b);r.renderbufferStorageMultisample(r.RENDERBUFFER,Be,ze,b.width,b.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+ue,r.RENDERBUFFER,B.__webglColorRenderbuffer[ue])}r.bindRenderbuffer(r.RENDERBUFFER,null),b.depthBuffer&&(B.__webglDepthRenderbuffer=r.createRenderbuffer(),Re(B.__webglDepthRenderbuffer,b,!0)),t.bindFramebuffer(r.FRAMEBUFFER,null)}}if(Q){t.bindTexture(r.TEXTURE_CUBE_MAP,ee.__webglTexture),H(r.TEXTURE_CUBE_MAP,M,pe);for(let oe=0;oe<6;oe++)if(o&&M.mipmaps&&M.mipmaps.length>0)for(let ue=0;ue<M.mipmaps.length;ue++)ge(B.__webglFramebuffer[oe][ue],b,M,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+oe,ue);else ge(B.__webglFramebuffer[oe],b,M,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+oe,0);E(M,pe)&&x(r.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(te){const oe=b.texture;for(let ue=0,ye=oe.length;ue<ye;ue++){const Fe=oe[ue],Z=i.get(Fe);t.bindTexture(r.TEXTURE_2D,Z.__webglTexture),H(r.TEXTURE_2D,Fe,pe),ge(B.__webglFramebuffer,b,Fe,r.COLOR_ATTACHMENT0+ue,r.TEXTURE_2D,0),E(Fe,pe)&&x(r.TEXTURE_2D)}t.unbindTexture()}else{let oe=r.TEXTURE_2D;if((b.isWebGL3DRenderTarget||b.isWebGLArrayRenderTarget)&&(o?oe=b.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY:console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")),t.bindTexture(oe,ee.__webglTexture),H(oe,M,pe),o&&M.mipmaps&&M.mipmaps.length>0)for(let ue=0;ue<M.mipmaps.length;ue++)ge(B.__webglFramebuffer[ue],b,M,r.COLOR_ATTACHMENT0,oe,ue);else ge(B.__webglFramebuffer,b,M,r.COLOR_ATTACHMENT0,oe,0);E(M,pe)&&x(oe),t.unbindTexture()}b.depthBuffer&&Te(b)}function Je(b){const M=m(b)||o,B=b.isWebGLMultipleRenderTargets===!0?b.texture:[b.texture];for(let ee=0,Q=B.length;ee<Q;ee++){const te=B[ee];if(E(te,M)){const pe=b.isWebGLCubeRenderTarget?r.TEXTURE_CUBE_MAP:r.TEXTURE_2D,oe=i.get(te).__webglTexture;t.bindTexture(pe,oe),x(pe),t.unbindTexture()}}}function xe(b){if(o&&b.samples>0&&de(b)===!1){const M=b.isWebGLMultipleRenderTargets?b.texture:[b.texture],B=b.width,ee=b.height;let Q=r.COLOR_BUFFER_BIT;const te=[],pe=b.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,oe=i.get(b),ue=b.isWebGLMultipleRenderTargets===!0;if(ue)for(let ye=0;ye<M.length;ye++)t.bindFramebuffer(r.FRAMEBUFFER,oe.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+ye,r.RENDERBUFFER,null),t.bindFramebuffer(r.FRAMEBUFFER,oe.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+ye,r.TEXTURE_2D,null,0);t.bindFramebuffer(r.READ_FRAMEBUFFER,oe.__webglMultisampledFramebuffer),t.bindFramebuffer(r.DRAW_FRAMEBUFFER,oe.__webglFramebuffer);for(let ye=0;ye<M.length;ye++){te.push(r.COLOR_ATTACHMENT0+ye),b.depthBuffer&&te.push(pe);const Fe=oe.__ignoreDepthValues!==void 0?oe.__ignoreDepthValues:!1;if(Fe===!1&&(b.depthBuffer&&(Q|=r.DEPTH_BUFFER_BIT),b.stencilBuffer&&(Q|=r.STENCIL_BUFFER_BIT)),ue&&r.framebufferRenderbuffer(r.READ_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.RENDERBUFFER,oe.__webglColorRenderbuffer[ye]),Fe===!0&&(r.invalidateFramebuffer(r.READ_FRAMEBUFFER,[pe]),r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,[pe])),ue){const Z=i.get(M[ye]).__webglTexture;r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,Z,0)}r.blitFramebuffer(0,0,B,ee,0,0,B,ee,Q,r.NEAREST),h&&r.invalidateFramebuffer(r.READ_FRAMEBUFFER,te)}if(t.bindFramebuffer(r.READ_FRAMEBUFFER,null),t.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),ue)for(let ye=0;ye<M.length;ye++){t.bindFramebuffer(r.FRAMEBUFFER,oe.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+ye,r.RENDERBUFFER,oe.__webglColorRenderbuffer[ye]);const Fe=i.get(M[ye]).__webglTexture;t.bindFramebuffer(r.FRAMEBUFFER,oe.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+ye,r.TEXTURE_2D,Fe,0)}t.bindFramebuffer(r.DRAW_FRAMEBUFFER,oe.__webglMultisampledFramebuffer)}}function we(b){return Math.min(a.maxSamples,b.samples)}function de(b){const M=i.get(b);return o&&b.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&M.__useRenderToTexture!==!1}function $e(b){const M=l.render.frame;f.get(b)!==M&&(f.set(b,M),b.update())}function Ue(b,M){const B=b.colorSpace,ee=b.format,Q=b.type;return b.isCompressedTexture===!0||b.isVideoTexture===!0||b.format===_SRGBAFormat||B!==LinearSRGBColorSpace&&B!==NoColorSpace&&(ColorManagement.getTransfer(B)===SRGBTransfer?o===!1?e.has("EXT_sRGB")===!0&&ee===RGBAFormat?(b.format=_SRGBAFormat,b.minFilter=LinearFilter,b.generateMipmaps=!1):M=ImageUtils.sRGBToLinear(M):(ee!==RGBAFormat||Q!==UnsignedByteType)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",B)),M}this.allocateTextureUnit=D,this.resetTextureUnits=ne,this.setTexture2D=W,this.setTexture2DArray=j,this.setTexture3D=Y,this.setTextureCube=q,this.rebindTextures=Oe,this.setupRenderTarget=I,this.updateRenderTargetMipmap=Je,this.updateMultisampleRenderTarget=xe,this.setupDepthRenderbuffer=Te,this.setupFrameBufferTexture=ge,this.useMultisampledRTT=de}function WebGLUtils(r,e,t){const i=t.isWebGL2;function a(s,l=NoColorSpace){let o;const c=ColorManagement.getTransfer(l);if(s===UnsignedByteType)return r.UNSIGNED_BYTE;if(s===UnsignedShort4444Type)return r.UNSIGNED_SHORT_4_4_4_4;if(s===UnsignedShort5551Type)return r.UNSIGNED_SHORT_5_5_5_1;if(s===ByteType)return r.BYTE;if(s===ShortType)return r.SHORT;if(s===UnsignedShortType)return r.UNSIGNED_SHORT;if(s===IntType)return r.INT;if(s===UnsignedIntType)return r.UNSIGNED_INT;if(s===FloatType)return r.FLOAT;if(s===HalfFloatType)return i?r.HALF_FLOAT:(o=e.get("OES_texture_half_float"),o!==null?o.HALF_FLOAT_OES:null);if(s===AlphaFormat)return r.ALPHA;if(s===RGBAFormat)return r.RGBA;if(s===LuminanceFormat)return r.LUMINANCE;if(s===LuminanceAlphaFormat)return r.LUMINANCE_ALPHA;if(s===DepthFormat)return r.DEPTH_COMPONENT;if(s===DepthStencilFormat)return r.DEPTH_STENCIL;if(s===_SRGBAFormat)return o=e.get("EXT_sRGB"),o!==null?o.SRGB_ALPHA_EXT:null;if(s===RedFormat)return r.RED;if(s===RedIntegerFormat)return r.RED_INTEGER;if(s===RGFormat)return r.RG;if(s===RGIntegerFormat)return r.RG_INTEGER;if(s===RGBAIntegerFormat)return r.RGBA_INTEGER;if(s===RGB_S3TC_DXT1_Format||s===RGBA_S3TC_DXT1_Format||s===RGBA_S3TC_DXT3_Format||s===RGBA_S3TC_DXT5_Format)if(c===SRGBTransfer)if(o=e.get("WEBGL_compressed_texture_s3tc_srgb"),o!==null){if(s===RGB_S3TC_DXT1_Format)return o.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(s===RGBA_S3TC_DXT1_Format)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(s===RGBA_S3TC_DXT3_Format)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(s===RGBA_S3TC_DXT5_Format)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(o=e.get("WEBGL_compressed_texture_s3tc"),o!==null){if(s===RGB_S3TC_DXT1_Format)return o.COMPRESSED_RGB_S3TC_DXT1_EXT;if(s===RGBA_S3TC_DXT1_Format)return o.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(s===RGBA_S3TC_DXT3_Format)return o.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(s===RGBA_S3TC_DXT5_Format)return o.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(s===RGB_PVRTC_4BPPV1_Format||s===RGB_PVRTC_2BPPV1_Format||s===RGBA_PVRTC_4BPPV1_Format||s===RGBA_PVRTC_2BPPV1_Format)if(o=e.get("WEBGL_compressed_texture_pvrtc"),o!==null){if(s===RGB_PVRTC_4BPPV1_Format)return o.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(s===RGB_PVRTC_2BPPV1_Format)return o.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(s===RGBA_PVRTC_4BPPV1_Format)return o.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(s===RGBA_PVRTC_2BPPV1_Format)return o.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(s===RGB_ETC1_Format)return o=e.get("WEBGL_compressed_texture_etc1"),o!==null?o.COMPRESSED_RGB_ETC1_WEBGL:null;if(s===RGB_ETC2_Format||s===RGBA_ETC2_EAC_Format)if(o=e.get("WEBGL_compressed_texture_etc"),o!==null){if(s===RGB_ETC2_Format)return c===SRGBTransfer?o.COMPRESSED_SRGB8_ETC2:o.COMPRESSED_RGB8_ETC2;if(s===RGBA_ETC2_EAC_Format)return c===SRGBTransfer?o.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:o.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(s===RGBA_ASTC_4x4_Format||s===RGBA_ASTC_5x4_Format||s===RGBA_ASTC_5x5_Format||s===RGBA_ASTC_6x5_Format||s===RGBA_ASTC_6x6_Format||s===RGBA_ASTC_8x5_Format||s===RGBA_ASTC_8x6_Format||s===RGBA_ASTC_8x8_Format||s===RGBA_ASTC_10x5_Format||s===RGBA_ASTC_10x6_Format||s===RGBA_ASTC_10x8_Format||s===RGBA_ASTC_10x10_Format||s===RGBA_ASTC_12x10_Format||s===RGBA_ASTC_12x12_Format)if(o=e.get("WEBGL_compressed_texture_astc"),o!==null){if(s===RGBA_ASTC_4x4_Format)return c===SRGBTransfer?o.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:o.COMPRESSED_RGBA_ASTC_4x4_KHR;if(s===RGBA_ASTC_5x4_Format)return c===SRGBTransfer?o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:o.COMPRESSED_RGBA_ASTC_5x4_KHR;if(s===RGBA_ASTC_5x5_Format)return c===SRGBTransfer?o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:o.COMPRESSED_RGBA_ASTC_5x5_KHR;if(s===RGBA_ASTC_6x5_Format)return c===SRGBTransfer?o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:o.COMPRESSED_RGBA_ASTC_6x5_KHR;if(s===RGBA_ASTC_6x6_Format)return c===SRGBTransfer?o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:o.COMPRESSED_RGBA_ASTC_6x6_KHR;if(s===RGBA_ASTC_8x5_Format)return c===SRGBTransfer?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:o.COMPRESSED_RGBA_ASTC_8x5_KHR;if(s===RGBA_ASTC_8x6_Format)return c===SRGBTransfer?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:o.COMPRESSED_RGBA_ASTC_8x6_KHR;if(s===RGBA_ASTC_8x8_Format)return c===SRGBTransfer?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:o.COMPRESSED_RGBA_ASTC_8x8_KHR;if(s===RGBA_ASTC_10x5_Format)return c===SRGBTransfer?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:o.COMPRESSED_RGBA_ASTC_10x5_KHR;if(s===RGBA_ASTC_10x6_Format)return c===SRGBTransfer?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:o.COMPRESSED_RGBA_ASTC_10x6_KHR;if(s===RGBA_ASTC_10x8_Format)return c===SRGBTransfer?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:o.COMPRESSED_RGBA_ASTC_10x8_KHR;if(s===RGBA_ASTC_10x10_Format)return c===SRGBTransfer?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:o.COMPRESSED_RGBA_ASTC_10x10_KHR;if(s===RGBA_ASTC_12x10_Format)return c===SRGBTransfer?o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:o.COMPRESSED_RGBA_ASTC_12x10_KHR;if(s===RGBA_ASTC_12x12_Format)return c===SRGBTransfer?o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:o.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(s===RGBA_BPTC_Format||s===RGB_BPTC_SIGNED_Format||s===RGB_BPTC_UNSIGNED_Format)if(o=e.get("EXT_texture_compression_bptc"),o!==null){if(s===RGBA_BPTC_Format)return c===SRGBTransfer?o.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:o.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(s===RGB_BPTC_SIGNED_Format)return o.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(s===RGB_BPTC_UNSIGNED_Format)return o.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(s===RED_RGTC1_Format||s===SIGNED_RED_RGTC1_Format||s===RED_GREEN_RGTC2_Format||s===SIGNED_RED_GREEN_RGTC2_Format)if(o=e.get("EXT_texture_compression_rgtc"),o!==null){if(s===RGBA_BPTC_Format)return o.COMPRESSED_RED_RGTC1_EXT;if(s===SIGNED_RED_RGTC1_Format)return o.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(s===RED_GREEN_RGTC2_Format)return o.COMPRESSED_RED_GREEN_RGTC2_EXT;if(s===SIGNED_RED_GREEN_RGTC2_Format)return o.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return s===UnsignedInt248Type?i?r.UNSIGNED_INT_24_8:(o=e.get("WEBGL_depth_texture"),o!==null?o.UNSIGNED_INT_24_8_WEBGL:null):r[s]!==void 0?r[s]:null}return{convert:a}}class ArrayCamera extends PerspectiveCamera{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class Group extends Object3D{constructor(){super(),this.isGroup=!0,this.type="Group"}}const _moveEvent={type:"move"};class WebXRController{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Group,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Group,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new Vector3,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new Vector3),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Group,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new Vector3,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new Vector3),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let a=null,s=null,l=null;const o=this._targetRay,c=this._grip,h=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(h&&e.hand){l=!0;for(const v of e.hand.values()){const m=t.getJointPose(v,i),p=this._getHandJoint(h,v);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const f=h.joints["index-finger-tip"],u=h.joints["thumb-tip"],d=f.position.distanceTo(u.position),g=.02,_=.005;h.inputState.pinching&&d>g+_?(h.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!h.inputState.pinching&&d<=g-_&&(h.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,i),s!==null&&(c.matrix.fromArray(s.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,s.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(s.linearVelocity)):c.hasLinearVelocity=!1,s.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(s.angularVelocity)):c.hasAngularVelocity=!1));o!==null&&(a=t.getPose(e.targetRaySpace,i),a===null&&s!==null&&(a=s),a!==null&&(o.matrix.fromArray(a.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,a.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(a.linearVelocity)):o.hasLinearVelocity=!1,a.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(a.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(_moveEvent)))}return o!==null&&(o.visible=a!==null),c!==null&&(c.visible=s!==null),h!==null&&(h.visible=l!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new Group;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}class WebXRManager extends EventDispatcher{constructor(e,t){super();const i=this;let a=null,s=1,l=null,o="local-floor",c=1,h=null,f=null,u=null,d=null,g=null,_=null;const v=t.getContextAttributes();let m=null,p=null;const E=[],x=[],w=new Vector2;let L=null;const C=new PerspectiveCamera;C.layers.enable(1),C.viewport=new Vector4;const R=new PerspectiveCamera;R.layers.enable(2),R.viewport=new Vector4;const z=[C,R],S=new ArrayCamera;S.layers.enable(1),S.layers.enable(2);let A=null,V=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(H){let K=E[H];return K===void 0&&(K=new WebXRController,E[H]=K),K.getTargetRaySpace()},this.getControllerGrip=function(H){let K=E[H];return K===void 0&&(K=new WebXRController,E[H]=K),K.getGripSpace()},this.getHand=function(H){let K=E[H];return K===void 0&&(K=new WebXRController,E[H]=K),K.getHandSpace()};function X(H){const K=x.indexOf(H.inputSource);if(K===-1)return;const le=E[K];le!==void 0&&(le.update(H.inputSource,H.frame,h||l),le.dispatchEvent({type:H.type,data:H.inputSource}))}function ne(){a.removeEventListener("select",X),a.removeEventListener("selectstart",X),a.removeEventListener("selectend",X),a.removeEventListener("squeeze",X),a.removeEventListener("squeezestart",X),a.removeEventListener("squeezeend",X),a.removeEventListener("end",ne),a.removeEventListener("inputsourceschange",D);for(let H=0;H<E.length;H++){const K=x[H];K!==null&&(x[H]=null,E[H].disconnect(K))}A=null,V=null,e.setRenderTarget(m),g=null,d=null,u=null,a=null,p=null,he.stop(),i.isPresenting=!1,e.setPixelRatio(L),e.setSize(w.width,w.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(H){s=H,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(H){o=H,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return h||l},this.setReferenceSpace=function(H){h=H},this.getBaseLayer=function(){return d!==null?d:g},this.getBinding=function(){return u},this.getFrame=function(){return _},this.getSession=function(){return a},this.setSession=async function(H){if(a=H,a!==null){if(m=e.getRenderTarget(),a.addEventListener("select",X),a.addEventListener("selectstart",X),a.addEventListener("selectend",X),a.addEventListener("squeeze",X),a.addEventListener("squeezestart",X),a.addEventListener("squeezeend",X),a.addEventListener("end",ne),a.addEventListener("inputsourceschange",D),v.xrCompatible!==!0&&await t.makeXRCompatible(),L=e.getPixelRatio(),e.getSize(w),a.renderState.layers===void 0||e.capabilities.isWebGL2===!1){const K={antialias:a.renderState.layers===void 0?v.antialias:!0,alpha:!0,depth:v.depth,stencil:v.stencil,framebufferScaleFactor:s};g=new XRWebGLLayer(a,t,K),a.updateRenderState({baseLayer:g}),e.setPixelRatio(1),e.setSize(g.framebufferWidth,g.framebufferHeight,!1),p=new WebGLRenderTarget(g.framebufferWidth,g.framebufferHeight,{format:RGBAFormat,type:UnsignedByteType,colorSpace:e.outputColorSpace,stencilBuffer:v.stencil})}else{let K=null,le=null,_e=null;v.depth&&(_e=v.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,K=v.stencil?DepthStencilFormat:DepthFormat,le=v.stencil?UnsignedInt248Type:UnsignedIntType);const ge={colorFormat:t.RGBA8,depthFormat:_e,scaleFactor:s};u=new XRWebGLBinding(a,t),d=u.createProjectionLayer(ge),a.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),p=new WebGLRenderTarget(d.textureWidth,d.textureHeight,{format:RGBAFormat,type:UnsignedByteType,depthTexture:new DepthTexture(d.textureWidth,d.textureHeight,le,void 0,void 0,void 0,void 0,void 0,void 0,K),stencilBuffer:v.stencil,colorSpace:e.outputColorSpace,samples:v.antialias?4:0});const Re=e.properties.get(p);Re.__ignoreDepthValues=d.ignoreDepthValues}p.isXRRenderTarget=!0,this.setFoveation(c),h=null,l=await a.requestReferenceSpace(o),he.setContext(a),he.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(a!==null)return a.environmentBlendMode};function D(H){for(let K=0;K<H.removed.length;K++){const le=H.removed[K],_e=x.indexOf(le);_e>=0&&(x[_e]=null,E[_e].disconnect(le))}for(let K=0;K<H.added.length;K++){const le=H.added[K];let _e=x.indexOf(le);if(_e===-1){for(let Re=0;Re<E.length;Re++)if(Re>=x.length){x.push(le),_e=Re;break}else if(x[Re]===null){x[Re]=le,_e=Re;break}if(_e===-1)break}const ge=E[_e];ge&&ge.connect(le)}}const F=new Vector3,W=new Vector3;function j(H,K,le){F.setFromMatrixPosition(K.matrixWorld),W.setFromMatrixPosition(le.matrixWorld);const _e=F.distanceTo(W),ge=K.projectionMatrix.elements,Re=le.projectionMatrix.elements,Pe=ge[14]/(ge[10]-1),Te=ge[14]/(ge[10]+1),Oe=(ge[9]+1)/ge[5],I=(ge[9]-1)/ge[5],Je=(ge[8]-1)/ge[0],xe=(Re[8]+1)/Re[0],we=Pe*Je,de=Pe*xe,$e=_e/(-Je+xe),Ue=$e*-Je;K.matrixWorld.decompose(H.position,H.quaternion,H.scale),H.translateX(Ue),H.translateZ($e),H.matrixWorld.compose(H.position,H.quaternion,H.scale),H.matrixWorldInverse.copy(H.matrixWorld).invert();const b=Pe+$e,M=Te+$e,B=we-Ue,ee=de+(_e-Ue),Q=Oe*Te/M*b,te=I*Te/M*b;H.projectionMatrix.makePerspective(B,ee,Q,te,b,M),H.projectionMatrixInverse.copy(H.projectionMatrix).invert()}function Y(H,K){K===null?H.matrixWorld.copy(H.matrix):H.matrixWorld.multiplyMatrices(K.matrixWorld,H.matrix),H.matrixWorldInverse.copy(H.matrixWorld).invert()}this.updateCamera=function(H){if(a===null)return;S.near=R.near=C.near=H.near,S.far=R.far=C.far=H.far,(A!==S.near||V!==S.far)&&(a.updateRenderState({depthNear:S.near,depthFar:S.far}),A=S.near,V=S.far);const K=H.parent,le=S.cameras;Y(S,K);for(let _e=0;_e<le.length;_e++)Y(le[_e],K);le.length===2?j(S,C,R):S.projectionMatrix.copy(C.projectionMatrix),q(H,S,K)};function q(H,K,le){le===null?H.matrix.copy(K.matrixWorld):(H.matrix.copy(le.matrixWorld),H.matrix.invert(),H.matrix.multiply(K.matrixWorld)),H.matrix.decompose(H.position,H.quaternion,H.scale),H.updateMatrixWorld(!0),H.projectionMatrix.copy(K.projectionMatrix),H.projectionMatrixInverse.copy(K.projectionMatrixInverse),H.isPerspectiveCamera&&(H.fov=RAD2DEG*2*Math.atan(1/H.projectionMatrix.elements[5]),H.zoom=1)}this.getCamera=function(){return S},this.getFoveation=function(){if(!(d===null&&g===null))return c},this.setFoveation=function(H){c=H,d!==null&&(d.fixedFoveation=H),g!==null&&g.fixedFoveation!==void 0&&(g.fixedFoveation=H)};let J=null;function ie(H,K){if(f=K.getViewerPose(h||l),_=K,f!==null){const le=f.views;g!==null&&(e.setRenderTargetFramebuffer(p,g.framebuffer),e.setRenderTarget(p));let _e=!1;le.length!==S.cameras.length&&(S.cameras.length=0,_e=!0);for(let ge=0;ge<le.length;ge++){const Re=le[ge];let Pe=null;if(g!==null)Pe=g.getViewport(Re);else{const Oe=u.getViewSubImage(d,Re);Pe=Oe.viewport,ge===0&&(e.setRenderTargetTextures(p,Oe.colorTexture,d.ignoreDepthValues?void 0:Oe.depthStencilTexture),e.setRenderTarget(p))}let Te=z[ge];Te===void 0&&(Te=new PerspectiveCamera,Te.layers.enable(ge),Te.viewport=new Vector4,z[ge]=Te),Te.matrix.fromArray(Re.transform.matrix),Te.matrix.decompose(Te.position,Te.quaternion,Te.scale),Te.projectionMatrix.fromArray(Re.projectionMatrix),Te.projectionMatrixInverse.copy(Te.projectionMatrix).invert(),Te.viewport.set(Pe.x,Pe.y,Pe.width,Pe.height),ge===0&&(S.matrix.copy(Te.matrix),S.matrix.decompose(S.position,S.quaternion,S.scale)),_e===!0&&S.cameras.push(Te)}}for(let le=0;le<E.length;le++){const _e=x[le],ge=E[le];_e!==null&&ge!==void 0&&ge.update(_e,K,h||l)}J&&J(H,K),K.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:K}),_=null}const he=new WebGLAnimation;he.setAnimationLoop(ie),this.setAnimationLoop=function(H){J=H},this.dispose=function(){}}}function WebGLMaterials(r,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function i(m,p){p.color.getRGB(m.fogColor.value,getUnlitUniformColorSpace(r)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function a(m,p,E,x,w){p.isMeshBasicMaterial||p.isMeshLambertMaterial?s(m,p):p.isMeshToonMaterial?(s(m,p),u(m,p)):p.isMeshPhongMaterial?(s(m,p),f(m,p)):p.isMeshStandardMaterial?(s(m,p),d(m,p),p.isMeshPhysicalMaterial&&g(m,p,w)):p.isMeshMatcapMaterial?(s(m,p),_(m,p)):p.isMeshDepthMaterial?s(m,p):p.isMeshDistanceMaterial?(s(m,p),v(m,p)):p.isMeshNormalMaterial?s(m,p):p.isLineBasicMaterial?(l(m,p),p.isLineDashedMaterial&&o(m,p)):p.isPointsMaterial?c(m,p,E,x):p.isSpriteMaterial?h(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function s(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===BackSide&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===BackSide&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const E=e.get(p).envMap;if(E&&(m.envMap.value=E,m.flipEnvMap.value=E.isCubeTexture&&E.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap){m.lightMap.value=p.lightMap;const x=r._useLegacyLights===!0?Math.PI:1;m.lightMapIntensity.value=p.lightMapIntensity*x,t(p.lightMap,m.lightMapTransform)}p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function l(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function o(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function c(m,p,E,x){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*E,m.scale.value=x*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function f(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function u(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function d(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),e.get(p).envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function g(m,p,E){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===BackSide&&m.clearcoatNormalScale.value.negate())),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=E.texture,m.transmissionSamplerSize.value.set(E.width,E.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function _(m,p){p.matcap&&(m.matcap.value=p.matcap)}function v(m,p){const E=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(E.matrixWorld),m.nearDistance.value=E.shadow.camera.near,m.farDistance.value=E.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:a}}function WebGLUniformsGroups(r,e,t,i){let a={},s={},l=[];const o=t.isWebGL2?r.getParameter(r.MAX_UNIFORM_BUFFER_BINDINGS):0;function c(E,x){const w=x.program;i.uniformBlockBinding(E,w)}function h(E,x){let w=a[E.id];w===void 0&&(_(E),w=f(E),a[E.id]=w,E.addEventListener("dispose",m));const L=x.program;i.updateUBOMapping(E,L);const C=e.render.frame;s[E.id]!==C&&(d(E),s[E.id]=C)}function f(E){const x=u();E.__bindingPointIndex=x;const w=r.createBuffer(),L=E.__size,C=E.usage;return r.bindBuffer(r.UNIFORM_BUFFER,w),r.bufferData(r.UNIFORM_BUFFER,L,C),r.bindBuffer(r.UNIFORM_BUFFER,null),r.bindBufferBase(r.UNIFORM_BUFFER,x,w),w}function u(){for(let E=0;E<o;E++)if(l.indexOf(E)===-1)return l.push(E),E;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(E){const x=a[E.id],w=E.uniforms,L=E.__cache;r.bindBuffer(r.UNIFORM_BUFFER,x);for(let C=0,R=w.length;C<R;C++){const z=Array.isArray(w[C])?w[C]:[w[C]];for(let S=0,A=z.length;S<A;S++){const V=z[S];if(g(V,C,S,L)===!0){const X=V.__offset,ne=Array.isArray(V.value)?V.value:[V.value];let D=0;for(let F=0;F<ne.length;F++){const W=ne[F],j=v(W);typeof W=="number"||typeof W=="boolean"?(V.__data[0]=W,r.bufferSubData(r.UNIFORM_BUFFER,X+D,V.__data)):W.isMatrix3?(V.__data[0]=W.elements[0],V.__data[1]=W.elements[1],V.__data[2]=W.elements[2],V.__data[3]=0,V.__data[4]=W.elements[3],V.__data[5]=W.elements[4],V.__data[6]=W.elements[5],V.__data[7]=0,V.__data[8]=W.elements[6],V.__data[9]=W.elements[7],V.__data[10]=W.elements[8],V.__data[11]=0):(W.toArray(V.__data,D),D+=j.storage/Float32Array.BYTES_PER_ELEMENT)}r.bufferSubData(r.UNIFORM_BUFFER,X,V.__data)}}}r.bindBuffer(r.UNIFORM_BUFFER,null)}function g(E,x,w,L){const C=E.value,R=x+"_"+w;if(L[R]===void 0)return typeof C=="number"||typeof C=="boolean"?L[R]=C:L[R]=C.clone(),!0;{const z=L[R];if(typeof C=="number"||typeof C=="boolean"){if(z!==C)return L[R]=C,!0}else if(z.equals(C)===!1)return z.copy(C),!0}return!1}function _(E){const x=E.uniforms;let w=0;const L=16;for(let R=0,z=x.length;R<z;R++){const S=Array.isArray(x[R])?x[R]:[x[R]];for(let A=0,V=S.length;A<V;A++){const X=S[A],ne=Array.isArray(X.value)?X.value:[X.value];for(let D=0,F=ne.length;D<F;D++){const W=ne[D],j=v(W),Y=w%L;Y!==0&&L-Y<j.boundary&&(w+=L-Y),X.__data=new Float32Array(j.storage/Float32Array.BYTES_PER_ELEMENT),X.__offset=w,w+=j.storage}}}const C=w%L;return C>0&&(w+=L-C),E.__size=w,E.__cache={},this}function v(E){const x={boundary:0,storage:0};return typeof E=="number"||typeof E=="boolean"?(x.boundary=4,x.storage=4):E.isVector2?(x.boundary=8,x.storage=8):E.isVector3||E.isColor?(x.boundary=16,x.storage=12):E.isVector4?(x.boundary=16,x.storage=16):E.isMatrix3?(x.boundary=48,x.storage=48):E.isMatrix4?(x.boundary=64,x.storage=64):E.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",E),x}function m(E){const x=E.target;x.removeEventListener("dispose",m);const w=l.indexOf(x.__bindingPointIndex);l.splice(w,1),r.deleteBuffer(a[x.id]),delete a[x.id],delete s[x.id]}function p(){for(const E in a)r.deleteBuffer(a[E]);l=[],a={},s={}}return{bind:c,update:h,dispose:p}}class WebGLRenderer{constructor(e={}){const{canvas:t=createCanvasElement(),context:i=null,depth:a=!0,stencil:s=!0,alpha:l=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:h=!1,powerPreference:f="default",failIfMajorPerformanceCaveat:u=!1}=e;this.isWebGLRenderer=!0;let d;i!==null?d=i.getContextAttributes().alpha:d=l;const g=new Uint32Array(4),_=new Int32Array(4);let v=null,m=null;const p=[],E=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=SRGBColorSpace,this._useLegacyLights=!1,this.toneMapping=NoToneMapping,this.toneMappingExposure=1;const x=this;let w=!1,L=0,C=0,R=null,z=-1,S=null;const A=new Vector4,V=new Vector4;let X=null;const ne=new Color(0);let D=0,F=t.width,W=t.height,j=1,Y=null,q=null;const J=new Vector4(0,0,F,W),ie=new Vector4(0,0,F,W);let he=!1;const H=new Frustum;let K=!1,le=!1,_e=null;const ge=new Matrix4,Re=new Vector2,Pe=new Vector3,Te={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function Oe(){return R===null?j:1}let I=i;function Je(y,U){for(let O=0;O<y.length;O++){const k=y[O],N=t.getContext(k,U);if(N!==null)return N}return null}try{const y={alpha:!0,depth:a,stencil:s,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:h,powerPreference:f,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${REVISION}`),t.addEventListener("webglcontextlost",re,!1),t.addEventListener("webglcontextrestored",P,!1),t.addEventListener("webglcontextcreationerror",ae,!1),I===null){const U=["webgl2","webgl","experimental-webgl"];if(x.isWebGL1Renderer===!0&&U.shift(),I=Je(U,y),I===null)throw Je(U)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}typeof WebGLRenderingContext<"u"&&I instanceof WebGLRenderingContext&&console.warn("THREE.WebGLRenderer: WebGL 1 support was deprecated in r153 and will be removed in r163."),I.getShaderPrecisionFormat===void 0&&(I.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(y){throw console.error("THREE.WebGLRenderer: "+y.message),y}let xe,we,de,$e,Ue,b,M,B,ee,Q,te,pe,oe,ue,ye,Fe,Z,ze,Be,Ae,ve,fe,De,Ve;function qe(){xe=new WebGLExtensions(I),we=new WebGLCapabilities(I,xe,e),xe.init(we),fe=new WebGLUtils(I,xe,we),de=new WebGLState(I,xe,we),$e=new WebGLInfo(I),Ue=new WebGLProperties,b=new WebGLTextures(I,xe,de,Ue,we,fe,$e),M=new WebGLCubeMaps(x),B=new WebGLCubeUVMaps(x),ee=new WebGLAttributes(I,we),De=new WebGLBindingStates(I,xe,ee,we),Q=new WebGLGeometries(I,ee,$e,De),te=new WebGLObjects(I,Q,ee,$e),Be=new WebGLMorphtargets(I,we,b),Fe=new WebGLClipping(Ue),pe=new WebGLPrograms(x,M,B,xe,we,De,Fe),oe=new WebGLMaterials(x,Ue),ue=new WebGLRenderLists,ye=new WebGLRenderStates(xe,we),ze=new WebGLBackground(x,M,B,de,te,d,c),Z=new WebGLShadowMap(x,te,we),Ve=new WebGLUniformsGroups(I,$e,we,de),Ae=new WebGLBufferRenderer(I,xe,$e,we),ve=new WebGLIndexedBufferRenderer(I,xe,$e,we),$e.programs=pe.programs,x.capabilities=we,x.extensions=xe,x.properties=Ue,x.renderLists=ue,x.shadowMap=Z,x.state=de,x.info=$e}qe();const Ne=new WebXRManager(x,I);this.xr=Ne,this.getContext=function(){return I},this.getContextAttributes=function(){return I.getContextAttributes()},this.forceContextLoss=function(){const y=xe.get("WEBGL_lose_context");y&&y.loseContext()},this.forceContextRestore=function(){const y=xe.get("WEBGL_lose_context");y&&y.restoreContext()},this.getPixelRatio=function(){return j},this.setPixelRatio=function(y){y!==void 0&&(j=y,this.setSize(F,W,!1))},this.getSize=function(y){return y.set(F,W)},this.setSize=function(y,U,O=!0){if(Ne.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}F=y,W=U,t.width=Math.floor(y*j),t.height=Math.floor(U*j),O===!0&&(t.style.width=y+"px",t.style.height=U+"px"),this.setViewport(0,0,y,U)},this.getDrawingBufferSize=function(y){return y.set(F*j,W*j).floor()},this.setDrawingBufferSize=function(y,U,O){F=y,W=U,j=O,t.width=Math.floor(y*O),t.height=Math.floor(U*O),this.setViewport(0,0,y,U)},this.getCurrentViewport=function(y){return y.copy(A)},this.getViewport=function(y){return y.copy(J)},this.setViewport=function(y,U,O,k){y.isVector4?J.set(y.x,y.y,y.z,y.w):J.set(y,U,O,k),de.viewport(A.copy(J).multiplyScalar(j).floor())},this.getScissor=function(y){return y.copy(ie)},this.setScissor=function(y,U,O,k){y.isVector4?ie.set(y.x,y.y,y.z,y.w):ie.set(y,U,O,k),de.scissor(V.copy(ie).multiplyScalar(j).floor())},this.getScissorTest=function(){return he},this.setScissorTest=function(y){de.setScissorTest(he=y)},this.setOpaqueSort=function(y){Y=y},this.setTransparentSort=function(y){q=y},this.getClearColor=function(y){return y.copy(ze.getClearColor())},this.setClearColor=function(){ze.setClearColor.apply(ze,arguments)},this.getClearAlpha=function(){return ze.getClearAlpha()},this.setClearAlpha=function(){ze.setClearAlpha.apply(ze,arguments)},this.clear=function(y=!0,U=!0,O=!0){let k=0;if(y){let N=!1;if(R!==null){const ce=R.texture.format;N=ce===RGBAIntegerFormat||ce===RGIntegerFormat||ce===RedIntegerFormat}if(N){const ce=R.texture.type,me=ce===UnsignedByteType||ce===UnsignedIntType||ce===UnsignedShortType||ce===UnsignedInt248Type||ce===UnsignedShort4444Type||ce===UnsignedShort5551Type,Se=ze.getClearColor(),Ee=ze.getClearAlpha(),Ie=Se.r,Ce=Se.g,Le=Se.b;me?(g[0]=Ie,g[1]=Ce,g[2]=Le,g[3]=Ee,I.clearBufferuiv(I.COLOR,0,g)):(_[0]=Ie,_[1]=Ce,_[2]=Le,_[3]=Ee,I.clearBufferiv(I.COLOR,0,_))}else k|=I.COLOR_BUFFER_BIT}U&&(k|=I.DEPTH_BUFFER_BIT),O&&(k|=I.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),I.clear(k)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",re,!1),t.removeEventListener("webglcontextrestored",P,!1),t.removeEventListener("webglcontextcreationerror",ae,!1),ue.dispose(),ye.dispose(),Ue.dispose(),M.dispose(),B.dispose(),te.dispose(),De.dispose(),Ve.dispose(),pe.dispose(),Ne.dispose(),Ne.removeEventListener("sessionstart",et),Ne.removeEventListener("sessionend",We),_e&&(_e.dispose(),_e=null),tt.stop()};function re(y){y.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),w=!0}function P(){console.log("THREE.WebGLRenderer: Context Restored."),w=!1;const y=$e.autoReset,U=Z.enabled,O=Z.autoUpdate,k=Z.needsUpdate,N=Z.type;qe(),$e.autoReset=y,Z.enabled=U,Z.autoUpdate=O,Z.needsUpdate=k,Z.type=N}function ae(y){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",y.statusMessage)}function se(y){const U=y.target;U.removeEventListener("dispose",se),be(U)}function be(y){Me(y),Ue.remove(y)}function Me(y){const U=Ue.get(y).programs;U!==void 0&&(U.forEach(function(O){pe.releaseProgram(O)}),y.isShaderMaterial&&pe.releaseShaderCache(y))}this.renderBufferDirect=function(y,U,O,k,N,ce){U===null&&(U=Te);const me=N.isMesh&&N.matrixWorld.determinant()<0,Se=yt(y,U,O,k,N);de.setMaterial(k,me);let Ee=O.index,Ie=1;if(k.wireframe===!0){if(Ee=Q.getWireframeAttribute(O),Ee===void 0)return;Ie=2}const Ce=O.drawRange,Le=O.attributes.position;let je=Ce.start*Ie,nt=(Ce.start+Ce.count)*Ie;ce!==null&&(je=Math.max(je,ce.start*Ie),nt=Math.min(nt,(ce.start+ce.count)*Ie)),Ee!==null?(je=Math.max(je,0),nt=Math.min(nt,Ee.count)):Le!=null&&(je=Math.max(je,0),nt=Math.min(nt,Le.count));const Ze=nt-je;if(Ze<0||Ze===1/0)return;De.setup(N,k,Se,O,Ee);let at,Xe=Ae;if(Ee!==null&&(at=ee.get(Ee),Xe=ve,Xe.setIndex(at)),N.isMesh)k.wireframe===!0?(de.setLineWidth(k.wireframeLinewidth*Oe()),Xe.setMode(I.LINES)):Xe.setMode(I.TRIANGLES);else if(N.isLine){let Ge=k.linewidth;Ge===void 0&&(Ge=1),de.setLineWidth(Ge*Oe()),N.isLineSegments?Xe.setMode(I.LINES):N.isLineLoop?Xe.setMode(I.LINE_LOOP):Xe.setMode(I.LINE_STRIP)}else N.isPoints?Xe.setMode(I.POINTS):N.isSprite&&Xe.setMode(I.TRIANGLES);if(N.isBatchedMesh)Xe.renderMultiDraw(N._multiDrawStarts,N._multiDrawCounts,N._multiDrawCount);else if(N.isInstancedMesh)Xe.renderInstances(je,Ze,N.count);else if(O.isInstancedBufferGeometry){const Ge=O._maxInstanceCount!==void 0?O._maxInstanceCount:1/0,ut=Math.min(O.instanceCount,Ge);Xe.renderInstances(je,Ze,ut)}else Xe.render(je,Ze)};function ke(y,U,O){y.transparent===!0&&y.side===DoubleSide&&y.forceSinglePass===!1?(y.side=BackSide,y.needsUpdate=!0,ht(y,U,O),y.side=FrontSide,y.needsUpdate=!0,ht(y,U,O),y.side=DoubleSide):ht(y,U,O)}this.compile=function(y,U,O=null){O===null&&(O=y),m=ye.get(O),m.init(),E.push(m),O.traverseVisible(function(N){N.isLight&&N.layers.test(U.layers)&&(m.pushLight(N),N.castShadow&&m.pushShadow(N))}),y!==O&&y.traverseVisible(function(N){N.isLight&&N.layers.test(U.layers)&&(m.pushLight(N),N.castShadow&&m.pushShadow(N))}),m.setupLights(x._useLegacyLights);const k=new Set;return y.traverse(function(N){const ce=N.material;if(ce)if(Array.isArray(ce))for(let me=0;me<ce.length;me++){const Se=ce[me];ke(Se,O,N),k.add(Se)}else ke(ce,O,N),k.add(ce)}),E.pop(),m=null,k},this.compileAsync=function(y,U,O=null){const k=this.compile(y,U,O);return new Promise(N=>{function ce(){if(k.forEach(function(me){Ue.get(me).currentProgram.isReady()&&k.delete(me)}),k.size===0){N(y);return}setTimeout(ce,10)}xe.get("KHR_parallel_shader_compile")!==null?ce():setTimeout(ce,10)})};let He=null;function Ke(y){He&&He(y)}function et(){tt.stop()}function We(){tt.start()}const tt=new WebGLAnimation;tt.setAnimationLoop(Ke),typeof self<"u"&&tt.setContext(self),this.setAnimationLoop=function(y){He=y,Ne.setAnimationLoop(y),y===null?tt.stop():tt.start()},Ne.addEventListener("sessionstart",et),Ne.addEventListener("sessionend",We),this.render=function(y,U){if(U!==void 0&&U.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(w===!0)return;y.matrixWorldAutoUpdate===!0&&y.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),Ne.enabled===!0&&Ne.isPresenting===!0&&(Ne.cameraAutoUpdate===!0&&Ne.updateCamera(U),U=Ne.getCamera()),y.isScene===!0&&y.onBeforeRender(x,y,U,R),m=ye.get(y,E.length),m.init(),E.push(m),ge.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),H.setFromProjectionMatrix(ge),le=this.localClippingEnabled,K=Fe.init(this.clippingPlanes,le),v=ue.get(y,p.length),v.init(),p.push(v),rt(y,U,0,x.sortObjects),v.finish(),x.sortObjects===!0&&v.sort(Y,q),this.info.render.frame++,K===!0&&Fe.beginShadows();const O=m.state.shadowsArray;if(Z.render(O,y,U),K===!0&&Fe.endShadows(),this.info.autoReset===!0&&this.info.reset(),ze.render(v,y),m.setupLights(x._useLegacyLights),U.isArrayCamera){const k=U.cameras;for(let N=0,ce=k.length;N<ce;N++){const me=k[N];mt(v,y,me,me.viewport)}}else mt(v,y,U);R!==null&&(b.updateMultisampleRenderTarget(R),b.updateRenderTargetMipmap(R)),y.isScene===!0&&y.onAfterRender(x,y,U),De.resetDefaultState(),z=-1,S=null,E.pop(),E.length>0?m=E[E.length-1]:m=null,p.pop(),p.length>0?v=p[p.length-1]:v=null};function rt(y,U,O,k){if(y.visible===!1)return;if(y.layers.test(U.layers)){if(y.isGroup)O=y.renderOrder;else if(y.isLOD)y.autoUpdate===!0&&y.update(U);else if(y.isLight)m.pushLight(y),y.castShadow&&m.pushShadow(y);else if(y.isSprite){if(!y.frustumCulled||H.intersectsSprite(y)){k&&Pe.setFromMatrixPosition(y.matrixWorld).applyMatrix4(ge);const me=te.update(y),Se=y.material;Se.visible&&v.push(y,me,Se,O,Pe.z,null)}}else if((y.isMesh||y.isLine||y.isPoints)&&(!y.frustumCulled||H.intersectsObject(y))){const me=te.update(y),Se=y.material;if(k&&(y.boundingSphere!==void 0?(y.boundingSphere===null&&y.computeBoundingSphere(),Pe.copy(y.boundingSphere.center)):(me.boundingSphere===null&&me.computeBoundingSphere(),Pe.copy(me.boundingSphere.center)),Pe.applyMatrix4(y.matrixWorld).applyMatrix4(ge)),Array.isArray(Se)){const Ee=me.groups;for(let Ie=0,Ce=Ee.length;Ie<Ce;Ie++){const Le=Ee[Ie],je=Se[Le.materialIndex];je&&je.visible&&v.push(y,me,je,O,Pe.z,Le)}}else Se.visible&&v.push(y,me,Se,O,Pe.z,null)}}const ce=y.children;for(let me=0,Se=ce.length;me<Se;me++)rt(ce[me],U,O,k)}function mt(y,U,O,k){const N=y.opaque,ce=y.transmissive,me=y.transparent;m.setupLightsView(O),K===!0&&Fe.setGlobalState(x.clippingPlanes,O),ce.length>0&&St(N,ce,U,O),k&&de.viewport(A.copy(k)),N.length>0&&ct(N,U,O),ce.length>0&&ct(ce,U,O),me.length>0&&ct(me,U,O),de.buffers.depth.setTest(!0),de.buffers.depth.setMask(!0),de.buffers.color.setMask(!0),de.setPolygonOffset(!1)}function St(y,U,O,k){if((O.isScene===!0?O.overrideMaterial:null)!==null)return;const ce=we.isWebGL2;_e===null&&(_e=new WebGLRenderTarget(1,1,{generateMipmaps:!0,type:xe.has("EXT_color_buffer_half_float")?HalfFloatType:UnsignedByteType,minFilter:LinearMipmapLinearFilter,samples:ce?4:0})),x.getDrawingBufferSize(Re),ce?_e.setSize(Re.x,Re.y):_e.setSize(floorPowerOfTwo(Re.x),floorPowerOfTwo(Re.y));const me=x.getRenderTarget();x.setRenderTarget(_e),x.getClearColor(ne),D=x.getClearAlpha(),D<1&&x.setClearColor(16777215,.5),x.clear();const Se=x.toneMapping;x.toneMapping=NoToneMapping,ct(y,O,k),b.updateMultisampleRenderTarget(_e),b.updateRenderTargetMipmap(_e);let Ee=!1;for(let Ie=0,Ce=U.length;Ie<Ce;Ie++){const Le=U[Ie],je=Le.object,nt=Le.geometry,Ze=Le.material,at=Le.group;if(Ze.side===DoubleSide&&je.layers.test(k.layers)){const Xe=Ze.side;Ze.side=BackSide,Ze.needsUpdate=!0,gt(je,O,k,nt,Ze,at),Ze.side=Xe,Ze.needsUpdate=!0,Ee=!0}}Ee===!0&&(b.updateMultisampleRenderTarget(_e),b.updateRenderTargetMipmap(_e)),x.setRenderTarget(me),x.setClearColor(ne,D),x.toneMapping=Se}function ct(y,U,O){const k=U.isScene===!0?U.overrideMaterial:null;for(let N=0,ce=y.length;N<ce;N++){const me=y[N],Se=me.object,Ee=me.geometry,Ie=k===null?me.material:k,Ce=me.group;Se.layers.test(O.layers)&&gt(Se,U,O,Ee,Ie,Ce)}}function gt(y,U,O,k,N,ce){y.onBeforeRender(x,U,O,k,N,ce),y.modelViewMatrix.multiplyMatrices(O.matrixWorldInverse,y.matrixWorld),y.normalMatrix.getNormalMatrix(y.modelViewMatrix),N.onBeforeRender(x,U,O,k,y,ce),N.transparent===!0&&N.side===DoubleSide&&N.forceSinglePass===!1?(N.side=BackSide,N.needsUpdate=!0,x.renderBufferDirect(O,U,k,N,y,ce),N.side=FrontSide,N.needsUpdate=!0,x.renderBufferDirect(O,U,k,N,y,ce),N.side=DoubleSide):x.renderBufferDirect(O,U,k,N,y,ce),y.onAfterRender(x,U,O,k,N,ce)}function ht(y,U,O){U.isScene!==!0&&(U=Te);const k=Ue.get(y),N=m.state.lights,ce=m.state.shadowsArray,me=N.state.version,Se=pe.getParameters(y,N.state,ce,U,O),Ee=pe.getProgramCacheKey(Se);let Ie=k.programs;k.environment=y.isMeshStandardMaterial?U.environment:null,k.fog=U.fog,k.envMap=(y.isMeshStandardMaterial?B:M).get(y.envMap||k.environment),Ie===void 0&&(y.addEventListener("dispose",se),Ie=new Map,k.programs=Ie);let Ce=Ie.get(Ee);if(Ce!==void 0){if(k.currentProgram===Ce&&k.lightsStateVersion===me)return vt(y,Se),Ce}else Se.uniforms=pe.getUniforms(y),y.onBuild(O,Se,x),y.onBeforeCompile(Se,x),Ce=pe.acquireProgram(Se,Ee),Ie.set(Ee,Ce),k.uniforms=Se.uniforms;const Le=k.uniforms;return(!y.isShaderMaterial&&!y.isRawShaderMaterial||y.clipping===!0)&&(Le.clippingPlanes=Fe.uniform),vt(y,Se),k.needsLights=bt(y),k.lightsStateVersion=me,k.needsLights&&(Le.ambientLightColor.value=N.state.ambient,Le.lightProbe.value=N.state.probe,Le.directionalLights.value=N.state.directional,Le.directionalLightShadows.value=N.state.directionalShadow,Le.spotLights.value=N.state.spot,Le.spotLightShadows.value=N.state.spotShadow,Le.rectAreaLights.value=N.state.rectArea,Le.ltc_1.value=N.state.rectAreaLTC1,Le.ltc_2.value=N.state.rectAreaLTC2,Le.pointLights.value=N.state.point,Le.pointLightShadows.value=N.state.pointShadow,Le.hemisphereLights.value=N.state.hemi,Le.directionalShadowMap.value=N.state.directionalShadowMap,Le.directionalShadowMatrix.value=N.state.directionalShadowMatrix,Le.spotShadowMap.value=N.state.spotShadowMap,Le.spotLightMatrix.value=N.state.spotLightMatrix,Le.spotLightMap.value=N.state.spotLightMap,Le.pointShadowMap.value=N.state.pointShadowMap,Le.pointShadowMatrix.value=N.state.pointShadowMatrix),k.currentProgram=Ce,k.uniformsList=null,Ce}function _t(y){if(y.uniformsList===null){const U=y.currentProgram.getUniforms();y.uniformsList=WebGLUniforms.seqWithValue(U.seq,y.uniforms)}return y.uniformsList}function vt(y,U){const O=Ue.get(y);O.outputColorSpace=U.outputColorSpace,O.batching=U.batching,O.instancing=U.instancing,O.instancingColor=U.instancingColor,O.skinning=U.skinning,O.morphTargets=U.morphTargets,O.morphNormals=U.morphNormals,O.morphColors=U.morphColors,O.morphTargetsCount=U.morphTargetsCount,O.numClippingPlanes=U.numClippingPlanes,O.numIntersection=U.numClipIntersection,O.vertexAlphas=U.vertexAlphas,O.vertexTangents=U.vertexTangents,O.toneMapping=U.toneMapping}function yt(y,U,O,k,N){U.isScene!==!0&&(U=Te),b.resetTextureUnits();const ce=U.fog,me=k.isMeshStandardMaterial?U.environment:null,Se=R===null?x.outputColorSpace:R.isXRRenderTarget===!0?R.texture.colorSpace:LinearSRGBColorSpace,Ee=(k.isMeshStandardMaterial?B:M).get(k.envMap||me),Ie=k.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,Ce=!!O.attributes.tangent&&(!!k.normalMap||k.anisotropy>0),Le=!!O.morphAttributes.position,je=!!O.morphAttributes.normal,nt=!!O.morphAttributes.color;let Ze=NoToneMapping;k.toneMapped&&(R===null||R.isXRRenderTarget===!0)&&(Ze=x.toneMapping);const at=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,Xe=at!==void 0?at.length:0,Ge=Ue.get(k),ut=m.state.lights;if(K===!0&&(le===!0||y!==S)){const it=y===S&&k.id===z;Fe.setState(k,y,it)}let Ye=!1;k.version===Ge.__version?(Ge.needsLights&&Ge.lightsStateVersion!==ut.state.version||Ge.outputColorSpace!==Se||N.isBatchedMesh&&Ge.batching===!1||!N.isBatchedMesh&&Ge.batching===!0||N.isInstancedMesh&&Ge.instancing===!1||!N.isInstancedMesh&&Ge.instancing===!0||N.isSkinnedMesh&&Ge.skinning===!1||!N.isSkinnedMesh&&Ge.skinning===!0||N.isInstancedMesh&&Ge.instancingColor===!0&&N.instanceColor===null||N.isInstancedMesh&&Ge.instancingColor===!1&&N.instanceColor!==null||Ge.envMap!==Ee||k.fog===!0&&Ge.fog!==ce||Ge.numClippingPlanes!==void 0&&(Ge.numClippingPlanes!==Fe.numPlanes||Ge.numIntersection!==Fe.numIntersection)||Ge.vertexAlphas!==Ie||Ge.vertexTangents!==Ce||Ge.morphTargets!==Le||Ge.morphNormals!==je||Ge.morphColors!==nt||Ge.toneMapping!==Ze||we.isWebGL2===!0&&Ge.morphTargetsCount!==Xe)&&(Ye=!0):(Ye=!0,Ge.__version=k.version);let st=Ge.currentProgram;Ye===!0&&(st=ht(k,U,N));let xt=!1,lt=!1,ft=!1;const Qe=st.getUniforms(),ot=Ge.uniforms;if(de.useProgram(st.program)&&(xt=!0,lt=!0,ft=!0),k.id!==z&&(z=k.id,lt=!0),xt||S!==y){Qe.setValue(I,"projectionMatrix",y.projectionMatrix),Qe.setValue(I,"viewMatrix",y.matrixWorldInverse);const it=Qe.map.cameraPosition;it!==void 0&&it.setValue(I,Pe.setFromMatrixPosition(y.matrixWorld)),we.logarithmicDepthBuffer&&Qe.setValue(I,"logDepthBufFC",2/(Math.log(y.far+1)/Math.LN2)),(k.isMeshPhongMaterial||k.isMeshToonMaterial||k.isMeshLambertMaterial||k.isMeshBasicMaterial||k.isMeshStandardMaterial||k.isShaderMaterial)&&Qe.setValue(I,"isOrthographic",y.isOrthographicCamera===!0),S!==y&&(S=y,lt=!0,ft=!0)}if(N.isSkinnedMesh){Qe.setOptional(I,N,"bindMatrix"),Qe.setOptional(I,N,"bindMatrixInverse");const it=N.skeleton;it&&(we.floatVertexTextures?(it.boneTexture===null&&it.computeBoneTexture(),Qe.setValue(I,"boneTexture",it.boneTexture,b)):console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))}N.isBatchedMesh&&(Qe.setOptional(I,N,"batchingTexture"),Qe.setValue(I,"batchingTexture",N._matricesTexture,b));const dt=O.morphAttributes;if((dt.position!==void 0||dt.normal!==void 0||dt.color!==void 0&&we.isWebGL2===!0)&&Be.update(N,O,st),(lt||Ge.receiveShadow!==N.receiveShadow)&&(Ge.receiveShadow=N.receiveShadow,Qe.setValue(I,"receiveShadow",N.receiveShadow)),k.isMeshGouraudMaterial&&k.envMap!==null&&(ot.envMap.value=Ee,ot.flipEnvMap.value=Ee.isCubeTexture&&Ee.isRenderTargetTexture===!1?-1:1),lt&&(Qe.setValue(I,"toneMappingExposure",x.toneMappingExposure),Ge.needsLights&&Tt(ot,ft),ce&&k.fog===!0&&oe.refreshFogUniforms(ot,ce),oe.refreshMaterialUniforms(ot,k,j,W,_e),WebGLUniforms.upload(I,_t(Ge),ot,b)),k.isShaderMaterial&&k.uniformsNeedUpdate===!0&&(WebGLUniforms.upload(I,_t(Ge),ot,b),k.uniformsNeedUpdate=!1),k.isSpriteMaterial&&Qe.setValue(I,"center",N.center),Qe.setValue(I,"modelViewMatrix",N.modelViewMatrix),Qe.setValue(I,"normalMatrix",N.normalMatrix),Qe.setValue(I,"modelMatrix",N.matrixWorld),k.isShaderMaterial||k.isRawShaderMaterial){const it=k.uniformsGroups;for(let pt=0,Et=it.length;pt<Et;pt++)if(we.isWebGL2){const Mt=it[pt];Ve.update(Mt,st),Ve.bind(Mt,st)}else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.")}return st}function Tt(y,U){y.ambientLightColor.needsUpdate=U,y.lightProbe.needsUpdate=U,y.directionalLights.needsUpdate=U,y.directionalLightShadows.needsUpdate=U,y.pointLights.needsUpdate=U,y.pointLightShadows.needsUpdate=U,y.spotLights.needsUpdate=U,y.spotLightShadows.needsUpdate=U,y.rectAreaLights.needsUpdate=U,y.hemisphereLights.needsUpdate=U}function bt(y){return y.isMeshLambertMaterial||y.isMeshToonMaterial||y.isMeshPhongMaterial||y.isMeshStandardMaterial||y.isShadowMaterial||y.isShaderMaterial&&y.lights===!0}this.getActiveCubeFace=function(){return L},this.getActiveMipmapLevel=function(){return C},this.getRenderTarget=function(){return R},this.setRenderTargetTextures=function(y,U,O){Ue.get(y.texture).__webglTexture=U,Ue.get(y.depthTexture).__webglTexture=O;const k=Ue.get(y);k.__hasExternalTextures=!0,k.__hasExternalTextures&&(k.__autoAllocateDepthBuffer=O===void 0,k.__autoAllocateDepthBuffer||xe.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),k.__useRenderToTexture=!1))},this.setRenderTargetFramebuffer=function(y,U){const O=Ue.get(y);O.__webglFramebuffer=U,O.__useDefaultFramebuffer=U===void 0},this.setRenderTarget=function(y,U=0,O=0){R=y,L=U,C=O;let k=!0,N=null,ce=!1,me=!1;if(y){const Ee=Ue.get(y);Ee.__useDefaultFramebuffer!==void 0?(de.bindFramebuffer(I.FRAMEBUFFER,null),k=!1):Ee.__webglFramebuffer===void 0?b.setupRenderTarget(y):Ee.__hasExternalTextures&&b.rebindTextures(y,Ue.get(y.texture).__webglTexture,Ue.get(y.depthTexture).__webglTexture);const Ie=y.texture;(Ie.isData3DTexture||Ie.isDataArrayTexture||Ie.isCompressedArrayTexture)&&(me=!0);const Ce=Ue.get(y).__webglFramebuffer;y.isWebGLCubeRenderTarget?(Array.isArray(Ce[U])?N=Ce[U][O]:N=Ce[U],ce=!0):we.isWebGL2&&y.samples>0&&b.useMultisampledRTT(y)===!1?N=Ue.get(y).__webglMultisampledFramebuffer:Array.isArray(Ce)?N=Ce[O]:N=Ce,A.copy(y.viewport),V.copy(y.scissor),X=y.scissorTest}else A.copy(J).multiplyScalar(j).floor(),V.copy(ie).multiplyScalar(j).floor(),X=he;if(de.bindFramebuffer(I.FRAMEBUFFER,N)&&we.drawBuffers&&k&&de.drawBuffers(y,N),de.viewport(A),de.scissor(V),de.setScissorTest(X),ce){const Ee=Ue.get(y.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_CUBE_MAP_POSITIVE_X+U,Ee.__webglTexture,O)}else if(me){const Ee=Ue.get(y.texture),Ie=U||0;I.framebufferTextureLayer(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,Ee.__webglTexture,O||0,Ie)}z=-1},this.readRenderTargetPixels=function(y,U,O,k,N,ce,me){if(!(y&&y.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Se=Ue.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&me!==void 0&&(Se=Se[me]),Se){de.bindFramebuffer(I.FRAMEBUFFER,Se);try{const Ee=y.texture,Ie=Ee.format,Ce=Ee.type;if(Ie!==RGBAFormat&&fe.convert(Ie)!==I.getParameter(I.IMPLEMENTATION_COLOR_READ_FORMAT)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}const Le=Ce===HalfFloatType&&(xe.has("EXT_color_buffer_half_float")||we.isWebGL2&&xe.has("EXT_color_buffer_float"));if(Ce!==UnsignedByteType&&fe.convert(Ce)!==I.getParameter(I.IMPLEMENTATION_COLOR_READ_TYPE)&&!(Ce===FloatType&&(we.isWebGL2||xe.has("OES_texture_float")||xe.has("WEBGL_color_buffer_float")))&&!Le){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=y.width-k&&O>=0&&O<=y.height-N&&I.readPixels(U,O,k,N,fe.convert(Ie),fe.convert(Ce),ce)}finally{const Ee=R!==null?Ue.get(R).__webglFramebuffer:null;de.bindFramebuffer(I.FRAMEBUFFER,Ee)}}},this.copyFramebufferToTexture=function(y,U,O=0){const k=Math.pow(2,-O),N=Math.floor(U.image.width*k),ce=Math.floor(U.image.height*k);b.setTexture2D(U,0),I.copyTexSubImage2D(I.TEXTURE_2D,O,0,0,y.x,y.y,N,ce),de.unbindTexture()},this.copyTextureToTexture=function(y,U,O,k=0){const N=U.image.width,ce=U.image.height,me=fe.convert(O.format),Se=fe.convert(O.type);b.setTexture2D(O,0),I.pixelStorei(I.UNPACK_FLIP_Y_WEBGL,O.flipY),I.pixelStorei(I.UNPACK_PREMULTIPLY_ALPHA_WEBGL,O.premultiplyAlpha),I.pixelStorei(I.UNPACK_ALIGNMENT,O.unpackAlignment),U.isDataTexture?I.texSubImage2D(I.TEXTURE_2D,k,y.x,y.y,N,ce,me,Se,U.image.data):U.isCompressedTexture?I.compressedTexSubImage2D(I.TEXTURE_2D,k,y.x,y.y,U.mipmaps[0].width,U.mipmaps[0].height,me,U.mipmaps[0].data):I.texSubImage2D(I.TEXTURE_2D,k,y.x,y.y,me,Se,U.image),k===0&&O.generateMipmaps&&I.generateMipmap(I.TEXTURE_2D),de.unbindTexture()},this.copyTextureToTexture3D=function(y,U,O,k,N=0){if(x.isWebGL1Renderer){console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");return}const ce=y.max.x-y.min.x+1,me=y.max.y-y.min.y+1,Se=y.max.z-y.min.z+1,Ee=fe.convert(k.format),Ie=fe.convert(k.type);let Ce;if(k.isData3DTexture)b.setTexture3D(k,0),Ce=I.TEXTURE_3D;else if(k.isDataArrayTexture||k.isCompressedArrayTexture)b.setTexture2DArray(k,0),Ce=I.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}I.pixelStorei(I.UNPACK_FLIP_Y_WEBGL,k.flipY),I.pixelStorei(I.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),I.pixelStorei(I.UNPACK_ALIGNMENT,k.unpackAlignment);const Le=I.getParameter(I.UNPACK_ROW_LENGTH),je=I.getParameter(I.UNPACK_IMAGE_HEIGHT),nt=I.getParameter(I.UNPACK_SKIP_PIXELS),Ze=I.getParameter(I.UNPACK_SKIP_ROWS),at=I.getParameter(I.UNPACK_SKIP_IMAGES),Xe=O.isCompressedTexture?O.mipmaps[N]:O.image;I.pixelStorei(I.UNPACK_ROW_LENGTH,Xe.width),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,Xe.height),I.pixelStorei(I.UNPACK_SKIP_PIXELS,y.min.x),I.pixelStorei(I.UNPACK_SKIP_ROWS,y.min.y),I.pixelStorei(I.UNPACK_SKIP_IMAGES,y.min.z),O.isDataTexture||O.isData3DTexture?I.texSubImage3D(Ce,N,U.x,U.y,U.z,ce,me,Se,Ee,Ie,Xe.data):O.isCompressedArrayTexture?(console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."),I.compressedTexSubImage3D(Ce,N,U.x,U.y,U.z,ce,me,Se,Ee,Xe.data)):I.texSubImage3D(Ce,N,U.x,U.y,U.z,ce,me,Se,Ee,Ie,Xe),I.pixelStorei(I.UNPACK_ROW_LENGTH,Le),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,je),I.pixelStorei(I.UNPACK_SKIP_PIXELS,nt),I.pixelStorei(I.UNPACK_SKIP_ROWS,Ze),I.pixelStorei(I.UNPACK_SKIP_IMAGES,at),N===0&&k.generateMipmaps&&I.generateMipmap(Ce),de.unbindTexture()},this.initTexture=function(y){y.isCubeTexture?b.setTextureCube(y,0):y.isData3DTexture?b.setTexture3D(y,0):y.isDataArrayTexture||y.isCompressedArrayTexture?b.setTexture2DArray(y,0):b.setTexture2D(y,0),de.unbindTexture()},this.resetState=function(){L=0,C=0,R=null,de.reset(),De.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return WebGLCoordinateSystem}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=e===DisplayP3ColorSpace?"display-p3":"srgb",t.unpackColorSpace=ColorManagement.workingColorSpace===LinearDisplayP3ColorSpace?"display-p3":"srgb"}get outputEncoding(){return console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace===SRGBColorSpace?sRGBEncoding:LinearEncoding}set outputEncoding(e){console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace=e===sRGBEncoding?SRGBColorSpace:LinearSRGBColorSpace}get useLegacyLights(){return console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights}set useLegacyLights(e){console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights=e}}class WebGL1Renderer extends WebGLRenderer{}WebGL1Renderer.prototype.isWebGL1Renderer=!0;class FogExp2{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new Color(e),this.density=t}clone(){return new FogExp2(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class Scene extends Object3D{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t}}class InterleavedBuffer{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=StaticDrawUsage,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.version=0,this.uuid=generateUUID()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return console.warn("THREE.InterleavedBuffer: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,i){e*=this.stride,i*=t.stride;for(let a=0,s=this.stride;a<s;a++)this.array[e+a]=t.array[i+a];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=generateUUID()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(t,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=generateUUID()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const _vector$6=new Vector3;class InterleavedBufferAttribute{constructor(e,t,i,a=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=i,this.normalized=a}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,i=this.data.count;t<i;t++)_vector$6.fromBufferAttribute(this,t),_vector$6.applyMatrix4(e),this.setXYZ(t,_vector$6.x,_vector$6.y,_vector$6.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)_vector$6.fromBufferAttribute(this,t),_vector$6.applyNormalMatrix(e),this.setXYZ(t,_vector$6.x,_vector$6.y,_vector$6.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)_vector$6.fromBufferAttribute(this,t),_vector$6.transformDirection(e),this.setXYZ(t,_vector$6.x,_vector$6.y,_vector$6.z);return this}setX(e,t){return this.normalized&&(t=normalize(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=normalize(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=normalize(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=normalize(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=denormalize(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=denormalize(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=denormalize(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=denormalize(t,this.array)),t}setXY(e,t,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=normalize(t,this.array),i=normalize(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this}setXYZ(e,t,i,a){return e=e*this.data.stride+this.offset,this.normalized&&(t=normalize(t,this.array),i=normalize(i,this.array),a=normalize(a,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=a,this}setXYZW(e,t,i,a,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=normalize(t,this.array),i=normalize(i,this.array),a=normalize(a,this.array),s=normalize(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=a,this.data.array[e+3]=s,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const a=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[a+s])}return new BufferAttribute(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new InterleavedBufferAttribute(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const a=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[a+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class SpriteMaterial extends Material{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Color(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let _geometry$1;const _intersectPoint=new Vector3,_worldScale=new Vector3,_mvPosition=new Vector3,_alignedPosition=new Vector2,_rotatedPosition=new Vector2,_viewWorldMatrix=new Matrix4,_vA=new Vector3,_vB=new Vector3,_vC=new Vector3,_uvA=new Vector2,_uvB=new Vector2,_uvC=new Vector2;class Sprite extends Object3D{constructor(e=new SpriteMaterial){if(super(),this.isSprite=!0,this.type="Sprite",_geometry$1===void 0){_geometry$1=new BufferGeometry;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new InterleavedBuffer(t,5);_geometry$1.setIndex([0,1,2,0,2,3]),_geometry$1.setAttribute("position",new InterleavedBufferAttribute(i,3,0,!1)),_geometry$1.setAttribute("uv",new InterleavedBufferAttribute(i,2,3,!1))}this.geometry=_geometry$1,this.material=e,this.center=new Vector2(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),_worldScale.setFromMatrixScale(this.matrixWorld),_viewWorldMatrix.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),_mvPosition.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&_worldScale.multiplyScalar(-_mvPosition.z);const i=this.material.rotation;let a,s;i!==0&&(s=Math.cos(i),a=Math.sin(i));const l=this.center;transformVertex(_vA.set(-.5,-.5,0),_mvPosition,l,_worldScale,a,s),transformVertex(_vB.set(.5,-.5,0),_mvPosition,l,_worldScale,a,s),transformVertex(_vC.set(.5,.5,0),_mvPosition,l,_worldScale,a,s),_uvA.set(0,0),_uvB.set(1,0),_uvC.set(1,1);let o=e.ray.intersectTriangle(_vA,_vB,_vC,!1,_intersectPoint);if(o===null&&(transformVertex(_vB.set(-.5,.5,0),_mvPosition,l,_worldScale,a,s),_uvB.set(0,1),o=e.ray.intersectTriangle(_vA,_vC,_vB,!1,_intersectPoint),o===null))return;const c=e.ray.origin.distanceTo(_intersectPoint);c<e.near||c>e.far||t.push({distance:c,point:_intersectPoint.clone(),uv:Triangle.getInterpolation(_intersectPoint,_vA,_vB,_vC,_uvA,_uvB,_uvC,new Vector2),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function transformVertex(r,e,t,i,a,s){_alignedPosition.subVectors(r,t).addScalar(.5).multiply(i),a!==void 0?(_rotatedPosition.x=s*_alignedPosition.x-a*_alignedPosition.y,_rotatedPosition.y=a*_alignedPosition.x+s*_alignedPosition.y):_rotatedPosition.copy(_alignedPosition),r.copy(e),r.x+=_rotatedPosition.x,r.y+=_rotatedPosition.y,r.applyMatrix4(_viewWorldMatrix)}class InstancedBufferAttribute extends BufferAttribute{constructor(e,t,i,a=1){super(e,t,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=a}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const _instanceLocalMatrix=new Matrix4,_instanceWorldMatrix=new Matrix4,_instanceIntersects=[],_box3=new Box3,_identity=new Matrix4,_mesh$1=new Mesh,_sphere$3=new Sphere;class InstancedMesh extends Mesh{constructor(e,t,i){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new InstancedBufferAttribute(new Float32Array(i*16),16),this.instanceColor=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let a=0;a<i;a++)this.setMatrixAt(a,_identity)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Box3),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,_instanceLocalMatrix),_box3.copy(e.boundingBox).applyMatrix4(_instanceLocalMatrix),this.boundingBox.union(_box3)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Sphere),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,_instanceLocalMatrix),_sphere$3.copy(e.boundingSphere).applyMatrix4(_instanceLocalMatrix),this.boundingSphere.union(_sphere$3)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}raycast(e,t){const i=this.matrixWorld,a=this.count;if(_mesh$1.geometry=this.geometry,_mesh$1.material=this.material,_mesh$1.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),_sphere$3.copy(this.boundingSphere),_sphere$3.applyMatrix4(i),e.ray.intersectsSphere(_sphere$3)!==!1))for(let s=0;s<a;s++){this.getMatrixAt(s,_instanceLocalMatrix),_instanceWorldMatrix.multiplyMatrices(i,_instanceLocalMatrix),_mesh$1.matrixWorld=_instanceWorldMatrix,_mesh$1.raycast(e,_instanceIntersects);for(let l=0,o=_instanceIntersects.length;l<o;l++){const c=_instanceIntersects[l];c.instanceId=s,c.object=this,t.push(c)}_instanceIntersects.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new InstancedBufferAttribute(new Float32Array(this.instanceMatrix.count*3),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"})}}class LineBasicMaterial extends Material{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Color(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const _start$1=new Vector3,_end$1=new Vector3,_inverseMatrix$1=new Matrix4,_ray$1=new Ray,_sphere$1=new Sphere;class Line extends Object3D{constructor(e=new BufferGeometry,t=new LineBasicMaterial){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[0];for(let a=1,s=t.count;a<s;a++)_start$1.fromBufferAttribute(t,a-1),_end$1.fromBufferAttribute(t,a),i[a]=i[a-1],i[a]+=_start$1.distanceTo(_end$1);e.setAttribute("lineDistance",new Float32BufferAttribute(i,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const i=this.geometry,a=this.matrixWorld,s=e.params.Line.threshold,l=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),_sphere$1.copy(i.boundingSphere),_sphere$1.applyMatrix4(a),_sphere$1.radius+=s,e.ray.intersectsSphere(_sphere$1)===!1)return;_inverseMatrix$1.copy(a).invert(),_ray$1.copy(e.ray).applyMatrix4(_inverseMatrix$1);const o=s/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,h=new Vector3,f=new Vector3,u=new Vector3,d=new Vector3,g=this.isLineSegments?2:1,_=i.index,m=i.attributes.position;if(_!==null){const p=Math.max(0,l.start),E=Math.min(_.count,l.start+l.count);for(let x=p,w=E-1;x<w;x+=g){const L=_.getX(x),C=_.getX(x+1);if(h.fromBufferAttribute(m,L),f.fromBufferAttribute(m,C),_ray$1.distanceSqToSegment(h,f,d,u)>c)continue;d.applyMatrix4(this.matrixWorld);const z=e.ray.origin.distanceTo(d);z<e.near||z>e.far||t.push({distance:z,point:u.clone().applyMatrix4(this.matrixWorld),index:x,face:null,faceIndex:null,object:this})}}else{const p=Math.max(0,l.start),E=Math.min(m.count,l.start+l.count);for(let x=p,w=E-1;x<w;x+=g){if(h.fromBufferAttribute(m,x),f.fromBufferAttribute(m,x+1),_ray$1.distanceSqToSegment(h,f,d,u)>c)continue;d.applyMatrix4(this.matrixWorld);const C=e.ray.origin.distanceTo(d);C<e.near||C>e.far||t.push({distance:C,point:u.clone().applyMatrix4(this.matrixWorld),index:x,face:null,faceIndex:null,object:this})}}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const a=t[i[0]];if(a!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,l=a.length;s<l;s++){const o=a[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}}class PointsMaterial extends Material{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Color(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const _inverseMatrix=new Matrix4,_ray=new Ray,_sphere=new Sphere,_position$2=new Vector3;class Points extends Object3D{constructor(e=new BufferGeometry,t=new PointsMaterial){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const i=this.geometry,a=this.matrixWorld,s=e.params.Points.threshold,l=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),_sphere.copy(i.boundingSphere),_sphere.applyMatrix4(a),_sphere.radius+=s,e.ray.intersectsSphere(_sphere)===!1)return;_inverseMatrix.copy(a).invert(),_ray.copy(e.ray).applyMatrix4(_inverseMatrix);const o=s/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,h=i.index,u=i.attributes.position;if(h!==null){const d=Math.max(0,l.start),g=Math.min(h.count,l.start+l.count);for(let _=d,v=g;_<v;_++){const m=h.getX(_);_position$2.fromBufferAttribute(u,m),testPoint(_position$2,m,c,a,e,t,this)}}else{const d=Math.max(0,l.start),g=Math.min(u.count,l.start+l.count);for(let _=d,v=g;_<v;_++)_position$2.fromBufferAttribute(u,_),testPoint(_position$2,_,c,a,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const a=t[i[0]];if(a!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,l=a.length;s<l;s++){const o=a[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}}function testPoint(r,e,t,i,a,s,l){const o=_ray.distanceSqToPoint(r);if(o<t){const c=new Vector3;_ray.closestPointToPoint(r,c),c.applyMatrix4(i);const h=a.ray.origin.distanceTo(c);if(h<a.near||h>a.far)return;s.push({distance:h,distanceToRay:Math.sqrt(o),point:c,index:e,face:null,object:l})}}class CanvasTexture extends Texture{constructor(e,t,i,a,s,l,o,c,h){super(e,t,i,a,s,l,o,c,h),this.isCanvasTexture=!0,this.needsUpdate=!0}}class CylinderGeometry extends BufferGeometry{constructor(e=1,t=1,i=1,a=32,s=1,l=!1,o=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:a,heightSegments:s,openEnded:l,thetaStart:o,thetaLength:c};const h=this;a=Math.floor(a),s=Math.floor(s);const f=[],u=[],d=[],g=[];let _=0;const v=[],m=i/2;let p=0;E(),l===!1&&(e>0&&x(!0),t>0&&x(!1)),this.setIndex(f),this.setAttribute("position",new Float32BufferAttribute(u,3)),this.setAttribute("normal",new Float32BufferAttribute(d,3)),this.setAttribute("uv",new Float32BufferAttribute(g,2));function E(){const w=new Vector3,L=new Vector3;let C=0;const R=(t-e)/i;for(let z=0;z<=s;z++){const S=[],A=z/s,V=A*(t-e)+e;for(let X=0;X<=a;X++){const ne=X/a,D=ne*c+o,F=Math.sin(D),W=Math.cos(D);L.x=V*F,L.y=-A*i+m,L.z=V*W,u.push(L.x,L.y,L.z),w.set(F,R,W).normalize(),d.push(w.x,w.y,w.z),g.push(ne,1-A),S.push(_++)}v.push(S)}for(let z=0;z<a;z++)for(let S=0;S<s;S++){const A=v[S][z],V=v[S+1][z],X=v[S+1][z+1],ne=v[S][z+1];f.push(A,V,ne),f.push(V,X,ne),C+=6}h.addGroup(p,C,0),p+=C}function x(w){const L=_,C=new Vector2,R=new Vector3;let z=0;const S=w===!0?e:t,A=w===!0?1:-1;for(let X=1;X<=a;X++)u.push(0,m*A,0),d.push(0,A,0),g.push(.5,.5),_++;const V=_;for(let X=0;X<=a;X++){const D=X/a*c+o,F=Math.cos(D),W=Math.sin(D);R.x=S*W,R.y=m*A,R.z=S*F,u.push(R.x,R.y,R.z),d.push(0,A,0),C.x=F*.5+.5,C.y=W*.5*A+.5,g.push(C.x,C.y),_++}for(let X=0;X<a;X++){const ne=L+X,D=V+X;w===!0?f.push(D,D+1,ne):f.push(D+1,D,ne),z+=3}h.addGroup(p,z,w===!0?1:2),p+=z}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new CylinderGeometry(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class SphereGeometry extends BufferGeometry{constructor(e=1,t=32,i=16,a=0,s=Math.PI*2,l=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:a,phiLength:s,thetaStart:l,thetaLength:o},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));const c=Math.min(l+o,Math.PI);let h=0;const f=[],u=new Vector3,d=new Vector3,g=[],_=[],v=[],m=[];for(let p=0;p<=i;p++){const E=[],x=p/i;let w=0;p===0&&l===0?w=.5/t:p===i&&c===Math.PI&&(w=-.5/t);for(let L=0;L<=t;L++){const C=L/t;u.x=-e*Math.cos(a+C*s)*Math.sin(l+x*o),u.y=e*Math.cos(l+x*o),u.z=e*Math.sin(a+C*s)*Math.sin(l+x*o),_.push(u.x,u.y,u.z),d.copy(u).normalize(),v.push(d.x,d.y,d.z),m.push(C+w,1-x),E.push(h++)}f.push(E)}for(let p=0;p<i;p++)for(let E=0;E<t;E++){const x=f[p][E+1],w=f[p][E],L=f[p+1][E],C=f[p+1][E+1];(p!==0||l>0)&&g.push(x,w,C),(p!==i-1||c<Math.PI)&&g.push(w,L,C)}this.setIndex(g),this.setAttribute("position",new Float32BufferAttribute(_,3)),this.setAttribute("normal",new Float32BufferAttribute(v,3)),this.setAttribute("uv",new Float32BufferAttribute(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new SphereGeometry(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class RawShaderMaterial extends ShaderMaterial{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class MeshLambertMaterial extends Material{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Color(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Color(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=TangentSpaceNormalMap,this.normalScale=new Vector2(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=MultiplyOperation,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Light extends Object3D{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Color(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),t}}class HemisphereLight extends Light{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Object3D.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Color(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const _projScreenMatrix$1=new Matrix4,_lightPositionWorld$1=new Vector3,_lookTarget$1=new Vector3;class LightShadow{constructor(e){this.camera=e,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Vector2(512,512),this.map=null,this.mapPass=null,this.matrix=new Matrix4,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Frustum,this._frameExtents=new Vector2(1,1),this._viewportCount=1,this._viewports=[new Vector4(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,i=this.matrix;_lightPositionWorld$1.setFromMatrixPosition(e.matrixWorld),t.position.copy(_lightPositionWorld$1),_lookTarget$1.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(_lookTarget$1),t.updateMatrixWorld(),_projScreenMatrix$1.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(_projScreenMatrix$1),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(_projScreenMatrix$1)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const _projScreenMatrix=new Matrix4,_lightPositionWorld=new Vector3,_lookTarget=new Vector3;class PointLightShadow extends LightShadow{constructor(){super(new PerspectiveCamera(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new Vector2(4,2),this._viewportCount=6,this._viewports=[new Vector4(2,1,1,1),new Vector4(0,1,1,1),new Vector4(3,1,1,1),new Vector4(1,1,1,1),new Vector4(3,0,1,1),new Vector4(1,0,1,1)],this._cubeDirections=[new Vector3(1,0,0),new Vector3(-1,0,0),new Vector3(0,0,1),new Vector3(0,0,-1),new Vector3(0,1,0),new Vector3(0,-1,0)],this._cubeUps=[new Vector3(0,1,0),new Vector3(0,1,0),new Vector3(0,1,0),new Vector3(0,1,0),new Vector3(0,0,1),new Vector3(0,0,-1)]}updateMatrices(e,t=0){const i=this.camera,a=this.matrix,s=e.distance||i.far;s!==i.far&&(i.far=s,i.updateProjectionMatrix()),_lightPositionWorld.setFromMatrixPosition(e.matrixWorld),i.position.copy(_lightPositionWorld),_lookTarget.copy(i.position),_lookTarget.add(this._cubeDirections[t]),i.up.copy(this._cubeUps[t]),i.lookAt(_lookTarget),i.updateMatrixWorld(),a.makeTranslation(-_lightPositionWorld.x,-_lightPositionWorld.y,-_lightPositionWorld.z),_projScreenMatrix.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),this._frustum.setFromProjectionMatrix(_projScreenMatrix)}}class PointLight extends Light{constructor(e,t,i=0,a=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=a,this.shadow=new PointLightShadow}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class DirectionalLightShadow extends LightShadow{constructor(){super(new OrthographicCamera(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class DirectionalLight extends Light{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Object3D.DEFAULT_UP),this.updateMatrix(),this.target=new Object3D,this.shadow=new DirectionalLightShadow}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class InstancedBufferGeometry extends BufferGeometry{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(e){return super.copy(e),this.instanceCount=e.instanceCount,this}toJSON(){const e=super.toJSON();return e.instanceCount=this.instanceCount,e.isInstancedBufferGeometry=!0,e}}class Clock{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=now();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}function now(){return(typeof performance>"u"?Date:performance).now()}class Raycaster{constructor(e,t,i=0,a=1/0){this.ray=new Ray(e,t),this.near=i,this.far=a,this.camera=null,this.layers=new Layers,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}intersectObject(e,t=!0,i=[]){return intersectObject(e,this,i,t),i.sort(ascSort),i}intersectObjects(e,t=!0,i=[]){for(let a=0,s=e.length;a<s;a++)intersectObject(e[a],this,i,t);return i.sort(ascSort),i}}function ascSort(r,e){return r.distance-e.distance}function intersectObject(r,e,t,i){if(r.layers.test(e.layers)&&r.raycast(e,t),i===!0){const a=r.children;for(let s=0,l=a.length;s<l;s++)intersectObject(a[s],e,t,!0)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:REVISION}})),typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=REVISION);const CopyShader={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class Pass{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const _camera=new OrthographicCamera(-1,1,1,-1,0,1);class FullscreenTriangleGeometry extends BufferGeometry{constructor(){super(),this.setAttribute("position",new Float32BufferAttribute([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Float32BufferAttribute([0,2,0,0,2,0],2))}}const _geometry=new FullscreenTriangleGeometry;class FullScreenQuad{constructor(e){this._mesh=new Mesh(_geometry,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,_camera)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class ShaderPass extends Pass{constructor(e,t){super(),this.textureID=t!==void 0?t:"tDiffuse",e instanceof ShaderMaterial?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=UniformsUtils.clone(e.uniforms),this.material=new ShaderMaterial({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this.fsQuad=new FullScreenQuad(this.material)}render(e,t,i){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=i.texture),this.fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class MaskPass extends Pass{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,i){const a=e.getContext(),s=e.state;s.buffers.color.setMask(!1),s.buffers.depth.setMask(!1),s.buffers.color.setLocked(!0),s.buffers.depth.setLocked(!0);let l,o;this.inverse?(l=0,o=1):(l=1,o=0),s.buffers.stencil.setTest(!0),s.buffers.stencil.setOp(a.REPLACE,a.REPLACE,a.REPLACE),s.buffers.stencil.setFunc(a.ALWAYS,l,4294967295),s.buffers.stencil.setClear(o),s.buffers.stencil.setLocked(!0),e.setRenderTarget(i),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),s.buffers.color.setLocked(!1),s.buffers.depth.setLocked(!1),s.buffers.color.setMask(!0),s.buffers.depth.setMask(!0),s.buffers.stencil.setLocked(!1),s.buffers.stencil.setFunc(a.EQUAL,1,4294967295),s.buffers.stencil.setOp(a.KEEP,a.KEEP,a.KEEP),s.buffers.stencil.setLocked(!0)}}class ClearMaskPass extends Pass{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class EffectComposer{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const i=e.getSize(new Vector2);this._width=i.width,this._height=i.height,t=new WebGLRenderTarget(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:HalfFloatType}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new ShaderPass(CopyShader),this.copyPass.material.blending=NoBlending,this.clock=new Clock}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){e===void 0&&(e=this.clock.getDelta());const t=this.renderer.getRenderTarget();let i=!1;for(let a=0,s=this.passes.length;a<s;a++){const l=this.passes[a];if(l.enabled!==!1){if(l.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(a),l.render(this.renderer,this.writeBuffer,this.readBuffer,e,i),l.needsSwap){if(i){const o=this.renderer.getContext(),c=this.renderer.state.buffers.stencil;c.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),c.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}MaskPass!==void 0&&(l instanceof MaskPass?i=!0:l instanceof ClearMaskPass&&(i=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new Vector2);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const i=this._width*this._pixelRatio,a=this._height*this._pixelRatio;this.renderTarget1.setSize(i,a),this.renderTarget2.setSize(i,a);for(let s=0;s<this.passes.length;s++)this.passes[s].setSize(i,a)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class RenderPass extends Pass{constructor(e,t,i=null,a=null,s=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=i,this.clearColor=a,this.clearAlpha=s,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new Color}render(e,t,i){const a=e.autoClear;e.autoClear=!1;let s,l;this.overrideMaterial!==null&&(l=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor)),this.clearAlpha!==null&&(s=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:i),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(s),this.overrideMaterial!==null&&(this.scene.overrideMaterial=l),e.autoClear=a}}const LuminosityHighPassShader={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new Color(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			vec3 luma = vec3( 0.299, 0.587, 0.114 );

			float v = dot( texel.xyz, luma );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class UnrealBloomPass extends Pass{constructor(e,t,i,a){super(),this.strength=t!==void 0?t:1,this.radius=i,this.threshold=a,this.resolution=e!==void 0?new Vector2(e.x,e.y):new Vector2(256,256),this.clearColor=new Color(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let s=Math.round(this.resolution.x/2),l=Math.round(this.resolution.y/2);this.renderTargetBright=new WebGLRenderTarget(s,l,{type:HalfFloatType}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let u=0;u<this.nMips;u++){const d=new WebGLRenderTarget(s,l,{type:HalfFloatType});d.texture.name="UnrealBloomPass.h"+u,d.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(d);const g=new WebGLRenderTarget(s,l,{type:HalfFloatType});g.texture.name="UnrealBloomPass.v"+u,g.texture.generateMipmaps=!1,this.renderTargetsVertical.push(g),s=Math.round(s/2),l=Math.round(l/2)}const o=LuminosityHighPassShader;this.highPassUniforms=UniformsUtils.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=a,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new ShaderMaterial({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];const c=[3,5,7,9,11];s=Math.round(this.resolution.x/2),l=Math.round(this.resolution.y/2);for(let u=0;u<this.nMips;u++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(c[u])),this.separableBlurMaterials[u].uniforms.invSize.value=new Vector2(1/s,1/l),s=Math.round(s/2),l=Math.round(l/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;const h=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=h,this.bloomTintColors=[new Vector3(1,1,1),new Vector3(1,1,1),new Vector3(1,1,1),new Vector3(1,1,1),new Vector3(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;const f=CopyShader;this.copyUniforms=UniformsUtils.clone(f.uniforms),this.blendMaterial=new ShaderMaterial({uniforms:this.copyUniforms,vertexShader:f.vertexShader,fragmentShader:f.fragmentShader,blending:AdditiveBlending,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new Color,this.oldClearAlpha=1,this.basic=new MeshBasicMaterial,this.fsQuad=new FullScreenQuad(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(e,t){let i=Math.round(e/2),a=Math.round(t/2);this.renderTargetBright.setSize(i,a);for(let s=0;s<this.nMips;s++)this.renderTargetsHorizontal[s].setSize(i,a),this.renderTargetsVertical[s].setSize(i,a),this.separableBlurMaterials[s].uniforms.invSize.value=new Vector2(1/i,1/a),i=Math.round(i/2),a=Math.round(a/2)}render(e,t,i,a,s){e.getClearColor(this._oldClearColor),this.oldClearAlpha=e.getClearAlpha();const l=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),s&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=i.texture,e.setRenderTarget(null),e.clear(),this.fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=i.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this.fsQuad.render(e);let o=this.renderTargetBright;for(let c=0;c<this.nMips;c++)this.fsQuad.material=this.separableBlurMaterials[c],this.separableBlurMaterials[c].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[c].uniforms.direction.value=UnrealBloomPass.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[c]),e.clear(),this.fsQuad.render(e),this.separableBlurMaterials[c].uniforms.colorTexture.value=this.renderTargetsHorizontal[c].texture,this.separableBlurMaterials[c].uniforms.direction.value=UnrealBloomPass.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[c]),e.clear(),this.fsQuad.render(e),o=this.renderTargetsVertical[c];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this.fsQuad.render(e),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,s&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(i),this.fsQuad.render(e)),e.setClearColor(this._oldClearColor,this.oldClearAlpha),e.autoClear=l}getSeperableBlurMaterial(e){const t=[];for(let i=0;i<e;i++)t.push(.39894*Math.exp(-.5*i*i/(e*e))/e);return new ShaderMaterial({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new Vector2(.5,.5)},direction:{value:new Vector2(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`})}getCompositeMaterial(e){return new ShaderMaterial({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`})}}UnrealBloomPass.BlurDirectionX=new Vector2(1,0),UnrealBloomPass.BlurDirectionY=new Vector2(0,1);const OutputShader={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`
	
		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = OptimizedCineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};class OutputPass extends Pass{constructor(){super();const e=OutputShader;this.uniforms=UniformsUtils.clone(e.uniforms),this.material=new RawShaderMaterial({name:e.name,uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader}),this.fsQuad=new FullScreenQuad(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,i){this.uniforms.tDiffuse.value=i.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},ColorManagement.getTransfer(this._outputColorSpace)===SRGBTransfer&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===LinearToneMapping?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===ReinhardToneMapping?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===CineonToneMapping?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===ACESFilmicToneMapping?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===AgXToneMapping&&(this.material.defines.AGX_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}const PG={ready:!1,paused:!1,audio:!0,language:"en"};let pgSaved=null;try{await window.bridge.initialize(),PG.ready=!0,PG.language=(window.bridge.platform.language||"en").slice(0,2).toLowerCase(),PG.audio=window.bridge.platform.isAudioEnabled!==!1;const r=await window.bridge.storage.get(["luchnik_save"]);pgSaved=r&&r[0]?JSON.parse(r[0]):null,window.bridge.platform.on(window.bridge.EVENT_NAME.PAUSE_STATE_CHANGED,e=>{PG.paused=!!e,typeof AU<"u"&&AU.ctx&&(PG.paused?AU.ctx.suspend():PG.audio&&!document.hidden&&AU.ctx.resume())}),window.bridge.platform.on(window.bridge.EVENT_NAME.AUDIO_STATE_CHANGED,e=>{PG.audio=!!e,typeof AU<"u"&&AU.ctx&&(PG.audio?!PG.paused&&!document.hidden&&AU.ctx.resume():AU.ctx.suspend())})}catch(r){console.warn("Bridge initialization:",r)}document.addEventListener("visibilitychange",()=>{typeof AU<"u"&&AU.ctx&&(document.hidden?AU.ctx.suspend():PG.audio&&!PG.paused&&AU.ctx.resume())});function pgInterstitial(){PG.ready&&window.bridge.advertisement.isInterstitialSupported&&Promise.resolve(window.bridge.advertisement.showInterstitial("game_over")).catch(()=>{})}const ruDict={"ARCHER<br>IN THE FOG":"ЛУЧНИК<br>В ТУМАНЕ","Hit the dragon before it gets angry. Otherwise it destroys your tower, and you fall to the next.":"Попади в дракона, пока он не рассвирепел. Не успеешь — он разнесёт башню, и ты рухнешь на следующую.",PLAY:"ИГРАТЬ",GALLERY:"АССЕТЫ",WEAPONS:"ОРУЖИЕ",FIGHT:"В БОЙ",RETRY:"СНОВА",RAGE:"ЯРОСТЬ",DRAGON:"ДРАКОН","THE DRAGON<br>WON":"ДРАКОН<br>ПОБЕДИЛ",MENU:"МЕНЮ","Tap or hold to fire arrows":"Нажми или держи палец — лучник стреляет туда"},localeEls=["#menu h1","#menu p","#bPlay","#bGal","#over h1","#bRetry","#bOvMenu","#bShop","#shClose","#bottom .lbl","#top .lbl","#hint"],origLocale=new Map(localeEls.map(r=>[r,document.querySelector(r)?.innerHTML]));function setLang(r){PG.language=r;for(const e of localeEls){const t=document.querySelector(e),i=origLocale.get(e);t&&i&&(t.innerHTML=r==="ru"&&ruDict[i]||i)}}document.getElementById("lang").onclick=()=>setLang(PG.language==="ru"?"en":"ru"),setLang(PG.language==="ru"?"ru":"en");const $=r=>document.getElementById(r),V3=Vector3;function rng(r){let e=r>>>0;return()=>{e|=0,e=e+1831565813|0;let t=Math.imul(e^e>>>15,1|e);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}const damp=(r,e,t,i)=>r+(e-r)*(1-Math.exp(-t*i)),dampV=(r,e,t,i)=>r.lerp(e,1-Math.exp(-t*i)),clamp=MathUtils.clamp,FOG_HEX=5666744,TS=16,NT=8,T={STONE:0,COBBLE:1,MOSS:2,SNOW:3,SNOWSIDE:4,RUST:5,PLANK:6,DEEP:7},TILE_NAMES=["Камень","Булыжник","Мшистый булыжник","Снег","Камень под снегом","Ржавая земля","Тёмные доски","Глубинный кирпич"];function makeAtlas(){const r=TS*NT,e=document.createElement("canvas");e.width=r,e.height=TS;const t=e.getContext("2d"),i=t.createImageData(r,TS),a=i.data,s=rng(11),l=u=>u<0?0:u>255?255:u|0,o=(u,d,g,_,v,m)=>{const p=(g*r+u*TS+d)*4;a[p]=l(_),a[p+1]=l(v),a[p+2]=l(m),a[p+3]=255},c=(u,d,g)=>{const _=[];for(let v=0;v<7;v++)_.push([s()*16,s()*16,(s()-.5)*34]);for(let v=0;v<16;v++)for(let m=0;m<16;m++){let p=1e9,E=1e9,x=0;for(let L=0;L<7;L++)for(const C of[-16,0,16])for(const R of[-16,0,16]){const z=m-_[L][0]-C,S=v-_[L][1]-R,A=Math.hypot(z,S);A<p?(E=p,p=A,x=L):A<E&&(E=A)}if(E-p<1.25){const L=d-58+(s()-.5)*10;o(u,m,v,L,L+3,L+12);continue}let w=d+_[x][2]+(s()-.5)*16-p*2.2;if(g&&s()<.42&&(v<9||s()<.3)){o(u,m,v,w*.62,w*.85,w*.55);continue}o(u,m,v,w,w+5,w+16)}};for(let u=0;u<16;u++)for(let d=0;d<16;d++){let g=122+(s()-.5)*22;(u*7+d*3)%23==0&&(g-=26),o(0,d,u,g,g+5,g+15)}c(1,132,!1),c(2,126,!0);for(let u=0;u<16;u++)for(let d=0;d<16;d++){const g=228+(s()-.5)*14;o(3,d,u,g-6,g-1,g+8)}const h=[];for(let u=0;u<16;u++)h.push(2+(s()*4|0));for(let u=0;u<16;u++)for(let d=0;d<16;d++)if(u<h[d]){const g=226+(s()-.5)*12;o(4,d,u,g-6,g,g+8)}else{let g=124+(s()-.5)*24;((d>>2)+(u>>2))%3==0&&(g-=10),o(4,d,u,g,g+5,g+16)}for(let u=0;u<16;u++)for(let d=0;d<16;d++){const g=s();let _=[112,64,58];g<.18?_=[72,36,36]:g<.32?_=[150,92,80]:g<.4&&(_=[94,82,92]);const v=(s()-.5)*18;o(5,d,u,_[0]+v,_[1]+v,_[2]+v)}for(let u=0;u<16;u++)for(let d=0;d<16;d++){let g=(s()-.5)*14;u%4==3&&(g-=22),(d+(u>>2)*5)%9==0&&u%4!=3&&(g-=14),o(6,d,u,74+g,55+g,42+g)}for(let u=0;u<16;u++)for(let d=0;d<16;d++){const g=u>>2,_=(g&1)*4;let v=66+(s()-.5)*14;(u%4==3||(d+_)%8==7)&&(v=42),o(7,d,u,v,v+3,v+12)}t.putImageData(i,0,0);const f=new CanvasTexture(e);return f.magFilter=f.minFilter=NearestFilter,f.generateMipmaps=!1,f.colorSpace=SRGBColorSpace,f}function pixTex(r,e,t,i=16,a){const s=document.createElement("canvas");s.width=s.height=i;const l=s.getContext("2d"),o=l.createImageData(i,i),c=rng(r);for(let f=0;f<i;f++)for(let u=0;u<i;u++){const d=(f*i+u)*4;let g=e;const _=c();a==="scale"?g=(u+(f>>2&1)*2)%4==0||f%4==0?t[0]:_<.12?t[1]:e:g=_<.14?t[0]:_<.22?t[1]:e;const v=(c()-.5)*10;o.data[d]=g[0]+v,o.data[d+1]=g[1]+v,o.data[d+2]=g[2]+v,o.data[d+3]=255}l.putImageData(o,0,0);const h=new CanvasTexture(s);return h.magFilter=h.minFilter=NearestFilter,h.generateMipmaps=!1,h.colorSpace=SRGBColorSpace,h}const atlas=makeAtlas(),blockMat=new MeshLambertMaterial({map:atlas});blockMat.onBeforeCompile=r=>{r.vertexShader=r.vertexShader.replace("#include <common>",`#include <common>
attribute float aSide;
attribute float aTop;`).replace("#include <uv_vertex>",`#include <uv_vertex>
    { float tl = normal.y>0.5 ? aTop : (normal.y<-0.5 ? (aSide==4.0?0.0:aSide) : aSide);
      vMapUv = vec2((uv.x*0.98+0.01 + tl)/${NT}.0, uv.y); }`)};const canvas=$("c"),renderer=new WebGLRenderer({canvas,antialias:!1,powerPreference:"high-performance"}),PR=Math.min(window.devicePixelRatio||1,2);renderer.setPixelRatio(PR),renderer.toneMapping=ACESFilmicToneMapping,renderer.toneMappingExposure=1;const camera=new PerspectiveCamera(62,innerWidth/innerHeight,.1,1200),scene=new Scene,gScene=new Scene,composer=new EffectComposer(renderer);composer.setPixelRatio(PR*.82);const renderPass=new RenderPass(scene,camera);composer.addPass(renderPass);const bloom=new UnrealBloomPass(new Vector2(256,256),.7,.55,.93);composer.addPass(bloom);const post=new ShaderPass({uniforms:{tDiffuse:{value:null},uTime:{value:0},uAberr:{value:1},uGrain:{value:.05},uGlitch:{value:0},uVig:{value:.5},uRes:{value:new Vector2(1,1)},uDanger:{value:0}},vertexShader:"varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",fragmentShader:`uniform sampler2D tDiffuse;uniform float uTime,uAberr,uGrain,uGlitch,uVig,uDanger;uniform vec2 uRes;varying vec2 vUv;
  float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  void main(){
    vec2 uv=vUv;
    float band=floor(uv.y*38.0);float tk=floor(uTime*18.0);
    float g=step(1.0-uGlitch*0.22,h(vec2(band,tk)));
    uv.x+=g*(h(vec2(band,tk+3.0))-0.5)*0.09*uGlitch;
    vec2 d=uv-0.5;float r=dot(d,d);
    float ab=uAberr*(0.0025+r*0.03)+g*0.01;
    vec3 c=vec3(texture2D(tDiffuse,uv+d*ab).r,texture2D(tDiffuse,uv).g,texture2D(tDiffuse,uv-d*ab).b);
    c=mix(c,c*vec3(0.9,1.0,1.14),0.4);
    c*=1.0-uVig*smoothstep(0.12,0.75,r*1.7);
    c=mix(c,c*vec3(0.75,0.8,1.05),uDanger*smoothstep(0.05,0.6,r*1.7));
    c+=(h(uv*uRes+fract(uTime*7.31)*91.0)-0.5)*uGrain;
    gl_FragColor=vec4(c,1.0);
  }`});composer.addPass(post),composer.addPass(new OutputPass);let ptScale=400;function resize(){const r=innerWidth,e=innerHeight;renderer.setSize(r,e,!1),composer.setSize(r,e),camera.aspect=r/e,camera.fov=r<e?74:58,camera.updateProjectionMatrix(),post.uniforms.uRes.value.set(r*PR*.82,e*PR*.82),ptScale=e*PR*.82/(2*Math.tan(MathUtils.degToRad(camera.fov)/2))}addEventListener("resize",resize),resize(),document.addEventListener("touchmove",r=>r.preventDefault(),{passive:!1}),document.addEventListener("gesturestart",r=>r.preventDefault());const NOISE=`float hh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hh(i),hh(i+vec2(1,0)),f.x),mix(hh(i+vec2(0,1)),hh(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*vn(p);p*=2.03;a*=.5;}return s;}`;function makeSky(){const r=new ShaderMaterial({uniforms:{uHor:{value:new Color(FOG_HEX)},uTop:{value:new Color(8824543)},uLow:{value:new Color(4152470)},uSun:{value:new Color(13229311)},uDir:{value:new V3(-.45,.75,.35).normalize()},uTime:{value:0}},vertexShader:"varying vec3 vD;void main(){vD=normalize(position);vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position=p.xyww;}",fragmentShader:`uniform vec3 uHor,uTop,uLow,uSun,uDir;uniform float uTime;varying vec3 vD;${NOISE}
    void main(){vec3 d=normalize(vD);float h=d.y;vec3 c=mix(uHor,uTop,smoothstep(0.02,0.75,h));c=mix(c,uLow,smoothstep(-0.02,-0.7,h));
      float s=max(dot(d,uDir),0.);c+=uSun*(pow(s,5.)*.22+pow(s,40.)*.35);
      float cl=fbm(d.xz/(abs(d.y)+.35)*2.2+vec2(uTime*.01,0.));c=mix(c,c*1.12,smoothstep(.45,.8,cl)*smoothstep(0.,.4,h));
      gl_FragColor=vec4(c,1.);}`,side:BackSide,depthWrite:!1,depthTest:!1,fog:!1}),e=new Mesh(new SphereGeometry(800,32,16),r);return e.renderOrder=-10,e.frustumCulled=!1,e}function makeSpecks(r){const e=new BufferGeometry,t=new Float32Array(r*3),i=new Float32Array(r*3),a=rng(5);for(let o=0;o<r*3;o++)i[o]=a();e.setAttribute("position",new BufferAttribute(t,3)),e.setAttribute("aSeed",new BufferAttribute(i,3));const s=new ShaderMaterial({uniforms:{uTime:{value:0},uC:{value:new V3},uScale:{value:400},uWind:{value:1},uDrift:{value:0},uAmt:{value:1}},vertexShader:`attribute vec3 aSeed;uniform float uTime,uScale,uWind,uDrift,uAmt;uniform vec3 uC;varying float vA;varying float vS;
    void main(){vec3 B=vec3(70.,50.,70.);vec3 p=aSeed*B;
      p.y-=uTime*(1.2+aSeed.x*2.6);p.x+=uDrift+sin(uTime*.5+aSeed.z*30.)*1.5;p.z+=cos(uTime*.37+aSeed.y*20.)*1.2;
      vec3 o=uC-B*.5;p=o+mod(p-o,B);
      vec4 mv=viewMatrix*vec4(p,1.);float z=-mv.z;
      gl_PointSize=(0.05+aSeed.y*0.09)*(.6+uAmt*.4)*uScale/max(z,.1);gl_Position=projectionMatrix*mv;
      vA=smoothstep(48.,6.,z)*smoothstep(.6,2.5,z)*min(1.,uAmt)*step(aSeed.x,.35+uAmt*.25);vS=aSeed.z;}`,fragmentShader:"varying float vA;varying float vS;void main(){vec3 c=vS>.62?vec3(.86,.92,1.):vec3(.13,.16,.24);gl_FragColor=vec4(c,vA*(vS>.62?.8:.75));}",transparent:!0,depthWrite:!1,fog:!1}),l=new Points(e,s);return l.frustumCulled=!1,l}function fogSheetMat(r,e){return new ShaderMaterial({uniforms:{uTime:{value:0},uOp:{value:e},uCol:{value:new Color(7574479)},uV:{value:r?1:0},uSeed:{value:Math.random()*50}},vertexShader:"varying vec2 vUv;varying vec3 vW;void main(){vUv=uv;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}",fragmentShader:`uniform float uTime,uOp,uV,uSeed;uniform vec3 uCol;varying vec2 vUv;varying vec3 vW;${NOISE}
    void main(){vec2 q=uV>.5?vec2(vUv.x*3.+uSeed,vUv.y*1.2)+vec2(uTime*.03,0.):vW.xz*.022+vec2(uTime*.012,uTime*.006)+uSeed;
      float n=fbm(q+fbm(q*1.7+uTime*.04)*.8);float a=smoothstep(.32,.82,n);
      float e=uV>.5?smoothstep(0.,.3,vUv.x)*smoothstep(1.,.7,vUv.x)*smoothstep(0.,.35,vUv.y)*smoothstep(1.,.6,vUv.y):smoothstep(.5,.22,length(vUv-.5));
      gl_FragColor=vec4(uCol*(.95+n*.15),a*e*uOp);}`,transparent:!0,depthWrite:!1,side:DoubleSide,fog:!1})}function makeAtmosphere(r,e){r.fog=new FogExp2(FOG_HEX,.026),r.background=new Color(FOG_HEX),r.add(new HemisphereLight(12900095,2240590,1.35));const t=new DirectionalLight(14871807,.85);t.position.set(-45,75,35),r.add(t);const i=makeSky();r.add(i);const a=makeSpecks(e?1800:900);r.add(a);const s=[],l=e?3:1;for(let c=0;c<l;c++){const h=new Mesh(new PlaneGeometry(420,420),fogSheetMat(!1,.55-c*.1));h.rotation.x=-Math.PI/2,h.userData={off:-9-c*7,h:!0},r.add(h),s.push(h)}const o=e?6:3;for(let c=0;c<o;c++){const h=new Mesh(new PlaneGeometry(70,26),fogSheetMat(!0,.28));h.userData={a:c/o*Math.PI*2,r:26+c%3*14,off:-4+c%2*6,h:!1,sp:.02+c%3*.01},r.add(h),s.push(h)}return{sky:i,specks:a,sheets:s}}function updateAtmosphere(r,e,t,i){r.sky.position.copy(i.position),r.sky.material.uniforms.uTime.value=e,r.specks.material.uniforms.uTime.value=e,r.specks.material.uniforms.uC.value.copy(i.position),r.specks.material.uniforms.uScale.value=ptScale;for(const a of r.sheets){a.material.uniforms.uTime.value=e;const s=a.userData;if(s.h)a.position.set(t.x,t.y+s.off+Math.sin(e*.2+s.off)*.6,t.z);else{s.a+=s.sp*.016;const l=s.a;a.position.set(t.x+Math.cos(l)*s.r,t.y+s.off+Math.sin(e*.3+l)*1.5,t.z+Math.sin(l)*s.r),a.lookAt(i.position.x,a.position.y,i.position.z)}}}const atmo=makeAtmosphere(scene,!0),gAtmo=makeAtmosphere(gScene,!1);class PointPool{constructor(e,t,i,a){this.cap=t,this.i=0;const s=new BufferGeometry;this.pos=new Float32Array(t*3),this.size=new Float32Array(t),this.alpha=new Float32Array(t),this.col=new Float32Array(t*3),this.vel=new Float32Array(t*3),this.life=new Float32Array(t),this.max=new Float32Array(t),this.s0=new Float32Array(t),this.grow=new Float32Array(t),this.grav=new Float32Array(t),s.setAttribute("position",new BufferAttribute(this.pos,3)),s.setAttribute("aSize",new BufferAttribute(this.size,1)),s.setAttribute("aAlpha",new BufferAttribute(this.alpha,1)),s.setAttribute("aColor",new BufferAttribute(this.col,3)),this.mat=new ShaderMaterial({uniforms:{uScale:{value:400}},vertexShader:`attribute float aSize,aAlpha;attribute vec3 aColor;uniform float uScale;varying float vA;varying vec3 vC;
      void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=aSize*uScale/max(-mv.z,.1);gl_Position=projectionMatrix*mv;vA=aAlpha;vC=aColor;}`,fragmentShader:a?"varying float vA;varying vec3 vC;void main(){gl_FragColor=vec4(vC,vA);}":"varying float vA;varying vec3 vC;void main(){float r=length(gl_PointCoord-.5);float a=smoothstep(.5,.0,r);gl_FragColor=vec4(vC,a*a*vA);}",transparent:!0,depthWrite:!1,blending:i?AdditiveBlending:NormalBlending,fog:!1}),this.pts=new Points(s,this.mat),this.pts.frustumCulled=!1,e.add(this.pts),this.g=s,this.active=0}spawn(e,t,i,a,s,l=0,o=0){const c=this.i;this.i=(this.i+1)%this.cap,this.pos.set([e.x,e.y,e.z],c*3),this.vel.set([t.x,t.y,t.z],c*3),this.s0[c]=i,this.size[c]=i,this.life[c]=a,this.max[c]=a,this.grow[c]=l,this.grav[c]=o,this.col.set([s.r,s.g,s.b],c*3),this.alpha[c]=1,this.active=3}update(e){if(this.active<=0)return;let t=!1;for(let i=0;i<this.cap;i++){if(this.life[i]<=0){this.alpha[i]!==0&&(this.alpha[i]=0);continue}t=!0,this.life[i]-=e;const a=i*3;this.vel[a+1]-=this.grav[i]*e;const s=Math.exp(-1.6*e);this.vel[a]*=s,this.vel[a+1]*=s,this.vel[a+2]*=s,this.pos[a]+=this.vel[a]*e,this.pos[a+1]+=this.vel[a+1]*e,this.pos[a+2]+=this.vel[a+2]*e;const l=Math.max(this.life[i]/this.max[i],0);this.alpha[i]=Math.min(1,l*2.2)*Math.min(1,(1-l)*10+.2),this.size[i]=this.s0[i]*(1+this.grow[i]*(1-l))}t||this.active--,this.g.attributes.position.needsUpdate=!0,this.g.attributes.aSize.needsUpdate=!0,this.g.attributes.aAlpha.needsUpdate=!0,this.g.attributes.aColor.needsUpdate=!0,this.mat.uniforms.uScale.value=ptScale}}const dust=new PointPool(scene,260,!1,!1),sparks=new PointPool(scene,400,!0,!0),gDust=new PointPool(gScene,160,!1,!1);class Debris{constructor(e,t,i=blockMat){this.cap=t,this.i=0;const a=new BoxGeometry(1,1,1);this.aS=new InstancedBufferAttribute(new Float32Array(t),1),this.aT=new InstancedBufferAttribute(new Float32Array(t),1),this.aS.setUsage(DynamicDrawUsage),this.aT.setUsage(DynamicDrawUsage),a.setAttribute("aSide",this.aS),a.setAttribute("aTop",this.aT),this.mesh=new InstancedMesh(a,i,t),this.mesh.frustumCulled=!1,this.mesh.instanceMatrix.setUsage(DynamicDrawUsage);const s=new Color(1,1,1),l=new Matrix4().makeScale(0,0,0);for(let o=0;o<t;o++)this.mesh.setMatrixAt(o,l),this.mesh.setColorAt(o,s);e.add(this.mesh),this.p=new Float32Array(t*3),this.v=new Float32Array(t*3),this.r=new Float32Array(t*3),this.w=new Float32Array(t*3),this.l=new Float32Array(t),this.s=new Float32Array(t),this.live=0,this._m=new Matrix4,this._q=new Quaternion,this._e=new Euler,this._p=new V3,this._s=new V3}spawn(e,t,i,a,s,l,o,c,h,f=1){const u=this.i;this.i=(this.i+1)%this.cap,this.p.set([e,t,i],u*3),this.v.set([a,s,l],u*3),this.r.set([0,0,0],u*3),this.w.set([(Math.random()-.5)*9,(Math.random()-.5)*9,(Math.random()-.5)*9],u*3),this.l[u]=h,this.s[u]=f,this.aS.array[u]=o,this.aT.array[u]=c,this.aS.needsUpdate=this.aT.needsUpdate=!0,this.live=Math.max(this.live,h+1)}update(e){if(this.live<=0)return;this.live-=e;const t=this._m;for(let i=0;i<this.cap;i++){const a=i*3;if(this.l[i]<=0){this.s[i]!==0&&(this.s[i]=0,t.makeScale(0,0,0),this.mesh.setMatrixAt(i,t));continue}this.l[i]-=e,this.v[a+1]-=21*e;const s=Math.exp(-.25*e);this.v[a]*=s,this.v[a+2]*=s,this.p[a]+=this.v[a]*e,this.p[a+1]+=this.v[a+1]*e,this.p[a+2]+=this.v[a+2]*e,this.r[a]+=this.w[a]*e,this.r[a+1]+=this.w[a+1]*e,this.r[a+2]+=this.w[a+2]*e;const l=this.s[i]*Math.min(1,this.l[i]/.6);this._e.set(this.r[a],this.r[a+1],this.r[a+2]),this._q.setFromEuler(this._e),this._p.set(this.p[a],this.p[a+1],this.p[a+2]),this._s.setScalar(l),t.compose(this._p,this._q,this._s),this.mesh.setMatrixAt(i,t)}this.mesh.instanceMatrix.needsUpdate=!0}}const debris=new Debris(scene,2400),gDebris=new Debris(gScene,900);function genTower(r,e,t){const i=rng(r),a=t==="ruin"?5:5+(i()*2|0),s=a>>1,l=-s,o=a-1-s,c=new Map,h=(x,w,L)=>x+"|"+w+"|"+L,f=(x,w,L,C)=>c.set(h(x,w,L),{x,y:w,z:L,s:C,t:C}),u=x=>{const w=i(),L=-x;return w<.07?T.RUST:L>6&&w<.24?T.MOSS:((L+3)/9|0)%2==1&&w<.7?T.DEEP:w<.62?T.COBBLE:T.STONE},d=t==="ruin"?.2:.06;for(let x=-e;x<=0;x++){const w=-x;for(let L=l;L<=o;L++)for(let C=l;C<=o;C++){const R=L==l||L==o||C==l||C==o,z=(L==l||L==o)&&(C==l||C==o);if(x==0){if(z&&i()<.3)continue;f(L,x,C,u(x));continue}if(R){if(w>2&&i()<d||t==="ruin"&&z&&w<5&&i()<.5)continue;f(L,x,C,u(x))}else w%8==0&&i()<.7&&f(L,x,C,u(x))}}const g=2+(i()*3|0);for(let x=0;x<g;x++){const w=i()*4|0,L=3+(i()*7|0),C=-2-(i()*(e-8)|0),R=l+(i()*a|0);for(let z=0;z<L;z++){const S=C-z;let A,V,X=0,ne=0;w==0?(A=o+1,V=R,X=1):w==1?(A=l-1,V=R,X=-1):w==2?(V=o+1,A=R,ne=1):(V=l-1,A=R,ne=-1),f(A,S,V,u(S)),z>L-3&&f(A+X,S,V+ne,u(S))}}for(let x=l;x<=o;x++)for(let w=l;w<=o;w++)(x==l||x==o||w==l||w==o)&&!(x+w&1)&&c.has(h(x,0,w))&&i()<.85&&f(x,1,w,T.COBBLE);if(t!=="plain"||i()<.5){const x=i()*4|0,w=4+(i()*7|0),L=-1-(i()*3|0),C=l+1+(i()*(a-2)|0);for(let R=1;R<=w&&!(R==w&&i()<.5);R++){let z,S;x==0?(z=o+R,S=C):x==1?(z=l-R,S=C):x==2?(S=o+R,z=C):(S=l-R,z=C),f(z,L,S,i()<.2?T.DEEP:T.COBBLE),R%2==0&&f(z,L+1,S,T.COBBLE),i()<.25&&f(z,L-1,S,T.STONE)}}const _=[],v=[[l,l],[o,o],[l,o],[o,l]],m=i()*4|0,[p,E]=v[m];c.has(h(p,0,E))&&(f(p,1,E,T.PLANK),f(p,2,E,T.PLANK),_.push(new V3(p,2.75,E)));for(const x of c.values())x.s!==T.PLANK&&!c.has(h(x.x,x.y+1,x.z))&&(x.y>=-1||i()<.7)&&(x.t=T.SNOW,x.s=T.SNOWSIDE);return{blocks:[...c.values()],torches:_,size:a}}const _m4=new Matrix4,_c=new Color;function torchFX(){const r=new Group,e=new Mesh(new BoxGeometry(.26,.32,.26),new MeshBasicMaterial({color:new Color(3.2,1.7,.55)}));r.add(e);const t=document.createElement("canvas");t.width=t.height=64;const i=t.getContext("2d"),a=i.createRadialGradient(32,32,0,32,32,32);a.addColorStop(0,"rgba(255,200,120,1)"),a.addColorStop(.3,"rgba(255,140,60,.35)"),a.addColorStop(1,"rgba(255,120,40,0)"),i.fillStyle=a,i.fillRect(0,0,64,64);const s=new Sprite(new SpriteMaterial({map:new CanvasTexture(t),blending:AdditiveBlending,depthWrite:!1,transparent:!0,fog:!1}));return s.scale.setScalar(2.4),r.add(s),r.userData={f:e,sp:s,ph:Math.random()*10},r}class Tower{constructor(e,t,i,a,s,l=30,o="plain"){const c=genTower(t,l,o);this.sc=e,this.blocks=c.blocks,this.origin=new V3(i,a,s),this.size=c.size,this.stand=new V3(i,a+.5,s),this.fx=[];for(const h of c.torches){const f=torchFX();f.position.copy(h).add(this.origin),e.add(f),this.fx.push(f)}this.build()}build(){this.mesh&&(this.sc.remove(this.mesh),this.mesh.geometry.dispose());const e=this.blocks.length;if(!e){this.mesh=null;return}const t=new BoxGeometry(1,1,1),i=new Float32Array(e),a=new Float32Array(e),s=new InstancedMesh(t,blockMat,e),l=this.origin;this.blocks.forEach((o,c)=>{_m4.makeTranslation(l.x+o.x,l.y+o.y,l.z+o.z),s.setMatrixAt(c,_m4),i[c]=o.s,a[c]=o.t;const h=Math.sin(o.x*12.9+o.y*78.2+o.z*37.7)*43758.5;_c.setScalar(.8+(h-Math.floor(h))*.22),s.setColorAt(c,_c)}),t.setAttribute("aSide",new InstancedBufferAttribute(i,1)),t.setAttribute("aTop",new InstancedBufferAttribute(a,1)),s.computeBoundingSphere(),this.sc.add(s),this.mesh=s}shatter(e,t,i,a=10,s=16){const l=this.origin,o=[];let c=0;for(const h of this.blocks){const f=-h.y;if(f<a||f<s&&Math.random()<.45){const u=l.x+h.x,d=l.y+h.y,g=l.z+h.z;let _=u-e.x,v=d-e.y,m=g-e.z;const p=Math.hypot(_,v,m)+.5,E=(10+Math.random()*16)/Math.sqrt(p);i.spawn(u,d,g,_/p*E+t.x*.35+(Math.random()-.5)*4,v/p*E*.6+3+Math.random()*7+t.y*.2,m/p*E+t.z*.35+(Math.random()-.5)*4,h.s,h.t,4+Math.random()*3,.6+Math.random()*.45),c++}else o.push(h)}this.blocks=o,this.build();for(const h of this.fx)h.position.y>l.y-a&&this.sc.remove(h);return this.fx=this.fx.filter(h=>h.parent),c}update(e){for(const t of this.fx){const i=t.userData,a=.85+Math.sin(e*13+i.ph)*.08+Math.sin(e*23.7+i.ph*2)*.07;i.f.scale.set(1,a*1.1,1),i.sp.scale.setScalar(2.2*a),i.f.position.y=Math.sin(e*9+i.ph)*.02}}dispose(){this.mesh&&(this.sc.remove(this.mesh),this.mesh.geometry.dispose());for(const e of this.fx)this.sc.remove(e)}}class Dragon{constructor(e){this.sc=e,this.root=new Group,e.add(this.root);const t=pixTex(21,[26,30,44],[[40,46,64],[16,18,28]],16,"scale");this.mS=new MeshLambertMaterial({map:t,emissive:0}),this.mB=new MeshLambertMaterial({map:pixTex(22,[44,52,72],[[56,66,90],[30,36,52]],16),emissive:0}),this.mM=new MeshLambertMaterial({map:pixTex(23,[22,25,38],[[30,34,50],[14,16,26]],16),emissive:0,side:DoubleSide}),this.mH=new MeshLambertMaterial({color:4870248,emissive:0}),this.mE=new MeshBasicMaterial({color:new Color(.5,3.4,3.8)}),this.mT=new MeshLambertMaterial({color:13161190}),this.mats=[this.mS,this.mB,this.mM,this.mH];const i=(u,d,g,_,v,m,p,E)=>{const x=new Mesh(new BoxGeometry(u,d,g),_);return x.position.set(v,m,p),E.add(x),x},a=this.body=new Group;this.root.add(a),this.torso=i(3.2,2.6,5.2,this.mS,0,0,0,a),this.chest=i(3.7,2.9,2.4,this.mS,0,.15,2.3,a),i(2.6,.3,4.8,this.mB,0,-1.4,.4,a);for(let u=0;u<6;u++){const d=i(.35,.9,.7,this.mH,0,1.6,-2.2+u*.9,a);d.rotation.x=-.45}this.neck=[];let s=a,l=new V3(0,.7,3.4);for(let u=0;u<4;u++){const d=new Group;d.position.copy(l),s.add(d);const g=1.7-u*.12;i(g,g,1.5,this.mS,0,0,.6,d),i(.3,.6,.5,this.mH,0,g/2+.2,.6,d),this.neck.push(d),s=d,l=new V3(0,.12,1.3)}const o=this.head=new Group;o.position.set(0,.1,1.4),s.add(o),this.skull=i(2.3,1.9,2.2,this.mS,0,0,.6,o),i(1.6,1.1,2.1,this.mS,0,-.25,2.4,o),i(.9,.3,1.7,this.mH,0,.4,2.3,o);const c=this.jaw=new Group;c.position.set(0,-.75,1),o.add(c),i(1.5,.45,2.7,this.mS,0,-.2,1.35,c);for(const u of[-1,1]){for(let v=0;v<3;v++)i(.16,.28,.16,this.mT,u*.58,.12,1.6+v*.55,c),i(.16,.26,.16,this.mT,u*.62,-.9,1.9+v*.55,o);const d=new Group;d.position.set(u*.8,.9,-.2),d.rotation.set(-.55,0,u*.3),o.add(d),i(.36,.36,2,this.mH,0,0,-1,d);const g=i(.24,.24,1,this.mH,0,.25,-2.1,d);g.rotation.x=.45;const _=new Group;_.position.set(u*1.15,.3,-.3),_.rotation.set(-.2,u*-.5,0),o.add(_),i(.22,.22,1.1,this.mH,0,0,-.55,_),i(.12,.3,.6,this.mE,u*1.17,.3,1.25,o),i(.55,.22,.08,this.mE,u*.6,.3,1.73,o)}this.mouth=i(.8,.55,.5,new MeshBasicMaterial({color:new Color(6,2.4,.5)}),0,-.5,3.3,o),this.mouth.scale.setScalar(.01),this.charge=0,this.emBase=new Color(0,0,0),this.legs=[];for(const[u,d]of[[1,1],[-1,1],[1,-1],[-1,-1]]){const g=new Group;g.position.set(u*1.55,-1,d*1.8),a.add(g),i(.9,1.8,1.1,this.mS,0,-.9,0,g);const _=new Group;_.position.set(0,-1.8,0),g.add(_),i(.7,1.5,.8,this.mS,0,-.75,0,_),i(.95,.35,1.3,this.mS,0,-1.55,.25,_);for(let v=-1;v<=1;v++)i(.15,.15,.45,this.mH,v*.32,-1.7,1,_);this.legs.push({hip:g,knee:_,ph:Math.random()*6,front:d>0})}this.wings=[];const h=[4.3,4.7,3.9],f=[5.4,4.5,3.1];for(const u of[1,-1]){const d=[];let g=null;for(let _=0;_<3;_++){const v=new Group;_==0?(v.position.set(u*1.75,1.1,1),a.add(v)):(v.position.set(u*h[_-1],0,0),g.add(v)),i(h[_],.4,.4,this.mS,u*h[_]/2,0,0,v),i(h[_],.09,f[_],this.mM,u*h[_]/2,-.05,-f[_]/2+.15,v);for(let m=0;m<2;m++)i(h[_]*.42,.09,.9,this.mM,u*(h[_]*(.25+m*.45)),-.05,-f[_]-.25+.15,v);if(_==2){const m=i(.3,.3,1.3,this.mH,u*(h[_]+.35),0,.3,v);m.rotation.y=u*.4}d.push(v),g=v}this.wings.push({side:u,segs:d})}this.tail=[];for(let u=0;u<13;u++){const d=new Group,g=1.45*(1-u/15);if(i(g,g*.9,1.25,this.mS,0,0,-.62,d),u%2==0&&i(.2,.5*g+.2,.5,this.mH,0,g*.5+.15,-.6,d),u==12){const _=i(1.6,.12,1.2,this.mM,.6,0,-1.1,d);_.rotation.y=.5;const v=i(1.6,.12,1.2,this.mM,-.6,0,-1.1,d);v.rotation.y=-.5}e.add(d),this.tail.push(d)}this.hitList=[{o:this.torso,r:2.5},{o:this.chest,r:2.2},{o:this.skull,r:1.7},...this.neck.map(u=>({o:u,r:1.25})),...this.wings.flatMap(u=>u.segs.map(d=>({o:d,r:1.9,wing:!0,side:u.side}))),...this.tail.slice(0,6).map(u=>({o:u,r:1}))],this.vel=new V3,this.ph=0,this.freq=1.4,this.fold=0,this.claw=0,this.jawOpen=0,this.flash=0,this.ly=0,this.lp=0,this.kick=new V3,this.roll=0,this.prevFwd=new V3(0,0,1),this._d=new Object3D,this._t=new V3,this._r=new V3,this._q=new Quaternion,this.visible=!0,this.resetTail()}resetTail(){this.root.updateMatrixWorld(!0);const e=new V3(0,.2,-2.7);this.body.localToWorld(e);const t=new V3(0,0,-1).applyQuaternion(this.root.quaternion);this.tail.forEach((i,a)=>{i.position.copy(e).addScaledVector(t,(a+1)*1.15)})}setVisible(e){this.root.visible=e,this.tail.forEach(t=>t.visible=e),this.visible=e}steer(e,t,i,a){const s=this._t.copy(e).sub(this.root.position),l=s.length();if(s.setLength(Math.min(t,l*1.4)),this.frozen>0&&s.multiplyScalar(.2),dampV(this.vel,s,i,a),this.root.position.addScaledVector(this.vel,a),Math.abs(this.spinV||0)>.3){this.root.rotateY(this.spinV*a),this.spinV*=Math.exp(-1.6*a),this.prevFwd.set(0,0,1).applyQuaternion(this.root.quaternion);return}if(this.vel.length()>.6){const c=this._r.copy(this.vel).normalize(),h=new V3().crossVectors(this.prevFwd,c).y/Math.max(a,.001);this.prevFwd.copy(c),this.roll=damp(this.roll,clamp(-h*.55,-.9,.9),2.2,a),this._d.position.copy(this.root.position),this._d.lookAt(this._t.copy(this.root.position).add(c)),this._d.rotateZ(this.roll),this.root.quaternion.slerp(this._d.quaternion,1-Math.exp(-3*a))}}hit(e){this.flash=1,this.kick.set((Math.random()-.5)*.4,.25,-.35)}animate(e,t,i,a=0){const s=1.35+a*1.2+(this.fold>.3?-.9:0);this.freq=damp(this.freq,s,2,e);const l=this.frozen>0?.2:1;this.ph+=e*Math.PI*2*this.freq*.6*l,this.frozen=Math.max(0,(this.frozen||0)-e);const o=this.ph,c=this.fold,h=1-c;for(const v of this.wings){const m=v.side,p=v.segs;p[0].rotation.z=m*(Math.sin(o)*.75*h+.12+c*.25),p[0].rotation.y=m*(c*.9+Math.cos(o)*.16*h),p[1].rotation.z=m*(Math.sin(o-.8)*.5*h-c*.25),p[1].rotation.y=m*c*1.1,p[2].rotation.z=m*(Math.sin(o-1.6)*.55*h-c*.1),p[2].rotation.y=m*c*.9}dampV(this.kick,new V3,5,e),this.body.position.set(this.kick.x,-Math.sin(o)*.38*h+this.kick.y,this.kick.z),this.body.rotation.x=Math.cos(o)*.05*h+this.kick.y*.5,this.body.rotation.z=this.kick.x*.6;for(const v of this.legs){const m=.75-this.claw*1.5;v.hip.rotation.x=m+Math.sin(t*1.3+v.ph)*.14*(1-this.claw),v.knee.rotation.x=-.95+this.claw*.8+Math.sin(t*1.3+v.ph-.7)*.2}if(i){this.root.updateMatrixWorld();const v=this.root.worldToLocal(this._t.copy(i)),m=clamp(Math.atan2(v.x,v.z),-1.1,1.1),p=clamp(-Math.atan2(v.y,Math.hypot(v.x,v.z)),-.7,.7);this.ly=damp(this.ly,m,2.5,e),this.lp=damp(this.lp,p,2.5,e)}this.neck.forEach((v,m)=>{v.rotation.y=this.ly/4+Math.sin(t*1.5-m*.55)*.07,v.rotation.x=this.lp/4+Math.sin(t*1.1-m*.5)*.05+(m==0?-.3:.06)}),this.head.rotation.x=this.lp*.15+.15+Math.sin(t*1.1-2.4)*.04,this.jaw.rotation.x=this.jawOpen*.62+Math.sin(t*2.7)*.04,this.flash=damp(this.flash,0,5,e);const f=Math.min(1,(this.frozen||0)*1.5);for(const v of this.mats)v.emissive.setRGB(this.emBase.r+.25*this.flash+.12*f,this.emBase.g+.85*this.flash+.35*f,this.emBase.b+1.1*this.flash+.6*f);this.mouth.scale.setScalar(.01+this.charge*1.3),this.mouth.visible=this.charge>.02,this.charge=damp(this.charge,0,1.5,e);const u=1+Math.sin(t*2.3)*.15+this.jawOpen*.8;this.mE.color.setRGB(.5*u,3.4*u,3.8*u),this.root.updateMatrixWorld(!0);const d=this._t.set(0,.2,-2.7);this.body.localToWorld(d);const g=this._r.set(1,0,0).applyQuaternion(this.root.quaternion);let _=d.clone();for(let v=0;v<this.tail.length;v++){const m=this.tail[v],p=m.position;p.addScaledVector(g,Math.cos(t*2.3-v*.6)*(.5+v*.22)*e),p.y-=1.6*e;const E=p.clone().sub(_),x=E.length()||1;p.copy(_).addScaledVector(E,1.15/x),m.lookAt(_),_=p.clone()}}mouthPos(e){return this.mouth.getWorldPosition(e)}hitTest(e){for(const t of this.hitList){if(t.o.getWorldPosition(this._t),t.wing){const i=new V3(t.side*2.2,0,-1.6);if(t.o.localToWorld(i),i.distanceTo(e)<t.r+.3)return t.o}if(this._t.distanceTo(e)<t.r+.3)return t.o}return null}}class Archer{constructor(e){this.root=new Group,e.add(this.root);const t=new MeshLambertMaterial({map:pixTex(31,[30,38,60],[[58,92,140],[18,22,36]],8)}),i=new MeshLambertMaterial({map:pixTex(32,[22,26,40],[[34,40,58],[14,16,26]],8)}),a=new MeshLambertMaterial({map:pixTex(33,[28,44,66],[[40,62,92],[18,28,44]],8),side:DoubleSide}),s=new MeshLambertMaterial({color:5914672}),l=new MeshBasicMaterial({color:329484});this.mEye=new MeshBasicMaterial({color:new Color(.9,2.2,2.6)});const o=(m,p,E,x,w,L,C,R)=>{const z=new Mesh(new BoxGeometry(m,p,E),x);return z.position.set(w,L,C),R.add(z),z},c=this.body=new Group;this.root.add(c),this.legs=[-1,1].map(m=>{const p=new Group;return p.position.set(m*.15,.85,0),c.add(p),o(.27,.85,.3,t,0,-.42,0,p),o(.29,.16,.36,i,0,-.8,.03,p),p});const h=this.spine=new Group;h.position.y=.85,c.add(h),o(.58,.72,.34,t,0,.36,0,h),o(.62,.1,.38,i,0,.04,0,h),o(.66,.2,.4,i,0,.66,0,h),this.armL=new Group,this.armL.position.set(.41,.66,0),h.add(this.armL),o(.22,.72,.22,t,0,-.32,0,this.armL),this.armR=new Group,this.armR.position.set(-.41,.66,0),h.add(this.armR),o(.22,.72,.22,t,0,-.32,0,this.armR);const f=this.head=new Group;f.position.y=.74,h.add(f),o(.5,.52,.5,i,0,.24,-.02,f),o(.36,.3,.04,l,0,.2,.23,f),o(.2,.16,.22,i,0,.52,-.2,f),o(.06,.04,.02,this.mEye,.08,.22,.255,f),o(.06,.04,.02,this.mEye,-.08,.22,.255,f);const u=o(.18,.58,.18,s,.14,.42,-.26,h);u.rotation.z=.35;for(let m=0;m<3;m++)o(.04,.18,.04,new MeshLambertMaterial({color:14213360}),(m-1)*.05,.34,0,u);this.cape=[];let d=h,g=.66;for(let m=0;m<5;m++){const p=new Group;p.position.set(0,m==0?g:-.26,m==0?-.2:0),d.add(p),o(.6-m*.02,.27,.04,a,0,-.13,0,p),this.cape.push(p),d=p}const _=this.bow=new Group;_.position.set(0,-.66,.06),_.rotation.x=Math.PI/2,this.armL.add(_),this.mBow=new MeshLambertMaterial({color:5914672});for(let m=0;m<9;m++){const p=(m/8-.5)*2.1,E=o(.06,.2,.06,this.mBow,0,Math.sin(p)*.72,Math.cos(p)*.22-.22,_);E.rotation.x=-p*.3}const v=new BufferGeometry;v.setAttribute("position",new BufferAttribute(new Float32Array(9),3)),this.string=new Line(v,new LineBasicMaterial({color:13621482})),_.add(this.string),this.draw=0,this.aim=0,this.yaw=0,this.pitch=0,this.fall=0,this.squash=0,this.vel=new V3,this.shootT=0}shoot(){this.shootT=.18}update(e,t,i){if(i){let f=Math.atan2(i.x,i.z)-this.yaw;f=Math.atan2(Math.sin(f),Math.cos(f)),this.yaw+=f*(1-Math.exp(-7*e)),this.pitch=damp(this.pitch,clamp(Math.asin(clamp(i.y,-1,1)),-.9,1.1),6,e)}this.root.rotation.y=this.yaw,this.shootT=Math.max(0,this.shootT-e),this.draw=damp(this.draw,this.shootT>0?1:.15,this.shootT>0?18:10,e),this.aim=damp(this.aim,this.fall>0?0:1,4,e),this.squash=damp(this.squash,0,5,e);const a=Math.sin(t*1.7);this.spine.rotation.x=-this.pitch*.7*this.aim+a*.015,this.spine.scale.y=1+a*.012,this.head.rotation.x=-this.pitch*.3*this.aim+Math.sin(t*.7)*.04,this.head.rotation.y=Math.sin(t*.43)*.08;const s=this.fall;this.armL.rotation.x=MathUtils.lerp(-.2,-Math.PI/2,this.aim)*(1-s)+s*(-2.6+Math.sin(t*9)*.5),this.armL.rotation.z=s*.4,this.armR.rotation.x=MathUtils.lerp(-.1,-1.45+this.draw*.2,this.aim)*(1-s)+s*(-2.6+Math.sin(t*9+2)*.5),this.armR.rotation.z=(-.55*this.aim-this.draw*.25)*(1-s)-s*.4,this.legs[0].rotation.x=Math.sin(t*11)*.6*s-.15*this.aim*(1-s)+this.squash*-.6,this.legs[1].rotation.x=-Math.sin(t*11)*.6*s+.2*this.aim*(1-s)+this.squash*-.6,this.body.position.y=-this.squash*.25,this.body.rotation.x=s*Math.sin(t*2.5)*.25;const l=this.string.geometry.attributes.position,o=.72,c=Math.cos(1.05)*.22-.22;l.setXYZ(0,0,o,c),l.setXYZ(1,0,0,c-.05-this.draw*.42),l.setXYZ(2,0,-o,c),l.needsUpdate=!0,this.cape.forEach((h,f)=>{const u=.1+f*.04+Math.sin(t*2.6-f*.7)*.1*(f+1)/4+Math.sin(t*5.3-f)*.03-s*(1+Math.sin(t*14-f)*.25)/(f*.3+1)+this.vel.length()*.01;h.rotation.x=damp(h.rotation.x,u,7,e),h.rotation.z=Math.sin(t*1.9-f*.6)*.06}),this.mEye.color.setRGB(.9,2.2+Math.sin(t*3)*.3,2.6)}handPos(e){return this.armL.localToWorld(e.set(0,-.7,.2))}}function arrowMesh(r){const e=new Group,t=new MeshLambertMaterial({color:9071180}),i=new Mesh(new BoxGeometry(.05,.05,1.05),t);e.add(i);const a=new Mesh(new BoxGeometry(.12,.12,.2),new MeshBasicMaterial({color:r||new Color(.9,1.9,2.2)}));a.position.z=.58,e.add(a);const s=new MeshLambertMaterial({color:14542581}),l=new Mesh(new BoxGeometry(.02,.16,.24),s);l.position.z=-.44,e.add(l);const o=l.clone();return o.rotation.z=Math.PI/2,e.add(o),e}const arrows=[];function fireArrow(r,e,t={}){const i=t.freeze?new Color(1.4,3.2,4.2):t.fire?new Color(4,1.6,.4):null,a=arrowMesh(i);(t.freeze||t.fire)&&a.scale.setScalar(1.25),a.position.copy(r),scene.add(a);const s=t.speed||62,l=10,o=e.clone().sub(r),h=o.length()/s;o.normalize().multiplyScalar(s),o.y+=.5*l*h,arrows.push({m:a,v:o,life:3.2,stuck:null,g:l,dmg:t.dmg||1,fire:!!t.fire,freeze:!!t.freeze})}function updateArrows(r){for(let e=arrows.length-1;e>=0;e--){const t=arrows[e];if(t.life-=r,t.stuck){t.life<=0&&(t.m.parent.remove(t.m),arrows.splice(e,1));continue}t.v.y-=t.g*r,TH.wind>3&&(t.v.x+=(TH.wind-2.5)*1.6*r);const i=t.v.clone().multiplyScalar(r),a=3;let s=!1;for(let l=0;l<a&&!s;l++){t.m.position.addScaledVector(i,1/a);for(let c=fireballs.length-1;c>=0;c--){const h=fireballs[c];if(!h.far&&t.m.position.distanceTo(h.m.position)<(h.kind==="cluster"?2.4:1.8)){const f=h.m.position.clone();if(killFireball(c),explode(f,h.kind==="cluster"?1.6:1.1),t.fire||t.freeze)for(let u=fireballs.length-1;u>=0;u--)!fireballs[u].far&&fireballs[u].m.position.distanceTo(f)<5&&(explode(fireballs[u].m.position.clone(),.9),killFireball(u));Math.random()<.35&&dropLoot(f,"coin"),AU.boom(.7),G.shake=Math.max(G.shake,.3),G.rage=Math.max(0,G.rage-1.5),G.shotDown=(G.shotDown||0)+1,ARC2.onShotDown(f),capQ.length||caption("СБИТ"),s=!0;break}}if(s)break;const o=dragon.visible?dragon.hitTest(t.m.position):null;if(o){onArrowHit(t,o);break}}if(s){scene.remove(t.m),arrows.splice(e,1);continue}t.stuck||(t.m.lookAt(t.m.position.clone().add(t.v)),Math.random()<.7&&sparks.spawn(t.m.position,new V3(0,0,0),t.fire||t.freeze?.14:.09,.35,t.freeze?new Color(.5,1.4,2):t.fire?new Color(2,.7,.15):new Color(.25,.55,.8)),t.life<=0&&(scene.remove(t.m),arrows.splice(e,1)))}}const AU={ctx:null,init(){if(!this.ctx)try{const r=new(window.AudioContext||window.webkitAudioContext);this.ctx=r,this.master=r.createGain(),this.master.gain.value=.7,this.master.connect(r.destination);const e=r.sampleRate*2,t=r.createBuffer(1,e,r.sampleRate),i=t.getChannelData(0);for(let h=0;h<e;h++)i[h]=Math.random()*2-1;this.noise=t;const a=r.createBufferSource();a.buffer=t,a.loop=!0;const s=r.createBiquadFilter();s.type="bandpass",s.frequency.value=380,s.Q.value=.6;const l=r.createGain();l.gain.value=.11;const o=r.createOscillator();o.frequency.value=.11;const c=r.createGain();c.gain.value=180,o.connect(c),c.connect(s.frequency),o.start(),a.connect(s),s.connect(l),l.connect(this.master),a.start(),this.wind=l}catch{}},nz(r,e,t,i,a=1){const s=this.ctx;if(!s)return;const l=s.createBufferSource();l.buffer=this.noise;const o=s.createBiquadFilter();o.type=e,o.frequency.value=t,o.Q.value=a;const c=s.createGain(),h=s.currentTime;c.gain.setValueAtTime(i,h),c.gain.exponentialRampToValueAtTime(.001,h+r),l.connect(o),o.connect(c),c.connect(this.master),l.start(h,Math.random()),l.stop(h+r)},tone(r,e,t,i,a){const s=this.ctx;if(!s)return;const l=s.createOscillator();l.type=r;const o=s.createGain(),c=s.currentTime;l.frequency.setValueAtTime(e,c),l.frequency.exponentialRampToValueAtTime(t,c+i),o.gain.setValueAtTime(a,c),o.gain.exponentialRampToValueAtTime(.001,c+i),l.connect(o),o.connect(this.master),l.start(c),l.stop(c+i)},shoot(){this.tone("triangle",190,90,.18,.25),this.nz(.12,"highpass",2500,.15)},hit(){this.tone("sine",110,45,.3,.5),this.nz(.15,"bandpass",900,.3,2)},roar(){const r=this.ctx;if(!r)return;const e=r.currentTime,t=r.createBiquadFilter();t.type="lowpass",t.frequency.setValueAtTime(200,e),t.frequency.linearRampToValueAtTime(900,e+.5),t.frequency.linearRampToValueAtTime(150,e+1.8);const i=r.createGain();i.gain.setValueAtTime(.001,e),i.gain.linearRampToValueAtTime(.35,e+.25),i.gain.exponentialRampToValueAtTime(.001,e+1.9),t.connect(i),i.connect(this.master);for(const a of[58,61.5,87]){const s=r.createOscillator();s.type="sawtooth",s.frequency.setValueAtTime(a,e),s.frequency.linearRampToValueAtTime(a*.7,e+1.8),s.connect(t),s.start(e),s.stop(e+1.9)}this.nz(1.5,"bandpass",500,.2,.8)},crash(){this.nz(2.6,"lowpass",420,.9,.7),this.tone("sine",70,28,1.6,.8),setTimeout(()=>this.nz(1.4,"bandpass",1400,.25,1),120)},flap(r){this.nz(.35,"lowpass",260,r,1)},land(){this.tone("sine",90,40,.25,.5),this.nz(.3,"lowpass",600,.35)},thunder(r){this.ctx&&setTimeout(()=>{this.nz(3.2,"lowpass",160+Math.random()*120,.55*clamp(1.4-r/300,.3,1),.5),this.nz(.5,"lowpass",900,.2,.7)},clamp(r*3,300,1800))},boom(r=1){this.nz(1.6,"lowpass",380,.8*r,.7),this.tone("sine",80,30,1,.6*r)},spit(r=1){this.nz(.6,"bandpass",600,.4*r,.8),this.tone("sawtooth",140,60,.4,.15*r)},coin(){this.tone("square",1250,1900,.09,.06),setTimeout(()=>this.tone("square",1900,2200,.12,.05),60)},heal(){this.tone("sine",520,1040,.35,.2),setTimeout(()=>this.tone("sine",780,1560,.4,.15),120)},ice(){this.nz(.4,"highpass",4e3,.25),this.tone("sine",2400,1200,.3,.1)},buy(){this.tone("triangle",600,900,.12,.2),setTimeout(()=>this.tone("triangle",900,1350,.18,.2),90)}},dragon=new Dragon(scene),archer=new Archer(scene),torchLight=new PointLight(16751178,6,16,1.6);scene.add(torchLight);let towers=[],cur=null,nxt=null,seedN=1;const bg=new Group;scene.add(bg);function makeNext(r){const e=Math.random()*Math.PI*2,t=10+Math.random()*4,i=22+Math.random()*6,a=["plain","bridge","ruin"],s=new Tower(scene,seedN++*7919,Math.round(r.origin.x+Math.cos(e)*t),Math.round(r.origin.y-i),Math.round(r.origin.z+Math.sin(e)*t),30,a[seedN%3]);return towers.push(s),s}function initWorld(){for(const r of towers)r.dispose();for(towers=[],seedN=1+(Math.random()*1e3|0),cur=new Tower(scene,seedN++*7919,0,0,0,30,"bridge"),towers.push(cur),nxt=makeNext(cur);bg.children.length;)bg.remove(bg.children[0]);for(let r=0;r<7;r++){const e=r/7*Math.PI*2+.3,t=55+r%3*22;new Tower(bg,900+r*31,Math.round(Math.cos(e)*t),Math.round(-4+r%2*8),Math.round(Math.sin(e)*t),40,r%2?"ruin":"bridge")}archer.root.position.copy(cur.stand),archer.fall=0,dragon.root.position.set(60,20,-60),dragon.vel.set(0,0,0),dragon.resetTail()}const G={mode:"menu",phase:"idle",pt:0,level:1,hits:0,need:4,rage:0,rageMax:15,depth:1,orbitA:0,orbitDir:1,fireCD:0,holding:!1,aimNdc:new Vector2,lastTap:0,slow:1,shake:0,glitch:0,diveDir:new V3,fallFrom:new V3,fallV:new V3,fallT:0,fallDur:1,flapPrev:0,camDir:new V3(0,0,1)},camPos=new V3(8,6,8),camLook=new V3;let capQ=[],capT=0;const CAP_EN={"ОН СНОВА ЗДЕСЬ":"HE IS BACK","СБЕЙ ОГОНЬ":"SHOOT THE FIRE","СБЕЙ ВСЕ":"SHOOT THEM ALL","ОН РАСПАДЁТСЯ":"IT WILL SPLIT","ТАРАН ГОЛОВОЙ":"HEAD RAM","УДАР ХВОСТОМ":"TAIL SWIPE",ОТБИТ:"REPELLED",ПАДЕНИЕ:"FALLING","ЕЩЁ ЖИВ":"STILL ALIVE",ЗАМОРОЖЕН:"FROZEN","+ ЖИЗНЬ":"+ LIFE","+3 ЛЕДЯНЫЕ":"+3 ICE",СБИТ:"SHOT DOWN",ПИКЕ:"PLUNGE","ИЗ ТУМАНА":"FROM THE FOG",ЩИТ:"SHIELD"},CAP_RU={"DRAGON RETREATS":"ДРАКОН ОТСТУПАЕТ"};function caption(r){r=PG.language==="ru"?CAP_RU[r]||r:CAP_EN[r]||r,capQ=r.split(" "),capT=0,showWord()}function showWord(){const r=$("cap");if(!capQ.length){r.classList.remove("show");return}r.classList.remove("show"),r.offsetWidth,r.textContent=capQ.shift(),r.classList.add("show"),capT=.52}function hud(r){for(const e of["top","bottom","depth","res","bShop","bFreeze"])$(e).style.opacity=r?1:0}function renderHP(){const r=$("hp");r.innerHTML="";for(let e=0;e<G.need;e++){const t=document.createElement("i");e<G.hits&&(t.className="on"),r.appendChild(t)}}function flashScreen(r){const e=$("flash");e.style.transition="none",e.style.opacity=r,requestAnimationFrame(()=>{e.style.transition="opacity .9s",e.style.opacity=0})}function startRound(){G.phase="intro",G.pt=0,G.hits=0,G.rage=0,$("hint").textContent=HINT0,G.repelHits=0,dragon.spinV=0,G.need=Math.min(3+G.level,10),G.spitT=3+Math.random()*2,G.charging=0,G.rageMax=Math.max(9,16-G.level*.6),renderHP(),G.orbitA=Math.atan2(dragon.root.position.z-cur.origin.z,dragon.root.position.x-cur.origin.x),G.orbitDir=Math.random()<.5?1:-1,ARC2.onRound()}function startGame(){AU.init();for(let r=fireballs.length-1;r>=0;r--)killFireball(r);clearLoot(),initWorld(),G.mode="play",G.level=1,G.depth=1,G.lives=3,G.dead=!1,G.revived=!1,ARC2.onStart(),G.freezeAmmo=2,G.freezeOn=!1,G.paused=!1,G.fbTold=!1,G.toldCluster=!1,THT=THEMES[0],$("over").classList.add("hide"),camPos.copy(cur.stand).add(new V3(-6,4,-6)),camLook.copy(cur.stand),G.camDir.set(1,0,1).normalize(),setWeaponLook(),renderRes(),$("depth").textContent="TIER 1",startRound(),hud(!0),caption("ОН СНОВА ЗДЕСЬ"),showLvl("Level 1 · "+THEMES[0].name.toLowerCase()+". "+THEMES[0].news),setTimeout(()=>{G.mode==="play"&&($("hint").style.opacity=1)},2500)}function onArrowHit(r,e){r.stuck=e,r.life=5,e.attach(r.m),dragon.hit(),AU.hit(),G.shake=Math.max(G.shake,.25);const t=new V3;r.m.getWorldPosition(t);for(let a=0;a<16;a++)sparks.spawn(t,new V3((Math.random()-.5)*9,Math.random()*7,(Math.random()-.5)*9),.14,.5+Math.random()*.4,new Color(.5,1.6,2),0,9);for(let a=0;a<22;a++)sparks.spawn(t,new V3((Math.random()-.5)*8,Math.random()*6+1,(Math.random()-.5)*8),.16+Math.random()*.1,.7+Math.random()*.5,new Color(2.2,.15,.12),0,12);G.mode==="play"&&(dropLoot(t,"coin",1+(Math.random()<.4?1:0)),Math.random()<.07&&dropLoot(t,"heart"),Math.random()<.15&&dropLoot(t,"ice"));const i=r.dmg||1;if(r.freeze){dragon.frozen=2.8,AU.ice();for(let a=0;a<24;a++)sparks.spawn(t,new V3((Math.random()-.5)*10,Math.random()*6,(Math.random()-.5)*10),.2,.9,new Color(1,2.4,3.2),0,6);capQ.length||caption("ЗАМОРОЖЕН")}["windup","dive","tail","spin","plunge","ambush"].includes(G.phase)?(G.repelHits+=i*(r.freeze?2:1),showRepel(),G.repelHits>=G.repelNeed&&repel()):(G.phase==="fight"||G.phase==="intro")&&(ARC2.onDragonHit(),G.task&&G.task!=="hits"?G.hits=G.hits:G.hits=Math.min(G.need,G.hits+i),renderHP(),G.rage=Math.max(0,G.rage-.6),G.hits>=G.need&&(G.phase="retreat",G.pt=0,dragon.jawOpen=1,AU.roar(),caption("DRAGON RETREATS"),G.glitch=.6,flashScreen(.25),dropLoot(t,"coin",4+G.level)))}function crash(r){if(ARC2.absorb())return;G.lives=(G.lives||1)-1,G.lives<=0&&(G.dead=!0),renderRes(),$("hint").style.opacity=0;const e=archer.root.position.clone();cur.shatter(e,r||dragon.vel,debris,10,17),r&&(_v.copy(dragon.root.position).sub(e),_v.y=0,_v.lengthSq()>.01&&G.diveDir.copy(_v.normalize()));for(let c=fireballs.length-1;c>=0;c--)fireballs[c].far||(explode(fireballs[c].m.position.clone(),.8),killFireball(c));for(let c=0;c<40;c++)dust.spawn(e.clone().add(new V3((Math.random()-.5)*6,(Math.random()-.5)*6,(Math.random()-.5)*6)),new V3((Math.random()-.5)*10,Math.random()*5,(Math.random()-.5)*10),3+Math.random()*3,2.5+Math.random()*2,new Color(.62,.72,.92),1.6,-.5);AU.crash(),G.shake=1.4,G.glitch=1.3,G.slow=.28,flashScreen(.5);const t=archer.root.position.clone(),i=nxt.stand.clone(),a=16,s=5,l=t.y-i.y,o=(s+Math.sqrt(s*s+2*a*l))/a;G.fallFrom.copy(t),G.fallDur=o,G.fallT=0,G.fallV.set((i.x-t.x)/o,s,(i.z-t.z)/o),archer.fall=1,G.phase="fall",G.pt=0,caption("ПАДЕНИЕ")}function land(){archer.root.position.copy(nxt.stand),archer.fall=0,archer.squash=1,AU.land(),G.shake=.6;for(let r=0;r<14;r++)dust.spawn(nxt.stand.clone().add(new V3((Math.random()-.5)*2,0,(Math.random()-.5)*2)),new V3((Math.random()-.5)*6,Math.random()*1.5,(Math.random()-.5)*6),1.6,1.6,new Color(.7,.78,.95),1.2,0);if(cur=nxt,nxt=makeNext(cur),G.depth++,$("depth").textContent="TIER "+G.depth,G.dead){towers=towers.filter(r=>r.origin.y>cur.origin.y+60?(r.dispose(),!1):!0),gameOver();return}towers=towers.filter(r=>r.origin.y>cur.origin.y+60?(r.dispose(),!1):!0),startRound(),caption("ЕЩЁ ЖИВ")}const ray=new Raycaster;function aimPoint(r){ray.setFromCamera(G.aimNdc,camera);for(const t of fireballs)if(!t.far&&ray.ray.distanceToPoint(t.m.position)<2.6){const i=archer.handPos(new V3);return r.copy(t.m.position).addScaledVector(t.v,i.distanceTo(t.m.position)/weapon().speed)}const e=clamp(camera.position.distanceTo(dragon.root.position),12,90);return r.copy(ray.ray.origin).addScaledVector(ray.ray.direction,e)}function setNdc(r){G.aimNdc.set(r.clientX/innerWidth*2-1,-(r.clientY/innerHeight)*2+1)}canvas.addEventListener("pointerdown",r=>{G.mode!=="play"||G.paused||G.phase==="over"||(AU.init(),setNdc(r),G.holding=!0,G.lastTap=performance.now(),$("hint").style.opacity=0,tryFire())}),addEventListener("pointermove",r=>{G.holding&&setNdc(r)}),addEventListener("pointerup",()=>G.holding=!1),addEventListener("pointercancel",()=>G.holding=!1);function tryFire(){if(G.paused||G.fireCD>0||archer.fall>0||G.phase==="fall"||G.phase==="over")return;const r=weapon();G.fireCD=r.cd,archer.shoot(),AU.shoot();const e=G.freezeOn&&G.freezeAmmo>0;e&&(G.freezeAmmo--,G.freezeAmmo<=0&&(G.freezeOn=!1),renderRes()),setTimeout(()=>{if(archer.fall>0)return;const t=archer.handPos(new V3),i=aimPoint(new V3).sub(t);for(let a=0;a<r.n;a++){const s=i.clone().applyAxisAngle(new V3(0,1,0),(a-(r.n-1)/2)*r.spread);fireArrow(t,t.clone().add(s),{speed:r.speed,dmg:r.dmg,fire:r.fire,freeze:e})}},90)}const _v=new V3,_w=new V3,_aimDir=new V3;function updateGame(r,e){G.pt+=r,G.fireCD-=r,G.holding&&tryFire();const t=cur.origin,i=archer.root.position,a=_w.copy(i).add(new V3(0,1.6,0));let s=0;switch(G.phase){case"intro":case"fight":{G.phase==="intro"&&G.pt>2.5&&(G.phase="fight",G.pt=0),G.orbitA+=r*(.42+G.level*.035)*G.orbitDir*(G.orbitBoost||1);const d=23+Math.sin(e*.37)*4,g=_v.set(t.x+Math.cos(G.orbitA)*d,i.y+5+Math.sin(e*.6)*3.5,t.z+Math.sin(G.orbitA)*d);dragon.steer(g,G.phase==="intro"?30:15+G.level*.6,1.4,r),dragon.fold=damp(dragon.fold,0,3,r),dragon.claw=damp(dragon.claw,0,3,r),dragon.jawOpen=damp(dragon.jawOpen,0,3,r),s=clamp(dragon.vel.y*.15,0,1),G.phase==="fight"&&(G.rage+=r*(dragon.frozen>0?0:1),G.rage>=G.rageMax&&startSpecial()),G.phase==="fight"&&performance.now()-G.lastTap>7e3&&($("hint").style.opacity=1),G.phase==="intro"&&($("hint").style.opacity=0),G.phase==="fight"&&(G.spitT-=r,G.spitT<=0&&!(G.charging>0)&&dragon.root.position.distanceTo(i)<48&&(G.charging=.8,AU.spit(.6)),G.charging>0&&!(dragon.frozen>0)&&(G.charging-=r,dragon.jawOpen=damp(dragon.jawOpen,1,8,r),dragon.charge=damp(dragon.charge,1,6,r),G.charging<=0&&(spitAttack(),G.spitT=diff(G.level).interval+Math.random()*2,dragon.charge=0,G.fbTold||(caption("СБЕЙ ОГОНЬ"),G.fbTold=!0))));break}case"windup":{const d=_v.copy(i).addScaledVector(G.diveDir,40);d.y=i.y+13,dragon.steer(d,26,1.8,r),s=1,dragon.jawOpen=damp(dragon.jawOpen,.8,4,r),G.glitch=Math.max(G.glitch,.35+G.pt*.15),diff(G.level).combo&&!G.comboDone&&G.pt>.8&&(G.comboDone=!0,spitAttack()),G.pt>Math.max(1.4,2.4-G.level*.12)&&(G.phase="dive",G.pt=0);break}case"dive":{const d=_v.copy(i).add(new V3(0,.6,0));dragon.steer(d,Math.min(72,48+G.level*2.5),3.2,r),dragon.fold=damp(dragon.fold,.6,4,r),dragon.claw=damp(dragon.claw,1,4,r),dragon.jawOpen=damp(dragon.jawOpen,1,6,r),G.glitch=Math.max(G.glitch,.5),G.shake=Math.max(G.shake,.15),dragon.root.position.distanceTo(d)<4.5&&crash();break}case"fall":{G.fallT+=r;const d=Math.min(G.fallT,G.fallDur);i.set(G.fallFrom.x+G.fallV.x*d,G.fallFrom.y+G.fallV.y*d-8*d*d,G.fallFrom.z+G.fallV.z*d),archer.vel.set(G.fallV.x,G.fallV.y-16*d,G.fallV.z);const g=_v.copy(G.diveDir).multiplyScalar(-30).add(t);g.y=nxt.stand.y+14,dragon.steer(g,34,1.2,r),dragon.fold=damp(dragon.fold,.1,2,r),dragon.claw=damp(dragon.claw,0,2,r),s=.8,G.fallT>=G.fallDur&&land();break}case"tail":{const d=_v.copy(i).addScaledVector(G.tailPerp,6.5);d.y=i.y+1.2,dragon.steer(d,30+G.level,2.4,r),dragon.claw=damp(dragon.claw,1,3,r),dragon.jawOpen=damp(dragon.jawOpen,.6,3,r),G.glitch=Math.max(G.glitch,.35),s=.5,(dragon.root.position.distanceTo(d)<3.4||G.pt>5)&&(G.phase="spin",G.pt=0,G.spinHit=!1,dragon.spinV=-G.tailSide*7.5,dragon.vel.multiplyScalar(.2),AU.roar());break}case"spin":{dragon.steer(_v.copy(dragon.root.position),1,3,r),G.shake=Math.max(G.shake,.2),G.glitch=Math.max(G.glitch,.5),G.pt>.42&&!G.spinHit&&(G.spinHit=!0,crash(G.tailPerp.clone().multiplyScalar(-22)));break}case"stagger":{const d=_v.copy(dragon.root.position).sub(i);d.y=0,d.normalize().multiplyScalar(30).add(i),d.y=i.y+10,dragon.steer(d,20,1.2,r),dragon.jawOpen=damp(dragon.jawOpen,.4,2,r),dragon.fold=damp(dragon.fold,0,3,r),dragon.claw=damp(dragon.claw,0,3,r),s=1,G.pt>2.2&&(G.phase="fight",G.pt=0,$("hint").style.opacity=0,$("hint").textContent=HINT0);break}case"plunge":{s=ARC2.plunge(r,e,i)??1;break}case"ambush":{s=ARC2.ambush(r,e,i,t)??1;break}case"over":{G.orbitA+=r*.3,dragon.steer(_v.set(t.x+Math.cos(G.orbitA)*26,i.y+8,t.z+Math.sin(G.orbitA)*26),14,1.2,r);break}case"retreat":{const d=_v.copy(dragon.root.position).sub(i);d.y=0,d.normalize().multiplyScalar(80).add(i),d.y=i.y+28,dragon.steer(d,26,1.2,r),s=1,dragon.jawOpen=damp(dragon.jawOpen,.3,2,r),G.pt>4&&levelUp();break}}dragon.animate(r,e,a,s);const l=Math.sin(dragon.ph);if(G.flapPrev>0&&l<=0){const d=dragon.root.position.distanceTo(camera.position);AU.flap(clamp(.5-d/120,0,.4))}G.flapPrev=l,G.phase!=="fall"&&G.phase!=="over"&&(aimPoint(_aimDir),_aimDir.sub(a).normalize(),G.holding||_aimDir.copy(dragon.root.position).sub(a).normalize()),archer.update(r,e,G.phase==="fall"?null:_aimDir);for(const d of towers)d.update(e);const o=cur.fx[0];o?(torchLight.position.copy(o.position),torchLight.intensity=6+Math.sin(e*13)*1.2+Math.sin(e*29)*.8):torchLight.intensity=damp(torchLight.intensity,0,3,r),bg.position.y=damp(bg.position.y,i.y*.85,1,r),$("rage").firstElementChild.style.width=(G.phase==="fight"||G.phase==="intro"?G.rage/G.rageMax*100:["windup","dive","tail","spin","plunge","ambush"].includes(G.phase)?100:0)+"%",G.phase==="windup"||G.phase==="dive"||G.phase==="fall"||G.phase==="plunge"?dampV(G.camDir,G.diveDir,1.2,r).normalize():(_v.copy(dragon.root.position).sub(i),_v.y=0,_v.lengthSq()>1&&dampV(G.camDir,_v.normalize(),1.6,r),G.camDir.normalize());const h=new V3().crossVectors(G.camDir,new V3(0,1,0)).normalize();let f,u;G.phase==="fall"?(f=_v.copy(i).addScaledVector(G.camDir,-8).addScaledVector(h,3).add(new V3(0,4.5,0)),u=new V3().copy(i).lerp(nxt.stand,.35)):(f=_v.copy(a).addScaledVector(G.camDir,-7.6-9*ARC2.camK).addScaledVector(h,-.7-2*ARC2.camK).add(new V3(0,2.2+2.6*ARC2.camK,0)),u=a.clone().lerp(dragon.root.position,G.phase==="dive"?.5:.55),u.y=Math.max(u.y,a.y)),dampV(camPos,f,G.phase==="fall"?3.2:2.3,r),dampV(camLook,u,3,r)}const GAL=[{name:"Дракон",desc:"Сегментный: шея, хвост из 13 звеньев, крылья с волной по 3 костям, светящиеся глаза.",r:24,look:new V3(0,0,0)},{name:"Лучник",desc:"Воксельный стрелок: капюшон, плащ с инерцией, лук с натяжением тетивы, колчан.",r:4.2,look:new V3(0,1.1,0)},{name:"Башня «Страж»",desc:"Колонна с зубцами, контрфорсами, факелом и снегом на выступах.",r:21,look:new V3(0,-5,0)},{name:"Башня «Мост»",desc:"Обломанный мост с зубцами, как длинная балка в видео.",r:22,look:new V3(0,-5,0)},{name:"Башня «Руины»",desc:"Разрушенная, со сколами углов и провалами в стенах.",r:21,look:new V3(0,-5,0)},{name:"Блоки",desc:"8 пиксельных текстур 16×16: "+TILE_NAMES.join(", ")+".",r:9,look:new V3(0,0,0)},{name:"Стрела и факел",desc:"Стрела со светящимся наконечником, факел с живым пламенем и ореолом.",r:5,look:new V3(0,.5,0)},{name:"Разрушение",desc:"Блоки разлетаются в щепки с вращением, гравитацией и пылью.",r:24,look:new V3(0,-4,0)},{name:"Виадук 2.5D",desc:"Гигантский воксельный виадук: арки, опоры, башни с горящими окнами. Подсвечивается молниями.",r:175,look:new V3(0,-8,0)},{name:"Виадуки 2D",desc:"Дальний плоский слой силуэтов виадуков с огоньками окон, кольцом вокруг мира.",r:95,look:new V3(0,0,0)},{name:"Грозовое небо",desc:"Тучи из 2.5D-карточек, ветвистые молнии, вспышки подсвечивают облака и постройки.",r:55,look:new V3(0,10,0)},{name:"Огненный шар",desc:"Воксельное пламя с ореолом и искрами. Попадание стрелой взрывает его в воздухе.",r:16,look:new V3(0,0,0)},{name:"Взрыв виадука",desc:"Шар дальнего дракона разносит пролёт виадука в щепки.",r:160,look:new V3(0,-8,0)},{name:"Добыча",desc:"Из дракона летят монетки, сердца (новая жизнь) и ледяные стрелы.",r:9,look:new V3(0,0,0)},{name:"Кассетный шар",desc:"Багровый шар на полпути распадается на несколько огненных шаров.",r:22,look:new V3(0,0,0)}];let gi=0,gItems=[];const gRoot=new Group;gScene.add(gRoot);function galBuild(r){if(gItems[r])return gItems[r];let e={};if(r==0){const t=new Dragon(gScene);e={d:t,upd:(i,a)=>{const s=new V3(Math.sin(a*.5)*6,Math.sin(a*.9)*1.2,Math.cos(a*.5)*6);t.steer(s,6,1.5,i),t.animate(i,a,camera.position,.2),GAL[0].look.copy(t.root.position)},show:i=>t.setVisible(i)}}if(r==1){const t=new Group,i=new Archer(t),a=new Tower(t,77,0,-.5,0,2,"plain");gRoot.add(t),e={g:t,upd:(s,l)=>{i.update(s,l,new V3(Math.sin(l*.6),Math.sin(l*.8)*.4+.2,Math.cos(l*.6)).normalize()),Math.sin(l*2.1)>.97&&i.shootT<=0&&i.shoot(),a.update(l)}}}if(r>=2&&r<=4){const t=new Group,i=new Tower(t,[13,29,47][r-2]*101,0,0,0,14,["plain","bridge","ruin"][r-2]);gRoot.add(t),e={g:t,upd:(a,s)=>i.update(s)}}if(r==5){const t=new Group,i=new BoxGeometry(1.4,1.4,1.4),a=new Float32Array(8),s=new Float32Array(8),l=new InstancedMesh(i,blockMat,8);for(let o=0;o<8;o++)a[o]=o,s[o]=o==4?3:o,_m4.makeTranslation((o%4-1.5)*2.1,(o<4?1:-1)*1.1,0),l.setMatrixAt(o,_m4),l.setColorAt(o,_c.setScalar(1));i.setAttribute("aSide",new InstancedBufferAttribute(a,1)),i.setAttribute("aTop",new InstancedBufferAttribute(s,1)),l.computeBoundingSphere(),t.add(l),gRoot.add(t),e={g:t,upd:(o,c)=>{t.rotation.y=Math.sin(c*.4)*.6,t.rotation.x=Math.sin(c*.3)*.25}}}if(r==6){const t=new Group,i=arrowMesh();i.scale.setScalar(2.4),i.position.set(-1.2,.6,0),t.add(i);const a=new Group,s=new Mesh(new BoxGeometry(.3,1.8,.3),new MeshLambertMaterial({color:5914672}));s.position.y=-.2,a.add(s);const l=torchFX();l.position.y=.95,a.add(l),a.position.set(1.6,0,0),t.add(a);const o=new PointLight(16751178,4,8,1.5);o.position.set(1.6,1.2,.6),t.add(o),gRoot.add(t),e={g:t,upd:(c,h)=>{i.rotation.y=h*.8,i.position.y=.6+Math.sin(h*1.3)*.15;const f=l.userData,u=.85+Math.sin(h*13)*.08+Math.sin(h*23.7)*.07;f.f.scale.set(1,u*1.1,1),f.sp.scale.setScalar(2.2*u),o.intensity=4+Math.sin(h*17)*.8}}}if(r==7){const t=new Group;gRoot.add(t);let i=null,a=0;const s=()=>{i&&i.dispose(),i=new Tower(t,555+(Math.random()*99|0),0,0,0,14,"bridge")};s(),e={g:t,upd:(l,o)=>{if(a+=l,i.update(o),a>1.6&&a-l<=1.6){i.shatter(new V3(4,-.5,0),new V3(-25,0,0),gDebris,8,11),AU.crash();for(let c=0;c<22;c++)gDust.spawn(new V3((Math.random()-.5)*5,-2+Math.random()*3,(Math.random()-.5)*5),new V3((Math.random()-.5)*8,Math.random()*3,(Math.random()-.5)*8),3,2.4,new Color(.62,.72,.92),1.5,-.3)}a>5&&(a=0,s())}}}if(r==8){const t=new Group;gRoot.add(t),new Viaduct(t,401,new V3(0,0,0),0,46),e={g:t,upd:()=>{}}}if(r==9){const t=new Group;gRoot.add(t);const i=new Mesh(new CylinderGeometry(45,45,28,72,1,!0),bandMat(make2DViaductTex(17),.15,1,!0));t.add(i),e={g:t,upd:(a,s)=>{i.rotation.y=s*.05,i.material.uniforms.uTime.value=s}}}if(r==10){const t=new Group;gRoot.add(t);const i=new StormLayer(t,!0);new Viaduct(t,402,new V3(0,-10,-110),0,44),e={g:t,upd:(a,s)=>{i.update(a,s,new V3(0,0,0),camera)}}}if(r==11){const t=new Group;gRoot.add(t);const i=makeFireballMesh();t.add(i);let a=0;e={g:t,upd:(s,l)=>{a+=s;const o=Math.min(a/2.4,1);i.visible=o<1,i.position.set(-12+o*18,Math.sin(o*3)*1.5,0),i.children.forEach((c,h)=>{c.isSprite||(c.rotation.x+=s*(2+h*.3),c.rotation.y+=s*3)}),o<1&&gFire.spawn(i.position.clone(),new V3(-2+Math.random()-.5,Math.random()*2,Math.random()-.5),.3+Math.random()*.3,.5,FIRE_COLS[Math.random()*3|0],-.6,-3),a>=2.4&&a-s<2.4&&(explode(i.position.clone(),1.4,GALP),AU.boom(.7)),a>3.6&&(a=0)}}}if(r==12){const t=new Group;gRoot.add(t);let i=new Viaduct(t,403,new V3(0,0,0),0,40);const a=makeFireballMesh();a.scale.setScalar(2.4),t.add(a);let s=0;const l=new V3,o=new V3(-70,30,40);e={g:t,upd:(c,h)=>{s===0&&i.randomTarget(l),s+=c;const f=Math.min(s/2.2,1);a.visible=f<1,a.position.lerpVectors(o,l,f),f<1&&gFire.spawn(a.position.clone(),new V3(Math.random()-.5,Math.random()*2,Math.random()-.5),.8,.6,FIRE_COLS[Math.random()*3|0],-.6,-3),s>=2.2&&s-c<2.2&&(i.shatterAt(l,5.5,gFarDeb,new V3(20,0,-10)),explode(l.clone(),4,GALP),AU.boom(.5)),s>6.5&&(i.blocks=i.orig.slice(),i.broken=0,i.build(),s=0)}}}if(r==13){const t=new Group;gRoot.add(t);const i=["coin","heart","ice"].map((a,s)=>{const l=lootMesh(a);return l.scale.setScalar(2.2),l.position.set((s-1)*2.2,0,0),t.add(l),l});e={g:t,upd:(a,s)=>{i.forEach((l,o)=>{l.rotation.y=s*1.5+o,l.position.y=Math.sin(s*2+o)*.25}),Math.random()<.3&&gFire.spawn(new V3((Math.random()-.5)*6,-1,(Math.random()-.5)*2),new V3(0,2,0),.12,.8,new Color(2.2,.15,.12),0,-1)}}}if(r==14){const t=new Group;gRoot.add(t);const i=makeFireballMesh(CLUSTER_COLS);i.scale.setScalar(2.3),t.add(i);const a=[0,1,2].map(()=>{const l=makeFireballMesh();return l.scale.setScalar(1.3),t.add(l),l});let s=0;e={g:t,upd:(l,o)=>{s+=l;const c=h=>h.children.forEach((f,u)=>{f.isSprite||(f.rotation.x+=l*(2+u*.3),f.rotation.y+=l*3)});if(s<1.6)i.visible=!0,a.forEach(h=>h.visible=!1),i.position.set(-14+s*8,2-s,0),c(i),gFire.spawn(i.position.clone(),new V3(-2,Math.random(),0),.6,.5,CLUSTER_COLS[Math.random()*3|0],-.6,-3);else if(s<3.4){i.visible&&(i.visible=!1,explode(i.position.clone(),1,GALP),AU.spit(.8));const h=s-1.6;a.forEach((f,u)=>{f.visible=!0;const d=(u-1)*.55;f.position.set(-1.2+Math.cos(d)*h*8,.4+Math.sin(d)*h*5,Math.sin(d)*h*3),c(f),Math.random()<.6&&gFire.spawn(f.position.clone(),new V3(-1,Math.random(),0),.4,.4,FIRE_COLS[u],-.6,-3)})}else s<3.5?a[0].visible&&(a.forEach(h=>{h.visible=!1,explode(h.position.clone(),1,GALP)}),AU.boom(.6)):s>4.6&&(s=0)}}}return gItems[r]=e,e}function galShow(r){gi=(r+GAL.length)%GAL.length;for(let t=0;t<GAL.length;t++){const i=gItems[t];i&&(i.g&&(i.g.visible=t==gi),i.show&&i.show(t==gi))}const e=galBuild(gi);e.g&&(e.g.visible=!0),e.show&&e.show(!0),$("gName").textContent=GAL[gi].name,$("gDesc").textContent=GAL[gi].desc,$("gNum").textContent=gi+1+" / "+GAL.length}$("gPrev").onclick=()=>galShow(gi-1),$("gNext").onclick=()=>galShow(gi+1),$("bGal").onclick=()=>{AU.init(),G.mode="gallery",renderPass.scene=gScene,$("menu").classList.add("hide"),$("gal").classList.remove("hide"),galShow(gi)},$("galBack").onclick=()=>{G.mode="menu",renderPass.scene=scene,$("gal").classList.add("hide"),$("menu").classList.remove("hide")},$("bPlay").onclick=()=>{$("menu").classList.add("hide"),startGame()};const STORM={flash:0,flashPos:new V3(0,200,0)},farMat=new ShaderMaterial({uniforms:{uFog:{value:new Color(FOG_HEX)},uCam:{value:new V3},uFlash:{value:0},uFlashPos:{value:new V3},uDens:{value:.0036},uTime:{value:0}},vertexShader:`attribute float aSide;varying float vK;varying vec3 vN;varying vec3 vW;varying float vSh;
  void main(){mat4 m=modelMatrix;
    #ifdef USE_INSTANCING
    m=m*instanceMatrix;
    #endif
    vec4 w=m*vec4(position,1.);vW=w.xyz;vN=normalize(mat3(m)*normal);vK=aSide;vec3 o=m[3].xyz;
    vSh=fract(sin(dot(floor(o*.37),vec3(12.9,78.2,37.7)))*43758.5);gl_Position=projectionMatrix*viewMatrix*w;}`,fragmentShader:`uniform vec3 uFog,uCam,uFlashPos;uniform float uFlash,uDens,uTime;varying float vK;varying vec3 vN;varying vec3 vW;varying float vSh;
  void main(){vec3 n=normalize(vN);float l=.3+.7*max(dot(n,normalize(vec3(-.45,.75,.35))),0.);
    vec3 c=vec3(.055,.065,.1)*(.7+vSh*.6)*l;if(n.y>.5)c+=vec3(.04,.05,.08);
    vec3 fd=normalize(uFlashPos-vW);c+=vec3(.45,.55,.9)*uFlash*(.3+.7*max(dot(n,fd),0.))*exp(-length(uFlashPos-vW)/240.);
    float d=length(vW-uCam);float f=1.-exp(-pow(d*uDens,1.6));
    if(vK>.5){c=vec3(3.2,1.25,.35)*(.7+.3*sin(uTime*2.3+vSh*40.));f*=.55;}
    c=mix(c,uFog*(1.+uFlash*.35),clamp(f,0.,.86));gl_FragColor=vec4(c,1.);}`});function genViaduct(r,e){const t=rng(r),i=[],a=(o,c,h,f=0)=>i.push({x:o,y:c,z:h,k:f}),s=3,l=5+(t()*2|0);for(let o=0;o<e;o++){for(let f=0;f<s;f++)a(o,0,f),a(o,-1,f);o%2==0&&(a(o,1,0),a(o,1,s-1));const c=o%l,h=Math.floor(o/l);if(c<2){const f=14+(Math.sin(h*91.7+r)*43758.5%1+1)%1*14|0;for(let u=-2;u>=-f;u--)a(o,u,0),a(o,u,s-1),u%5==0&&a(o,u,1)}else{const f=l-2,u=c-2+.5-f/2,d=f/2,g=Math.sqrt(Math.max(0,d*d-u*u)),_=Math.round(-3-(d-g)*1.6);for(let v=-2;v>=_;v--)for(let m=0;m<s;m++)a(o,v,m,m==0&&v==-2&&t()<.06?1:0)}}for(const o of[1,e-5,(e/2|0)-2]){const c=6+(t()*9|0),h=4;for(let f=1;f<=c;f++)for(let u=o;u<o+h;u++)for(let d=-1;d<=s;d++)(u==o||u==o+h-1||d==-1||d==s)&&a(u,f,d,f%3==1&&(u==o+1||u==o+2)&&t()<.45?1:0);for(let f=o;f<o+h;f+=2)a(f,c+1,-1),a(f,c+1,s)}return i}class Viaduct{constructor(e,t,i,a,s,l=2.6){this.orig=genViaduct(t,s),this.blocks=this.orig.slice(),this.cell=l,this.len=s,this.g=new Group,this.g.position.copy(i),this.g.rotation.y=a,e.add(this.g),this.broken=0,this.regenT=0,this.build()}build(){this.mesh&&(this.g.remove(this.mesh),this.mesh.geometry.dispose());const e=this.blocks.length,t=this.cell,i=new BoxGeometry(t,t,t),a=new Float32Array(e),s=new InstancedMesh(i,farMat,e);this.blocks.forEach((l,o)=>{_m4.makeTranslation((l.x-this.len/2)*t,l.y*t,(l.z-1)*t),s.setMatrixAt(o,_m4),a[o]=l.k}),i.setAttribute("aSide",new InstancedBufferAttribute(a,1)),i.setAttribute("aTop",new InstancedBufferAttribute(new Float32Array(e),1)),s.computeBoundingSphere(),this.g.add(s),this.mesh=s}blockWorld(e,t){return this.g.localToWorld(t.set((e.x-this.len/2)*this.cell,e.y*this.cell,(e.z-1)*this.cell))}randomTarget(e){const t=this.blocks.filter(a=>a.y>=-2&&a.y<=1&&!a.k),i=t[Math.random()*t.length|0]||this.blocks[0];return this.blockWorld(i,e)}shatterAt(e,t,i,a){this.g.updateMatrixWorld(!0);const s=[],l=new V3;let o=0;for(const c of this.blocks)if(this.blockWorld(c,l),l.distanceTo(e)/this.cell<t*(.75+Math.random()*.4)){const f=l.clone().sub(e).normalize(),u=10+Math.random()*18;i.spawn(l.x,l.y,l.z,f.x*u+a.x*.4,f.y*u*.6+6+Math.random()*8,f.z*u+a.z*.4,c.k,0,5+Math.random()*3,this.cell*(.7+Math.random()*.3)),o++}else s.push(c);return this.blocks=s,this.build(),this.broken+=o,this.regenT=0,o}update(e){this.broken>0&&(this.regenT+=e,this.regenT>40&&(this.blocks=this.orig.slice(),this.broken=0,this.build()))}}function makeCloudCards(r,e,t,i,a,s,l,o,c){const h=new PlaneGeometry(1,1),f=new InstancedBufferGeometry;f.index=h.index,f.setAttribute("position",h.attributes.position),f.setAttribute("uv",h.attributes.uv);const u=new Float32Array(r*3),d=new Float32Array(r*2),g=new Float32Array(r),_=rng(e);for(let p=0;p<r;p++){const E=_()*Math.PI*2,x=t+Math.sqrt(_())*(i-t),w=l+_()*(o-l);u.set([Math.cos(E)*x,a+_()*(s-a),Math.sin(E)*x],p*3),d.set([w*1.7,w],p*2),g[p]=_()*100}f.setAttribute("aOff",new InstancedBufferAttribute(u,3)),f.setAttribute("aSize",new InstancedBufferAttribute(d,2)),f.setAttribute("aSeed",new InstancedBufferAttribute(g,1)),f.instanceCount=r;const v=new ShaderMaterial({uniforms:{uTime:{value:0},uFlash:{value:0},uFlashPos:{value:new V3},uFog:{value:new Color(FOG_HEX)},uCam:{value:new V3},uOrigin:{value:new V3},uOp:{value:c}},vertexShader:`attribute vec3 aOff;attribute vec2 aSize;attribute float aSeed;uniform vec3 uOrigin;uniform float uTime;varying vec2 vUv;varying float vSeed;varying vec3 vC;varying vec3 vW;
    void main(){vec3 R=normalize(vec3(viewMatrix[0][0],viewMatrix[1][0],viewMatrix[2][0]));vec3 wc=aOff+uOrigin+vec3(sin(uTime*.02+aSeed)*6.,sin(uTime*.05+aSeed)*1.5,0.);
      vec3 wp=wc+R*position.x*aSize.x+vec3(0.,position.y*aSize.y,0.);vUv=uv;vSeed=aSeed;vC=wc;vW=wp;gl_Position=projectionMatrix*viewMatrix*vec4(wp,1.);}`,fragmentShader:`uniform float uTime,uFlash,uOp;uniform vec3 uFlashPos,uFog,uCam;varying vec2 vUv;varying float vSeed;varying vec3 vC;varying vec3 vW;${NOISE}
    void main(){vec2 p=vUv*vec2(2.6,1.6)+vSeed;float n=fbm(p*1.5+vec2(uTime*.012,0.)+fbm(p*2.2+uTime*.025)*.7);
      vec2 q=(vUv-.5)*vec2(1.,1.35);float rad=1.-smoothstep(.12,.5,length(q));float a=smoothstep(.3,.72,n*rad*1.55);
      float top=smoothstep(.15,.95,vUv.y);vec3 c=mix(vec3(.06,.075,.13),vec3(.26,.32,.5),top*.65+n*.45);
      c+=vec3(.65,.75,1.1)*uFlash*exp(-length(uFlashPos-vC)/130.)*(.5+n)*1.6;
      float d=length(vW-uCam);c=mix(c,uFog*(1.+uFlash*.3),clamp(1.-exp(-pow(d*.0052,1.5)),0.,.85));
      gl_FragColor=vec4(c,a*uOp);}`,transparent:!0,depthWrite:!1,fog:!1}),m=new Mesh(f,v);return m.frustumCulled=!1,m}function make2DViaductTex(r){const i=document.createElement("canvas");i.width=512,i.height=128;const a=i.getContext("2d"),s=rng(r);for(let o=0;o<3;o++){const c=Math.round(128*(.28+o*.2+s()*.08)),h=Math.round(s()*512*.35),f=Math.round(512*(.4+s()*.45)),u=10+(s()*6|0);a.fillStyle="#0000ff",a.fillRect(h,c,f,3);for(let g=h;g<h+f;g+=4)a.fillRect(g,c-1,2,1);for(let g=h;g<h+f;g+=u)a.fillRect(g,c+3,3,128-c);for(let g=h;g<h+f-u;g+=u)a.fillRect(g+3,c+3,u-3,6),a.globalCompositeOperation="destination-out",a.beginPath(),a.ellipse(g+3+(u-3)/2,c+9,(u-3)/2,4.5,0,0,Math.PI*2),a.fill(),a.globalCompositeOperation="source-over";const d=1+(s()*3|0);for(let g=0;g<d;g++){const _=h+Math.round(s()*(f-8)),v=5+(s()*4|0),m=8+(s()*16|0);a.fillStyle="#0000ff",a.fillRect(_,c-m,v,m);for(let p=0;p<v;p+=2)a.fillRect(_+p,c-m-2,1,2);a.fillStyle="#ff0000";for(let p=0;p<3;p++)s()<.7&&a.fillRect(_+1+(s()*(v-2)|0),c-m+2+(s()*(m-4)|0),1,1)}}const l=new CanvasTexture(i);return l.magFilter=l.minFilter=NearestFilter,l.generateMipmaps=!1,l.wrapS=RepeatWrapping,l}function bandMat(r,e,t,i){return new ShaderMaterial({uniforms:{uTex:{value:r},uFog:{value:new Color(FOG_HEX)},uMix:{value:e},uFlash:{value:0},uTime:{value:0},uRep:{value:t}},vertexShader:"varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",fragmentShader:`uniform sampler2D uTex;uniform vec3 uFog;uniform float uMix,uFlash,uTime,uRep;varying vec2 vUv;
  void main(){vec4 s=texture2D(uTex,vec2(fract(vUv.x*uRep),vUv.y));if(s.a<.5)discard;vec3 c=vec3(.05,.06,.1)+vec3(.4,.5,.85)*uFlash*.45;
    c=mix(c,uFog*(1.+uFlash*.3),uMix);if(s.r>.5)c=vec3(3.,1.2,.35)*(.75+.25*sin(uTime*2.+vUv.x*900.))*(1.-uMix*.55);gl_FragColor=vec4(c,1.);}`,side:i?DoubleSide:BackSide,depthWrite:!1,fog:!1})}function boltPts(r,e,t,i){let a=[r,e];for(let s=0;s<t;s++){const l=[a[0]];for(let o=0;o<a.length-1;o++){const c=a[o],h=a[o+1],f=c.clone().add(h).multiplyScalar(.5);f.x+=(Math.random()-.5)*i,f.z+=(Math.random()-.5)*i,f.y+=(Math.random()-.5)*i*.25,l.push(f,h)}a=l,i*=.55}return a}function ribbon(r,e,t,i,a){const s=e.length-1;for(let l=0;l<s;l++){const o=e[l],c=e[l+1],h=c.clone().sub(o).cross(a).normalize(),f=t+(i-t)*l/s,u=t+(i-t)*(l+1)/s,d=o.clone().addScaledVector(h,f),g=o.clone().addScaledVector(h,-f),_=c.clone().addScaledVector(h,u),v=c.clone().addScaledVector(h,-u);for(const m of[d,g,_,g,v,_])r.push(m.x,m.y,m.z)}}class Lightning{constructor(e){this.parent=e,this.bolts=[],this.t=1.5+Math.random()*2,this.count=0}strike(e,t){const i=new V3;e.getWorldDirection(i);const a=Math.atan2(i.z,i.x),s=Math.random()<.7?a+(Math.random()-.5)*2:Math.random()*Math.PI*2,l=150+Math.random()*120,o=new V3(t.x+Math.cos(s)*l,t.y+85+Math.random()*30,t.z+Math.sin(s)*l),c=o.clone().add(new V3((Math.random()-.5)*50,-(110+Math.random()*70),(Math.random()-.5)*50)),h=boltPts(o,c,6,60),f=e.position.clone().sub(o.clone().lerp(c,.5)).normalize(),u=[],d=[];ribbon(u,h,.75,.25,f),ribbon(d,h,3.2,1.2,f);for(let v=0;v<3;v++){const m=4+(Math.random()*40|0),p=h[m],E=p.clone().add(new V3((Math.random()-.5)*60,-(25+Math.random()*45),(Math.random()-.5)*60)),x=boltPts(p,E,4,26);ribbon(u,x,.4,.1,f),ribbon(d,x,1.6,.5,f)}const g=(v,m)=>{const p=new BufferGeometry;p.setAttribute("position",new Float32BufferAttribute(v,3));const E=new Mesh(p,new MeshBasicMaterial({color:m,transparent:!0,blending:AdditiveBlending,depthWrite:!1,fog:!1,side:DoubleSide}));return E.frustumCulled=!1,this.parent.add(E),E},_=o.clone().lerp(c,.3);this.bolts.push({c:g(u,new Color(2.8,3.3,5)),g:g(d,new Color(.35,.45,.9)),t:0,life:.6,pos:_}),STORM.flashPos.copy(_),this.count++,AU.thunder(l)}update(e,t,i){this.t-=e,this.t<=0&&(this.strike(t,i),this.t=Math.random()<.25?.3:(2.5+Math.random()*5)/Math.max(.15,STORM.rate||1));let a=0;for(let s=this.bolts.length-1;s>=0;s--){const l=this.bolts[s];l.t+=e;const o=l.t,c=o<.06?1:o<.11?.2:o<.19?.95:Math.max(0,1-(o-.19)/.4);if(l.c.material.opacity=c,l.g.material.opacity=c*.8,a=Math.max(a,c),o>l.life){for(const h of[l.c,l.g])this.parent.remove(h),h.geometry.dispose(),h.material.dispose();this.bolts.splice(s,1)}}STORM.flash=Math.max(a,STORM.flash*Math.exp(-6*e))}}class StormLayer{constructor(e,t){this.g=new Group,e.add(this.g),this.origin=new V3,this.cards=makeCloudCards(t?70:170,3,70,260,-70,60,28,80,.95),this.g.add(this.cards),this.ceil=makeCloudCards(t?20:46,9,0,260,85,125,110,190,.9),this.g.add(this.ceil),this.bands=[],t||[[17,430,250,.6,-30,3],[29,360,190,.42,22,2]].forEach(([i,a,s,l,o,c])=>{const h=new Mesh(new CylinderGeometry(a,a,s,72,1,!0),bandMat(make2DViaductTex(i),l,c,!1));h.renderOrder=-9,h.frustumCulled=!1,h.userData.off=o,h.rotation.y=i,this.g.add(h),this.bands.push(h)}),this.light=new Lightning(this.g)}update(e,t,i,a){this.origin.set(damp(this.origin.x,i.x*.7,1,e),damp(this.origin.y,i.y*.9,1,e),damp(this.origin.z,i.z*.7,1,e)),this.light.update(e,a,i);for(const s of[this.cards,this.ceil]){const l=s.material.uniforms;l.uTime.value=t,l.uFlash.value=STORM.flash,l.uFlashPos.value.copy(STORM.flashPos),l.uCam.value.copy(a.position),l.uOrigin.value.copy(this.origin)}for(const s of this.bands)s.position.set(a.position.x,i.y*.95+s.userData.off,a.position.z),s.material.uniforms.uFlash.value=STORM.flash,s.material.uniforms.uTime.value=t}}const glowTex=(()=>{const r=document.createElement("canvas");r.width=r.height=64;const e=r.getContext("2d"),t=e.createRadialGradient(32,32,0,32,32,32);return t.addColorStop(0,"rgba(255,220,140,1)"),t.addColorStop(.35,"rgba(255,120,40,.45)"),t.addColorStop(1,"rgba(255,80,20,0)"),e.fillStyle=t,e.fillRect(0,0,64,64),new CanvasTexture(r)})(),FIRE_COLS=[new Color(5,2.3,.5),new Color(4,1.1,.25),new Color(6,4.2,1.5)];function makeFireballMesh(r){const e=new Group,t=r||FIRE_COLS,i=rng(Math.random()*1e6|0);for(let s=0;s<8;s++){const l=.4+i()*.5,o=new Mesh(new BoxGeometry(l,l,l),new MeshBasicMaterial({color:t[s%3],fog:!1}));o.position.set((i()-.5)*.6,(i()-.5)*.6,(i()-.5)*.6),o.rotation.set(i()*3,i()*3,i()*3),e.add(o)}const a=new Sprite(new SpriteMaterial({map:glowTex,blending:AdditiveBlending,depthWrite:!1,transparent:!0,fog:!1}));return a.scale.setScalar(4.5),e.add(a),e}const fire=new PointPool(scene,900,!0,!0),farDebris=new Debris(scene,1500,farMat),boomLight=new PointLight(16747066,0,70,1.2);scene.add(boomLight);const fbLights=[0,1].map(()=>{const r=new PointLight(16742954,0,24,1.4);return scene.add(r),r}),MAINP={fire,dust,light:boomLight},fireballs=[];function explode(r,e=1,t=MAINP){for(let i=0;i<50;i++){const a=new V3(Math.random()-.5,Math.random()-.3,Math.random()-.5).normalize().multiplyScalar((6+Math.random()*14)*e);t.fire.spawn(r,a,(.3+Math.random()*.5)*e,.5+Math.random()*.7,FIRE_COLS[i%3],-.5,4*e)}for(let i=0;i<12;i++)t.dust.spawn(r.clone().add(new V3((Math.random()-.5)*2*e,(Math.random()-.5)*2*e,(Math.random()-.5)*2*e)),new V3((Math.random()-.5)*5*e,Math.random()*3*e,(Math.random()-.5)*5*e),(2.5+Math.random()*2)*e,2.4,new Color(.16,.18,.26),1.4,-.6);t.light.position.copy(r),t.light.intensity=60*Math.min(e,2)}function spitFireball(r,e,t,i,a,s={}){const l=s.kind==="cluster",o=makeFireballMesh(l?CLUSTER_COLS:null);o.scale.setScalar(t?2.4:l?2.3:1.5),o.position.copy(r),scene.add(o);const c=s.dir?s.dir.clone().normalize():e.clone().sub(r).normalize();fireballs.push({m:o,v:c.multiplyScalar(i),speed:i,target:e.clone(),far:t,life:14,via:a,home:s.home||0,kind:s.kind||"n",split:s.split||0,dist0:r.distanceTo(e)})}function killFireball(r){const e=fireballs[r];scene.remove(e.m),e.m.traverse(t=>{t.geometry&&t.geometry.dispose()}),fireballs.splice(r,1)}function updateFireballs(r,e){let t=0;fbLights.forEach(i=>i.intensity=damp(i.intensity,0,8,r));for(let i=fireballs.length-1;i>=0;i--){const a=fireballs[i],s=a.m.position;if(a.life-=r,a.home){const o=a.target.clone().sub(s).normalize().multiplyScalar(a.speed);dampV(a.v,o,a.home,r),a.v.setLength(a.speed)}if(s.addScaledVector(a.v,r),a.kind==="cluster"&&s.distanceTo(a.target)<a.dist0*.55){const o=s.clone(),c=a.v.clone().normalize(),h=a.split,f=a.speed;killFireball(i),explode(o,.9),AU.spit(.8);for(let u=0;u<h;u++){const d=c.clone().applyAxisAngle(new V3(0,1,0),(u-(h-1)/2)*.6);d.y+=.25,spitFireball(o,a.target,!1,f*1.15,null,{dir:d,home:2.2})}continue}a.m.children.forEach((o,c)=>{if(o.isSprite){o.scale.setScalar(4.5*(1+Math.sin(e*20+c)*.12));return}o.rotation.x+=r*(2+c*.3),o.rotation.y+=r*(3-c*.2);const h=1+Math.sin(e*15+c*2)*.15;o.scale.setScalar(h)});const l=a.far?2.4:1;for(let o=0;o<2;o++)fire.spawn(s.clone().add(new V3((Math.random()-.5)*.6*l,(Math.random()-.5)*.6*l,(Math.random()-.5)*.6*l)),a.v.clone().multiplyScalar(-.12).add(new V3((Math.random()-.5)*2,Math.random()*2,(Math.random()-.5)*2)),(.25+Math.random()*.3)*l,.45+Math.random()*.4,FIRE_COLS[Math.random()*3|0],-.6,-3);if(!a.far&&t<fbLights.length&&(fbLights[t].position.copy(s),fbLights[t].intensity=8+Math.sin(e*30)*2,t++),s.distanceTo(a.target)<(a.far?4:1.6)||a.life<=0){const o=a.v.clone(),c=a.far,h=a.via,f=a.target.clone();killFireball(i),c?(explode(f,4),h&&h.shatterAt(f,5.5,farDebris,o.multiplyScalar(.5)),AU.boom(.35)):(explode(f,1.6),AU.boom(1),G.mode==="play"&&!["fall","over"].includes(G.phase)?crash(o):G.shake=Math.max(G.shake,.6))}}}const storm=new StormLayer(scene,!1),stormG=new Group;scene.add(stormG);const viaducts=[];for(let r=0;r<7;r++){const e=r/7*Math.PI*2+.4+Math.sin(r*3.1)*.2,t=150+r%3*60,i=-60+r*37%5*32;viaducts.push(new Viaduct(stormG,300+r*17,new V3(Math.cos(e)*t,i,Math.sin(e)*t),-e+Math.PI/2+Math.sin(r*5.3)*.25,40+r*7%17,3.2))}const farDragon=new Dragon(scene);[farDragon.root,...farDragon.tail].forEach(r=>r.traverse(e=>{e.material&&(e.material.fog=!1,e.material.needsUpdate=!0)})),farDragon.emBase.setRGB(.045,.06,.1),farDragon.root.position.set(-120,20,40),farDragon.resetTail();const FD={st:"cruise",t:0,a:2,via:null,p:new V3,dir:new V3};function updateFarDragon(r,e){const t=stormG.position,i=farDragon;FD.t+=r;let a=null,s=.2;if(FD.st==="cruise"){if(FD.a+=r*.09,i.steer(_v.set(t.x+Math.cos(FD.a)*150,t.y+18+Math.sin(e*.3)*12,t.z+Math.sin(FD.a)*120),22,1,r),i.fold=damp(i.fold,0,2,r),i.claw=damp(i.claw,0,2,r),FD.t>7+Math.random()*4){const l=viaducts.filter(o=>o.blocks.length>o.orig.length*.7);l.length&&(FD.via=l[Math.random()*l.length|0],FD.via.randomTarget(FD.p),FD.st=Math.random()<.5?"ram":"spit",FD.t=0)}}else if(FD.st==="ram")a=FD.p,i.steer(FD.p,42,2,r),i.fold=damp(i.fold,.55,3,r),i.claw=damp(i.claw,1,3,r),i.jawOpen=damp(i.jawOpen,1,3,r),(i.root.position.distanceTo(FD.p)<6||FD.t>12)&&(FD.via.shatterAt(FD.p,6.5,farDebris,i.vel),explode(FD.p,4.5),AU.boom(.35),FD.dir.copy(i.vel).normalize(),FD.st="away",FD.t=0);else if(FD.st==="spit"){a=FD.p;const l=_w.copy(i.root.position).sub(FD.p);l.y=0,l.setLength(55).add(FD.p),l.y=FD.p.y+12,i.steer(l,26,1.4,r),FD.t>3&&(i.jawOpen=damp(i.jawOpen,1,6,r),i.charge=damp(i.charge,1,5,r)),FD.t>3.8&&(spitFireball(i.mouthPos(new V3),FD.p,!0,32,FD.via),AU.spit(.3),FD.dir.copy(i.vel).normalize(),FD.st="away",FD.t=0)}else i.steer(_v.copy(i.root.position).addScaledVector(FD.dir,30).add(new V3(0,14,0)),26,1,r),i.fold=damp(i.fold,0,2,r),i.claw=damp(i.claw,0,2,r),i.jawOpen=damp(i.jawOpen,0,2,r),s=1,FD.t>4&&(FD.st="cruise",FD.t=0,FD.a=Math.atan2(i.root.position.z-t.z,i.root.position.x-t.x));i.animate(r,e,a,s)}const hemiMain=scene.children.find(r=>r.isHemisphereLight);function updateStormWorld(r,e){const t=archer.root.position;stormG.position.set(damp(stormG.position.x,t.x*.8,1,r),damp(stormG.position.y,t.y*.9,1,r),damp(stormG.position.z,t.z*.8,1,r)),storm.update(r,e,t,camera);for(const a of viaducts)a.update(r);updateFarDragon(r,e),updateFireballs(r,e),fire.update(r),farDebris.update(r),boomLight.intensity=damp(boomLight.intensity,0,4,r),hemiMain.intensity=TH.hemiI+STORM.flash*1.3;const i=farMat.uniforms;i.uCam.value.copy(camera.position),i.uFlash.value=STORM.flash,i.uFlashPos.value.copy(STORM.flashPos),i.uTime.value=e}const gFire=new PointPool(gScene,500,!0,!0),gFarDeb=new Debris(gScene,700,farMat),gBoom=new PointLight(16747066,0,70,1.2);gScene.add(gBoom);const GALP={fire:gFire,dust:gDust,light:gBoom},HINT0="Tap or hold to fire arrows",CLUSTER_COLS=[new Color(4.5,.6,.5),new Color(2.2,.25,.6),new Color(5,2,1.2)],THEMES=[{name:"ТУМАН",news:"Огненный шар и таран головой",fog:5666744,dens:.026,top:8824543,low:4152470,hemi:12900095,hemiI:1.35,exp:1,light:.6,rain:0,ember:0,snow:1,moon:0,moonCol:14674175,aurora:0,wind:1,sheet:7574479},{name:"ГРОЗА",news:"Новое: залп из двух шаров. Ливень и частые молнии",fog:4874905,dens:.028,top:6257584,low:3031923,hemi:11124200,hemiI:1.15,exp:.95,light:2.4,rain:1,ember:0,snow:.25,moon:0,moonCol:14674175,aurora:0,wind:2.2,sheet:6257845},{name:"ПЕПЕЛЬНЫЙ СНЕГ",news:"Новое: удар хвостом по башне. В воздухе пепел и угли",fog:6972566,dens:.026,top:10194880,low:4865904,hemi:14731496,hemiI:1.3,exp:1,light:.5,rain:0,ember:1,snow:.6,moon:0,moonCol:14674175,aurora:0,wind:.6,sheet:9076661},{name:"БАГРОВАЯ ЛУНА",news:"Новое: кассетный шар распадается на три",fog:5917306,dens:.024,top:8018570,low:3023944,hemi:16758960,hemiI:1.2,exp:.95,light:.8,rain:0,ember:.5,snow:.3,moon:1,moonCol:16734784,aurora:0,wind:1,sheet:8022682},{name:"БУРАН",news:"Новое: самонаводящиеся шары, залп из трёх. Ветер сносит стрелы",fog:10466006,dens:.04,top:13162222,low:8229304,hemi:15266047,hemiI:1.6,exp:1.05,light:.3,rain:0,ember:0,snow:3,moon:0,moonCol:14674175,aurora:0,wind:5,sheet:12636396},{name:"СИЯНИЕ",news:"Новое: шар распадается на пять, огонь прямо во время тарана",fog:2310238,dens:.022,top:1782612,low:924723,hemi:10477784,hemiI:1.1,exp:1.05,light:.4,rain:0,ember:0,snow:.7,moon:.5,moonCol:15134975,aurora:1,wind:.8,sheet:3828362},{name:"ЗАТМЕНИЕ",news:"Дракон быстрее и злее во всём",fog:2827328,dens:.03,top:3484239,low:1183262,hemi:11575512,hemiI:.95,exp:1,light:1.6,rain:.5,ember:.7,snow:.4,moon:1,moonCol:6955056,aurora:.3,wind:2,sheet:4602470}],themeFor=r=>r-1<THEMES.length?THEMES[r-1]:THEMES[1+(r-2)%(THEMES.length-1)];function diff(r){return{volley:r>=5?3:r>=2?2:1,cluster:r>=4?r>=6?5:3:0,homing:r>=5,tail:r>=3,combo:r>=6,fbSpeed:10+r*.8,interval:Math.max(2.4,6.5-r*.45),repel:2+Math.floor(r/2)}}const TH={fog:new Color(FOG_HEX),top:new Color(8824543),low:new Color(4152470),hemi:new Color(12900095),sheet:new Color(7574479),moonCol:new Color(14674175),dens:.026,hemiI:1.35,exp:1,light:.6,rain:0,ember:0,snow:1,moon:0,aurora:0,wind:1};let THT=THEMES[0];const _tc=new Color,WX=(()=>{const r=(o,c,h,f,u)=>{const d=new BufferGeometry,g=rng(c),_=new Float32Array(o*3);for(let p=0;p<o*3;p++)_[p]=g();d.setAttribute("position",new BufferAttribute(new Float32Array(o*3),3)),d.setAttribute("aSeed",new BufferAttribute(_,3));const v=new ShaderMaterial({uniforms:{uTime:{value:0},uC:{value:new V3},uScale:{value:400},uOp:{value:0},uDrift:{value:0}},vertexShader:h,fragmentShader:f,transparent:!0,depthWrite:!1,fog:!1,blending:u?AdditiveBlending:NormalBlending}),m=new Points(d,v);return m.frustumCulled=!1,scene.add(m),m},e=r(2e3,77,`attribute vec3 aSeed;uniform float uTime,uScale,uOp,uDrift;uniform vec3 uC;varying float vA;
    void main(){vec3 B=vec3(60.,40.,60.);vec3 p=aSeed*B;p.y-=uTime*(26.+aSeed.x*10.);p.x+=uDrift*3.;vec3 o=uC-B*.5;p=o+mod(p-o,B);
      vec4 mv=viewMatrix*vec4(p,1.);float z=-mv.z;gl_PointSize=(.55+aSeed.y*.4)*uScale/max(z,.1);gl_Position=projectionMatrix*mv;vA=smoothstep(40.,4.,z)*smoothstep(.5,2.,z)*uOp*step(aSeed.z,uOp);}`,"varying float vA;void main(){vec2 c=gl_PointCoord-.5;float a=(1.-smoothstep(0.,.05,abs(c.x)))*(1.-smoothstep(.2,.5,abs(c.y)));gl_FragColor=vec4(.78,.86,1.,a*vA*.6);}",!1),t=r(700,78,`attribute vec3 aSeed;uniform float uTime,uScale,uOp,uDrift;uniform vec3 uC;varying float vA;varying float vF;
    void main(){vec3 B=vec3(60.,40.,60.);vec3 p=aSeed*B;p.y+=uTime*(1.2+aSeed.x*2.);p.x+=sin(uTime*.7+aSeed.z*20.)*2.+uDrift;p.z+=cos(uTime*.5+aSeed.y*17.)*2.;vec3 o=uC-B*.5;p=o+mod(p-o,B);
      vec4 mv=viewMatrix*vec4(p,1.);float z=-mv.z;gl_PointSize=(.06+aSeed.y*.1)*uScale/max(z,.1);gl_Position=projectionMatrix*mv;
      vF=.6+.4*sin(uTime*(3.+aSeed.x*6.)+aSeed.z*50.);vA=smoothstep(45.,4.,z)*smoothstep(.5,2.,z)*uOp*step(aSeed.z,uOp*.9+.1);}`,"varying float vA;varying float vF;void main(){gl_FragColor=vec4(vec3(3.2,1.1,.25)*vF,vA);}",!0),i=new Mesh(new PlaneGeometry(1,1),new ShaderMaterial({uniforms:{uCol:{value:new Color},uOp:{value:0}},vertexShader:"varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",fragmentShader:`uniform vec3 uCol;uniform float uOp;varying vec2 vUv;${NOISE}
    void main(){vec2 q=vUv-.5;float r=length(q);float disc=smoothstep(.205,.195,r);float n=fbm(q*14.+3.);float rim=smoothstep(.16,.2,r)*disc;
      float glow=exp(-max(r-.2,0.)*14.)*(1.-disc);vec3 c=uCol*(disc*(.55+.5*n)+rim*.6)+uCol*glow*.9;gl_FragColor=vec4(c,max(disc,glow*.75)*uOp);}`,transparent:!0,depthWrite:!1,fog:!1}));i.scale.setScalar(260),i.renderOrder=-9,i.frustumCulled=!1,scene.add(i);const a=new Mesh(new CylinderGeometry(560,560,260,96,1,!0),new ShaderMaterial({uniforms:{uTime:{value:0},uOp:{value:0}},vertexShader:"varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",fragmentShader:`uniform float uTime,uOp;varying vec2 vUv;${NOISE}
    void main(){float x=vUv.x*60.;float c=fbm(vec2(x*.35+uTime*.05,vUv.y*1.5-uTime*.03));float folds=.55+.45*sin(x*1.3+uTime*.4+c*6.);
      float band=smoothstep(.0,.25,vUv.y)*pow(1.-vUv.y,1.2)*smoothstep(.35,.75,c);vec3 col=mix(vec3(.1,1.5,.75),vec3(.7,.3,1.4),smoothstep(.3,1.,vUv.y));
      gl_FragColor=vec4(col*band*folds*uOp*.9,1.);}`,side:BackSide,transparent:!0,depthWrite:!1,fog:!1,blending:AdditiveBlending}));a.renderOrder=-8,a.frustumCulled=!1,scene.add(a);const s=new V3(.55,.42,-.72).normalize(),l=new V3;return{rain:e,ember:t,moon:i,aur:a,update(o,c){const h=camera.position;for(const f of[e,t]){const u=f.material.uniforms;u.uTime.value=c,u.uC.value.copy(h),u.uScale.value=ptScale,u.uDrift.value+=TH.wind*o}e.material.uniforms.uOp.value=TH.rain,t.material.uniforms.uOp.value=TH.ember,e.visible=TH.rain>.01,t.visible=TH.ember>.01,camera.getWorldDirection(l),l.y=0,l.normalize().applyAxisAngle(new V3(0,1,0),.4),l.y=.42,l.normalize(),dampV(s,l,.25,o),s.normalize(),i.position.copy(h).addScaledVector(s,640),i.lookAt(h),i.material.uniforms.uCol.value.copy(TH.moonCol),i.material.uniforms.uOp.value=TH.moon,i.visible=TH.moon>.01,a.position.set(h.x,archer.root.position.y+190,h.z),a.material.uniforms.uTime.value=c,a.material.uniforms.uOp.value=TH.aurora,a.visible=TH.aurora>.01}}})();function applyTheme(r,e){const t=1-Math.exp(-.6*r);for(const s of["fog","top","low","hemi","sheet","moonCol"])TH[s].lerp(_tc.set(THT[s]),t);for(const s of["dens","hemiI","exp","light","rain","ember","snow","moon","aurora","wind"])TH[s]+=(THT[s]-TH[s])*t;scene.fog.color.copy(TH.fog),scene.fog.density=TH.dens*(1+(G.fogBoost||0)*1.6),scene.background.copy(TH.fog);const i=atmo.sky.material.uniforms;i.uHor.value.copy(TH.fog),i.uTop.value.copy(TH.top),i.uLow.value.copy(TH.low),hemiMain.color.copy(TH.hemi);for(const s of atmo.sheets)s.material.uniforms.uCol.value.copy(TH.sheet);farMat.uniforms.uFog.value.copy(TH.fog);for(const s of[storm.cards,storm.ceil])s.material.uniforms.uFog.value.copy(TH.fog);for(const s of storm.bands)s.material.uniforms.uFog.value.copy(TH.fog);STORM.rate=TH.light;const a=atmo.specks.material.uniforms;a.uAmt.value=TH.snow,a.uDrift.value+=TH.wind*.9*r,WX.update(r,e)}const SAVE={coins:0,owned:["bow"],weapon:"bow",best:1};pgSaved&&typeof pgSaved=="object"&&Object.assign(SAVE,pgSaved),Array.isArray(SAVE.owned)||(SAVE.owned=["bow"]),typeof SAVE.coins!="number"&&(SAVE.coins=0);function save(){PG.ready&&window.bridge.storage.set(["luchnik_save"],[JSON.stringify(SAVE)]).catch(()=>{})}const WEAPONS=[{id:"bow",name:"Hunting Bow",price:0,cd:.42,n:1,spread:0,speed:62,dmg:1,col:5914672,desc:"A single reliable arrow."},{id:"twin",name:"Twin Bow",price:25,cd:.45,n:2,spread:.05,speed:62,dmg:1,col:9080744,desc:"Two arrows per shot."},{id:"xbow",name:"Crossbow",price:50,cd:.26,n:1,spread:0,speed:90,dmg:1,col:3093058,desc:"Fast bolts and rapid fire."},{id:"fire",name:"Fire Bow",price:90,cd:.5,n:1,spread:0,speed:66,dmg:2,fire:!0,col:12603422,desc:"Double damage. Blast nearby fireballs."},{id:"storm",name:"Arrow Storm",price:150,cd:.38,n:3,spread:.07,speed:72,dmg:1,col:3828400,desc:"Three arrows in a spread."}],weapon=()=>WEAPONS.find(r=>r.id===SAVE.weapon)||WEAPONS[0];function setWeaponLook(){const r=weapon();archer.mBow.color.set(r.col),archer.mBow.emissive.set(r.fire?3805188:0)}function renderShop(){$("shCoins").textContent="● "+SAVE.coins;const r=$("shList");r.innerHTML="";for(const e of WEAPONS){const t=SAVE.owned.includes(e.id),i=SAVE.weapon===e.id,a=document.createElement("button");a.className="wp"+(i?" eq":"")+(!t&&SAVE.coins<e.price?" no":""),a.innerHTML=`<span class="sw" style="background:#${new Color(e.col).getHexString()}"></span><span class="tx"><b>${e.name}</b><i>${e.desc}</i></span><span class="pr">${i?"EQUIPPED":t?"EQUIP":"● "+e.price}</span>`,a.onclick=()=>{if(t)SAVE.weapon=e.id;else if(SAVE.coins>=e.price)SAVE.coins-=e.price,SAVE.owned.push(e.id),SAVE.weapon=e.id,AU.buy();else return;save(),setWeaponLook(),renderShop(),renderRes()},r.appendChild(a)}}$("bShop").onclick=r=>{r.stopPropagation(),G.mode==="play"&&(G.paused=!0,G.holding=!1,renderShop(),$("shop").classList.remove("hide"))},$("shClose").onclick=()=>{G.paused=!1,$("shop").classList.add("hide")},$("bFreeze").onclick=r=>{r.stopPropagation(),G.freezeAmmo>0&&(G.freezeOn=!G.freezeOn,AU.ice()),renderRes()},$("bRetry").onclick=()=>(pgInterstitial(),startGame()),$("bOvMenu").onclick=()=>{pgInterstitial(),$("over").classList.add("hide"),G.mode="menu",hud(!1),$("menu").classList.remove("hide")};function renderRes(){$("hearts").innerHTML='<i class="ht"></i>'.repeat(Math.max(0,G.lives||0)),$("coins").innerHTML='<i class="cn"></i>'+SAVE.coins,$("bFreeze").innerHTML=ICON_ICE+"<b>"+(G.freezeAmmo||0)+"</b>",$("bFreeze").classList.toggle("on",!!G.freezeOn)}let lvlTO=0;function showLvl(r){const e=$("lvl");e.textContent=r,e.style.opacity=1,clearTimeout(lvlTO),lvlTO=setTimeout(()=>e.style.opacity=0,5500)}function showRepel(){const r=$("repel");r.innerHTML=Array.from({length:G.repelNeed},(e,t)=>'<i class="'+(t<G.repelHits?"on":"")+'"></i>').join(""),r.style.opacity=1}function startSpecial(){const r=diff(G.level),e=archer.root.position;G.repelHits=0,G.repelNeed=r.repel,G.pt=0,G.comboDone=!1,AU.roar(),dragon.jawOpen=1,_v.copy(dragon.root.position).sub(e),_v.y=0,G.diveDir.copy(_v.normalize()),ARC2.pickSpecial(r)||(r.tail&&Math.random()<.5?(G.phase="tail",caption("УДАР ХВОСТОМ"),G.tailSide=Math.random()<.5?1:-1,G.tailPerp=new V3(-G.diveDir.z,0,G.diveDir.x).multiplyScalar(G.tailSide)):(G.phase="windup",G.lastSpecial="windup",caption("ТАРАН ГОЛОВОЙ"))),showRepel()}function repel(){ARC2.onRepel(),G.phase="stagger",G.pt=0,dragon.spinV=0,dragon.vel.multiplyScalar(-.6).add(new V3(0,12,0)),dragon.jawOpen=1,dragon.hit(),dragon.flash=1.6,AU.roar(),caption("ОТБИТ"),G.rage=G.rageMax*.35,G.glitch=.5,flashScreen(.2),dropLoot(dragon.root.position.clone(),"coin",3),$("hint").style.opacity=0}function spitAttack(){const r=diff(G.level),e=archer.root.position,t=e.clone().add(new V3(0,1,0));if(r.cluster&&Math.random()<.45){spitFireball(dragon.mouthPos(new V3),t,!1,r.fbSpeed*.8,null,{kind:"cluster",split:r.cluster,home:r.homing?.8:0}),AU.spit(1),G.toldCluster||(caption("ОН РАСПАДЁТСЯ"),G.toldCluster=!0);return}const i=G.level===2?1+(Math.random()<.6?1:0):r.volley;for(let a=0;a<i;a++)setTimeout(()=>{if(G.mode!=="play"||["fall","over"].includes(G.phase))return;const s=dragon.mouthPos(new V3),l=t.clone().sub(s).normalize().applyAxisAngle(new V3(0,1,0),(a-(i-1)/2)*.5);spitFireball(s,t,!1,r.fbSpeed,null,{dir:l,home:r.homing?1.7:i>1?1.3:0}),AU.spit(.8)},a*260);G.fbTold||(caption(i>1?"СБЕЙ ВСЕ":"СБЕЙ ОГОНЬ"),G.fbTold=!0)}function levelUp(){G.level++,THT=themeFor(G.level),startRound(),caption("LEVEL "+G.level+" "+THT.name),showLvl("Level "+G.level+" · "+THT.name.toLowerCase()+". "+(G.level>THEMES.length?"Дракон стал ещё быстрее":THT.news))}function gameOver(){ARC2.onGameOver(),G.phase="over",G.holding=!1,SAVE.best=Math.max(SAVE.best||1,G.depth),save(),hud(!1),$("ovStats").textContent="Tier "+G.depth+" · level "+G.level+" · coins "+SAVE.coins+" · best tier: "+SAVE.best,$("over").classList.remove("hide")}const loot=[];function lootMesh(r){const e=new Group,t=(s,l,o,c,h,f,u)=>{const d=new Mesh(new BoxGeometry(s,l,o),new MeshBasicMaterial({color:c,fog:!1}));d.position.set(h,f,u),e.add(d)};let i;if(r==="coin"&&(t(.42,.42,.1,new Color(1.3,.9,.18),0,0,0),t(.22,.22,.13,new Color(1.9,1.5,.5),0,0,0),i=16760896),r==="heart"){const s=new Color(1.6,.12,.18);for(const[l,o]of[[-1,1],[1,1],[-2,0],[-1,0],[0,0],[1,0],[2,0],[-1,-1],[0,-1],[1,-1],[0,-2]])t(.15,.15,.15,s,l*.15,o*.15+.08,0);i=16724048}if(r==="ice"){const s=new Color(.8,1.7,2.2);t(.09,.9,.09,new Color(.6,1.3,1.7),0,0,0),t(.26,.26,.26,s,0,.5,0),t(.16,.16,.16,s,.16,.36,0),t(.16,.16,.16,s,-.16,.36,0),i=8448255}const a=new Sprite(new SpriteMaterial({map:glowTex,color:i,blending:AdditiveBlending,depthWrite:!1,transparent:!0,opacity:.45,fog:!1}));return a.scale.setScalar(1.2),e.add(a),e}function dropLoot(r,e,t=1){for(let i=0;i<t;i++){const a=lootMesh(e);a.position.copy(r),scene.add(a),loot.push({m:a,type:e,v:new V3((Math.random()-.5)*10,4+Math.random()*6,(Math.random()-.5)*10),t:-i*.05})}}function clearLoot(){for(const r of loot)scene.remove(r.m);loot.length=0}function collect(r){const e=archer.root.position.clone().add(new V3(0,1.2,0));r.type==="coin"&&(SAVE.coins++,AU.coin()),r.type==="heart"&&(G.lives=Math.min(6,(G.lives||0)+1),G.dead=!1,AU.heal(),caption("+ ЖИЗНЬ")),r.type==="ice"&&(G.freezeAmmo=(G.freezeAmmo||0)+3,AU.ice(),capQ.length||caption("+3 ЛЕДЯНЫЕ"));const t=r.type==="coin"?new Color(2.4,1.8,.4):r.type==="heart"?new Color(2.6,.3,.4):new Color(1,2.4,3.2);for(let i=0;i<8;i++)sparks.spawn(e,new V3((Math.random()-.5)*4,Math.random()*3,(Math.random()-.5)*4),.12,.4,t,0,4);renderRes(),save()}function updateLoot(r,e){if(!loot.length)return;const t=archer.root.position.clone().add(new V3(0,1.2,0));for(let i=loot.length-1;i>=0;i--){const a=loot[i];if(a.t+=r,a.t<.7)a.v.y-=12*r,a.v.multiplyScalar(Math.exp(-1.5*r));else{const s=t.clone().sub(a.m.position);dampV(a.v,s.normalize().multiplyScalar(Math.min(42,10+a.t*26)),5,r)}a.m.position.addScaledVector(a.v,r),a.m.rotation.y+=r*6,a.m.rotation.x=Math.sin(e*3+i)*.3,(a.t>.7&&a.m.position.distanceTo(t)<1.3||a.t>6)&&(G.mode==="play"&&collect(a),scene.remove(a.m),loot.splice(i,1))}}const INV=(()=>{const r=(c,h)=>{let f=0;return c.traverse(u=>{h(u)&&f++}),f},e=c=>c.isMesh,t=(c,h)=>{if(typeof c!="function")return!1;const n2=x=>x.replace(/\s+/g,"").replace(/"/g,"'");return n2(c.toString()).includes(n2(h))},i=c=>genTower(4242,30,c),a=(c,h)=>i(c).blocks.some(h)?1:0;return{sec:{"Текстуры блоков":{fn:["makeAtlas","pixTex"],data:[["тайлы атласа",()=>TILE_NAMES.length,8],["атлас 128×16",()=>atlas.image&&atlas.image.width===TS*NT?1:0,1],["материал блоков с тайлами",()=>typeof blockMat.onBeforeCompile=="function"?1:0,1]]},Дракон:{fn:["Dragon"],data:[["меши тела всего",()=>r(dragon.root,e),93],["звенья шеи",()=>dragon.neck.length,4],["голова",()=>dragon.head?1:0,1],["челюсть",()=>dragon.jaw?1:0,1],["ноги",()=>dragon.legs.length,4],["крылья",()=>dragon.wings.length,2],["кости крыльев",()=>dragon.wings.reduce((c,h)=>c+h.segs.length,0),6],["звенья хвоста",()=>dragon.tail.length,13],["зоны попадания",()=>dragon.hitList.length,19],["материалы",()=>dragon.mats.length+2,6]]},Лучник:{fn:["Archer"],data:[["меши фигуры",()=>r(archer.root,e),32],["ноги",()=>archer.legs.length,2],["руки",()=>(archer.armL?1:0)+(archer.armR?1:0),2],["голова с капюшоном",()=>archer.head?1:0,1],["сегменты плаща",()=>archer.cape.length,5],["лук",()=>archer.bow?1:0,1],["тетива",()=>archer.string?1:0,1]]},Башни:{fn:["genTower","Tower","torchFX","makeNext"],data:[["стили башен",()=>["plain","bridge","ruin"].filter(c=>i(c).blocks.length>100).length,3],["зубцы",()=>a("bridge",c=>c.y===1&&c.s!==T.PLANK),1],["факел-столб",()=>a("bridge",c=>c.s===T.PLANK),1],["снег на выступах",()=>a("bridge",c=>c.t===T.SNOW),1],["контрфорсы",()=>i("plain").blocks.some(c=>Math.abs(c.x)>3||Math.abs(c.z)>3)?1:0,1],["мост с зубцами",()=>i("bridge").blocks.some(c=>Math.abs(c.x)>4||Math.abs(c.z)>4)?1:0,1],["фоновые силуэты",()=>bg.children.filter(c=>c.isInstancedMesh).length,7],["свет факела",()=>torchLight.isPointLight?1:0,1]]},"Атмосфера и эффекты":{fn:["makeSky","makeSpecks","fogSheetMat","makeAtmosphere","updateAtmosphere","PointPool","Debris"],data:[["небо",()=>atmo.sky?1:0,1],["снег и пыль в воздухе",()=>atmo.specks.geometry.attributes.aSeed.count,1800],["слои тумана горизонтальные",()=>atmo.sheets.filter(c=>c.userData.h).length,3],["полосы тумана вертикальные",()=>atmo.sheets.filter(c=>!c.userData.h).length,6],["туман сцены",()=>scene.fog&&scene.fog.isFogExp2?1:0,1],["пыль обрушения",()=>dust.cap,260],["искры",()=>sparks.cap,400],["обломки-блоки",()=>debris.cap,2400],["след стрелы",()=>t(updateArrows,"sparks.spawn")?1:0,1]]},"Пост-обработка":{fn:["resize"],data:[["проходы композитора",()=>composer.passes.length,4],["bloom",()=>bloom.strength>0?1:0,1],["аберрация/зерно/глитч/виньетка/опасность",()=>["uAberr","uGrain","uGlitch","uVig","uDanger"].filter(c=>c in post.uniforms).length,5],["рендер 82%",()=>t(resize,".82")?1:0,1]]},Механики:{fn:["fireArrow","updateArrows","onArrowHit","crash","land","startRound","startGame","tryFire","aimPoint","updateGame"],data:[["фазы боя",()=>["intro","fight","windup","dive","fall","retreat"].filter(c=>t(updateGame,"case '"+c+"'")).length,6],["стрела застревает в драконе",()=>t(onArrowHit,"attach")?1:0,1],["замедление при ударе",()=>t(crash,"G.slow")?1:0,1],["тряска камеры",()=>t(crash,"G.shake")?1:0,1],["баллистика падения",()=>t(crash,"fallDur")?1:0,1],["рост сложности",()=>t(startRound,"G.level")?1:0,1],["удержание пальца = очередь",()=>t(updateGame,"G.holding")?1:0,1]]},Интерфейс:{fn:["caption","showWord","hud","renderHP","flashScreen"],data:[["элементы HUD",()=>["depth","top","hp","cap","hint","bottom","rage","flash"].filter(c=>$(c)).length,8],["меню",()=>["menu","bPlay","bGal"].filter(c=>$(c)).length,3],["подписи по словам",()=>t(caption,"split")?1:0,1]]},Звук:{fn:[],data:[["звуки",()=>["init","shoot","hit","roar","crash","flap","land"].filter(c=>typeof AU[c]=="function").length,7]]},"Галерея ассетов":{fn:["galBuild","galShow"],data:[["карточки ассетов",()=>GAL.length,8],["кнопки",()=>["gal","gPrev","gNext","galBack"].filter(c=>$(c)).length,4]]},"Гроза и виадуки":{fn:["genViaduct","Viaduct","makeCloudCards","make2DViaductTex","bandMat","boltPts","ribbon","Lightning","StormLayer","updateStormWorld"],data:[["виадуки 2.5D",()=>viaducts.length,7],["блоки виадуков",()=>viaducts.reduce((c,h)=>c+h.orig.length,0),9e3],["горящие окна",()=>viaducts.reduce((c,h)=>c+h.orig.filter(f=>f.k).length,0),40],["тучи-карточки",()=>storm.cards.geometry.instanceCount,170],["тучи-потолок",()=>storm.ceil.geometry.instanceCount,46],["2D-слои силуэтов",()=>storm.bands.length,2],["молнии с ветвями",()=>t(Lightning,"boltPts")&&t(Lightning,"thunder")?1:0,1],["вспышка подсвечивает мир",()=>"uFlash"in farMat.uniforms&&t(updateStormWorld,"hemiMain")?1:0,1],["обломки виадуков",()=>farDebris.cap,1500],["восстановление виадука",()=>t(Viaduct,"regenT")?1:0,1]]},"Огненные шары и дальний дракон":{fn:["makeFireballMesh","spitFireball","updateFireballs","killFireball","explode","updateFarDragon"],data:[["искры огня",()=>fire.cap,900],["свет шаров",()=>fbLights.length+1,3],["пасть светится перед плевком",()=>dragon.mouth?1:0,1],["стрела сбивает шар",()=>t(updateArrows,"fireballs")?1:0,1],["шар рушит башню",()=>t(updateFireballs,"crash(")?1:0,1],["помощь прицела по шару",()=>t(aimPoint,"fireballs")?1:0,1],["дальний дракон",()=>farDragon.tail.length,13],["режимы дальнего дракона",()=>["cruise","ram","spit","away"].filter(c=>t(updateFarDragon,"'"+c+"'")).length,4],["звуки грозы и огня",()=>["thunder","boom","spit"].filter(c=>typeof AU[c]=="function").length,3],["новые карточки галереи",()=>GAL.length-8,5]]},"Атаки и сложность":{fn:["diff","startSpecial","repel","spitAttack","showRepel"],data:[["новые фазы (хвост, вращение, отброс, конец)",()=>["tail","spin","stagger","over"].filter(c=>t(updateGame,"case '"+c+"'")).length,4],["таран головой и удар хвостом",()=>t(startSpecial,"ТАРАН")&&t(startSpecial,"ХВОСТ")?2:0,2],["залп до 3 шаров",()=>diff(6).volley,3],["кассетный шар распадается",()=>t(updateFireballs,"'cluster'")&&diff(6).cluster>=5?1:0,1],["самонаведение",()=>t(updateFireballs,".home")?1:0,1],["отражение растёт с уровнем",()=>diff(9).repel>diff(1).repel?1:0,1],["огонь во время тарана",()=>diff(6).combo&&t(updateGame,"comboDone")?1:0,1],["таран быстрее с уровнем",()=>t(updateGame,"48+G.level")?1:0,1]]},"Добыча и жизни":{fn:["lootMesh","dropLoot","updateLoot","collect","clearLoot","gameOver","renderRes"],data:[["виды добычи",()=>["coin","heart","ice"].filter(c=>t(lootMesh,"'"+c+"'")).length,3],["красные пиксели при попадании",()=>t(onArrowHit,"2.2,.15,.12")?1:0,1],["жизни на старте",()=>t(startGame,"G.lives=3")?3:0,3],["экран поражения",()=>["over","ovStats","bRetry","bOvMenu"].filter(c=>$(c)).length,4],["HUD жизней и монет",()=>["res","hearts","coins"].filter(c=>$(c)).length,3]]},"Оружие и магазин":{fn:["weapon","setWeaponLook","renderShop","save","tryFire","fireArrow"],data:[["оружие",()=>WEAPONS.length,5],["ледяные стрелы замораживают",()=>t(onArrowHit,"frozen")&&t(Dragon,"frozen")?1:0,1],["огненные стрелы взрывают шары",()=>t(updateArrows,".fire")?1:0,1],["магазин",()=>["shop","shList","shClose","bShop","bFreeze"].filter(c=>$(c)).length,5],["пауза в магазине",()=>t(frame,"G.paused")?1:0,1],["звуки покупок и добычи",()=>["coin","heal","ice","buy"].filter(c=>typeof AU[c]=="function").length,4]]},"Удержание и универсальные улучшения (2.0)":{fn:["ARC2"].length?["caption","showRepel","renderRes","gameOver","startSpecial","crash"]:[],data:[["цвета искр",()=>Object.keys(ARC2.SP.lantern).length,4],["пипсы щита",()=>$("shield").children.length,3],["столбики фонаря",()=>$("lantern").children.length,4],["задания башен",()=>new Set([1,2,3,4,5,6,7,8].map(d=>ARC2.dice(d).task)).size,4],["характеры дракона",()=>new Set([1,2,3,4,5,6,7,8].map(d=>ARC2.dice(d).temp)).size,4],["соседние башни не повторяются",()=>[2,3,4,5,6,7,8].every(d=>ARC2.dice(d).task!==ARC2.dice(d+1).task)?1:0,1],["новые атаки (пике, из тумана)",()=>["plunge","ambush"].filter(c=>t(updateGame,"case '"+c+"'")).length,2],["тень пике и глаза в тумане",()=>t(ARC2.plunge,"uRim")&&t(ARC2.ambush,"setEyes")?2:0,2],["туман при падении",()=>$("fogveil")?1:0,1],["щит превращает таран в отбив",()=>t(crash,"absorb")?1:0,1],["подписи EN/RU",()=>Object.keys(CAP_EN).length,16]]},"Уровни и погода":{fn:["applyTheme","themeFor","levelUp","showLvl"],data:[["уровни-темы",()=>THEMES.length,7],["дождь",()=>WX.rain.geometry.attributes.aSeed.count,2e3],["угли",()=>WX.ember.geometry.attributes.aSeed.count,700],["луна",()=>WX.moon?1:0,1],["северное сияние",()=>WX.aur?1:0,1],["параметры темы",()=>Object.keys(THEMES[0]).length,17],["ветер сносит стрелы",()=>t(updateArrows,"TH.wind")?1:0,1],["карточки галереи всего",()=>GAL.length,15]]}},extra:[["R1 мгновенный старт для новичка",()=>t(ARC2.boot,"SAVE.played")],["R5 воскрешение за рекламу",()=>!!$("bRevive")],["R6 реклама на «Снова», не на экране поражения",()=>t(gameOver,"onGameOver")&&!t(gameOver,"pgInterstitial")],["R7 кнопки-значки, без эмодзи",()=>!$("bFreeze").textContent.includes("❄")&&!!$("bShop").querySelector("svg")],["внешних загрузок нет (Bridge и шрифт локально)",()=>![...document.scripts].some(x=>x.src&&new URL(x.src).host!==location.host)&&!document.querySelector('link[href*="googleapis"]')],["игрок не видит счётчик",()=>!document.querySelector("[data-inv]")],["экран закреплён (touch-action:none)",()=>getComputedStyle(document.body).touchAction==="none"],["цикл по времени, не по кадрам",()=>t(frame,"getDelta")]],hist:[["v1: дракон, лучник, 3 башни, 8 блоков, туман, обломки, пост, звук, галерея",5178],["+ гроза: тучи 2.5D, молнии, виадуки 2D/2.5D, огненные шары, дальний дракон, 5 карточек галереи",19636],["+ уровни: 7 тем погоды и света, таран и удар хвостом, залпы, кассетные и самонаводящиеся шары, отражение атак, добыча, жизни, 5 видов оружия, ледяные стрелы, магазин, 2 карточки галереи",22450],["+ 2.0: R1–R11, искры (4 цвета, щит, фонарь), генератор башен, пике в замедлении, атака из тумана, туман при падении, ежедневный подарок, воскрешение",22498]]}})();window.__INV=()=>{const out={sec:{},lost:[],now:0},fnOk=n=>{try{return typeof eval(n)=="function"}catch(r){return!1}};for(const[r,e]of Object.entries(INV.sec)){const t={};for(const i of e.fn)fnOk(i)?out.now++:out.lost.push(r+": функция "+i);for(const[i,a,s]of e.data){let l=0;try{l=a()}catch{l=0}t[i]=l,out.now+=l,l<s&&out.lost.push(r+": "+i+" "+l+"/"+s)}out.sec[r]=t}return out.extra=INV.extra.map(([r,e])=>{let t=!1;try{t=!!e()}catch{}return{n:r,ok:t}}),out.base=INV.hist[INV.hist.length-1][1],out.ok=!out.lost.length&&out.now>=out.base&&out.extra.every(r=>r.ok),out.hist=INV.hist,out};const ICON_ICE='<svg viewBox="0 0 11 11" fill="currentColor" aria-hidden="true"><rect x="5" y="0" width="1" height="11"/><rect x="0" y="5" width="11" height="1"/><rect x="2" y="2" width="1" height="1"/><rect x="8" y="2" width="1" height="1"/><rect x="2" y="8" width="1" height="1"/><rect x="8" y="8" width="1" height="1"/><rect x="3" y="3" width="1" height="1"/><rect x="7" y="3" width="1" height="1"/><rect x="3" y="7" width="1" height="1"/><rect x="7" y="7" width="1" height="1"/><rect x="4" y="1" width="3" height="1"/><rect x="4" y="9" width="3" height="1"/><rect x="1" y="4" width="1" height="3"/><rect x="9" y="4" width="1" height="3"/></svg>',GAME_VERSION="2.0.0",ARC2=(()=>{const pg=(n2,d)=>{try{PG.ready&&window.bridge.analytics&&window.bridge.analytics.send(n2,d)}catch{}},ru=()=>PG.language==="ru",COLS=["harvest","precision","element","agility"],HEX={harvest:"#c27bff",precision:"#58c4ff",element:"#ff8a3d",agility:"#6ee68a"},TC={harvest:new Color(1.5,.7,2.4),precision:new Color(.6,1.6,2.6),element:new Color(2.6,1.1,.3),agility:new Color(.8,2.4,1)},SP={lantern:{harvest:0,precision:0,element:0,agility:0},shield:0,fly:[],chainT:-9,chain:0,earned:0};function spark(c,from,n2=1){for(let k=0;k<n2;k++)SP.fly.push({c,p:from.clone(),t:-k*.12})}function land2(c){(G.lives||0)<3?(G.lives=(G.lives||0)+1,G.dead=!1,AU.heal(),renderRes()):SP.shield<3?(SP.shield++,AU.ice()):SP.lantern[c]=Math.min(9,SP.lantern[c]+1),SP.earned++,G.task==="sparks"&&c===G.taskCol&&G.phase!=="fall"&&G.phase!=="over"&&bumpTask(1),pg("spark",{color:c})}function flyTick(dt){const hand=archer.root.position;for(let i=SP.fly.length-1;i>=0;i--){const f=SP.fly[i];if(f.t+=dt,f.t<0)continue;const k=Math.min(1,f.t/.45),e=1-Math.pow(1-k,3),x=f.p.x+(hand.x-f.p.x)*e,y=f.p.y+(hand.y+1.4-f.p.y)*e+Math.sin(k*Math.PI)*2,z=f.p.z+(hand.z-f.p.z)*e;if(sparks.spawn(_sv.set(x,y,z),_sw.set((Math.random()-.5)*1.2,(Math.random()-.5)*1.2,(Math.random()-.5)*1.2),.16,.4,TC[f.c],0,4),k>=1){SP.fly.splice(i,1),land2(f.c);for(let j=0;j<10;j++)sparks.spawn(_sv.set(hand.x,hand.y+1.3,hand.z),_sw.set((Math.random()-.5)*5,Math.random()*4,(Math.random()-.5)*5),.14,.5,TC[f.c],0,5)}}}const _sv=new V3,_sw=new V3;function absorb(){if(SP.shield<=0||G.forceCrash)return!1;SP.shield--,flashScreen(.35),G.shake=Math.max(G.shake,.8),caption("ЩИТ");const p=archer.root.position.clone().add(new V3(0,1.4,0));for(let k=0;k<30;k++)sparks.spawn(p,new V3((Math.random()-.5)*12,Math.random()*8,(Math.random()-.5)*12),.2,.7,TC.precision,0,6);return G.phase!=="fall"&&G.phase!=="over"&&repel(),pg("shield_used",{depth:G.depth}),!0}const TASKS=["hits","fire","sparks","hold"],TEMPS=["steady","swift","fiery","trickster"],NAME={hits:["Last Arrow","Последней Стрелы"],fire:["Falling Fire","Падающего Огня"],sparks:["Living Light","Живого Света"],hold:["Long Night","Долгой Ночи"]},TEMP_ADJ={steady:["Quiet","Тихая"],swift:["Swift","Быстрая"],fiery:["Burning","Пылающая"],trickster:["Misty","Туманная"]},mod=(a,n2)=>(a%n2+n2)%n2;function dice(depth){const k=depth-1,task=k===0?"hits":TASKS[mod(k,4)],temp=k===0?"steady":TEMPS[mod(k*3+1,4)],col=COLS[mod(k*2+1,4)],budget=1+Math.floor(k/2),n2=task==="fire"?Math.min(2+budget,8):task==="sparks"?Math.min(2+budget,7):task==="hold"?0:null,T2=task==="hold"?Math.min(20+budget*5,50):0,name=ru()?`${TEMP_ADJ[temp][1]} башня ${NAME[task][1]}`:`${TEMP_ADJ[temp][0]} Tower of the ${NAME[task][0]}`;return{task,temp,col,n:n2,T:T2,name,budget}}let D0=dice(1),holdT=0,base0=0;function bumpTask(n2){G.task==="hits"||G.phase!=="fight"||(G.hits=Math.min(G.need,G.hits+n2),renderHP(),G.hits>=G.need&&retreat())}function retreat(){G.phase="retreat",G.pt=0,dragon.jawOpen=1,AU.roar(),caption("DRAGON RETREATS"),G.glitch=.6,flashScreen(.25),dropLoot(dragon.root.position.clone(),"coin",4+G.level),spark("harvest",dragon.root.position),pg("progression_completed",{step_id:"tower_"+G.task,step_index:G.depth,level:G.level,version:GAME_VERSION})}function onRound(){D0=dice(G.depth),G.task=D0.task,G.taskCol=D0.col,G.temp=D0.temp,holdT=0,D0.task==="fire"?(G.need=D0.n,base0=G.shotDown||0):D0.task==="sparks"?G.need=D0.n:D0.task==="hold"&&(G.need=10),G.hits=0,renderHP(),$("hp").style.setProperty("--pc",D0.task==="sparks"?HEX[D0.col]:D0.task==="fire"?"#ff8a3d":D0.task==="hold"?"#cfe0ff":""),D0.temp==="fiery"&&(G.spitT*=.6),D0.temp==="swift"?G.orbitBoost=1.3:G.orbitBoost=1,G.depth>1&&showLvl(D0.name),$("repel").style.opacity=0}function onShotDown(f){spark("precision",f),G.task==="fire"&&bumpTask(1)}function onRepel(){spark("harvest",dragon.root.position,2),$("repel").style.opacity=0,pg("attack_repelled",{attack:G.phase,depth:G.depth})}function onDragonHit(){const now2=performance.now()/1e3;SP.chain=now2-SP.chainT<1.5?SP.chain+1:1,SP.chainT=now2,SP.chain>=3&&(SP.chain=0,spark("agility",dragon.root.position)),(G.freezeOn||dragon.frozen>2.7)&&spark("element",dragon.root.position)}const shadowMat=new ShaderMaterial({uniforms:{uA:{value:0},uRim:{value:0},uT:{value:0}},transparent:!0,depthWrite:!1,vertexShader:"varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",fragmentShader:"uniform float uA,uRim,uT;varying vec2 vUv;void main(){vec2 q=(floor(vUv*28.)+.5)/28.*2.-1.;float d=length(q);float fill=1.-smoothstep(.55,1.,d);float rim=smoothstep(.84,.94,d)*(1.-smoothstep(.94,1.02,d));float pulse=.55+.45*sin(uT*9.-d*6.);vec3 c=mix(vec3(.02,.03,.08),vec3(1.7,.4,.25),rim*uRim);float a=max(fill*uA*.7,rim*uRim*pulse);if(a<.01)discard;gl_FragColor=vec4(c,a);}"}),shadow=new Mesh(new PlaneGeometry(1,1).rotateX(-Math.PI/2),shadowMat);shadow.renderOrder=6,shadow.visible=!1,scene.add(shadow);const eyeMat=c=>new SpriteMaterial({map:glowTex,color:c,blending:AdditiveBlending,depthWrite:!1,transparent:!0,opacity:0,fog:!1}),eyes=[eyeMat(16736352),eyeMat(16736352)].map(m=>{const sp=new Sprite(m);return sp.scale.setScalar(1.6),sp.visible=!1,scene.add(sp),sp});let camK=0,prevSpecial="";const hideBody=h=>{dragon.root.visible=!h,dragon.tail.forEach(t=>t.visible=!h)};function pickSpecial(r){const pool=["windup","plunge","ambush"].concat(r.tail?["tail"]:[]);G.temp==="trickster"&&pool.push("ambush");const opts=pool.filter(x=>x!==prevSpecial),pick=opts[Math.floor(Math.random()*opts.length)];return prevSpecial=pick,pick==="plunge"?(G.phase="plunge",G.plLock=!1,G.repelNeed=Math.max(2,r.repel-1),caption("ПИКЕ"),pg("special_attack",{attack:"plunge",depth:G.depth}),!0):pick==="ambush"?(G.phase="ambush",G.amStage=0,G.repelNeed=Math.max(2,r.repel-1),caption("ИЗ ТУМАНА"),pg("special_attack",{attack:"ambush",depth:G.depth}),!0):(pg("special_attack",{attack:pick,depth:G.depth}),!1)}function plunge(r,e,i){const top=_sv.copy(i).addScaledVector(G.diveDir,10);top.y=i.y+20,shadow.visible=!0,shadow.position.set(i.x,i.y+.05,i.z);const grow=Math.min(1,G.pt/1.3);if(shadow.scale.setScalar(2+grow*4),shadowMat.uniforms.uA.value=grow,shadowMat.uniforms.uT.value=e,G.pt<1.3)return dragon.steer(top,32,2,r),dragon.fold=damp(dragon.fold,0,3,r),dragon.jawOpen=damp(dragon.jawOpen,.6,3,r),1;G.plLock||(G.plLock=!0,AU.roar(),G.glitch=Math.max(G.glitch,.6)),shadowMat.uniforms.uRim.value=1;const d=_sw.copy(i).add(new V3(0,.6,0));return dragon.steer(d,15+G.level*.8,3,r),dragon.fold=damp(dragon.fold,.7,3,r),dragon.claw=damp(dragon.claw,1,3,r),dragon.jawOpen=damp(dragon.jawOpen,1,4,r),G.shake=Math.max(G.shake,.08),dragon.root.position.distanceTo(d)<4.5&&(shadow.visible=!1,crash()),1}function ambush(r,e,i,t){const P=dragon.root.position;if(G.amStage===0){const far=_sv.copy(P).sub(i);return far.y=0,far.normalize().multiplyScalar(42).add(i),far.y=i.y+4,dragon.steer(far,30,1.4,r),G.fogBoost=Math.min(1,(G.fogBoost||0)+r*.8),G.pt>1.4&&(G.amStage=1,G.pt=0,hideBody(!0),G.amOrb=Math.atan2(P.z-t.z,P.x-t.x)),.6}if(G.amStage===1)return G.amOrb+=r*.9,dragon.steer(_sv.set(t.x+Math.cos(G.amOrb)*22,i.y+3+Math.sin(e*1.3)*2,t.z+Math.sin(G.amOrb)*22),22,1.6,r),setEyes(.35+.15*Math.sin(e*3)),G.pt>3.2&&(G.amStage=2,G.pt=0,AU.roar()),.5;if(G.amStage===2)return dragon.steer(_sv.copy(P),2,2,r),setEyes(.6+G.pt*.6,1+G.pt*1.2),G.pt>.9&&(G.amStage=3,G.pt=0,hideBody(!1),setEyes(0),flashScreen(.3),G.glitch=.9),1;const d=_sw.copy(i).add(new V3(0,.6,0));return dragon.steer(d,58+G.level*2,3.4,r),dragon.jawOpen=damp(dragon.jawOpen,1,6,r),dragon.claw=damp(dragon.claw,1,4,r),G.fogBoost=Math.max(0,(G.fogBoost||0)-r*1.5),P.distanceTo(d)<4.5&&crash(),1}function setEyes(op,sc=1){(dragon.head||dragon.root).getWorldPosition(_sv),eyes.forEach((s,k)=>{s.visible=op>.01,s.material.opacity=Math.min(1,op*1.6),s.scale.setScalar(3.4*sc),s.position.set(_sv.x+(k?.9:-.9),_sv.y+.4,_sv.z)})}const veil=$("fogveil");let perf={f:[],act:0,start:performance.now()};function tick(raw,t,e){const sp=G.phase==="plunge"||G.phase==="ambush";if(camK=damp(camK,sp?1:0,2.2,raw),G.phase!=="plunge"&&(shadow.visible=!1,shadowMat.uniforms.uRim.value=0),G.phase!=="ambush"&&(!dragon.root.visible&&G.mode==="play"&&hideBody(!1),setEyes(0),G.fogBoost=Math.max(0,(G.fogBoost||0)-raw*1.2)),flyTick(t),G.task==="hold"&&G.phase==="fight"){holdT+=t;const k=Math.min(10,Math.floor(holdT/(D0.T/10)));k!==G.hits&&(G.hits=k,renderHP(),k>=10&&retreat())}if(veil.style.opacity=G.phase==="fall"?(Math.sin(Math.PI*Math.min(1,G.fallT/G.fallDur))*.85).toFixed(3):0,hudTick(),G.mode==="play"&&G.phase!=="over"&&!G.paused&&!document.hidden){const ms=raw*1e3;if(perf.f.push(ms),perf.act+=ms,perf.act>=3e4){const f=perf.f.slice().sort((a,b)=>a-b),n2=f.length,q=x=>f[Math.min(n2-1,Math.floor(x*n2))],o=x=>f.filter(v=>v>x).length;pg("performance_sample",{target_fps:60,window_ms:Math.round(performance.now()-perf.start),active_ms:Math.round(perf.act),frame_count:n2,fps_avg:+(n2*1e3/perf.act).toFixed(1),fps_p10:+(1e3/q(.9)).toFixed(1),frame_time_p50_ms:+q(.5).toFixed(2),frame_time_p95_ms:+q(.95).toFixed(2),frame_time_p99_ms:+q(.99).toFixed(2),frame_time_max_ms:+f[n2-1].toFixed(1),frames_over_50ms:o(50),frames_over_100ms:o(100),frames_over_250ms:o(250),frames_over_500ms:o(500),frames_over_1000ms:o(1e3),game_version:GAME_VERSION}),perf={f:[],act:0,start:performance.now()}}}}const lbars=COLS.map(c=>{const b=document.createElement("i");return b.style.setProperty("--c",HEX[c]),b.innerHTML="<b></b>",$("lantern").append(b),b});function hudTick(){COLS.forEach((c,k)=>{lbars[k].firstChild.style.height=(SP.lantern[c]/9*100).toFixed(0)+"%",lbars[k].classList.toggle("need",G.task==="sparks"&&c===G.taskCol)}),$("shield").dataset.n=SP.shield,$("arcHud").style.opacity=G.mode==="play"&&G.phase!=="over"?1:0}const rewOK=()=>{try{return PG.ready&&window.bridge.advertisement.isRewardedSupported}catch{return!1}};function onGameOver(){const b=$("bRevive");b.hidden=!(rewOK()&&!G.revived),b.disabled=!1,b.hidden||pg("revive_offered",{depth:G.depth}),pg("progression_failed",{step_id:"tower",step_index:G.depth,level:G.level,version:GAME_VERSION})}$("bRevive").onclick=()=>{const b=$("bRevive");if(b.disabled)return;b.disabled=!0;let got=!1,done=!1;const fin=ok=>{done||(done=!0,b.hidden=!0,!(!ok||G.phase!=="over")&&(G.revived=!0,G.lives=1,G.dead=!1,renderRes(),$("over").classList.add("hide"),hud(!0),startRound(),caption("ЕЩЁ ЖИВ"),pg("revive_used",{depth:G.depth})))};try{window.bridge.advertisement.on(window.bridge.EVENT_NAME.REWARDED_STATE_CHANGED,st=>{st==="rewarded"&&(got=!0),(st==="closed"||st==="failed")&&fin(got)}),window.bridge.advertisement.showRewarded("revive")}catch{fin(!1)}setTimeout(()=>fin(got),9e4)};const today=()=>{const d=new Date;return d.getFullYear()*1e4+(d.getMonth()+1)*100+d.getDate()},_startGame=startGame;function onStart(){const d=today();SAVE.giftDay!==d&&(SAVE.streak=SAVE.lastDay===d-1?(SAVE.streak||0)+1:1,SAVE.giftDay=d,dropLoot(archer.root.position.clone().add(new V3(0,2.5,0)),"ice"),SP.shield=Math.min(3,SP.shield+1),pg("daily_gift",{streak:SAVE.streak})),SAVE.lastDay=d,SAVE.played=1,save(),pg("progression_started",{step_id:"run",step_index:1,version:GAME_VERSION})}function boot(){PG.language==="ru"&&($("bRevive").lastChild.textContent="Ожить: смотреть рекламу"),SAVE.played||setTimeout(()=>{G.mode==="menu"&&$("bPlay").onclick()},600)}return{get camK(){return camK},SP,dice,absorb,onRound,onShotDown,onRepel,onDragonHit,pickSpecial,plunge,ambush,tick,onGameOver,onStart,boot,spark,retreat}})();window.__arc2=ARC2,window.__A={G,SAVE,startSpecial,crash,repel,startRound,gameOver,get dragon(){return dragon},get archer(){return archer}},initWorld();const clock=new Clock;let fade=0,menuA=0;function frame(){requestAnimationFrame(frame);const r=Math.min(clock.getDelta(),.05),e=clock.elapsedTime;G.slow=damp(G.slow,1,1.3,r);const t=(G.paused||PG.paused?0:r)*G.slow;if(fade=Math.min(1,fade+r*.5),(capQ.length||$("cap").classList.contains("show"))&&(capT-=r,capT<=0&&showWord()),G.mode==="gallery"){galBuild(gi).upd(r,e),gDebris.update(r),gDust.update(r),gFire.update(r),gFarDeb.update(r),gBoom.intensity=damp(gBoom.intensity,0,4,r),gi!==10&&(STORM.flash=damp(STORM.flash,0,5,r));{const l=farMat.uniforms;l.uCam.value.copy(camera.position),l.uFlash.value=STORM.flash,l.uFlashPos.value.copy(STORM.flashPos),l.uTime.value=e}const a=GAL[gi];menuA+=r*.22;const s=a.r;dampV(camPos,_v.set(a.look.x+Math.cos(menuA)*s,a.look.y+s*.28+Math.sin(e*.3)*s*.05,a.look.z+Math.sin(menuA)*s),2,r),dampV(camLook,a.look,3,r),camera.position.copy(camPos),camera.lookAt(camLook),updateAtmosphere(gAtmo,e,a.look,camera),post.uniforms.uGlitch.value=Math.max(0,Math.sin(e*.7)*.3-.2),post.uniforms.uDanger.value=0}else{if(G.mode==="play")updateGame(t,e),ARC2.tick(r,t,e);else{G.orbitA+=r*.35;const s=cur.origin;dragon.steer(_v.set(s.x+Math.cos(G.orbitA)*24,s.y+6+Math.sin(e*.6)*3,s.z+Math.sin(G.orbitA)*24),15,1.4,r),dragon.animate(r,e,archer.root.position,0),archer.update(r,e,_w.copy(dragon.root.position).sub(archer.root.position).normalize());for(const o of towers)o.update(e);menuA+=r*.08,dampV(camPos,_v.set(s.x+Math.cos(menuA)*15,s.y+4+Math.sin(e*.25),s.z+Math.sin(menuA)*15),1.5,r),dampV(camLook,_w.copy(s).lerp(dragon.root.position,.5),2,r);const l=cur.fx[0];l&&(torchLight.position.copy(l.position),torchLight.intensity=6+Math.sin(e*13)*1.2)}updateArrows(t),debris.update(t),dust.update(t),sparks.update(t),updateStormWorld(t,e),applyTheme(r,e),updateLoot(t,e),G.shake=damp(G.shake,0,2.2,r),G.glitch=damp(G.glitch,0,1.6,r);const i=G.shake*.35;camera.position.copy(camPos).add(_v.set(Math.sin(e*37)*i,Math.sin(e*41+1)*i,Math.sin(e*33+2)*i)),camera.lookAt(camLook),updateAtmosphere(atmo,e,archer.root.position,camera);const a=["windup","dive","tail","spin","plunge","ambush"].includes(G.phase)?1:0;post.uniforms.uDanger.value=damp(post.uniforms.uDanger.value,a,3,r),post.uniforms.uGlitch.value=G.glitch+Math.max(0,Math.sin(e*.9)*Math.sin(e*2.3)-.85)*2}post.uniforms.uTime.value=e,post.uniforms.uAberr.value=1+post.uniforms.uGlitch.value*2.5+Math.sin(e*.5)*.2,post.uniforms.uGrain.value=.055+post.uniforms.uDanger.value*.03,renderer.toneMappingExposure=(G.mode==="gallery"?1:TH.exp)*(.15+.85*fade),composer.render()}frame(),PG.ready&&requestAnimationFrame(()=>window.bridge.platform.sendMessage("game_ready")),ARC2.boot();
