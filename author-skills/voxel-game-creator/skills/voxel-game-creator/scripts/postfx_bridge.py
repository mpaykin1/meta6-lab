#!/usr/bin/env python3
"""Zlib pmndrs/postprocessing: optional WebGL cinematic fallback for Lumenwild.

The existing Lumenwild HDR/god-ray chain owns medium/high quality and is NEVER
replaced. Voxelize uses WebGPU, which this WebGL-oriented library cannot wrap.
In auto mode, any missing npm/network/lockfile safely yields the native engine.
"""
from __future__ import annotations
import json
import os
import shutil
import subprocess
from pathlib import Path
from create_game import fail, save, replace_once

VERSION = '6.39.6'
UPSTREAM = 'https://github.com/pmndrs/postprocessing'
PIN = 'a1f103559d15cf56cbcbb15d4373711b09418f3f'

RUNTIME = r'''// Voxel Game Creator: Zlib-licensed pmndrs/postprocessing@6.39.6.
// Optional direct-render cinematic effects; never stacks atop native HDR post.
import * as THREE from 'three';
import { BloomEffect, BrightnessContrastEffect, EffectComposer, EffectPass,
  RenderPass, VignetteEffect } from 'postprocessing';

export class VgcPostFX {
  private composer: EffectComposer | null = null;
  private readonly renderer: THREE.WebGLRenderer;
  private disabled = false;
  private cooldownFrames = 0;
  private slowFrames = 0;
  private lastFrame = 0;
  private emaDelta = 1 / 60;
  private previousAutoClear: boolean;
  private size = new THREE.Vector2();
  private mobile: boolean;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene,
              camera: THREE.Camera) {
    this.renderer = renderer;
    this.previousAutoClear = renderer.autoClear;
    this.mobile = (navigator.maxTouchPoints || 0) > 0 ||
      window.matchMedia('(pointer:coarse)').matches;
    // True accessibility: no noisy flicker and no forced extra passes.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.disabled = true;
      return;
    }
    try {
      const composer = new EffectComposer(renderer, {
        depthBuffer: true, stencilBuffer: false, multisampling: 0,
        frameBufferType: THREE.UnsignedByteType,
      });
      const grade = new BrightnessContrastEffect({ brightness: -0.014, contrast: 0.055 });
      const vignette = new VignetteEffect({ offset: 0.32, darkness: 0.34 });
      const effects = this.mobile
        ? [grade, vignette]
        : [new BloomEffect({ intensity: 0.23, luminanceThreshold: 0.78,
            luminanceSmoothing: 0.24, mipmapBlur: true, levels: 5 }), grade, vignette];
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(new EffectPass(camera, ...effects));
      this.composer = composer;
      this.resize();
    } catch (error) {
      this.disabled = true;
      this.composer?.dispose();
      this.composer = null;
      renderer.autoClear = this.previousAutoClear;
      console.warn('VGC Postprocessing initialization failed; native rendering retained', error);
    }
  }

  resize(): void {
    if (!this.composer || this.disabled) return;
    const actual = this.renderer.getDrawingBufferSize(new THREE.Vector2());
    if (actual.x === this.size.x && actual.y === this.size.y) return;
    this.size.copy(actual);
    const css = this.renderer.getSize(new THREE.Vector2());
    this.composer.setSize(css.x, css.y, false);
  }

  render(): boolean {
    if (!this.composer || this.disabled || document.hidden) return false;
    const now = performance.now();
    if (this.lastFrame) {
      const dt = Math.max(0, Math.min((now - this.lastFrame) / 1000, 0.1));
      this.emaDelta = this.emaDelta * 0.91 + dt * 0.09;
      if (this.emaDelta > 1 / 29) this.slowFrames++;
      else this.slowFrames = 0;
      if (this.slowFrames > 30) {
        // Do not permanently disable the scene: retry after native recovery.
        this.cooldownFrames = 240;
        this.slowFrames = 0;
      }
    }
    this.lastFrame = now;
    if (this.cooldownFrames > 0) {
      --this.cooldownFrames;
      this.renderer.autoClear = this.previousAutoClear;
      return false;
    }
    try {
      this.resize();
      this.renderer.setRenderTarget(null);
      this.renderer.autoClear = false;
      this.composer.render();
      return true;
    } catch (error) {
      console.warn('VGC Postprocessing render failed; restoring native WebGL', error);
      this.disabled = true;
      this.dispose();
      return false;
    }
  }

  dispose(): void {
    this.composer?.dispose();
    this.composer = null;
    this.renderer.autoClear = this.previousAutoClear;
  }
}
'''


def configure_dependency(client: Path, mode: str) -> tuple[bool, str]:
    if mode not in ('auto', 'required', 'off'):
        fail('Postprocessing mode must be auto|required|off')
    if mode == 'off':
        return False, 'off'
    package = client / 'package.json'
    lock = client / 'package-lock.json'
    if not package.is_file() or not lock.is_file():
        if mode == 'required': fail('Postprocessing requires a real npm package-lock.json')
        return False, 'npm-project-unavailable'
    before = {p: p.read_bytes() for p in (package, lock)}
    if not shutil.which('npm'):
        if mode == 'required': fail('Postprocessing requires npm')
        return False, 'npm-unavailable'
    try:
        p = json.loads(package.read_text(encoding='utf8'))
        # Zlib release 6.39.6 is compatible with THREE 0.185, not legacy r128 or WebGPU.
        if not str(p.get('dependencies', {}).get('three', '')).startswith(('^0.185', '~0.185', '0.185')):
            raise ValueError('Postprocessing is pinned to reviewed Lumenwild Three.js ^0.185')
        cmd = ['npm', 'install', '--package-lock-only', '--save-exact', '--ignore-scripts',
               '--no-audit', '--no-fund', '--fetch-retries=0', '--fetch-timeout=6500',
               f'postprocessing@{VERSION}']
        result = subprocess.run(cmd, cwd=client, capture_output=True, text=True,
                                timeout=48, check=False, env={**os.environ, 'CI': 'true'})
        if result.returncode:
            raise RuntimeError((result.stderr or result.stdout)[-900:])
        p = json.loads(package.read_text(encoding='utf8'))
        q = json.loads(lock.read_text(encoding='utf8'))
        if (p.get('dependencies', {}).get('postprocessing') != VERSION or
            q.get('packages', {}).get('node_modules/postprocessing', {}).get('version') != VERSION):
            raise RuntimeError('Postprocessing package-lock resolution mismatch')
        return True, 'npm-lock-resolved'
    except (OSError, subprocess.TimeoutExpired, RuntimeError, ValueError) as error:
        for path, data in before.items(): path.write_bytes(data)
        if mode == 'required': fail('Postprocessing dependency failed: ' + str(error))
        return False, 'native-postfx-preserved; npm resolution unavailable'


def install(project: Path, engine: str, *, mode: str = 'auto') -> dict:
    """Attach a *single* WebGL composer to Lumenwild's native direct-render path.

    Native HDR post, voxel physics, animations, shader layers, and CPU renderer
    are left unchanged. No-op in auto mode for unsupported engine.
    """
    if mode not in ('auto', 'required', 'off'):
        fail('Unknown Postprocessing mode: ' + mode)
    if mode == 'off': return {'status': 'off', 'engine': engine}
    if engine != 'browser':
        if mode == 'required': fail('pmndrs Postprocessing WebGL bridge supports only Lumenwild browser, not WebGPU or other native renderers')
        return {'status': 'native-renderer-preserved', 'engine': engine}
    if not project.is_dir(): fail('Lumenwild generated project not found: ' + str(project))
    manifest_files = (project/'package.json', project/'package-lock.json')
    original_manifests = {f: f.read_bytes() for f in manifest_files if f.is_file()}
    enabled, status = configure_dependency(project, mode)
    if not enabled:
        return {'status': status, 'engine': engine}
    target = project / 'src/render/renderer.ts'
    original = target.read_text(encoding='utf8')
    try:
        code = original
        code = replace_once(code, 'import { PostPipeline } from "./post";',
            'import { PostPipeline } from "./post";\nimport { VgcPostFX } from "./vgc-postfx";',
            'pmndrs Postprocessing import')
        code = replace_once(code, '  private post: PostPipeline | null = null;',
            '  private post: PostPipeline | null = null;\n  private vgcPostfx: VgcPostFX | null = null;',
            'pmndrs Postprocessing field')
        code = replace_once(code, '    this.renderer.setSize(this.width, this.height);',
            '    this.renderer.setSize(this.width, this.height);\n    this.vgcPostfx?.resize();',
            'pmndrs Postprocessing resize')
        code = replace_once(code, '    if (!this.direct) {\n      const size = this.renderer.getDrawingBufferSize(',
            '    if (!this.direct) {\n      this.vgcPostfx?.dispose();\n      this.vgcPostfx = null;\n      const size = this.renderer.getDrawingBufferSize(',
            'pmndrs Postprocessing native HDR ownership')
        code = replace_once(code, '''    if (!this.post) {
      renderer.setRenderTarget(null);
      renderer.render(this.scene, camera);
      return;
    }''', '''    if (!this.post) {
      // Native low/direct WebGL path only. Never double-compose native HDR/god rays.
      renderer.setRenderTarget(null);
      this.vgcPostfx ??= new VgcPostFX(renderer, this.scene, camera);
      if (this.vgcPostfx.render()) return;
      renderer.autoClear = true;
      renderer.render(this.scene, camera);
      return;
    }''', 'pmndrs Postprocessing direct-render branch')
        code = replace_once(code, '''    this.post?.dispose();
    this.shadow?.dispose();''', '''    this.vgcPostfx?.dispose();
    this.vgcPostfx = null;
    this.post?.dispose();
    this.shadow?.dispose();''', 'pmndrs Postprocessing cleanup')
        module = project / 'src/render/vgc-postfx.ts'
        if module.exists(): fail('pmndrs Postprocessing module already exists')
        save(target, code)
        save(module, RUNTIME)
        save(project / 'VGC_POSTFX.json', json.dumps({
            'project': 'pmndrs/postprocessing', 'license': 'Zlib', 'version': VERSION,
            'pin': PIN, 'mode': mode, 'status': status,
            'active': 'Lumenwild WebGL direct-render branch only; never native HDR or CPU',
            'effects': ['bloom-desktop', 'vignette', 'subtle-color-grade'],
            'quality': 'mobile: no bloom, reduced motion disables; sustained FPS<29 backs off',
            'assets': 'original Ragnagrok/Blockbench/voxel world untouched',
        }, indent=2) + '\n')
        return {'status': 'installed', 'engine': engine, 'version': VERSION}
    except BaseException as error:
        target.write_text(original, encoding='utf8')
        (project / 'src/render/vgc-postfx.ts').unlink(missing_ok=True)
        (project / 'VGC_POSTFX.json').unlink(missing_ok=True)
        # Restore both package & lock as a unit in auto mode instead of
        # shipping a dependency that the client never imports.
        if mode == 'auto':
            # The bridge owns only the newly inserted dependency; npm resolution
            # may update transitive deps, so restore precisely via a snapshot.
            for old_path, data in original_manifests.items(): old_path.write_bytes(data)
            return {'status': 'native-renderer-preserved; source-patch-failed', 'engine': engine}
        raise
