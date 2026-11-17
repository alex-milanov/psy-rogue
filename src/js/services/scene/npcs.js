'use strict';

// lib
const { map } = require('rxjs/operators');

// threejs
const THREE = require('three');
window.THREE = window.THREE || THREE;

let clock = new THREE.Clock();

const gltfLoader = require('../../util/three/loader/gltf.js');

const init = () => gltfLoader.load('assets/models/guard.glb')
	.pipe(map(gltf => {
		// Create 3 guard models (matching game state)
		const guards = [0, 1, 2].map(index => {
			let guard = gltfLoader.clone(gltf);
			let model = guard.scene;
			let animations = guard.animations;

			model.castShadow = true;
			model.receiveShadow = true;
			model.scale.set(4, 4, 4);
			model.traverse(function(object) {
				if (object.isMesh) {
					object.castShadow = true;
					object.receiveShadow = true;
				}
			});
			
			// Animation setup
			let skeleton = new THREE.SkeletonHelper(model);
			skeleton.visible = false;
			let mixer = new THREE.AnimationMixer(model);
			let idleAction = mixer.clipAction(animations[0]);
			let walkAction = mixer.clipAction(animations[1]);
			let acts = [idleAction, walkAction];
			const fallbackNames = ['idle', 'walk'];
			const clips = animations.map((clip, i) => ({
				index: i,
				name: clip.name || fallbackNames[i] || `clip-${i}`,
				duration: clip.duration
			}));
			acts.forEach(function(action) {
				action.setEffectiveWeight(0);
				action.play();
			});
			
			// Store guard ID to match with game state
			model.name = 'guard';
			model.guardId = `guard-${index + 1}`;
			model.userData = {
				kind: 'guard',
				selectable: true,
				guardId: model.guardId
			};
			
			return {model, mixer, acts, clips};
		});
		return guards;
	}));

const refresh = ({scene, guards, state}) => {
	let mixerUpdateDelta = clock.getDelta();
	
	// Sync 3D models with game state
	if (state.game && state.game.guards) {
		guards.forEach(guard => {
			// Find corresponding game state guard
			const gameGuard = state.game.guards.find(g => g.id === guard.model.guardId);
			if (!gameGuard) return;
			
			const gizmoOnThis = state.editor && state.editor.gizmoDragging &&
				state.editor.selection &&
				state.editor.selection.kind === 'guard' &&
				state.editor.selection.guardId === guard.model.guardId;

			// Update pose from game state unless gizmo is dragging this guard
			if (!gizmoOnThis) {
				guard.model.position.copy(new THREE.Vector3().fromArray(gameGuard.position));
				guard.model.rotation.y = gameGuard.rotation;
			}
			
			const anim = state.editor && state.editor.anim;
			const previewClips = anim && state.editor.selection &&
				state.editor.selection.kind === 'guard' &&
				state.editor.selection.guardId === guard.model.guardId &&
				Array.isArray(anim.clipIndices) && anim.clipIndices.length > 0
				? anim.clipIndices
				: null;

			const actionPaused = !!(anim && anim.paused &&
				state.editor.selection &&
				state.editor.selection.kind === 'guard' &&
				state.editor.selection.guardId === guard.model.guardId);

			if (previewClips) {
				guard.acts.forEach((action, i) => {
					action.setEffectiveWeight(previewClips.indexOf(i) !== -1 ? 1 : 0);
				});
			} else if (actionPaused || gameGuard.mode !== 'walk') {
				// Paused mid-patrol: idle pose while frozen (unless clips overridden)
				guard.acts[1].setEffectiveWeight(0);
				guard.acts[0].setEffectiveWeight(1);
			} else {
				guard.acts[1].setEffectiveWeight(1);
				guard.acts[0].setEffectiveWeight(0);
			}

			if (guard.mixer) guard.mixer.update(mixerUpdateDelta);
		});
	}
	
	return guards;
};

module.exports = {
	init,
	refresh
};
