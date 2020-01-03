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
			x: (360 + (state.player.rotation - 90 - 45) % 360),
			y: (state.camera.range.h +
				cameraAngle.y - (mouse ? (mouse.y - state.viewport.mouse.y) * 0.3 : 0)) % state.camera.range.h
		};
		// console.log(cameraAngle, mouse);
		cameraAngle.y = Math.max(Math.min(cameraAngle.y, 260), 170);

		mouse = {...state.viewport.mouse};
	} else {
		mouse = false;
	}

	const minDistance = 12;
	const distance = Math.min(
		Math.max(minDistance, state.camera.distance * ((cameraAngle.y - 180) / 90)),
		state.camera.distance
	);
	const lookAtPos = centerPos.clone().add({
		x: 0, y: 6 - 6 * ((cameraAngle.y - 180) / 90), z: 0
	});
	// console.log(cameraAngle.y);

	camera.position.copy(lookAtPos.clone().add({
		// x
		x: Math.cos(degreeToRadiant(cameraAngle.x)) *
			Math.cos(degreeToRadiant(cameraAngle.y)) * distance,
		y: // y
		-Math.sin(degreeToRadiant(cameraAngle.y)) * distance,
		z: // z
		-Math.cos(degreeToRadiant(cameraAngle.y)) *
			Math.sin(degreeToRadiant(cameraAngle.x)) * distance
	}));

	camera.aspect = state.viewport.screen.width / (state.viewport.screen.height);
	camera.updateProjectionMatrix();
	camera.lookAt(lookAtPos);

	return camera;
};

module.exports = {
	init,
	refresh
};
