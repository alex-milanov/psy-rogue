'use strict';

// lib
const { withLatestFrom, distinctUntilChanged, filter } = require('rxjs/operators');

// util
const time = require('../../util/time');

let cameraAngle = {x: 45, y: 210};
let mouse = false;

let subscriptions = [];
let unhook = () => {};

const hook = ({state$, actions}) => {
	// Track camera angle based on player rotation and mouse drag (for minimap visualization)
	subscriptions.push(
		time.frame().pipe(
			withLatestFrom(state$, (t, state) => state),
			distinctUntilChanged((a, b) => 
				a.viewport.mouse.down === b.viewport.mouse.down &&
				a.viewport.mouse.y === b.viewport.mouse.y &&
				a.player.rotation === b.player.rotation
			),
			filter(state => state.viewport.mouse.down)
		).subscribe(state => {
			// Horizontal follows player rotation (which is updated by mouse drag in control/index.js)
			cameraAngle.x = (360 + (state.player.rotation - 90 - 45) % 360);
			
			// Vertical angle from mouse drag
			cameraAngle.y = (state.camera.range.h +
				cameraAngle.y - (mouse ? (mouse.y - state.viewport.mouse.y) * 0.3 : 0)) % state.camera.range.h;
			// Clamp vertical angle
			cameraAngle.y = Math.max(Math.min(cameraAngle.y, 260), 170);
			
			mouse = {...state.viewport.mouse};
			
			// Update state for minimap
			actions.set(['camera', 'angle'], cameraAngle);
		})
	);

	// Reset mouse tracking when mouse is released
	subscriptions.push(
		time.frame().pipe(
			withLatestFrom(state$, (t, state) => state),
			distinctUntilChanged((a, b) => a.viewport.mouse.down === b.viewport.mouse.down),
			filter(state => !state.viewport.mouse.down)
		).subscribe(() => {
			mouse = false;
		})
	);

	// Update camera angle when not dragging (follows player rotation)
	subscriptions.push(
		time.frame().pipe(
			withLatestFrom(state$, (t, state) => state),
			distinctUntilChanged((a, b) => a.player.rotation === b.player.rotation),
			filter(state => !state.viewport.mouse.down)
		).subscribe(state => {
			cameraAngle.x = (360 + (state.player.rotation - 90 - 45) % 360);
			actions.set(['camera', 'angle'], cameraAngle);
		})
	);

	unhook = () => subscriptions.forEach(sub => sub.unsubscribe());
};

module.exports = {
	hook,
	unhook: () => unhook()
};

