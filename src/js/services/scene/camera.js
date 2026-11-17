'use strict';

// threejs
const THREE = require('three');
window.THREE = window.THREE || THREE;

const degreeToRadiant = deg => Math.PI / (180 / deg);

const init = () => {};

/** Edit selection pivot, else player (virux followPlayer center). */
const resolveOrbitTarget = state => {
	const sel = state.editor && state.editor.enabled && state.editor.selection;
	if (sel) {
		if (sel.kind === 'player' && state.player && state.player.position) {
			return state.player.position;
		}
		if (sel.kind === 'guard' && sel.guardId && state.game && state.game.guards) {
			const guard = state.game.guards.find(g => g.id === sel.guardId);
			if (guard && guard.position) return guard.position;
		}
		if (sel.position) return sel.position;
	}
	return (state.player && state.player.position) || [0, 0, 0];
};

const refreshHybrid = ({camera, state}) => {
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
		x: Math.cos(degreeToRadiant(cameraAngle.x)) *
			Math.cos(degreeToRadiant(cameraAngle.y)) * distance,
		y: -Math.sin(degreeToRadiant(cameraAngle.y)) * distance,
		z: -Math.cos(degreeToRadiant(cameraAngle.y)) *
			Math.sin(degreeToRadiant(cameraAngle.x)) * distance
	}));

	camera.fov = state.camera.fov != null ? state.camera.fov : 45;
	camera.aspect = state.viewport.screen.width / state.viewport.screen.height;
	camera.updateProjectionMatrix();
	camera.lookAt(lookAtPos);

	return camera;
};

// Virux-style free orbit around a fixed look-at (player or edit selection)
const refreshOrbit = ({camera, state}) => {
	const cameraAngle = state.camera.angle || {x: 45, y: 210};
	const centerPos = new THREE.Vector3().fromArray(resolveOrbitTarget(state));
	const distance = state.camera.distance != null ? state.camera.distance : 60;

	camera.position.copy(centerPos.clone().add({
		x: Math.cos(degreeToRadiant(cameraAngle.x)) *
			Math.cos(degreeToRadiant(cameraAngle.y)) * distance,
		y: -Math.sin(degreeToRadiant(cameraAngle.y)) * distance,
		z: -Math.cos(degreeToRadiant(cameraAngle.y)) *
			Math.sin(degreeToRadiant(cameraAngle.x)) * distance
	}));

	camera.fov = state.camera.fov != null ? state.camera.fov : 45;
	camera.aspect = state.viewport.screen.width / state.viewport.screen.height;
	camera.updateProjectionMatrix();
	camera.lookAt(centerPos);

	return camera;
};

const refreshFirst = ({camera, state}) => {
	const eyeHeight = state.player.crouching
		? 2.8
		: (state.camera.eyeHeight != null ? state.camera.eyeHeight : 5);
	const eye = new THREE.Vector3().fromArray(state.player.position);
	eye.y += eyeHeight;

	// Same yaw basis as WASD forward (rotation + 45)
	const yaw = degreeToRadiant(state.player.rotation + 45);
	const pitch = degreeToRadiant(state.camera.pitch || 0);
	const fx = -Math.cos(yaw);
	const fz = Math.sin(yaw);

	const look = eye.clone().add(new THREE.Vector3(
		fx * Math.cos(pitch),
		Math.sin(pitch),
		fz * Math.cos(pitch)
	));

	camera.position.copy(eye);
	camera.fov = state.camera.fovFirst != null ? state.camera.fovFirst : 75;
	camera.aspect = state.viewport.screen.width / state.viewport.screen.height;
	camera.updateProjectionMatrix();
	camera.lookAt(look);

	return camera;
};

const refresh = ({camera, state}) => {
	if (!camera || !state) return camera;
	if (state.camera.view === 'first') {
		return refreshFirst({camera, state});
	}
	if (state.camera.mode === 'orbit') {
		return refreshOrbit({camera, state});
	}
	return refreshHybrid({camera, state});
};

module.exports = {
	init,
	refresh
};
