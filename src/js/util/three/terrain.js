'use strict';

// lib
const THREE = require('three');

const createPlane = (scene, heightMap, dim = 256, gap = 100, modifier = 0.02, plane = false) => {
	console.log('creating plane');

	console.log(heightMap);

	const geometry = new THREE.PlaneGeometry(gap, gap, dim - 1, dim - 1);
	// geometry.rotateX(-Math.PI / 2);

	for (let i = 0, l = geometry.vertices.length; i < l; i++) {
		geometry.vertices[i].z = heightMap[i] * modifier;
	}
	geometry.rotateX(-Math.PI / 2);

	let texture = new THREE.TextureLoader().load('assets/terrain4.png');
	texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
	const text2 = new THREE.TextureLoader().load('assets/forrest_ground.png');
	text2.wrapS = THREE.RepeatWrapping;
	text2.wrapT = THREE.RepeatWrapping;
	text2.repeat.set(32, 32);

	const material = new THREE.MeshPhongMaterial({
		map: texture,
		alphaMap: text2,
		// bumpMap: new THREE.TextureLoader().load('assets/heightmap.jpg'),
		// color: 0x156289,
		// emissive: 0x072534,
		side: THREE.DoubleSide,
		shading: THREE.SmoothShading,
		transparent: true,
		// specular: 0xaaaaaa,
		shininess: 3
	});

	const mat2 = new THREE.MeshPhongMaterial({
		map: text2,
		// bumpMap: new THREE.TextureLoader().load('assets/heightmap.jpg'),
		// color: 0x156289,
		// emissive: 0x072534,
		side: THREE.DoubleSide,
		shading: THREE.SmoothShading,
		transparent: true,
		// specular: 0xaaaaaa,
		shininess: 3
	});

	if (plane && plane instanceof THREE.Mesh) {
		plane.geometry.copy(geometry);
		plane.material.copy(material);
	} else {
		plane = new THREE.Mesh(geometry, material);
		plane.receiveShadow = true;
		plane.castShadow = true;
		scene.add(plane);
		let wireframe = new THREE.WireframeGeometry(geometry);
		let line = new THREE.LineSegments(wireframe);
		line.material.color.setHex(0x112233);
		scene.add(line);
	}

	console.log(plane);

	return {scene, plane};
};

module.exports = {
	createPlane
};
