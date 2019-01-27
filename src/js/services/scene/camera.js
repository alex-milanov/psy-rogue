'use strict';

// lib
const Rx = require('rx');
const $ = Rx.Observable;

// threejs
const THREE = require('three');
window.THREE = window.THREE || THREE;

const degreeToRadiant = deg => Math.PI / (180 / deg);
const calcucalateAngle = (viewport, range) => ({
	x: (viewport.mouse.x / viewport.screen.width * range.h) + range.hOffset,
	y: (viewport.mouse.y / viewport.screen.height * range.v) + range.vOffset
});

const init = () => {};

let cameraAngle = {x: 45, y: 210};
let mouse = false;

const refresh = ({camera, state}) => {
	const centerPos = new THREE.Vector3().fromArray(
		state.camera.followPlayer
			? state.player.position
			: [0, 0, 0]
	);

	if (state.viewport.mouse.down) {
		cameraAngle = {
			x: (state.camera.range.h +
				cameraAngle.x + (mouse ? (mouse.x - state.viewport.mouse.x) : 0)) % state.camera.range.h,
			y: (state.camera.range.h +
				cameraAngle.y - (mouse ? (mouse.y - state.viewport.mouse.y) : 0)) % state.camera.range.h
		};
		// console.log(cameraAngle, mouse);

		mouse = {...state.viewport.mouse};
	} else {
		mouse = false;
	}

	camera.position.copy(centerPos.clone().add({
		// x
		x: Math.cos(degreeToRadiant(cameraAngle.x)) *
			Math.cos(degreeToRadiant(cameraAngle.y)) * state.camera.distance,
		y: // y
		-Math.sin(degreeToRadiant(cameraAngle.y)) * state.camera.distance,
		z: // z
		-Math.cos(degreeToRadiant(cameraAngle.y)) *
			Math.sin(degreeToRadiant(cameraAngle.x)) * state.camera.distance
	}));

	camera.aspect = state.viewport.screen.width / (state.viewport.screen.height);
	camera.updateProjectionMatrix();
	camera.lookAt(centerPos);

	return camera;
};

module.exports = {
	init,
	refresh
};
