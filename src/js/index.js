
// lib
const { map, distinctUntilChanged, filter } = require('rxjs/operators');

// iblokz
const vdom = require('iblokz-snabbdom-helpers');
const {obj, arr} = require('iblokz-data');
const {createState} = require('iblokz-state');


// actions and state
let actionsTree = require('./actions');
let {actions, state$} = createState(actionsTree);
let ui = require('./ui');
let actions$;

// services
let game = require('./services/game');
let scene = require('./services/scene');
let viewport = require('./services/viewport.js');
let audio = require('./services/audio');
let control = require('./services/control');
let minimap = require('./services/minimap');

const equals = (a, b) => {
	return JSON.stringify(a) === JSON.stringify(b);
};

// hot reloading
if (module.hot) {
	// actions
	module.hot.accept("./actions", function() {
		actionsTree = require('./actions');
		const result = createState(actionsTree);
		actions = result.actions;
		// Trigger a re-render with current state
		// actions.stream.next({path: ['_reload'], payload: []});
		// Trigger a re-render
		actions.stream.next(state => state);
	});
	// ui
	module.hot.accept("./ui", function() {
		ui = require('./ui');
		// Trigger a re-render with current state
		// actions.stream.next({path: ['_reload'], payload: []});
		actions.stream.next(state => state);
	});
	// services
	// module.hot.accept("./services/scene", function() {
	// 	// console.log(scene.unhook);
	// 	scene.unhook();
	// 	scene = require('./services/scene');
	// 	scene.hook({state$, actions});
	// 	actions.stream.next({path: ['_reload'], payload: []});
	// });
	// module.hot.accept("./services/viewport.js", function() {
	// 	viewport.unhook();
	// 	setTimeout(() => {
	// 		viewport = require('./services/viewport.js');
	// 		viewport.hook({state$, actions});
	// 		actions.stream.next({path: ['_reload'], payload: []});
	// 	});
	// });
	// module.hot.accept("./services/audio", function() {
	// 	audio.unhook();
	// 	setTimeout(() => {
	// 		audio = require('./services/audio');
	// 		audio.hook({state$, actions});
	// 		actions.stream.next({path: ['_reload'], payload: []});
	// 	});
	// });
}

// Log actions for debugging
actions.stream
	.pipe(
		filter(action => action.path && ['game', 'viewport.mouse'].indexOf(
			[].concat(action.payload[0]).join('.')
		) === -1)
	)
	.subscribe(action => console.log(action.path.join('.'), 	[].concat(action.payload[0]).join('.'),action.payload));

// logging
state$
	.pipe(
		map(state => obj.filter(state, key => ['game', 'viewport'].indexOf(key) === -1)),
		distinctUntilChanged(
			(a, b) => equals(
				obj.filter(a, key => ['game', 'viewport'].indexOf(key) === -1),
				obj.filter(b, key => ['game', 'viewport'].indexOf(key) === -1)
			)
		)
	)
	.subscribe(state => console.log(state));

// services
game.hook({state$, actions});
minimap.hook({state$, actions});
scene.hook({state$, actions, minimap});
viewport.hook({state$, actions});
audio.hook({state$, actions});
control.hook({state$, actions});

// state -> ui
const ui$ = state$.pipe(map(state => ui({state, actions})));
vdom.patchStream(ui$, '#ui');
