'use strict';

// lib
const Rx = require('rx');
const $ = Rx.Observable;

// threejs
const THREE = require('three');
window.THREE = window.THREE || THREE;

const {obj, fn} = require('iblokz-data');

const colladaLoader = require('../../util/three/loader/collada.js');
const gltfLoader = require('../../util/three/loader/gltf.js');
const objLoader = require('../../util/three/loader/obj.js');

const init = ({scene, state}) => {
	const materials = ['ground.jpg', 'tiles.png']
		.map(f => new THREE.TextureLoader().load(`assets/textures/${f}`))
		.map(text => (
			(text.wrapS = THREE.RepeatWrapping),
			(text.wrapT = THREE.RepeatWrapping),
			text))
		.map(map => new THREE.MeshPhongMaterial({
			map
		}));

	const geometry = new THREE.BoxGeometry(5, 0.2, 5);
	state.level.map.forEach(
		(row, z) => row
			.forEach(
				(tile, x) => fn.pipe(
					() => new THREE.Mesh(geometry, materials[tile]),
					mesh => (
						(mesh.castShadow = true),
						(mesh.receiveShadow = true),
						mesh
					),
					mesh => (mesh.position.set(
						(x - row.length / 2 + 1) * 5,
						tile * 0.1,
						(z - state.level.map.length / 2 + 1) * 5
					), mesh),
					mesh => scene.add(mesh)
				)()
			)
	);
	const modelScale = [0.5, 2.5, 3, 3, 1];
	$.fromArray(['lamp.dae', 'bench.dae', 'tree1.dae', 'tree2.dae', 'tree3.dae'])
		.concatMap(f => f.match('.dae')
			? colladaLoader.load(`assets/models/${f}`)
			: f.match('.obj')
				? objLoader.load(`assets/models/${f}`)
				: gltfLoader.load(`assets/models/${f}`)
		)
		.reduce((a, m) => [].concat(a, m), [])
		.subscribe(colladaArray => {
			let meshes = colladaArray
				.map(c => c.scene)
				.map((c, i) => (
					(c.castShadow = true),
					(c.receiveShadow = true),
					(c.scale.set(modelScale[i], modelScale[i], modelScale[i]),
					c
				)));
			state.level.assets.forEach(
				(row, z) => row
					.forEach(
						(tile, x) => tile !== 0 && fn.pipe(
							() => meshes[tile - 1].clone(),
							mesh => (mesh.position.set(
								(x - row.length / 2 + 1) * 5,
								0,
								(z - state.level.map.length / 2 + 1) * 5
							), mesh),
							mesh => scene.add(mesh)
						)()
					)
			);
		});
	// gltfLoader.load(`assets/models/old_fabric/scene.gltf`)
	// 	.subscribe(gltf => {
	// 		let fabric = gltf.scene;
	// 		scene.add(fabric);
	// 		fabric.scale.set(1.72, 1.72, 1.72);
	// 		fabric.position.set(
	// 			(levelMap[0].length / 2 + 3) * 5,
	// 			0.25,
	// 			-2.3
	// 		);
	// 	});
	return scene;
};

module.exports = {
	init
};
