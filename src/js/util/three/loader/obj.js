'use strict';

// lib
const Rx = require('rx');
const $ = Rx.Observable;

// threejs
const THREE = require('three');
window.THREE = window.THREE || THREE;

require('three/examples/js/loaders/MTLLoader.js');
require('three/examples/js/loaders/OBJLoader.js');

const load = url => $.create(observer => new THREE.MTLLoader()
	.load(url.replace('.obj', '.mtl'), materials => (
		materials.preload(),
		new THREE.OBJLoader()
			.setMaterials(materials)
			.load(url, object => (
				observer.onNext(object),
				observer.onCompleted()
			))
	)));

module.exports = {
	load
};
