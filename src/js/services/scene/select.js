'use strict';

/**
 * Scene-local selection highlight (side effect on sceneState).
 * Picking lives in util/three/pick.js.
 */

const THREE = require('three');

const disposeHelper = helper => {
	if (!helper) return;
	if (helper.parent) helper.parent.remove(helper);
	if (helper.geometry) helper.geometry.dispose();
	if (helper.material) helper.material.dispose();
};

const clearSelectionHelpers = scene => {
	// Sweep by name so orphans from lost refs can't linger
	scene.children
		.filter(child => child.name === 'selectionHelper')
		.forEach(disposeHelper);
};

const syncSelectionHelper = (sceneState, selection) => {
	if (!sceneState || !sceneState.scene) return sceneState;

	clearSelectionHelpers(sceneState.scene);
	sceneState.selectionHelper = null;

	if (!selection || !selection.uuid) return sceneState;

	let target = null;
	sceneState.scene.traverse(obj => {
		if (!target && obj.uuid === selection.uuid) target = obj;
	});
	if (!target) return sceneState;

	const helper = new THREE.BoxHelper(target, 0x66ccff);
	helper.name = 'selectionHelper';
	helper.userData.targetUuid = selection.uuid;
	sceneState.scene.add(helper);
	sceneState.selectionHelper = helper;
	return sceneState;
};

module.exports = {
	syncSelectionHelper
};
