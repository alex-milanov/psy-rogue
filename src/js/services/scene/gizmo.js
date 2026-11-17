'use strict';

/**
 * Edit-mode TransformControls — Qoole-style matrix undo/redo on the live object.
 */

const THREE = require('three');
window.THREE = window.THREE || THREE;
require('three/examples/js/controls/TransformControls.js');

const editorHistory = require('../../actions/level/history');

const TILE_SNAP = 5;
const ROT_SNAP = Math.PI / 2;

const findByUuid = (scene, uuid) => {
	let target = null;
	if (!scene || !uuid) return null;
	scene.traverse(obj => {
		if (!target && obj.uuid === uuid) target = obj;
	});
	return target;
};

const applyKindConstraints = (gizmo, kind, mode) => {
	const gridish = kind === 'tile' || kind === 'wall' || kind === 'asset';
	gizmo.setTranslationSnap(gridish && mode === 'translate' ? TILE_SNAP : null);
	gizmo.setRotationSnap(gridish && mode === 'rotate' ? ROT_SNAP : null);

	if (mode === 'translate' && (kind === 'tile' || kind === 'asset' || kind === 'wall')) {
		gizmo.showX = true;
		gizmo.showY = false;
		gizmo.showZ = true;
	} else {
		gizmo.showX = true;
		gizmo.showY = true;
		gizmo.showZ = true;
	}
};

const readTransform = object => ({
	position: [
		Number(object.position.x.toFixed(3)),
		Number(object.position.y.toFixed(3)),
		Number(object.position.z.toFixed(3))
	],
	rotation: [
		Number(object.rotation.x.toFixed(4)),
		Number(object.rotation.y.toFixed(4)),
		Number(object.rotation.z.toFixed(4))
	],
	rotationY: Number(object.rotation.y.toFixed(4)),
	scale: [
		Number(object.scale.x.toFixed(3)),
		Number(object.scale.y.toFixed(3)),
		Number(object.scale.z.toFixed(3))
	]
});

const applyMatrixToObject = (object, matrix) => {
	matrix.decompose(object.position, object.quaternion, object.scale);
	object.updateMatrix();
};

const createGizmo = ({camera, domElement, scene, actions}) => {
	const gizmo = new THREE.TransformControls(camera, domElement);
	gizmo.name = 'transformGizmo';
	gizmo.setMode('translate');
	gizmo.setSize(0.85);
	scene.add(gizmo);

	let attachedUuid = null;
	let matrixBefore = null;
	let dragKind = null;

	const syncPoseFromObject = object => {
		if (!object) return;
		actions.applyObjectPose(readTransform(object));
	};

	// Qoole interact(): snapshot matrix before, push undo/redo pair after change
	const pushMatrixHistory = (object, before, after, title) => {
		if (!object || !before || !after) return;
		if (before.equals(after)) return;

		const matrix1 = before.clone();
		const matrix2 = after.clone();

		editorHistory.add(
			() => {
				applyMatrixToObject(object, matrix1);
				syncPoseFromObject(object);
			},
			() => {
				applyMatrixToObject(object, matrix2);
				syncPoseFromObject(object);
			},
			title
		);
	};

	gizmo.addEventListener('dragging-changed', ev => {
		actions.set(['editor', 'gizmoDragging'], !!ev.value);
		const object = gizmo.object;
		if (!object) return;

		if (ev.value) {
			object.updateMatrix();
			matrixBefore = object.matrix.clone();
			dragKind = (object.userData && object.userData.kind) || object.name || 'object';
			// Seed document pose so selection matches mesh at drag start
			syncPoseFromObject(object);
		} else if (matrixBefore) {
			object.updateMatrix();
			const matrixAfter = object.matrix.clone();
			const title = `transform:${dragKind || 'object'}:${object.uuid}`;
			pushMatrixHistory(object, matrixBefore, matrixAfter, title);
			syncPoseFromObject(object);
			matrixBefore = null;
			dragKind = null;
		}
	});

	const sync = ({state}) => {
		const editor = state && state.editor;
		const selection = editor && editor.selection;
		const enabled = editor && editor.enabled && selection && selection.uuid;

		if (!enabled) {
			if (gizmo.object) gizmo.detach();
			attachedUuid = null;
			gizmo.visible = false;
			return gizmo;
		}

		const mode = editor.gizmoMode || 'translate';
		if (gizmo.getMode() !== mode) gizmo.setMode(mode);
		applyKindConstraints(gizmo, selection.kind, mode);

		if (attachedUuid !== selection.uuid) {
			const target = findByUuid(scene, selection.uuid);
			if (!target) {
				gizmo.detach();
				attachedUuid = null;
				return gizmo;
			}
			gizmo.attach(target);
			attachedUuid = selection.uuid;
		}

		gizmo.visible = true;
		return gizmo;
	};

	const dispose = () => {
		gizmo.detach();
		if (gizmo.parent) gizmo.parent.remove(gizmo);
	};

	return {gizmo, sync, dispose};
};

module.exports = {
	createGizmo,
	readTransform,
	TILE_SNAP
};
