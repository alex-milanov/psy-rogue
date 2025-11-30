'use strict';

const { map, distinctUntilChanged, share } = require('rxjs/operators');

const time = require('./time');

const parsePad = pad => pad && ({
	axes: pad.axes,
	buttons: pad.buttons.map(button => ({
		pressed: button.pressed,
		value: button.value
	})),
	connected: pad.connected,
	id: pad.id,
	index: pad.index,
	mapping: pad.mapping,
	timestamp: pad.timestamp
}) || pad;

const list = () => Array.from(navigator.getGamepads() || navigator.webkitGetGamepads() || [])
	.map(parsePad);

const changes = () => time.frame()
	.pipe(
		map(list),
		distinctUntilChanged(),
		//	pads.reduce((r, pad) => !pad && r || (r + (pad.axes || '') + (pad.buttons || '')), ''))
		share()
	);

module.exports = {
	list,
	changes
};
