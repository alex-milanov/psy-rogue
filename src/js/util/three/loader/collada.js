'use strict';

// lib
const { Observable } = require('rxjs');

// threejs
const THREE = require('three');
window.THREE = window.THREE || THREE;

require('three/examples/js/loaders/ColladaLoader.js');

const load = url => new Observable(observer => new THREE.ColladaLoader(new THREE.LoadingManager())
	.load(url, function(collada) {
		observer.next(collada);
		observer.complete();
	}));

module.exports = {
	load
};
