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

const parseFields = (data, path, actions) => Object.keys(data)
	.reduce((fields, field) => [].concat(fields,
		obj.switch(typeof data[field], {
			default: () => inputControl({
				title: field,
				type: typeof data[field],
				value: data[field],
				path: [].concat(path, field)
			}, actions),
			object: () => div([].concat(
				label({style: {paddingLeft: ((path.length - 1) * 10 + 'px')}}, field),
				parseFields(data[field], [].concat(path, field), actions)
			)),
			boolean: () => toggleControl([].concat(path, field), data[field], actions)
		})()), []);

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
		state.controls.camera && parseFields(state.camera, ['camera'], actions) || []
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
	fieldset([
		legend('Level Controls'),
		div(`Current: ${state.level.name || 'Grid-based Level'}`),
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
	])
]);

