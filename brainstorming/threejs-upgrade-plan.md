# Three.js Upgrade Plan

**Current**: r100 (0.100.0) - circa 2018  
**Target**: r169+ (latest) - 2024+  
**Jump**: ~70 major releases

## Breaking Changes Overview

### 1. Import Path Changes (MAJOR)

#### Before (r100)
```javascript
require('three/examples/js/loaders/GLTFLoader.js');
require('three/examples/js/loaders/ColladaLoader.js');
require('three/examples/js/loaders/FBXLoader.js');
require('three/examples/js/loaders/MTLLoader.js');
require('three/examples/js/loaders/OBJLoader.js');
require('../../util/three/effects/outline.js');
```

#### After (r169+)
```javascript
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ColladaLoader } from 'three/addons/loaders/ColladaLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';
```

**Impact**: All loader files need rewriting (6 files)

### 2. Module System Change

- **r100**: Uses `window.THREE` global + require()
- **r169+**: ES Modules only (import/export)

#### Current Pattern
```javascript
const THREE = require('three');
window.THREE = window.THREE || THREE;
```

#### New Pattern
```javascript
import * as THREE from 'three';
// No window.THREE needed
```

**Impact**: Every file that imports Three.js (10 files)

### 3. Geometry → BufferGeometry

- All `Geometry` class removed (r125+)
- Only `BufferGeometry` exists now
- Most geometry constructors now return `BufferGeometry` by default

**Our Usage**: Mainly loading models, so low impact

### 4. Material Changes

#### Current (may need updating)
```javascript
new THREE.MeshToonMaterial({
  color: diffuseColor,
  specular: specularColor,
  reflectivity: beta,
  shininess: specularShininess,
  skinning: true,
  map: reMat.map,
  normalMap: reMat.normalMap
});
```

#### Potential Changes
- `specular` and `shininess` don't exist on MeshToonMaterial
- Check if properties still valid

### 5. Renderer Changes

#### Color Management (r152+)
```javascript
renderer.outputColorSpace = THREE.SRGBColorSpace;
// Old: renderer.outputEncoding = THREE.sRGBEncoding;
```

### 6. Animation System

- `AnimationMixer` API mostly stable
- `AnimationClip` may have minor changes
- Should be compatible

### 7. Shadow System

- Mostly compatible
- May need to adjust shadow camera settings

## Files That Need Updates

### High Priority (Core Three.js usage)
1. ✅ `src/js/util/three/loader/gltf.js` - GLTFLoader
2. ✅ `src/js/util/three/loader/collada.js` - ColladaLoader  
3. ✅ `src/js/util/three/loader/fbx.js` - FBXLoader
4. ✅ `src/js/util/three/loader/obj.js` - OBJLoader/MTLLoader
5. ✅ `src/js/services/scene/index.js` - Scene setup, renderer, OutlineEffect
6. ✅ `src/js/services/scene/camera.js` - Camera setup
7. ✅ `src/js/services/scene/character.js` - Character model, materials, animations
8. ✅ `src/js/services/scene/npcs.js` - NPC models, animations
9. ✅ `src/js/services/scene/level.js` - Level geometry, loaders
10. ❓ `src/js/util/three/effects/outline.js` - May need to check if exists

### Medium Priority
- Shader materials (if any custom shaders exist)
- Texture handling
- Light configurations

## Estimated Effort

### Phase 1: Core Migration (4-6 hours)
- Update package.json to latest Three.js
- Convert all imports to ES modules
- Update loader files (6 files)
- Fix immediate breaking changes

### Phase 2: Material & Rendering (2-3 hours)
- Update material properties
- Add color space management
- Test shadows and lighting
- Fix any visual regressions

### Phase 3: Testing & Polish (2-3 hours)
- Test all model loading (GLTF, Collada, FBX, OBJ)
- Test animations (character, NPCs)
- Test camera, controls, effects
- Performance testing
- Visual quality check

**Total**: 8-12 hours

## Benefits of Upgrading

### Performance
- Better tree-shaking (smaller bundles with ES modules)
- WebGPU support (future-ready)
- Improved rendering performance
- Better memory management

### Features
- Latest loaders with better format support
- Improved animation system
- Better shadow quality
- KTX2 texture compression
- Improved GLTF support

### Maintenance
- Active support and bug fixes
- Better documentation
- Modern codebase
- Community compatibility

## Risks

### High Risk
- Animations may break (mixer, clips)
- Materials may look different
- Models may not load correctly
- Performance regression possible

### Medium Risk
- Shadows may need reconfiguration
- Outline effect may need replacement
- FBX loader issues (historically problematic)

### Low Risk
- Camera system (stable API)
- Basic rendering (well-tested)
- GLTF loading (best supported format)

## Migration Strategy

### Option A: Incremental (RECOMMENDED)
1. Create `feature/threejs-upgrade` branch
2. Update Three.js package
3. Fix loaders one by one
4. Test each loader thoroughly
5. Fix materials and effects
6. Merge when fully working

**Pros**: Safe, can pause/resume, test at each step  
**Cons**: Takes longer

### Option B: All-at-once
1. Update everything in one go
2. Fix all breaking changes
3. Test everything

**Pros**: Faster if it works  
**Cons**: High risk, hard to debug, might lose work

## Recommendation

### Do This Upgrade If:
- ✅ You want latest features (WebGPU, better GLTF)
- ✅ You need better performance
- ✅ You plan long-term development
- ✅ You have 8-12 hours available

### Skip For Now If:
- ❌ Current version works fine
- ❌ Focused on gameplay features first
- ❌ Limited time for technical debt
- ❌ Risk-averse (close to a release)

## Next Steps if Proceeding

1. Create `brainstorming/threejs-upgrade-checklist.md`
2. Set up test branch
3. Update package.json
4. Start with GLTF loader (most critical)
5. Test character loading
6. Continue methodically through list

## Alternative: Hybrid Approach

Keep Three.js r100 for now, but:
- ✅ Keep current stable version
- ✅ Focus on gameplay features
- ✅ Upgrade Three.js in Phase 2 (after basic gameplay done)
- ✅ Less risk, better use of time

**Verdict**: Probably best to **defer** until after implementing:
- Camera mode switching
- Mission objectives
- Basic augments
- Alert system

Then upgrade Three.js with more features to test against.

