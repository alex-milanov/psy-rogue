'use strict';

// dom
const {
	h1, h2, a, div, p,
	section, button, span,
	canvas, header, footer, audio
} = require('iblokz-snabbdom-helpers');
// components
const controls = require('./controls');

module.exports = ({state, actions}) => section('#ui', [
	header([
		h1('Psy'),
		h2('Rogue')
	]),
	section('#view3d'),
	footer([
		p('Click and drag to Rotate. Scroll to Zoom.'),
		p('User WASD keys to move, C to crouch')
	]),
	controls({state, actions})
	// audio(`[src="assets/samples/ambient.ogg"][autoplay="true"][controls="true"][loop="true"]`)
]);
