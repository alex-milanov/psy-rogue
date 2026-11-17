'use strict';

/**
 * Mouse → Three object picking (same idea as virux scene raycast → grid hit).
 * Pure helpers; scene services own living Raycaster/highlight side effects.
 */

const THREE = require('three');

const SELECTABLE_NAMES = {
	wall: true,
	tile: true,
	asset: true,
	player: true,
	guard: true
};

/** Page coords → NDC for setFromCamera (virux uses the same mapping). */
const pageToNdc = (pageX, pageY, screen) => {
	const width = (screen && screen.width) || window.innerWidth;
	const height = (screen && screen.height) || window.innerHeight;
	return new THREE.Vector2(
		(pageX / width) * 2 - 1,
		-(pageY / height) * 2 + 1
	);
};

const findSelectable = object => {
	let current = object;
	while (current) {
		if (current.userData && current.userData.selectable) return current;
		if (current.name && SELECTABLE_NAMES[current.name]) return current;
		if (current.guardId) return current;
		current = current.parent;
	}
	return null;
};

const describeObject = object => {
	const pos = object.getWorldPosition
		? object.getWorldPosition(new THREE.Vector3())
		: object.position.clone();
	const kind = (object.userData && object.userData.kind)
		|| object.name
		|| (object.guardId ? 'guard' : 'object');

	return {
		kind,
		name: object.name || kind,
		uuid: object.uuid,
		position: [pos.x, pos.y, pos.z].map(v => Number(v.toFixed(2))),
		grid: (object.userData && object.userData.grid) || null,
		assetId: (object.userData && object.userData.assetId) || null,
		tileType: (object.userData && object.userData.tileType) != null
			? object.userData.tileType
			: null,
		guardId: object.guardId || (object.userData && object.userData.guardId) || null
	};
};

/**
 * Raycast from camera through page coords; return first selectable hit description.
 * Mirrors virux: setFromCamera(ndc) → intersectObject(s) → map hit to app data.
 */
const mouseToObject = ({camera, scene, pageX, pageY, screen, objects, recursive}) => {
	if (!camera || !scene) return null;

	const ndc = pageToNdc(pageX, pageY, screen);
	const raycaster = new THREE.Raycaster();
	raycaster.setFromCamera(ndc, camera);

	const targets = objects || scene.children;
	const hits = raycaster.intersectObjects(targets, recursive !== false);
	if (!hits.length) return null;

	for (let i = 0; i < hits.length; i++) {
		const selectable = findSelectable(hits[i].object);
		if (selectable && selectable.name !== 'skybox') {
			return {
				...describeObject(selectable),
				point: hits[i].point
					? [hits[i].point.x, hits[i].point.y, hits[i].point.z]
						.map(v => Number(v.toFixed(2)))
					: null,
				distance: hits[i].distance
			};
		}
	}
	return null;
};

/** Like virux grid hover: intersect a single mesh and return raw hit (or null). */
const mouseToMeshHit = ({camera, mesh, pageX, pageY, screen}) => {
	if (!camera || !mesh) return null;
	const ndc = pageToNdc(pageX, pageY, screen);
	const raycaster = new THREE.Raycaster();
	raycaster.setFromCamera(ndc, camera);
	const hits = raycaster.intersectObject(mesh);
	return hits[0] || null;
};

module.exports = {
	pageToNdc,
	findSelectable,
	describeObject,
	mouseToObject,
	mouseToMeshHit
};
