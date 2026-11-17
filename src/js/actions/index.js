'use strict';

const {obj, arr} = require('iblokz-data');

// namespaces
const counter = require('./counter');
const level = require('./level');
const game = require('../services/game');

// initial
const initial = {
	camera: {
		// hybrid = current orbit/elevation morph; first = eye cam (does not alter hybrid math)
		view: 'hybrid', // 'hybrid' | 'first'
		// follow = hybrid chase; orbit = virux free sphere around player/selection
		mode: 'follow', // 'follow' | 'orbit'
		distance: 60,
		range: {
			h: 360,
			hOffset: -180,
			v: 90,
			vOffset: -80
		},
		followPlayer: true,
		angle: {x: 45, y: 210},
		pitch: 0,
		eyeHeight: 5,
		fov: 45,
		fovFirst: 75,
		hybridSnapshot: null
	},
	player: {
		position: [-10, 0.2, 35],
		rotation: 180,
		crouching: false,
		combat: false,
		direction: [0, 0],
		force: 0
	},
	viewport: {
		screen: {
			width: 800,
			height: 600
		},
		mouse: {
			x: 0,
			y: 0,
			changeX: 0,
			changeY: 0,
			down: false,
			overCanvas: false
		}
	},
	controls: {
		on: true,
		camera: false,
		hotkeys: false,
		// rotate / look on mouse move without holding button (when over canvas)
		mouseLook: false
	},
	editor: {
		enabled: false,
		selection: null, // { kind, name, uuid, position, grid?, assetId?, guardId? }
		// Character/NPC clip preview when selection is player|guard
		// Character edit: clip catalog + multi-select override; paused freezes that actor's game action
		anim: null // { clips, clipIndices: number[], paused: boolean }
	},
	minimap: {
		enabled: true,
		size: 200
	},
	game: game.actions.initial
};

// actions
const set = (key, value) => state => obj.patch(state, key, value);
const toggle = key => state => obj.patch(state, key, !obj.sub(state, key));
const arrToggle = (key, value) => state =>
	obj.patch(state, key,
		arr.toggle(obj.sub(state, key), value)
	);

const zoom = amount => state => {
	if (state.camera.view === 'first') {
		const fov = state.camera.fovFirst != null ? state.camera.fovFirst : 75;
		return obj.patch(state, 'camera', {
			fovFirst: Math.max(50, Math.min(100, fov + amount))
		});
	}
	return obj.patch(state, 'camera', {
		distance: Math.max(12, state.camera.distance + amount)
	});
};

const degreeToRadiant = deg => Math.PI / (180 / deg);
const calcucalateAngle = (viewport, range) => ({
	x: (viewport.mouse.x / viewport.screen.width * range.h) + range.hOffset,
	y: (viewport.mouse.y / viewport.screen.height * range.v) + range.vOffset
});

const move = (direction, force) =>
	state => obj.patch(state, 'player', {
		position: [
			state.player.position[0] +
				// front / back
				(-Math.cos(degreeToRadiant(state.player.rotation + 45)) * direction[2] * force) +
				(Math.cos(degreeToRadiant(state.player.rotation - 45)) * direction[0] * force),
			state.player.position[1],
			state.player.position[2] +
				// front / back
				(Math.sin(degreeToRadiant(state.player.rotation + 45)) * direction[2] * force) +
				(-Math.sin(degreeToRadiant(state.player.rotation - 45)) * direction[0] * force)
		]
	});

const toggleView = () => state => {
	if (state.camera.view === 'first') {
		const snap = state.camera.hybridSnapshot || {};
		return obj.patch(state, 'camera', {
			view: 'hybrid',
			angle: snap.angle ? {...snap.angle} : state.camera.angle,
			distance: snap.distance != null ? snap.distance : state.camera.distance,
			hybridSnapshot: null,
			pitch: 0
		});
	}
	return obj.patch(state, 'camera', {
		view: 'first',
		hybridSnapshot: {
			angle: {...(state.camera.angle || {x: 45, y: 210})},
			distance: state.camera.distance
		},
		pitch: 0
	});
};

const toggleEditMode = () => state => {
	const enabling = !state.editor.enabled;
	return obj.patch(state, 'editor', {
		enabled: enabling,
		selection: enabling ? state.editor.selection : null,
		anim: enabling ? state.editor.anim : null
	});
};

const selectObject = (selection, anim) => state => {
	const isActor = selection && (selection.kind === 'player' || selection.kind === 'guard');
	const nextAnim = isActor
		? (anim || state.editor.anim)
		: null;
	return obj.patch(state, 'editor', {
		...state.editor,
		selection,
		anim: nextAnim
			? {
				clips: nextAnim.clips || [],
				// no auto-pick — empty means follow game state (e.g. walk+crouch)
				clipIndices: Array.isArray(nextAnim.clipIndices) ? nextAnim.clipIndices : [],
				// freeze subject movement/AI while inspecting (anims still run)
				paused: nextAnim.paused !== false
			}
			: null
	});
};

const toggleAnimClip = clipIndex => state => {
	if (!state.editor.anim) return state;
	return obj.patch(state, ['editor', 'anim', 'clipIndices'],
		arr.toggle(state.editor.anim.clipIndices || [], clipIndex)
	);
};

const toggleCharacterPaused = () => state => {
	if (!state.editor.anim) return state;
	return obj.patch(state, ['editor', 'anim', 'paused'], !state.editor.anim.paused);
};

const toggleOrbitMode = () => state => {
	if (state.camera.mode === 'orbit') {
		return obj.patch(state, ['camera', 'mode'], 'follow');
	}
	return obj.patch(state, 'camera', {
		mode: 'orbit',
		view: state.camera.view === 'first' ? 'hybrid' : state.camera.view
	});
};

module.exports = {
	initial,
	counter,
	level,
	set,
	toggle,
	arrToggle,
	zoom,
	move,
	toggleView,
	toggleEditMode,
	selectObject,
	toggleAnimClip,
	toggleCharacterPaused,
	toggleOrbitMode
};
