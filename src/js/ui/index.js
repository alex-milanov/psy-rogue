'use strict';

// dom
const {
	h1, h2, a, div,
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
		h2('Click and drag to Rotate. Scroll to Zoom.')
	]),
	controls({state, actions})
	// audio(`[src="assets/samples/ambient.ogg"][autoplay="true"][controls="true"][loop="true"]`)
]);
