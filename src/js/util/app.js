'use strict';

// lib
const { Subject, Observable, from, of, isObservable } = require('rxjs');

const {arr, obj} = require('iblokz-data');

const observe = source => isObservable(source)
  ? source
  : (source.then instanceof Function)
    ? from(source)
    : of(source);

const adapt = (o, p = []) => Object.keys(o).filter(key => key !== 'initial').reduce((o2, key) => Object.assign({}, o2,
	(o[key] instanceof Function) && obj.keyValue(key, function() {
		observe(
			o[key].apply(null, Array.from(arguments))
		).subscribe(resp => o2.stream.next(Object.assign(resp, {
			path: [].concat(p, key),
			payload: Array.from(arguments)
		})));
	}) || (o[key] instanceof Object) && (() => {
		let o3 = adapt(o[key], [].concat(p, key));
		o3.stream.subscribe(resp => o2.stream.next(resp));
		return Object.assign({
			initial: Object.assign({}, o2.initial, obj.keyValue(key, o3.initial))
		}, obj.keyValue(key, o3));
	})() || obj.keyValue(key, o[key])
), {stream: new Subject(), initial: o.initial || {}});

const attach = (tree, path, node) => [adapt(node, path)].map(adaptedNode => (
	adaptedNode.stream.subscribe(resp => tree.stream.next(resp)),
	Object.assign({}, obj.patch(tree, path, adaptedNode), {
		initial: obj.patch(tree.initial, path, adaptedNode.initial)
	})
)).pop();

module.exports = {
	adapt,
	attach
};
