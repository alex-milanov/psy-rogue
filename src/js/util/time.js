'use strict';

// lib
const { Observable } = require('rxjs');
const { filter, share, withLatestFrom } = require('rxjs/operators');

const raf = require('raf');

const tick = cb => raf(function(dt) {
	cb(dt);
	tick(cb);
});

const frame = () => new Observable(
	obs => tick(dt => obs.next(dt))
)
	.pipe(
		filter(dt => dt !== 0),
		share()
	);

const loop = (state$, node) => frame(node).pipe(withLatestFrom(state$, (dt, state) => ({dt, state})));

module.exports = {
	frame,
	loop
};
