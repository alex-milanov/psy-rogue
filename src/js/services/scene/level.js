'use strict';

// lib
const { from } = require('rxjs');
const { concatMap, reduce } = require('rxjs/operators');

// threejs
const THREE = require('three');
window.THREE = window.THREE || THREE;

const {obj, fn} = require('iblokz-data');

const colladaLoader = require('../../util/three/loader/collada.js');
const gltfLoader = require('../../util/three/loader/gltf.js');
const objLoader = require('../../util/three/loader/obj.js');


const loadTexture = file => new THREE.TextureLoader().load(file);
const genSkyboxMaterial = (pack, opacity = 0.3) => new THREE.MeshFaceMaterial(
	['front', 'back', 'up', 'down', 'right', 'left']
		.map(direction => new THREE.MeshBasicMaterial({
			map: loadTexture(`assets/skybox/${pack}/${direction}.png`),
			side: THREE.DoubleSide,
			fog: false,
			transparent: true,
			opacity
		}))
	);

const buildSkybox = (scene) => {
	const skyboxGeo = new THREE.CubeGeometry(1000, 1000, 1000);
	const skybox = new THREE.Mesh(skyboxGeo, genSkyboxMaterial('neccity', 0.1));
	skybox.name = 'skybox';
	skybox.position.set(0, 0, 0);
	scene.add(skybox);
	scene.fog = new THREE.FogExp2(`#17112a`, 0.015);
	scene.background = new THREE.Color(`#17112a`);
};

/**
 * Build optimized wall meshes from level grid
 * Merges adjacent wall tiles into larger rectangles to reduce mesh count
 * 
 * @param {Array<Array<number>>} levelGrid - 2D array where 2 = wall tile
 * @param {number} tileSize - Size of each tile (assumes square tiles)
 * @param {Array<number>} gridCenter - [x, z] center offset of grid
 * @param {number} wallHeight - Height of walls
 * @param {THREE.Texture} wallTexture - Texture for wall material
 * @param {THREE.Scene} scene - Scene to add walls to
 */
const buildWalls = (levelGrid, tileSize, gridCenter, wallHeight, wallTexture, scene) => {
	const gridHeight = levelGrid.length;
	const gridWidth = levelGrid[0] ? levelGrid[0].length : 0;

	wallTexture.wrapS = THREE.RepeatWrapping;
	wallTexture.wrapT = THREE.RepeatWrapping;
	wallTexture.repeat.set(2, 2);
	const wallMaterial = new THREE.MeshPhongMaterial({
		map: wallTexture,
		side: THREE.DoubleSide
	});

	// Track which tiles have been processed
	const processed = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(false));
	
	// Helper to check if tile is a wall and unprocessed
	const isWall = (z, x) => {
		return z >= 0 && z < gridHeight && 
		       x >= 0 && x < gridWidth && 
		       levelGrid[z][x] === 2 && 
		       !processed[z][x];
	};
	
	// Helper to convert grid coords to world coords
	const toWorld = (x, z) => {
		return [
			(x - gridWidth / 2 + 1) * tileSize + gridCenter[0],
			(z - gridHeight / 2 + 1) * tileSize + gridCenter[1]
		];
	};
	
	// Scan for horizontal wall spans
	for (let z = 0; z < gridHeight; z++) {
		for (let x = 0; x < gridWidth; x++) {
			if (!isWall(z, x)) continue;
			
			// Find horizontal span length
			let spanLength = 0;
			while (isWall(z, x + spanLength)) {
				spanLength++;
			}
			
			// Try to extend vertically (create rectangles, not just lines)
			let spanDepth = 1;
			let canExtend = true;
			while (canExtend) {
				// Check if next row has the same horizontal span
				for (let i = 0; i < spanLength; i++) {
					if (!isWall(z + spanDepth, x + i)) {
						canExtend = false;
						break;
					}
				}
				if (canExtend) spanDepth++;
			}
			
			// Mark all tiles in this rectangle as processed
			for (let dz = 0; dz < spanDepth; dz++) {
				for (let dx = 0; dx < spanLength; dx++) {
					processed[z + dz][x + dx] = true;
				}
			}
			
			// Create wall mesh for this span
			const width = spanLength * tileSize;
			const depth = spanDepth * tileSize;
			const geometry = new THREE.BoxGeometry(width, wallHeight, depth);
			const mesh = new THREE.Mesh(geometry, wallMaterial);
			mesh.name = 'wall';
			
			// Position at center of span
			const [worldX, worldZ] = toWorld(x + spanLength / 2 - 0.5, z + spanDepth / 2 - 0.5);
			mesh.position.set(worldX, wallHeight / 2, worldZ);
			
			mesh.castShadow = true;
			mesh.receiveShadow = true;
			scene.add(mesh);
		}
	}
};

const buildTiles = (levelGrid, tileSize, scene) => {

	const tileGeometry = new THREE.BoxGeometry(tileSize, 0.2, tileSize);
	
	levelGrid.forEach(
		(row, z) => row
			.forEach(
				(tile, x) => {
					// Skip wall tiles (value === 2), they'll be handled by buildWalls
					if (tile === 2) return;
					
					fn.pipe(
						() => new THREE.Mesh(tileGeometry, materials[groundTileMap[tile]]),
						mesh => (
							(mesh.castShadow = true),
							(mesh.receiveShadow = true),
							(mesh.name = 'tile'),
							mesh
						),
						mesh => (mesh.position.set(
							(x - row.length / 2 + 1) * tileSize,
							tile * 0.1,
							(z - levelGrid.length / 2 + 1) * tileSize
						), mesh),
						mesh => scene.add(mesh)
					)();
				}
			)
	);
};

const buildAssets = (levelAssets, scene) => {
	const modelScale = [0.5, 2.5, 3, 3, 1];
	from(['lamp.dae', 'bench.dae', 'tree1.dae', 'tree2.dae', 'tree3.dae'])
		.pipe(
			concatMap(f => f.match('.dae')
				? colladaLoader.load(`assets/models/${f}`)
				: f.match('.obj')
					? objLoader.load(`assets/models/${f}`)
					: gltfLoader.load(`assets/models/${f}`)
			),
			reduce((a, m) => [].concat(a, m), [])
		)
		.subscribe(colladaArray => {
			let meshes = colladaArray
				.map(c => c.scene)
				.map((c, i) => (
					(c.castShadow = true),
					(c.receiveShadow = true),
					(c.scale.set(modelScale[i], modelScale[i], modelScale[i]),
					c
				)));
			levelAssets.forEach(
				(row, z) => row
					.forEach(
						(tile, x) => tile !== 0 && fn.pipe(
							() => meshes[tile - 1].clone(),
							mesh => (mesh.position.set(
								(x - row.length / 2 + 1) * 5,
								0,
								(z - levelAssets.length / 2 + 1) * 5
							), mesh),
							mesh => ((mesh.name = 'asset'), mesh),
							mesh => scene.add(mesh)
						)()
					)
			);
		});
}

const texturesArray = ['ground.jpg', 'tiles.png', 'wall.jpg'];
const textures = texturesArray
	.reduce((acc, textureName) => ({
		...acc,
		[textureName.replace(/\.jpg|\.png/, '')]: loadTexture(`assets/textures/${textureName}`)
	}), {});

console.log('textures', textures);

const materials = obj.map(textures, (key, value) =>
	((console.log('key', key, 'value', value),
	new THREE.MeshPhongMaterial({map: value, side: THREE.DoubleSide}))));

console.log('materials', materials);
	
const groundTileMap = {
	0: 'ground',
	1: 'tiles'
};

const loadLevel = ({scene, state}) => {
	// clean up old level
	scene.children.forEach(child => {
		if (child.name === 'skybox' || child.name === 'tile' || child.name === 'wall' || child.name === 'asset') {
			scene.remove(child);
		}
	});

	buildSkybox(scene);

	const tileSize = 5;
	
	// Build floor tiles (non-wall tiles)
	buildTiles(state.level.map, tileSize, scene);

	// Build optimized walls
	buildWalls(
		state.level.map,
		tileSize,
		[0, 0], // Grid center offset
		16, // Wall height
		textures.wall,
		scene
	);

	buildAssets(state.level.assets, scene);
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
	loadLevel
};
