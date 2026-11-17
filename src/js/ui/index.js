'use strict';

// dom
const {
	h1, h2, a, div, p,
	section, button, span,
	canvas, header, footer, audio
} = require('iblokz-snabbdom-helpers');
// components
const controls = require('./controls');
const minimap = require('./minimap');
const characterEdit = require('./character-edit');

module.exports = ({state, actions}) => section('#ui', [
	header([
		h1('Psy'),
		h2('Rogue')
	]),
	section('#view3d'),
	footer([
		h2('WASD / arrows move · C crouch · drag look · scroll zoom')
	]),
	div('.overlay'),
	minimap({state, actions}),
	characterEdit({state, actions}),
	controls({state, actions})
	// audio(`[src="assets/samples/ambient.ogg"][autoplay="true"][controls="true"][loop="true"]`)
]);
