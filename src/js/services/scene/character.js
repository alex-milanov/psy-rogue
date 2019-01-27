'use strict';

// lib
const Rx = require('rx');
const $ = Rx.Observable;

// threejs
const THREE = require('three');
window.THREE = window.THREE || THREE;

let clock = new THREE.Clock();

const gltfLoader = require('../../util/three/loader/gltf.js');

const init = () => gltfLoader.load('assets/models/rogue.glb')
	.map(gltf => {
		let character = gltf.scene;
		// player.rotation.y = -180 * Math.PI / 180;
		character.castShadow = true;
		character.receiveShadow = true;
		character.scale.set(4, 4, 4);
		character.position.set(0, 0.2, 0);
		character.traverse(function(object) {
			if (object.isMesh) {
				object.castShadow = true;
				object.receiveShadow = true;
			}
		});

		// skeleton
		let skeleton = new THREE.SkeletonHelper(character);
		skeleton.visible = false;
		// scene.add(skeleton);
		// testMesh.scale.set(0.001, 0.001, 0.001);
		let animations = gltf.animations;
		let mixer = new THREE.AnimationMixer(character);
		console.log(character, skeleton);
		let idleAction = mixer.clipAction(animations[0]);
		let idle2Action = mixer.clipAction(animations[1]);
		let walkAction = mixer.clipAction(animations[2]);
		let crouchIdleAction = mixer.clipAction(animations[3]);
		let acts = [idleAction, idle2Action, walkAction, crouchIdleAction];

		acts.forEach(function(action) {
			action.setEffectiveWeight(0);
			action.play();
		});

		acts[1].setEffectiveWeight(1);
		return {character, skeleton, mixer, acts};
	});

let lookAwayFrom = (me, target) => {
	let v = new THREE.Vector3();
	v.subVectors(me.position, target.position).add(me.position);
	v.y = me.position.y;
	me.lookAt(v);
};

const refresh = ({scene, character, mixer, acts, state, camera}) => {
	const newPos = new THREE.Vector3().fromArray(state.player.position);

	let walking = false;
	let running = false;
	let crouching = state.player.crouching;
	if (character && character.position) {
		if (state.camera.followPlayer) lookAwayFrom(character, camera);
		if (character.position.distanceTo(newPos) > 0) {
			walking = true;
			if (!state.camera.followPlayer) character.lookAt(newPos);
			if (character.position.distanceTo(newPos) >= 10) running = true;
			// player.rotation.y -= 135;
			console.log(character.position.distanceTo(newPos));
		}
		character.position.copy(newPos);
	}

	// sunLight.lookAt(newPos);

	// manage animation

	if (acts) {
		if (walking) {
			acts[1].setEffectiveWeight(0);
			acts[2].setEffectiveWeight(1);
		} else {
			acts[1].setEffectiveWeight(1);
			acts[2].setEffectiveWeight(0);
		}
		acts[3].setEffectiveWeight(crouching ? 1 : 0);
	}
	let mixerUpdateDelta = clock.getDelta();
	// console.log(character, mixer, acts);
	if (mixer) mixer.update(mixerUpdateDelta);
};

module.exports = {
	init,
	refresh
};
