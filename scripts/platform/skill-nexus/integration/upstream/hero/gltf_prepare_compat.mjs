#!/usr/bin/env node
import {Node} from '@gltf-transform/core';
if(typeof Node.prototype.getParent!=='function'){
  Object.defineProperty(Node.prototype,'getParent',{
    value:function getParent(){return this.getParentNode();},
    writable:false,configurable:true
  });
}
await import('./gltf_prepare.mjs');
