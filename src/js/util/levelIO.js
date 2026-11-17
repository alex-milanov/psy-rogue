'use strict';

/**
 * Level document serialize / download / file pick (Qoole saveScene / loadScene).
 */

const clone = value => JSON.parse(JSON.stringify(value));

const toDocument = state => ({
	name: (state.level && state.level.name) || 'level',
	map: state.level.map,
	assets: state.level.assets,
	playerStart: state.level.playerStart || {
		pos: state.player.position,
		rotation: state.player.rotation
	},
	guards: state.level.guards || (
		state.game && state.game.guards
			? state.game.guards.map(g => ({
				id: g.id,
				startPos: g.position,
				rotation: g.rotation,
				route: g.route,
				type: 'patrol'
			}))
			: []
	)
});

const downloadDocument = (doc, filename) => {
	const blob = new Blob([JSON.stringify(doc, null, 2)], {type: 'application/json'});
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename || `${doc.name || 'level'}.json`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
};

const pickJsonFile = () => new Promise((resolve, reject) => {
	const input = document.createElement('input');
	input.type = 'file';
	input.accept = 'application/json,.json';
	input.addEventListener('change', () => {
		const file = input.files && input.files[0];
		if (!file) {
			reject(new Error('No file selected'));
			return;
		}
		const reader = new FileReader();
		reader.onload = ev => {
			try {
				resolve({name: file.name, data: JSON.parse(ev.target.result)});
			} catch (err) {
				reject(err);
			}
		};
		reader.onerror = () => reject(reader.error || new Error('Read failed'));
		reader.readAsText(file);
	});
	input.click();
});

/** Editable slice used by undo/redo (not ephemeral UI). */
const snapshotDocument = state => clone({
	level: {
		map: state.level.map,
		assets: state.level.assets,
		playerStart: state.level.playerStart || null,
		guards: state.level.guards || null,
		name: state.level.name || null
	},
	player: {
		position: state.player.position,
		rotation: state.player.rotation
	},
	guards: state.game && state.game.guards
		? state.game.guards.map(g => ({
			id: g.id,
			position: g.position,
			rotation: g.rotation,
			route: g.route,
			routeIndex: g.routeIndex,
			mode: g.mode,
			frame: g.frame
		}))
		: null,
	selection: state.editor ? state.editor.selection : null
});

const docsEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const applyDocumentSnapshot = (state, snap) => {
	if (!snap) return state;

	const levelChanged =
		JSON.stringify(snap.level.map) !== JSON.stringify(state.level.map) ||
		JSON.stringify(snap.level.assets) !== JSON.stringify(state.level.assets);

	let next = {
		...state,
		level: {
			...state.level,
			...snap.level,
			needsReload: levelChanged ? true : state.level.needsReload
		},
		player: {
			...state.player,
			...snap.player
		},
		editor: {
			...state.editor,
			selection: snap.selection
		}
	};

	if (snap.guards && state.game) {
		const byId = snap.guards.reduce((acc, g) => {
			acc[g.id] = g;
			return acc;
		}, {});
		next = {
			...next,
			game: {
				...state.game,
				guards: state.game.guards.map(g => {
					const patch = byId[g.id];
					return patch
						? {...g, ...patch, position: [...patch.position]}
						: g;
				})
			}
		};
	}

	return next;
};

module.exports = {
	clone,
	toDocument,
	downloadDocument,
	pickJsonFile,
	snapshotDocument,
	docsEqual,
	applyDocumentSnapshot
};
