'use strict';

// lib
const { map, filter, distinctUntilChanged, withLatestFrom, share } = require('rxjs/operators');

// util
const keyboard = require('../../util/keyboard');
const time = require('../../util/time');
const cameraControl = require('./camera');

const getDirection = keys => ([
	(keys.left || keys.a) && 1 || (keys.right || keys.d) && -1 || 0,
	0,
	(keys.up || keys.w) && 1 || (keys.down || keys.s) && -1 || 0
]);

const getForce = keys =>
	(keys.shift && 0.2 || 0.1) *
	(keys.c && 0.5 || 1) *
		((
			keys.left || keys.right || keys.up || keys.down
			|| keys.a || keys.d || keys.w || keys.s
		) ? 1 : 0);

let unhook = () => {};

const hook = ({state$, actions}) => {
	let subs = [];

	// Hook camera control (angle calculation)
	cameraControl.hook({state$, actions});

	// Watch keyboard input
	const pressedKeys$ = keyboard.watch(['left', 'right', 'up', 'down', 'shift', 'w', 'a', 's', 'd', 'c']);
	
	// Minimap toggle (M key)
	subs.push(
		keyboard.on('m')
			.subscribe(() => actions.toggle(['minimap', 'enabled']))
	);

	const directionForce$ = pressedKeys$
		.pipe(
			map(keys => (console.log('keys', keys), keys)),
			map(keys => ({
				direction: getDirection(keys),
				force: getForce(keys)
			})),
			share()
		);

	// Crouch control
	subs.push(
		keyboard.watch(['c'])
			.pipe(
				distinctUntilChanged((a, b) => a.c === b.c)
			)
			.subscribe(keys => actions.set(['player', 'crouching'], keys.c))
	);

	// Movement control
	subs.push(
		time.frame().pipe(
			withLatestFrom(directionForce$, (t, df) => df),
			filter(({force}) => force > 0)
		).subscribe(({direction, force}) => actions.move(direction, force))
	);

	// Mouse rotation control (horizontal camera rotation updates player facing)
	subs.push(
		time.frame().pipe(
			withLatestFrom(state$, (t, state) => state),
			distinctUntilChanged((a, b) => a.viewport.mouse.changeX === b.viewport.mouse.changeX && a.viewport.mouse.down === b.viewport.mouse.down),
			filter(state => state.viewport.mouse.down)
		).subscribe(state => actions.set(['player', 'rotation'],
			Number((
				(state.camera.range.h + state.player.rotation -
					state.viewport.mouse.changeX * 0.3) % state.camera.range.h))
		))
	);

	// Force tracking
	subs.push(
		directionForce$.pipe(
			distinctUntilChanged((a, b) => a.force === b.force)
		).subscribe(({force}) => actions.set('player', {force}))
	);

	// Direction tracking
	subs.push(
		directionForce$.pipe(
			distinctUntilChanged((a, b) => a.direction.join(',') === b.direction.join(','))
		).subscribe(({direction}) => actions.set('player', {direction}))
	);

	unhook = () => {
		subs.forEach(sub => sub.unsubscribe());
		cameraControl.unhook();
	};
};

module.exports = {
	hook,
	unhook: () => unhook()
};

