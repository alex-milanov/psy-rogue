'use strict';

// lib
const { Observable } = require('rxjs');

// threejs
const THREE = require('three');
window.THREE = window.THREE || THREE;

require('three/examples/js/loaders/MTLLoader.js');
require('three/examples/js/loaders/OBJLoader.js');

const load = url => new Observable(observer => new THREE.MTLLoader()
	.load(url.replace('.obj', '.mtl'), materials => (
		materials.preload(),
		new THREE.OBJLoader()
			.setMaterials(materials)
			.load(url, object => (
				observer.next(object),
				observer.complete()
			))
	)));

module.exports = {
	load
};
