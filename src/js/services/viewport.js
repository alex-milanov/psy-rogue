'use strict';
// lib
const { fromEvent } = require('rxjs');
const { withLatestFrom, filter, startWith } = require('rxjs/operators');

let unhook = () => {};

const hook = ({state$, actions}) => {
	let subs = [];
	// mouse movement
	subs.push(
		fromEvent(document, 'mousemove')
			.pipe(
				withLatestFrom(state$, (ev, state) => ({ev, state}))
			)
			.subscribe(({ev, state}) => actions.set(['viewport', 'mouse'], {
				x: ev.pageX,
				y: ev.pageY,
				changeX: ev.pageX - state.viewport.mouse.x,
				changeY: ev.pageY - state.viewport.mouse.y
			})));

	subs.push(
		fromEvent(document, 'mousedown')
			.pipe(
				filter(ev => ev.target.tagName === 'CANVAS')
			)
			.subscribe(ev => actions.set(['viewport', 'mouse'], {
				down: true
			})));

	subs.push(
		fromEvent(document, 'mouseup')
			.subscribe(ev => actions.set(['viewport', 'mouse'], {
				down: false
			})));

	subs.push(
		fromEvent(document, 'mousewheel')
			.pipe(
				filter(ev => ev.target.tagName === 'CANVAS')
			)
			.subscribe(ev => (
				ev.preventDefault(),
				actions.zoom(Math.ceil(Math.abs(ev.deltaY / 30)) * (ev.deltaY > 0 ? 1 : -1)
			))));

	subs.push(
		fromEvent(window, 'resize')
			.pipe(
				startWith({})
			)
			.subscribe(ev => actions.set(['viewport', 'screen'], {
				width: window.innerWidth,
				height: window.innerHeight,
				size: window.innerWidth >= 1200
					? 'xl'
					: window.innerWidth >= 992
						? 'lg'
						: window.innerWidth >= 768
							? 'md'
							: window.innerWidth >= 576
								? 'sm'
								: 'xs'
			})));

	unhook = () => subs.forEach(sub => sub.unsubscribe());
};

module.exports = {
	hook,
	unhook: () => unhook()
};
