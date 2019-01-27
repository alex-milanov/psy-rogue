'use strict';

// lib
const Rx = require('rx');
const $ = Rx.Observable;

// threejs
const THREE = require('three');
window.THREE = window.THREE || THREE;

let clock = new THREE.Clock();

const routes = [
	[[-10, 0.2, -20], [20, 0.2, -20]],
	[[0, 0.2, 0], [-30, 0.2, 0]],
	[[-20, 0.2, 20], [10, 0.2, 20], [10, 0.2, 40]]
];

const gltfLoader = require('../../util/three/loader/gltf.js');

const init = () => gltfLoader.load('assets/models/guard.glb')
	.map(gltf => {
		let animations = gltf.animations;

		// console.log('123', guard, guard.clone());
		// player.rotation.y = -180 * Math.PI / 180;
		const guards = routes.map(
			route => {
				// let model = new THREE.ObjectLoader().parse(guard.toJSON());
				let guard = gltfLoader.clone(gltf);
				let model = guard.scene;
				let animations = guard.animations;

				model.castShadow = true;
				model.receiveShadow = true;
				model.scale.set(4, 4, 4);
				model.position.copy(new THREE.Vector3().fromArray(route[0]));
				// model.lookAt(new THREE.Vector3().fromArray(route[1]));
				model.traverse(function(object) {
					if (object.isMesh) {
						object.castShadow = true;
						object.receiveShadow = true;
					}
				});
				// skeleton
				let skeleton = new THREE.SkeletonHelper(model);
				skeleton.visible = false;
				let mixer = new THREE.AnimationMixer(model);
				let idleAction = mixer.clipAction(animations[0]);
				let walkAction = mixer.clipAction(animations[1]);
				let acts = [idleAction, walkAction];
				acts.forEach(function(action) {
					action.setEffectiveWeight(0);
					action.play();
				});
				model.route = route;
				model.direction = 1;
				return {model, mixer, acts, route};
			}
		);
		return guards;
	});

const refresh = ({scene, guards, state}) => {
	let mixerUpdateDelta = clock.getDelta();
	// console.log(guards);
	guards.forEach(guard => {
		// console.log(guard);
		if (guard.model.position.distanceTo(new THREE.Vector3().fromArray(guard.model.route[
			guard.model.direction
		])) <= 0.12) {
			guard.model.position.copy(new THREE.Vector3().fromArray(guard.model.route[
				guard.model.direction
			]));
			if (guard.model.direction < guard.model.route.length - 1) {
				guard.model.direction++;
			} else {
				guard.model.direction = 0;
				guard.model.route = guard.model.route.reverse();
			}
			guard.model.lookAt(new THREE.Vector3().fromArray(guard.model.route[guard.model.direction]));
		} else {
			guard.model.lookAt(new THREE.Vector3().fromArray(guard.model.route[guard.model.direction]));
			var direction = new THREE.Vector3();
			guard.model.getWorldDirection(direction);
			guard.model.position.add(direction.multiplyScalar(0.12));
		}
		guard.acts[1].setEffectiveWeight(1);
		guard.acts[0].setEffectiveWeight(0);
		// console.log(character, mixer, acts);
		if (guard.mixer) guard.mixer.update(mixerUpdateDelta);
	});
	return guards;
};

module.exports = {
	init,
	refresh
};
