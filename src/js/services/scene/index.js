'use strict';

// lib
const Rx = require('rx');
const $ = Rx.Observable;

// threejs
const THREE = require('three');
window.THREE = window.THREE || THREE;

const colladaLoader = require('../../util/three/loader/collada.js');

const time = require('../../util/time.js');

const {obj, fn} = require('iblokz-data');

const level = require('./level');
const _camera = require('./camera');
const _character = require('./character');
const npcs = require('./npcs');

const init = parentNode => {
	let width = parentNode.offsetWidth;
	let height = parentNode.offsetHeight;

	// let camera = new THREE.PerspectiveCamera(70, width / height, 1, 1000);
	let camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
	camera.position.z = 100;
	camera.position.y = 50;

	const scene = new THREE.Scene();

	scene.add(new THREE.AmbientLight(0xcccccc, 0.1));
	// scene.add(new THREE.HemisphereLight(0x443333, 0x111122));
	// scene.add(new THREE.PointLight(0xffffff, 0.3));
	let dirLight = new THREE.DirectionalLight(0xffffff, 1);
	dirLight.color.setHSL(0.1, 0, 0.1);
	dirLight.position.set(0.5, 1.5, -1);
	dirLight.position.multiplyScalar(30);
	dirLight.castShadow = true;
	dirLight.shadowCameraVisible = true;
	// var d = 200;
	dirLight.castShadow = true;
	dirLight.shadow.mapSize.width = 1024;
	dirLight.shadow.mapSize.height = 1024;
	var d = 700;
	dirLight.shadow.camera.left = -d;
	dirLight.shadow.camera.right = d;
	dirLight.shadow.camera.top = d;
	dirLight.shadow.camera.bottom = -d;
	dirLight.shadow.camera.far = 2000;
	dirLight.shadow.bias = -0.001;
	scene.add(dirLight);

	let plane = false;

	let renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(width, height);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	parentNode.innerHTML = '';
	parentNode.appendChild(renderer.domElement);

	level.init(scene);

	return {scene, light: dirLight, renderer, camera, canvas: renderer.domElement, plane};
};

let cameraAngle = {x: 45, y: 210};
let mouse = false;

const render = ({plane, scene, camera, renderer, state, character, mixer, acts, guards}) => {
	// console.log(items);
	if (plane) {
		// items[0].rotation.z += 0.01;
		// plane.rotation.z += 0.001;
	}
	camera = _camera.refresh({camera, state});
	_character.refresh({scene, character, mixer, acts, state, camera});
	if (guards)
		npcs.refresh({scene, guards, state});

	renderer.setSize(state.viewport.screen.width, state.viewport.screen.height);
	// renderer.setFaceCulling(0);
	renderer.render(scene, camera);
};

// const loadMap = (url, dim) => imageUtil.load(url)
// 	.map(image => imageUtil.getData(image, dim));
	// .map(imageUtil.simplifyData);

let unhook = () => {};
let hook = ({state$, actions}) => {
	let subs = [];

	const init$ = $.interval(100)
		.map(() => document.querySelector('#view3d'))
		.distinctUntilChanged(el => el)
		.filter(el => el)
		.map(canvas => () => init(canvas));

	const character$ = _character.init()
		.map(data => sceneState => {
			sceneState.scene.add(data.character);
			console.log(data.character);
			console.log(sceneState);
			return {
				...sceneState,
				...data
			};
		});
	const npcs$ = npcs.init()
		.map(guards => sceneState => {
			console.log(guards);
			guards.forEach(guard => {
				sceneState.scene.add(guard.model);
			});
			console.log(sceneState);
			return {
				...sceneState,
				guards
			};
		});

	const sceneState$ = $.merge(
		init$,
		character$,
		npcs$
	)
		.map(reducer => (console.log(reducer), reducer))
		.scan((sceneState, modify) => modify(sceneState), {});

	subs.push(
		time.frame()
			.filter((dt, i) => i % 2 === 0)
			.withLatestFrom(
				sceneState$,
				state$,
				(dt, sceneState, state) => ({...sceneState, state})
			)
			.subscribe(render)
	);

	subs.push(
		() => {
			console.log('cleaning up scene');
			let cleanupSub = $.just({}).withLatestFrom(sceneState$, (j, sceneState) => sceneState)
				.subscribe(({renderer}) => {
					renderer.dispose();
					cleanupSub.dispose();
				});
		}
	);

	unhook = () => {
		console.log(subs);

		subs.forEach(sub => sub.dispose ? sub.dispose() : sub());
	};
};

module.exports = {
	hook,
	unhook: () => unhook()
};
