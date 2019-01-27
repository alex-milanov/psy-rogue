'use strict';
// lib
const Rx = require('rx');
const $ = Rx.Observable;

let unhook = () => {};

const hook = ({state$, actions}) => {
	let subs = [];
	// mouse movement
	subs.push(
		$.fromEvent(document, 'mousemove')
			.subscribe(ev => actions.set(['viewport', 'mouse'], {
				x: ev.pageX,
				y: ev.pageY
			})));

	subs.push(
		$.fromEvent(document, 'mousedown')
			.filter(ev => ev.target.tagName === 'CANVAS')
			.subscribe(ev => actions.set(['viewport', 'mouse'], {
				down: true
			})));

	subs.push(
		$.fromEvent(document, 'mouseup')
			.subscribe(ev => actions.set(['viewport', 'mouse'], {
				down: false
			})));

	subs.push(
		$.fromEvent(document, 'mousewheel')
			.filter(ev => ev.target.tagName === 'CANVAS')
			.subscribe(ev => (
				ev.preventDefault(),
				actions.zoom(Math.ceil(Math.abs(ev.deltaY / 30)) * (ev.deltaY > 0 ? 1 : -1)
			))));

	subs.push(
		$.fromEvent(window, 'resize')
			.startWith({})
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

	unhook = () => subs.forEach(sub => sub.dispose());
};

module.exports = {
	hook,
	unhook: () => unhook()
};
