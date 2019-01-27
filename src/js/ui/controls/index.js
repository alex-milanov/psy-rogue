'use strict';

// dom
const {
	header, h1, section, button, span, canvas,
	form, input, label, legend, fieldset, div, i
} = require('iblokz-snabbdom-helpers');
// components
// const counter = require('./counter');

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
	])
]);
