'use strict';

// dom
const {
	header, h1, section, button, span, canvas,
	form, input, label, legend, fieldset, div, i
} = require('iblokz-snabbdom-helpers');
// components
// const counter = require('./counter');

const levelGen = require('../../util/levelGen');
const levelGenDebug = require('../../util/levelGenDebug');

const {obj} = require('iblokz-data');

const inputControl = ({title, type, value, path}, actions) => div([
	label({style: {paddingLeft: ((path.length - 2) * 10 + 'px')}}, title),
	input({
		attrs: {
			type
		},
		on: {
			input: ev => actions.set(path, type === 'number'
				? parseFloat(ev.target.value)
				: ev.target.value
			)
		},
		props: {
			value
		}
	})
]);

const toggleControl = (path, value, actions) => div('.toggle', {
	on: {click: () => actions.toggle(path)}
}, [
	i('.fa', {class: {'fa-square-o': !value, 'fa-check-square-o': value}}),
	path.slice(-1).pop()
]);

const isPlainObject = value =>
	value !== null && typeof value === 'object' && !Array.isArray(value);

const parseFields = (data, path, actions) => {
	if (!isPlainObject(data)) return [];
	return Object.keys(data)
		.reduce((fields, field) => {
			const value = data[field];
			// typeof null === 'object' — skip null/arrays; only nest plain objects
			if (isPlainObject(value)) {
				return [].concat(fields, div([].concat(
					label({style: {paddingLeft: ((path.length - 1) * 10 + 'px')}}, field),
					parseFields(value, [].concat(path, field), actions)
				)));
			}
			if (typeof value === 'boolean') {
				return [].concat(fields, toggleControl([].concat(path, field), value, actions));
			}
			if (value === null || value === undefined) {
				return fields;
			}
			return [].concat(fields, inputControl({
				title: field,
				type: typeof value === 'number' ? 'number' : 'text',
				value,
				path: [].concat(path, field)
			}, actions));
		}, []);
};

module.exports = ({state, actions}) => form('.controls', [
	fieldset([].concat(
		legend({
			on: {
				click: () => actions.toggle(['controls', 'camera'])
			}
		}, [
			i('.fa', {
				class: {
					'fa-minus-square-o': state.controls.camera,
					'fa-plus-square-o': !state.controls.camera
				}
			}),
			'Camera'
		]),
		state.controls.camera ? [].concat(
			div('.toggle', {
				on: {click: () => actions.toggleView()}
			}, [
				i('.fa', {
					class: {
						'fa-check-square-o': state.camera.view === 'first',
						'fa-square-o': state.camera.view !== 'first'
					}
				}),
				` first-person (V) — ${state.camera.view || 'hybrid'}`
			]),
			div('.toggle', {
				on: {click: () => actions.toggleOrbitMode()}
			}, [
				i('.fa', {
					class: {
						'fa-check-square-o': state.camera.mode === 'orbit',
						'fa-square-o': state.camera.mode !== 'orbit'
					}
				}),
				` orbit (O) — ${state.camera.mode || 'follow'}`
			]),
			div('.toggle', {
				on: {click: () => actions.toggle(['controls', 'mouseLook'])}
			}, [
				i('.fa', {
					class: {
						'fa-check-square-o': state.controls.mouseLook,
						'fa-square-o': !state.controls.mouseLook
					}
				}),
				' mouse-look without drag (L)'
			]),
			parseFields({
				distance: state.camera.distance,
				followPlayer: state.camera.followPlayer,
				angle: state.camera.angle,
				pitch: state.camera.pitch,
				eyeHeight: state.camera.eyeHeight,
				fovFirst: state.camera.fovFirst
			}, ['camera'], actions)
		) : []
	)),
	fieldset([
		legend('Viewport'),
		div(`Size: ${state.viewport.screen.width} x ${state.viewport.screen.height}`),
		div(`Mouse: ${state.viewport.mouse.x} x ${state.viewport.mouse.y}`)
	]),
	fieldset([].concat(
		legend('Player Debug'),
		div(`Position: [${state.player.position.map(v => v.toFixed(1)).join(', ')}]`),
		div(`Rotation: ${state.player.rotation.toFixed(1)}°`),
		div(`Direction: [${state.player.direction.join(', ')}]`),
		state.camera && state.camera.angle 
			? div(`Camera: [${state.camera.angle.x.toFixed(1)}°, ${state.camera.angle.y.toFixed(1)}°]`)
			: div(),
		div(`Force: ${(state.player.force * 100).toFixed(0)}%`),
		div(`Crouching: ${state.player.crouching ? 'Yes' : 'No'}`),
		// Only show tile info for grid-based levels
		state.level.map ? div(`Tile: ${
			parseInt((state.player.position[2] - 2.5) / 5 + state.level.map.length / 2, 10)
		} x ${
			parseInt((state.player.position[0] - 2.5) / 5 + state.level.map[0].length / 2, 10)
		}: ${
			['grass', 'pavement'][
			state.level.map[
				parseInt((state.player.position[2] - 2.5) / 5 + state.level.map.length / 2, 10)
			][
				parseInt((state.player.position[0] - 2.5) / 5 + state.level.map[0].length / 2, 10)
			]]
		}`) : div()
	)),
	fieldset([].concat(
		legend('Level Controls'),
		div(`Current: ${state.level.name || 'Grid-based Level'}`),
		div('.toggle', {
			on: {click: () => actions.toggleEditMode()}
		}, [
			i('.fa', {
				class: {
					'fa-check-square-o': state.editor && state.editor.enabled,
					'fa-square-o': !(state.editor && state.editor.enabled)
				}
			}),
			' edit mode (E) — click to select'
		]),
		state.editor && state.editor.enabled
			? div(state.editor.selection
				? `Selected: ${state.editor.selection.kind}` +
					(state.editor.selection.grid
						? ` @ ${state.editor.selection.grid.row},${state.editor.selection.grid.col}`
						: '') +
					(state.editor.selection.assetId != null
						? ` (asset ${state.editor.selection.assetId})`
						: '') +
					(state.editor.selection.guardId
						? ` (${state.editor.selection.guardId})`
						: '') +
					` [${state.editor.selection.position.join(', ')}]`
				: 'Click an object in the view to select it')
			: [],
		state.editor && state.editor.selection
			? button(`[type="button"]`, {
				on: {click: () => actions.selectObject(null)}
			}, 'Clear selection')
			: [],
		button(`[type="button"]`, {
			on: {
				click: () => {
					const levelData = levelGen.generateCompound({
						gridSize: 29,
						tileSize: 5,
						buildingCount: 3,
						density: 1.0
					});
					console.log(levelGenDebug.gridToASCII(levelData));
					console.log('Player Start:', levelData.playerStart);
					console.log('Guards:', levelData.guards);
					actions.level.load(levelData.map, levelData.assets, levelData.playerStart, levelData.guards);
				}
			}
		}, 'Load Procedural Level')
	))
]);

