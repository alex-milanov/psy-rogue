'use strict';

const {obj, arr} = require('iblokz-data');

// namespaces=
const counter = require('./counter');

// initial
const initial = {
	camera: {
		distance: 120,
		range: {
			h: 360,
			hOffset: -180,
			v: 90,
			vOffset: -80
		},
		followPlayer: false
	},
	player: {
		position: [-20, 0.2, 50],
		crouching: false,
		combat: false
	},
	viewport: {
		screen: {
			width: 800,
			height: 600
		},
		mouse: {
			x: 0,
			y: 0,
			down: false
		}
	},
	controls: {
		on: true,
		camera: true
	}
};

// actions
const set = (key, value) => state => obj.patch(state, key, value);
const toggle = key => state => obj.patch(state, key, !obj.sub(state, key));
const arrToggle = (key, value) => state =>
	obj.patch(state, key,
		arr.toggle(obj.sub(state, key), value)
	);

const zoom = amount => state => obj.patch(state, 'camera', {
	distance: state.camera.distance + amount
});

const move = (direction, force) =>
	state => obj.patch(state, 'player', {
		position: state.player.position.map((p, i) => (p + direction[i] * force))
	});

module.exports = {
	initial,
	counter,
	set,
	toggle,
	arrToggle,
	zoom,
	move
};
