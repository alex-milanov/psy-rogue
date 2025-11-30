'use strict';

// threejs
const THREE = require('three');
window.THREE = window.THREE || THREE;

const degreeToRadiant = deg => Math.PI / (180 / deg);

const init = () => {};

const refresh = ({camera, state}) => {
	// Camera angle is now calculated in services/control/camera.js
	const cameraAngle = state.camera.angle || {x: 45, y: 210};
	
	const centerPos = new THREE.Vector3().fromArray(
		state.camera.followPlayer
			? state.player.position
			: [0, 0, 0]
	);

	const minDistance = 12;
	const distance = Math.min(
		Math.max(minDistance, state.camera.distance * ((cameraAngle.y - 180) / 90)),
		state.camera.distance
	);
	const lookAtPos = centerPos.clone().add({
		x: 0, y: 6 - 6 * ((cameraAngle.y - 180) / 90), z: 0
	});

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
