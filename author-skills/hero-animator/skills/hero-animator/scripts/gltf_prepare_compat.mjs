#!/usr/bin/env node
/** Compatibility entrypoint for original Hero Animator glTF-Transform 4.x bridge.
 * Version 4 removed Node.getParent() in favor of Node.getParentNode().
 * Adds only a deprecated read-only alias before loading the unchanged author code.
 * No automatic motions, re-rigging, materials, geometry or identity changes.
 */
import { Node } from '@gltf-transform/core';
if (typeof Node.prototype.getParent !== 'function') {
  Object.defineProperty(Node.prototype, 'getParent', {
    value: function getParent() { return this.getParentNode(); },
    writable: false, configurable: true,
  });
}
await import('./gltf_prepare.mjs');
