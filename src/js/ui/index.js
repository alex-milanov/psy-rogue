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
const animPreview = require('./anim-preview');

module.exports = ({state, actions}) => section('#ui', [
	header([
		h1('Psy'),
		h2('Rogue')
	]),
	section('#view3d'),
	footer([
		p('Drag to look/orbit, or L for free mouse-look on canvas. Scroll zooms. V = first-person, O = orbit, E = edit.'),
		h2('WASD move, C crouch, M minimap, V first-person, L mouse-look, O orbit, E edit')
	]),
	div('.overlay'),
	minimap({state, actions}),
	animPreview({state, actions}),
	controls({state, actions})
	// audio(`[src="assets/samples/ambient.ogg"][autoplay="true"][controls="true"][loop="true"]`)
]);
