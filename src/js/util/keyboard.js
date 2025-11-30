'use strict';

const { fromEvent, merge } = require('rxjs');
const { map, filter, scan, share, distinctUntilChanged } = require('rxjs/operators');

const {obj} = require('iblokz-data');

const keyDown$ = fromEvent(document, 'keydown');
const keyUp$ = fromEvent(document, 'keyup');
const keyAction$ = merge(keyDown$, keyUp$);
	// .map(ev => (console.log(ev), ev));

const keyAliases = {
	'ArrowUp': 'up',
	'ArrowDown': 'down',
	'ArrowLeft': 'left',
	'ArrowRight': 'right',
	' ': 'space',
	'Shift': 'shift'
};

const charCodes = {

};

const parseKey = ev => keyAliases[ev.key] || charCodes[ev.keyCode] || ev.key;

const watch = keyList => keyAction$
	.pipe(
		distinctUntilChanged((a, b) => (a.type + (a.key || a.which)) === (b.type + (b.key || b.which))),
		map(ev => ({type: ev.type, key: parseKey(ev)})),
		filter(ev => keyList.indexOf(ev.key) > -1),
		scan((keys, ev) => obj.patch(keys, ev.key, (ev.type === 'keydown')), {}),
		share()
	);

const on = key => keyDown$.pipe(filter(ev => parseKey(ev) === key));

module.exports = {
	watch,
	on
};
