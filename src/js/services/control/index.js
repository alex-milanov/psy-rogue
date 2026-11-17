'use strict';

// lib
const {fromEvent} = require('rxjs');
const { map, filter, distinctUntilChanged, withLatestFrom, share } = require('rxjs/operators');

// util
const keyboard = require('../../util/keyboard');
const time = require('../../util/time');
const cameraControl = require('./camera');

const isEditing = state => !!(state.editor && state.editor.enabled);

// Arrows always move; WASD only outside edit (Qoole uses M/R/S there)
const getDirection = (keys, editing) => ([
	(keys.left || (!editing && keys.a)) && 1 || (keys.right || (!editing && keys.d)) && -1 || 0,
	0,
	(keys.up || (!editing && keys.w)) && 1 || (keys.down || (!editing && keys.s)) && -1 || 0
]);

const getForce = (keys, editing) =>
	(keys.shift && 0.2 || 0.1) *
	(keys.c && 0.5 || 1) *
		((
			keys.left || keys.right || keys.up || keys.down
			|| (!editing && (keys.a || keys.d || keys.w || keys.s))
		) ? 1 : 0);

let unhook = () => {};

const hook = ({state$, actions}) => {
	let subs = [];

	// Hook camera control (angle calculation)
	cameraControl.hook({state$, actions});

	// Watch keyboard input
	const pressedKeys$ = keyboard.watch(['left', 'right', 'up', 'down', 'shift', 'w', 'a', 's', 'd', 'c']);

	// M: gizmo move in edit (Qoole), otherwise minimap
	subs.push(
		keyboard.on('m')
			.pipe(withLatestFrom(state$, (ev, state) => state))
			.subscribe(state => {
				if (isEditing(state)) {
					actions.setGizmoMode('translate');
				} else {
					actions.toggle(['minimap', 'enabled']);
				}
			})
	);

	// First-person / hybrid toggle (V key) — does not change hybrid orbit math
	subs.push(
		keyboard.on('v')
			.subscribe(() => actions.toggleView())
	);

	// Free mouse-look without drag (L key)
	subs.push(
		keyboard.on('l')
			.subscribe(() => actions.toggle(['controls', 'mouseLook']))
	);

	// Virux-style free orbit around player / edit selection (O key)
	subs.push(
		keyboard.on('o')
			.subscribe(() => actions.toggleOrbitMode())
	);

	// Edit mode: click-to-select (E key)
	subs.push(
		keyboard.on('e')
			.subscribe(() => actions.toggleEditMode())
	);

	// Qoole-style gizmo modes in edit: M move, R rotate, S scale
	[
		['r', 'rotate'],
		['s', 'scale']
	].forEach(([key, mode]) => {
		subs.push(
			keyboard.on(key)
				.pipe(withLatestFrom(state$, (ev, state) => state))
				.subscribe(state => {
					if (isEditing(state)) actions.setGizmoMode(mode);
				})
		);
	});

	// Undo / redo (Ctrl/Cmd+Z, Ctrl/Cmd+Y or Shift+Z)
	subs.push(
		fromEvent(document, 'keydown').subscribe(ev => {
			if (!(ev.ctrlKey || ev.metaKey)) return;
			const key = (ev.key || '').toLowerCase();
			if (key === 'z' && !ev.shiftKey) {
				ev.preventDefault();
				actions.undo();
			} else if (key === 'y' || (key === 'z' && ev.shiftKey)) {
				ev.preventDefault();
				actions.redo();
			}
		})
	);

	const directionForce$ = pressedKeys$
		.pipe(
			withLatestFrom(state$, (keys, state) => ({keys, editing: isEditing(state)})),
			map(({keys, editing}) => ({
				direction: getDirection(keys, editing),
				force: getForce(keys, editing)
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

	// Movement control — skip when character-edit has player action paused
	subs.push(
		time.frame().pipe(
			withLatestFrom(directionForce$, state$, (t, df, state) => ({...df, state})),
			filter(({force, state}) => {
				if (force <= 0) return false;
				const anim = state.editor && state.editor.anim;
				const sel = state.editor && state.editor.selection;
				if (anim && anim.paused && sel && sel.kind === 'player') return false;
				return true;
			})
		).subscribe(({direction, force}) => actions.move(direction, force))
	);

	const looking = state =>
		state.viewport.mouse.down ||
		(state.controls.mouseLook && state.viewport.mouse.overCanvas);

	// Mouse look: yaw updates player facing; pitch only in first-person
	// With controls.mouseLook, works on move over canvas without holding button
	subs.push(
		time.frame().pipe(
			withLatestFrom(state$, (t, state) => state),
			distinctUntilChanged((a, b) =>
				a.viewport.mouse.changeX === b.viewport.mouse.changeX &&
				a.viewport.mouse.changeY === b.viewport.mouse.changeY &&
				a.viewport.mouse.down === b.viewport.mouse.down &&
				a.viewport.mouse.overCanvas === b.viewport.mouse.overCanvas &&
				a.camera.view === b.camera.view &&
				a.controls.mouseLook === b.controls.mouseLook
			),
			filter(state => looking(state) &&
				state.camera.mode !== 'orbit' &&
				!(state.editor && state.editor.gizmoDragging) &&
				(state.viewport.mouse.changeX !== 0 || state.viewport.mouse.changeY !== 0))
		).subscribe(state => {
			actions.set(['player', 'rotation'],
				Number((
					(state.camera.range.h + state.player.rotation -
						state.viewport.mouse.changeX * 0.3) % state.camera.range.h))
			);
			if (state.camera.view === 'first') {
				const pitch = Math.max(-85, Math.min(85,
					(state.camera.pitch || 0) - state.viewport.mouse.changeY * 0.3
				));
				actions.set(['camera', 'pitch'], pitch);
			}
		})
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
