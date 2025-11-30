'use strict';

// lib
const { withLatestFrom } = require('rxjs/operators');

// util
const time = require('../../util/time');

// Guard AI and game logic
const initial = {
	guards: [
		{
			id: 'guard-1',
			position: [-10, 0.2, -20],
			rotation: 0,
			route: [[-10, 0.2, -20], [20, 0.2, -20]],
			routeIndex: 0,
			mode: 'idle',
			frame: 0
		},
		{
			id: 'guard-2',
			position: [0, 0.2, 0],
			rotation: 0,
			route: [[0, 0.2, 0], [-30, 0.2, 0]],
			routeIndex: 0,
			mode: 'idle',
			frame: 0
		},
		{
			id: 'guard-3',
			position: [-20, 0.2, 20],
			rotation: 0,
			route: [[-20, 0.2, 20], [10, 0.2, 20], [10, 0.2, 40]],
			routeIndex: 0,
			mode: 'idle',
			frame: 0
		}
	]
};

const updateGuard = (guard) => {
	if (guard.mode === 'idle') {
		guard.frame++;
		if (guard.frame >= 60) { // Wait 60 frames (1 second at 60fps)
			guard.mode = 'walk';
			guard.frame = 0;
		}
	} else if (guard.mode === 'walk') {
		// Move towards next waypoint
		const target = guard.route[guard.routeIndex];
		const dx = target[0] - guard.position[0];
		const dz = target[2] - guard.position[2];
		const distance = Math.sqrt(dx * dx + dz * dz);
		
		// Update rotation to face target
		guard.rotation = Math.atan2(dx, dz);
		
		if (distance < 0.12) {
			// Reached waypoint
			guard.position = [...target];
			guard.routeIndex++;
			
			if (guard.routeIndex >= guard.route.length) {
				// End of route, reverse direction
				guard.route = [...guard.route].reverse();
				guard.routeIndex = 1; // Next waypoint after current
			}
			guard.mode = 'idle';
			guard.frame = 0;
		} else {
			// Move towards target
			const speed = 0.08;
			const ratio = Math.min(speed / distance, 1);
			guard.position[0] += dx * ratio;
			guard.position[2] += dz * ratio;
		}
	}
	
	return guard;
};

const loop = ({state}) => {
	// Update all guards
	const guards = state.game.guards.map(updateGuard);
	return { guards };
};

const actions = {
	initial
};

let unhook = () => {};

const hook = ({state$, actions}) => {
	let subs = [];

	// Game loop - update guard AI
	subs.push(
		time.frame()
			.pipe(
				withLatestFrom(state$, (dt, state) => ({dt, state}))
			)
			.subscribe(({dt, state}) => {
				if (state.game) {
					const updates = loop({state});
					actions.set('game', updates);
				}
			})
	);

	unhook = () => subs.forEach(sub => sub.unsubscribe());
};

module.exports = {
	actions,
	hook,
	unhook: () => unhook()
};

