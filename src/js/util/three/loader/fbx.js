'use strict';

// lib
const { Observable } = require('rxjs');

// threejs
const THREE = require('three');
window.THREE = window.THREE || THREE;
require('three/examples/js/libs/inflate.min.js');
require('three/examples/js/loaders/FBXLoader.js');

const load = url => new Observable(observer => new THREE.FBXLoader()
	.load(url, function(fbx) {
		observer.next(fbx);
		observer.complete();
	}));

module.exports = {
	load
};
