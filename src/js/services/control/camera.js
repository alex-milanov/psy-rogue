'use strict';

// lib
const {withLatestFrom, distinctUntilChanged, filter} = require('rxjs/operators');

// util
const time = require('../../util/time');

let cameraAngle = {x: 45, y: 210};
let mouse = false;

let subscriptions = [];
let unhook = () => {};

const isHybrid = state =>
	(!state.camera.view || state.camera.view === 'hybrid') &&
	state.camera.mode !== 'orbit';

const isOrbit = state =>
	state.camera.mode === 'orbit' && state.camera.view !== 'first';

const looking = state =>
	!(state.editor && state.editor.gizmoDragging) && (
		state.viewport.mouse.down ||
		(state.controls.mouseLook && state.viewport.mouse.overCanvas)
	);

const hook = ({state$, actions}) => {
	// Hybrid-only: orbit elevation + sync yaw from player
	subscriptions.push(
		time.frame().pipe(
			withLatestFrom(state$, (t, state) => state),
			distinctUntilChanged((a, b) =>
				a.viewport.mouse.down === b.viewport.mouse.down &&
				a.viewport.mouse.overCanvas === b.viewport.mouse.overCanvas &&
				a.viewport.mouse.y === b.viewport.mouse.y &&
				a.viewport.mouse.x === b.viewport.mouse.x &&
				a.player.rotation === b.player.rotation &&
				a.camera.view === b.camera.view &&
				a.camera.mode === b.camera.mode &&
				a.controls.mouseLook === b.controls.mouseLook
			),
			filter(state => isHybrid(state) && looking(state))
		).subscribe(state => {
			cameraAngle.x = (360 + (state.player.rotation - 90 - 45) % 360);

			cameraAngle.y = (state.camera.range.h +
				cameraAngle.y - (mouse ? (mouse.y - state.viewport.mouse.y) * 0.3 : 0)
			) % state.camera.range.h;
			cameraAngle.y = Math.max(Math.min(cameraAngle.y, 260), 170);

			mouse = {...state.viewport.mouse};

			actions.set(['camera', 'angle'], {...cameraAngle});
		})
	);

	// Virux-style free orbit: drag updates yaw+pitch; does not drive player facing
	subscriptions.push(
		time.frame().pipe(
			withLatestFrom(state$, (t, state) => state),
			distinctUntilChanged((a, b) =>
				a.viewport.mouse.down === b.viewport.mouse.down &&
				a.viewport.mouse.overCanvas === b.viewport.mouse.overCanvas &&
				a.viewport.mouse.y === b.viewport.mouse.y &&
				a.viewport.mouse.x === b.viewport.mouse.x &&
				a.camera.mode === b.camera.mode &&
				a.camera.view === b.camera.view &&
				a.controls.mouseLook === b.controls.mouseLook
			),
			filter(state => isOrbit(state) && looking(state))
		).subscribe(state => {
			const rangeH = state.camera.range.h;
			if (!mouse && state.camera.angle) {
				cameraAngle = {...state.camera.angle};
			}
			cameraAngle = {
				x: (rangeH + cameraAngle.x +
					(mouse ? (mouse.x - state.viewport.mouse.x) : 0)) % rangeH,
				y: Math.max(100, Math.min(260,
					cameraAngle.y - (mouse ? (mouse.y - state.viewport.mouse.y) * 0.3 : 0)
				))
			};
			mouse = {...state.viewport.mouse};
			actions.set(['camera', 'angle'], {...cameraAngle});
		})
	);

	subscriptions.push(
		time.frame().pipe(
			withLatestFrom(state$, (t, state) => state),
			distinctUntilChanged((a, b) =>
				looking(a) === looking(b) &&
				a.controls.mouseLook === b.controls.mouseLook
			),
			filter(state => !looking(state))
		).subscribe(() => {
			mouse = false;
		})
	);

	subscriptions.push(
		time.frame().pipe(
			withLatestFrom(state$, (t, state) => state),
			distinctUntilChanged((a, b) =>
				a.player.rotation === b.player.rotation &&
				a.camera.view === b.camera.view &&
				a.camera.mode === b.camera.mode &&
				(a.camera.angle && a.camera.angle.y) === (b.camera.angle && b.camera.angle.y) &&
				looking(a) === looking(b)
			),
			filter(state => isHybrid(state) && !looking(state))
		).subscribe(state => {
			cameraAngle.x = (360 + (state.player.rotation - 90 - 45) % 360);
			if (state.camera.angle && state.camera.angle.y != null) {
				cameraAngle.y = state.camera.angle.y;
			}
			actions.set(['camera', 'angle'], {...cameraAngle});
		})
	);

	unhook = () => subscriptions.forEach(sub => sub.unsubscribe());
};

module.exports = {
	hook,
	unhook: () => unhook()
};
