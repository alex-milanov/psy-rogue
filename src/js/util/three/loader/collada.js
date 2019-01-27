'use strict';

// lib
const Rx = require('rx');
const $ = Rx.Observable;

// threejs
const THREE = require('three');
window.THREE = window.THREE || THREE;

require('three/examples/js/loaders/ColladaLoader.js');

const load = url => $.create(observer => new THREE.ColladaLoader(new THREE.LoadingManager())
	.load(url, function(collada) {
		observer.onNext(collada);
		observer.onCompleted();
	}));

module.exports = {
	load
};
