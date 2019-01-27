'use strict';

// lib
const Rx = require('rx');
const $ = Rx.Observable;

// threejs
const THREE = require('three');
window.THREE = window.THREE || THREE;
require('three/examples/js/libs/inflate.min.js');
require('three/examples/js/loaders/FBXLoader.js');

const load = url => $.create(observer => new THREE.FBXLoader()
	.load(url, function(fbx) {
		observer.onNext(fbx);
		observer.onCompleted();
	}));

module.exports = {
	load
};
