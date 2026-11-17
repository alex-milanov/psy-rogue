# Level, model & character editors (app modes)

**Date:** 2026-11-17  
**Status:** Planning — not started  
**Depends on:** control / game / scene separation (`brainstorming/architecture/game-scene-separation.md`); existing `state.level` grid + `needsReload`; character mixer in `services/scene/character.js`  
**Goal:** In-app **level edit**, thin **model/prop edit**, and **character edit** (orbit preview + animation slots) without a second app, second Three renderer, or loop rewrite — same `#view3d` shell, mode-gated services.

**References:**
- virux — attachable game slice; scene syncs from document; click → action (catalysts)
- synthwave-visualizer — `camera.mode` follow|orbit; dumb viewport; `lib/3d` toolkit vs `services/scene`
- iblokz brainstorming — one-way loop; scene/audio as infra; util/lib for pure 3D helpers; game shells skip `pages/`

---

## Context (now)

| Piece | State |
|-------|--------|
| Loop | `actions → state$ → ui` + services (`control`, `game`, `scene`, `viewport`, `minimap`, `audio`) |
| Level document | `state.level.{map, assets, needsReload, playerStart?, guards?}` |
| Load path | UI / procedural → `actions.level.load` → scene `loadLevel` (full rebuild) |
| Procedural gap | Gen produces `playerStart` / `guards` but play state often still hardcoded |
| Camera | Follow + drag angle; no explicit edit/orbit mode like synthwave |
| Character | `rogue.glb` + `AnimationMixer`; clips wired by **index** (idle / idle2 / walk / crouch); weights driven by move/crouch in play |
| Game | Patrol AI every frame via `actions.set('game', …)` |
| Stack | Parcel 2.12, pnpm, iblokz-state, RxJS 7, Three r100, CJS |

---

## Architecture (locked)

```
play:          input → control → player/camera → game AI → scene + minimap
level/model:   input → control/editor → level|editor slice → scene (overlays; game paused)
character:     input → orbit cam + anim UI → character/editor slice → scene (solo focus; game paused)
```

| Layer | Play | Level edit | Model edit (props) | Character edit |
|-------|------|------------|--------------------|----------------|
| **State** | `player`, `game`, `level` | + `app.mode`, `editor.{tool,brush,selection}` | selection + transform | `characterEdit.{clip,slot,preview,orbit}` (+ clip catalog) |
| **Control** | WASD / crouch / cam drag | paint / place / hotkeys | gizmo drag (commit on up) | orbit only; no player move |
| **Game** | AI loop | **paused** | paused | paused |
| **Camera** | follow | orbit / top-down | orbit on selection | **orbit around character** (fixed look-at) |
| **Scene** | sync actors | overlays + reload/patch | highlight + transforms | focus rogue; hide or dim level optional; drive mixer from edit state |
| **UI** | HUD + debug | editor toolbar | prop inspector | clip list, slot map, play/pause/scrub |
| **Toolkit** | `util/three`, `util/levelGen` | ray→cell, brush | transform helpers | clip list helpers; orbit-around-target (shared with model) |

**Source of truth:** grids/placements in document state; **animation slot map** (semantic name → clip index or clip name) in document state so play mode stops hardcoding `acts[0..3]`. Scene owns the living `AnimationMixer` (infra); edit UI dispatches desired clip/weights. Ephemeral scrub/drag can stay instance-local until commit (iblokz ui-state).

---

## Scope

**In (this plan):**

1. App / camera **mode** flag + pause game in edit
2. Edit camera (orbit and/or top-down); **orbit-around-target** shared by model + character
3. Click-to-paint `map` / `assets` → level actions → rebuild or patch
4. Set **playerStart** + **guard** waypoints into level state (also closes procedural reseed gap)
5. Export / import level JSON
6. Thin **model/prop** mode: select placed asset, edit yaw/scale/position in state
7. **Character edit** mode: orbit the rogue; list `gltf.animations`; preview clips; map slots (`idle`, `walk`, `crouchIdle`, …); optional skeleton helper toggle

**Out (later docs):**

- Authoring new keyframes / retargeting / full GLB write-back from the browser
- Full material / LOD workshop
- Second Parcel entry or second WebGL canvas
- Collaborative editing, undo stack v2, brush scripts
- Three.js major upgrade (separate plan)
- Safe-zone hub editor / multi-floor interiors
- Guard/NPC character workshop (can reuse character mode later)

---

## Decisions

| Topic | Decision |
|-------|----------|
| Shell | **One** `#view3d`; modes change behavior (synthwave pattern) |
| Mode home | `app.mode: 'play' \| 'levelEdit' \| 'modelEdit' \| 'characterEdit'` (+ optional `camera.mode`) |
| Level edits | Pure reducers under `actions/level` (or `actions/editor` for chrome only) |
| Character edits | Document: slot → clip id/name (+ preview flags). Mixer stays in scene |
| Input | Gate `services/control` **or** thin `services/editor` silo — prefer gate first |
| Game in edit | Skip / filter game loop when not `play` |
| Reload | v1: keep `needsReload` full rebuild; later: incremental cell mesh updates |
| Model editor v1 | Prop placer + transform inspector on **level** placements — not a Blender clone |
| Character editor v1 | **Preview + slot mapping**, not a timeline DCC. “Add animation” = **register/import clip into catalog** (e.g. from another GLB) and assign to a slot — not draw bones |
| Orbit | Shared helper: orbit around `player.position` (character) or selection pivot (model); same synthwave orbit math |
| Focus | In `characterEdit`, optionally hide/dim level + NPCs so the rogue reads clearly |
| Play path | Replace index hardcoding in `character.js` with slot map from state when present |
| Gizmo / drag | Instance/gesture local until mouseup → commit action |
| Where helpers live | Pure: `util/` (or future `lib/3d`); living: services; UI: `ui/editor/` |
| Action dialect | Keep psy-rogue `actions.*` tree for this plan (no forced `dispatch` migration) |
| ESM | Not required to ship modes |

---

## Steps (in order)

### Step 1 — Mode + pause

- [ ] `app.mode` in initial state + toggle (UI and/or hotkey)
- [ ] `services/game`: run AI only when `mode === 'play'`
- [ ] `services/control`: ignore player move when editing (or no-op)

**Done when:** toggle edit ↔ play; guards freeze in edit; no scene rewrite.

### Step 2 — Edit camera (+ orbit-around-target)

- [ ] Explicit camera mode: follow (play) vs orbit / top-down (edit) — mirror synthwave `toggleCameraMode`
- [ ] Orbit look-at target from state (character pivot vs selection vs compound center)
- [ ] Viewport stays dumb; interpretation in control/camera or scene camera refresh

**Done when:** edit modes can inspect without driving the rogue; character mode orbits the model.

### Step 3 — Paint level document

- [ ] Raycast → grid cell util
- [ ] Actions: `setCell` / `setAsset` (immutable patch of `level.map` / `level.assets`) + `needsReload: true`
- [ ] Control or editor service: click/drag paint while in `levelEdit`
- [ ] Optional: brush id + eraser in `editor` slice; toolbar in `ui/editor` or controls fieldset

**Done when:** painting a wall/tile/asset survives reload and is visible in 3D.

### Step 4 — Spawns & guards into level state

- [ ] Actions to set `playerStart` and edit guard list/routes on `state.level`
- [ ] On load / play enter: apply `playerStart` → `player`, level `guards` → `game.guards`
- [ ] Scene NPC init: spawn from guard list length/ids (not hardcoded 3)

**Done when:** procedural load and hand-edit both reseed player + patrols correctly.

### Step 5 — Export / import (level)

- [ ] Serialize `{ map, assets, playerStart, guards }` (reuse/align with `levelGenDebug` / gen output)
- [ ] UI: download JSON + load file / paste
- [ ] Round-trip through `level.load`

**Done when:** a compound can leave the browser and come back.

### Step 6 — Model / prop edit (thin)

- [ ] Select placed asset (click → `editor.selection`)
- [ ] Inspector: position / rotation / scale (start with yaw + scale if grid-locked pos)
- [ ] Orbit around selection pivot when useful
- [ ] Defer materials / skinned remix

**Done when:** a lamp/tree/bench can be nudged without editing JSON by hand.

### Step 7 — Character edit (preview + slots)

- [ ] Enter `characterEdit`: pause game; orbit camera look-at = character; optional dim/hide level & guards
- [ ] Expose clip catalog from loaded GLTF (`name`, duration, index) into UI (via state or scene→action once on load)
- [ ] Preview: select clip → set mixer weights / `clipAction`; play / pause / loop; optional simple time scrub (instance-local ok)
- [ ] Slot map in document state, e.g. `{ idle, walk, crouchIdle }` → clip index
- [ ] UI to assign catalog clip → slot; “add animation” = load secondary GLB
- [ ] Toggle `SkeletonHelper` visibility for orientation
- [ ] Play mode: `character.refresh` reads slot map instead of hardcoded `acts[0..3]`

**Done when:** you can orbit the rogue, preview each clip, and remapping walk/idle/crouch changes both preview and play behavior.

---

## Non-goals / watchouts

- Don’t put brush / AI / spawn / slot rules inside `services/scene` beyond applying mixer state
- Don’t stream every gizmo/orbit tick into document state unless needed for persistence
- Full rebuild on every paint stroke may hitch — acceptable for v1
- Character edit is **not** a substitute for Blender — no exporting a rewritten GLB in this plan
- Keep Liberty Island / stealth MVP on a separate track; editors are **tooling**
- Avoid inventing a second ontology beside `map` / `assets` until export proves pain
- Clip “add” without real import UX will confuse — label clearly as assign/import-from-file

---

## Acceptance (plan complete)

- [ ] `play` ↔ `levelEdit` / `modelEdit` / `characterEdit` without restarting the app
- [ ] Paint tiles/assets; reload reflects document
- [ ] Player start + guards editable and applied on play
- [ ] Level JSON export/import round-trips
- [ ] Prop select + basic transform works
- [ ] Character: orbit around model; list + preview clips; slot remap affects play anims
- [ ] `pnpm build` still green; play loop unchanged when `mode === 'play'`

---

## Follow-ups (separate plans)

- Incremental wall/tile meshing (drop blanket `needsReload`)
- Undo/redo stack for editor actions
- Persist character slot map / clip catalog to JSON beside level or character profile
- True GLB write-back / clip baking / retarget
- Guard NPC workshop reusing character edit
- Wire editor output into Liberty Island MVP content pipeline
- Align `brainstorming/design/levels/procedural-integration.md` with actual load APIs
