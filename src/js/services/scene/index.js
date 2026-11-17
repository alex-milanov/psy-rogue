'use strict';

// lib
const {interval, merge, of, fromEvent} = require('rxjs');
const {map, filter, distinctUntilChanged, withLatestFrom, scan, take} = require('rxjs/operators');

// threejs
const THREE = require('three');
window.THREE = window.THREE || THREE;
require('../../util/three/effects/outline.js');

const time = require('../../util/time.js');

const {loadLevel} = require('./level');
const _camera = require('./camera');
const _character = require('./character');
const npcs = require('./npcs');
const {mouseToObject} = require('../../util/three/pick');
const {syncSelectionHelper} = require('./select');
const {createGizmo} = require('./gizmo');

const init = ({canvas, state}) => {
	let width = canvas.offsetWidth || state.viewport.screen.width || 800;
	let height = canvas.offsetHeight || state.viewport.screen.height || 600;

	let camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
	camera.position.z = 100;
	camera.position.y = 50;

	const scene = new THREE.Scene();

	// Dim key light (original) + a bit of ambient so the grid reads if textures are late
	scene.add(new THREE.AmbientLight(0xffffff, 0.35));
	let dirLight = new THREE.DirectionalLight(0xffffff, 1);
	dirLight.color.setHSL(0.1, 0, 0.1);
	dirLight.position.set(0.5, 1.5, -1);
	dirLight.position.multiplyScalar(30);
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

	let renderer = new THREE.WebGLRenderer({antialias: true, alpha: false});
	renderer.setClearColor(0x17112a, 1);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(width, height);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	let effect = new THREE.OutlineEffect(renderer, {
		defaultThickness: 0.0005,
		defaultColor: new THREE.Color(`#1a2a7a`),
		defaultAlpha: 0.01
	});

	canvas.innerHTML = '';
	canvas.appendChild(renderer.domElement);

	loadLevel({scene, state});

	return {scene, light: false, renderer, effect, camera, canvas: renderer.domElement, plane};
};

const render = (sceneState) => {
	const {scene, camera, renderer, state, character, mixer, acts, guards} = sceneState;
	if (!scene || !camera || !renderer || !state) return sceneState;

	_camera.refresh({camera, state});
	_character.refresh({scene, character, mixer, acts, state, camera});
	if (guards) npcs.refresh({scene, guards, state});

	// Selection highlight synced here (not in sceneState$ merge — avoids racing init)
	const selection = state.editor && state.editor.selection;
	const helperUuid = sceneState.selectionHelper && sceneState.selectionHelper.userData
		&& sceneState.selectionHelper.userData.targetUuid;
	const nextUuid = selection && selection.uuid;
	if (helperUuid !== nextUuid) {
		syncSelectionHelper(sceneState, selection);
	} else if (sceneState.selectionHelper && sceneState.selectionHelper.update) {
		sceneState.selectionHelper.update();
	}

	if (sceneState.gizmoApi) {
		sceneState.gizmoApi.sync({state});
	}

	renderer.setSize(state.viewport.screen.width, state.viewport.screen.height);
	renderer.render(scene, camera);
	return sceneState;
};

let unhook = () => {};
let hook = ({state$, actions, minimap}) => {
	let subs = [];
	let pointer = {active: false, x: 0, y: 0, moved: false};
	let latestSceneState = {};

	// Single init when #view3d exists (snabbdom can replace the node; don't re-init)
	const init$ = interval(100)
		.pipe(
			map(() => document.querySelector('#view3d')),
			filter(el => el),
			take(1),
			withLatestFrom(state$, (canvas, state) => ({canvas, state})),
			map(({canvas, state}) => () => {
				const base = init({canvas, state});
				const gizmoApi = createGizmo({
					camera: base.camera,
					domElement: base.canvas,
					scene: base.scene,
					actions
				});
				return {...base, gizmoApi};
			})
		);

	// Hold actor payloads until scene exists, then attach (same race virux avoids by slower loads)
	const character$ = _character.init()
		.pipe(
			map(data => sceneState => {
				if (!sceneState.scene) {
					return {...sceneState, pendingCharacter: data};
				}
				sceneState.scene.add(data.character);
				return {...sceneState, ...data, pendingCharacter: null};
			})
		);

	const npcs$ = npcs.init()
		.pipe(
			map(guards => sceneState => {
				if (!sceneState.scene) {
					return {...sceneState, pendingGuards: guards};
				}
				guards.forEach(guard => sceneState.scene.add(guard.model));
				return {...sceneState, guards, pendingGuards: null};
			})
		);

	const levelChange$ = state$.pipe(
		distinctUntilChanged(state => state.level.needsReload),
		filter(state => state.level.needsReload),
		map(state => sceneState => {
			if (!sceneState.scene) return sceneState;
			loadLevel({scene: sceneState.scene, state});
			actions.set(['level', 'needsReload'], false);
			return sceneState;
		})
	);

	const sceneState$ = merge(
		init$,
		character$,
		npcs$,
		levelChange$
	)
		.pipe(
			scan((sceneState, modify) => {
				let next = modify(sceneState);

				// Flush actors that finished loading before init
				if (next.scene && next.pendingCharacter) {
					const data = next.pendingCharacter;
					if (data.character && data.character.parent !== next.scene) {
						next.scene.add(data.character);
					}
					next = {...next, ...data, pendingCharacter: null};
				}
				if (next.scene && next.pendingGuards) {
					next.pendingGuards.forEach(guard => {
						if (guard.model && guard.model.parent !== next.scene) {
							next.scene.add(guard.model);
						}
					});
					next = {...next, guards: next.pendingGuards, pendingGuards: null};
				}

				latestSceneState = next;
				return next;
			}, {})
		);

	subs.push(
		time.frame()
			.pipe(
				filter((dt, i) => i % 2 === 0),
				withLatestFrom(
					sceneState$,
					state$,
					// Mutate the live scan object — a shallow copy drops selectionHelper
					// and leaves orphaned BoxHelpers in the scene.
					(dt, sceneState, state) => {
						sceneState.state = state;
						return sceneState;
					}
				)
			)
			.subscribe(sceneState => {
				latestSceneState = render(sceneState) || sceneState;
			})
	);

	// Edit-mode click → select (util/three/pick)
	subs.push(
		fromEvent(document, 'mousedown')
			.pipe(filter(ev => ev.target.tagName === 'CANVAS'))
			.subscribe(ev => {
				pointer = {active: true, x: ev.pageX, y: ev.pageY, moved: false};
			})
	);

	subs.push(
		fromEvent(document, 'mousemove').subscribe(ev => {
			if (!pointer.active) return;
			if (Math.abs(ev.pageX - pointer.x) > 4 || Math.abs(ev.pageY - pointer.y) > 4) {
				pointer.moved = true;
			}
		})
	);

	subs.push(
		fromEvent(document, 'mouseup')
			.pipe(
				filter(() => pointer.active && !pointer.moved),
				withLatestFrom(state$, (ev, state) => ({ev, state})),
				filter(({state}) => state.editor && state.editor.enabled &&
					!state.editor.gizmoDragging)
			)
			.subscribe(({ev, state}) => {
				const sceneState = latestSceneState;
				// Don't re-pick when releasing on the gizmo itself
				if (sceneState.gizmoApi && sceneState.gizmoApi.gizmo &&
					sceneState.gizmoApi.gizmo.dragging) {
					pointer = {active: false, x: 0, y: 0, moved: false};
					return;
				}
				const selection = mouseToObject({
					camera: sceneState.camera,
					scene: sceneState.scene,
					pageX: ev.pageX,
					pageY: ev.pageY,
					screen: state.viewport.screen
				});
				let anim = null;
				if (selection && selection.kind === 'player' && sceneState.clips) {
					anim = {clips: sceneState.clips, clipIndices: [], paused: true};
				} else if (selection && selection.kind === 'guard' && sceneState.guards) {
					const guard = sceneState.guards.find(g =>
						g.model && g.model.guardId === selection.guardId
					);
					if (guard && guard.clips) {
						anim = {clips: guard.clips, clipIndices: [], paused: true};
					}
				}
				actions.selectObject(selection, anim);
				pointer = {active: false, x: 0, y: 0, moved: false};
			})
	);

	subs.push(
		fromEvent(document, 'mouseup').subscribe(() => {
			pointer.active = false;
		})
	);

	subs.push(
		() => {
			let cleanupSub = of({}).pipe(
				withLatestFrom(sceneState$, (j, sceneState) => sceneState)
			)
				.subscribe(({renderer}) => {
					if (renderer) renderer.dispose();
					cleanupSub.unsubscribe();
				});
		}
	);

	unhook = () => {
		subs.forEach(sub => sub.unsubscribe ? sub.unsubscribe() : sub());
	};
};

module.exports = {
	hook,
	unhook: () => unhook()
};
