'use strict';

const {obj, arr} = require('iblokz-data');

// namespaces=
const counter = require('./counter');
const level = require('./level');

// initial
const initial = {
	camera: {
		distance: 60,
		range: {
			h: 360,
			hOffset: -180,
			v: 90,
			vOffset: -80
		},
		followPlayer: true
	},
	player: {
		position: [-10, 0.2, 35],
		rotation: 180,
		crouching: false,
		combat: false,
		direction: [0, 0],
		force: 0
	},
	viewport: {
		screen: {
			width: 800,
			height: 600
		},
		mouse: {
			x: 0,
			y: 0,
			changeX: 0,
			changeY: 0,
			down: false
		}
	},
	controls: {
		on: true,
		camera: false
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

const degreeToRadiant = deg => Math.PI / (180 / deg);
const calcucalateAngle = (viewport, range) => ({
	x: (viewport.mouse.x / viewport.screen.width * range.h) + range.hOffset,
	y: (viewport.mouse.y / viewport.screen.height * range.v) + range.vOffset
});

const move = (direction, force) =>
	state => obj.patch(state, 'player', {
		position: [
			state.player.position[0] +
				// front / back
				(-Math.cos(degreeToRadiant(state.player.rotation + 45)) * direction[2] * force) +
				(Math.cos(degreeToRadiant(state.player.rotation - 45)) * direction[0] * force),
			state.player.position[1],
			state.player.position[2] +
				// front / back
				(Math.sin(degreeToRadiant(state.player.rotation + 45)) * direction[2] * force) +
				(-Math.sin(degreeToRadiant(state.player.rotation - 45)) * direction[0] * force)
		]
	});

module.exports = {
	initial,
	counter,
	level,
	set,
	toggle,
	arrToggle,
	zoom,
	move
};
