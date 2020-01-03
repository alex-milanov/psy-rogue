'use strict';

// lib
const Rx = require('rx');
const $ = Rx.Observable;

// iblokz
const vdom = require('iblokz-snabbdom-helpers');
const {obj, arr} = require('iblokz-data');

// util
const keyboard = require('./util/keyboard');
const time = require('./util/time');

// app
const app = require('./util/app');
let actions = app.adapt(require('./actions'));
let ui = require('./ui');
let actions$;
const state$ = new Rx.BehaviorSubject();

// services
let scene = require('./services/scene');
let viewport = require('./services/viewport.js');
let audio = require('./services/audio');

// hot reloading
if (module.hot) {
	// actions
	actions$ = $.fromEventPattern(
    h => module.hot.accept("./actions", h)
	).flatMap(() => {
		actions = app.adapt(require('./actions'));
		return actions.stream.startWith(state => state);
	}).merge(actions.stream);
	// ui
	module.hot.accept("./ui", function() {
		ui = require('./ui');
		actions.stream.onNext(state => state);
	});
	// services
	module.hot.accept("./services/scene", function() {
		// console.log(scene.unhook);
		scene.unhook();
		scene = require('./services/scene');
		scene.hook({state$, actions});
		actions.stream.onNext(state => state);
	});
	module.hot.accept("./services/viewport.js", function() {
		viewport.unhook();
		setTimeout(() => {
			viewport = require('./services/viewport.js');
			viewport.hook({state$, actions});
			actions.stream.onNext(state => state);
		});
	});
	module.hot.accept("./services/audio", function() {
		audio.unhook();
		setTimeout(() => {
			audio = require('./services/audio');
			audio.hook({state$, actions});
			actions.stream.onNext(state => state);
		});
	});
} else {
	actions$ = actions.stream;
}

// actions -> state
actions$
	.map(action => (
		// action.path && console.log(action.path.join('.'), action.payload),
		// console.log(action),
		action
	))
	.startWith(() => actions.initial)
	.scan((state, change) => change(state), {})
	.subscribe(state => state$.onNext(state));

// logging
state$
	.map(state => obj.filter(state, key => key !== 'viewport'))
	.distinctUntilChanged(state => state)
	.subscribe(state => console.log(state));

// services
scene.hook({state$, actions});
viewport.hook({state$, actions});
audio.hook({state$, actions});

// state -> ui
const ui$ = state$.map(state => ui({state, actions}));
vdom.patchStream(ui$, '#ui');

// controls
const pressedKeys$ = keyboard.watch(['left', 'right', 'up', 'down', 'shift', 'w', 'a', 's', 'd', 'c']);

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

const directionForce$ = pressedKeys$
	// .filter(keys => keys.up || keys.down || keys.left || keys.right)
	.map(keys => (console.log('keys', keys), keys))
	.map(keys => ({
		direction: getDirection(keys),
		force: getForce(keys)
	}))
	.share();

const crouching$ = keyboard.watch(['c'])
	.distinctUntilChanged(keys => keys.c)
	.subscribe(keys => actions.set(['player', 'crouching'], keys.c));

time.frame().withLatestFrom(directionForce$, (t, df) => df)
	.filter(({force}) => force > 0)
	.subscribe(({direction, force}) => actions.move(direction, force));

time.frame().withLatestFrom(state$, (t, state) => state)
	.distinctUntilChanged(state => state.viewport.mouse)
	.filter(state => state.viewport.mouse.down)
	.subscribe(state => actions.set(['player', 'rotation'],
		Number((
			(state.camera.range.h + state.player.rotation -
				state.viewport.mouse.changeX * 0.3) % state.camera.range.h))
	));

directionForce$.distinctUntilChanged(({force}) => force)
	.subscribe(({force}) => actions.set('player', {force}));

// livereload impl.
if (module.hot) {
	document.write(`<script src="http://${(location.host || 'localhost').split(':')[0]}` +
	`:35729/livereload.js?snipver=1"></script>`);
}
