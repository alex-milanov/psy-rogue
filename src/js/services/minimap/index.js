'use strict';

// lib
const { withLatestFrom } = require('rxjs/operators');

// util
const time = require('../../util/time');

let canvas = null;
let ctx = null;

const mapToCanvas = (worldPos, worldSize, canvasSize) => {
	// Convert world coordinates to canvas coordinates
	// Assuming world is centered at 0,0
	const halfWorld = worldSize / 2;
	const normalized = (worldPos + halfWorld) / worldSize;
	return normalized * canvasSize;
};

const render = (state) => {
	if (!canvas) {
		canvas = document.getElementById('minimap-canvas');
		if (!canvas) return; // Canvas not ready yet
		ctx = canvas.getContext('2d');
	}

	const size = state.minimap.size;
	const worldSize = 120; // Adjust based on your level size
	
	// Clear canvas - darker blue background
	ctx.fillStyle = 'rgba(0, 20, 30, 0.95)';
	ctx.fillRect(0, 0, size, size);

	// Draw grid lines (subtle blue)
	ctx.strokeStyle = 'rgba(113, 161, 209, 0.15)';
	ctx.lineWidth = 1;
	const gridStep = size / 10;
	for (let i = 0; i <= 10; i++) {
		ctx.beginPath();
		ctx.moveTo(i * gridStep, 0);
		ctx.lineTo(i * gridStep, size);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(0, i * gridStep);
		ctx.lineTo(size, i * gridStep);
		ctx.stroke();
	}

	// Draw guards (red dots) from game state
	if (state.game && state.game.guards) {
		state.game.guards.forEach(guard => {
			const x = mapToCanvas(guard.position[0], worldSize, size);
			const z = mapToCanvas(guard.position[2], worldSize, size);
			
			// Guard glow
			const gradient = ctx.createRadialGradient(x, z, 0, x, z, 6);
			gradient.addColorStop(0, 'rgba(255, 80, 80, 0.8)');
			gradient.addColorStop(1, 'rgba(255, 80, 80, 0)');
			ctx.fillStyle = gradient;
			ctx.beginPath();
			ctx.arc(x, z, 6, 0, Math.PI * 2);
			ctx.fill();
			
			// Draw dot
			ctx.fillStyle = '#ff5050';
			ctx.beginPath();
			ctx.arc(x, z, 3, 0, Math.PI * 2);
			ctx.fill();
			
			// Draw facing direction (small line)
			const dirLength = 10;
			const angle = guard.rotation;
			ctx.strokeStyle = '#ff5050';
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(x, z);
			ctx.lineTo(
				x + Math.sin(angle) * dirLength,
				z + Math.cos(angle) * dirLength
			);
			ctx.stroke();
		});
	}

	// Draw player and camera info
	if (state.player) {
		const playerX = mapToCanvas(state.player.position[0], worldSize, size);
		const playerZ = mapToCanvas(state.player.position[2], worldSize, size);
		
		// Draw camera view area (3D cone projected to 2D)
		if (state.camera && state.camera.angle) {
			const cameraY = state.camera.angle.y;
			// Camera direction is based on player.rotation (NOT affected by movement direction)
			const cameraDir = ((state.player.rotation - 45) * Math.PI) / 180;
			const viewDistance = 30;
			
			ctx.fillStyle = 'rgba(113, 161, 209, 0.1)';
			ctx.strokeStyle = 'rgba(113, 161, 209, 0.3)';
			ctx.lineWidth = 1;
			
			// Calculate how "top-down" the view is (0 = side view, 1 = directly above)
			// cameraY: 170 (elevated) -> 220 (3rd person) -> 250+ (top-down)
			const topDownness = Math.max(0, Math.min(1, (cameraY - 190) / 60));
			
			// Transitional: Partial arc that transitions from wedge to circle
			// FOV grows wider as we go more top-down
			const baseFOV = 70;
			const fov = baseFOV + (topDownness * (360 - baseFOV));
			const fovRad = fov * Math.PI / 180;
			
			// Wedge closes as topDownness approaches 1
			const wedgeClosure = Math.max(0, 1 - topDownness * 1.5);
			
			ctx.beginPath();
			if (wedgeClosure > 0) {
				// Draw wedge that opens up as we go more top-down
				ctx.moveTo(playerX, playerZ);
			}
			
			// Draw arc
			const numPoints = Math.max(20, Math.floor(fov / 5));
			for (let i = 0; i <= numPoints; i++) {
				const angle = cameraDir - fovRad / 2 + (fovRad * i / numPoints);
				const x = playerX + Math.sin(angle) * viewDistance;
				const z = playerZ + Math.cos(angle) * viewDistance;
				if (i === 0) {
					ctx.lineTo(x, z);
				} else {
					ctx.lineTo(x, z);
				}
			}
			
			if (wedgeClosure > 0) {
				ctx.lineTo(playerX, playerZ);
			}
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}
		
		// Outer glow (blue)
		const gradient = ctx.createRadialGradient(playerX, playerZ, 0, playerX, playerZ, 10);
		gradient.addColorStop(0, 'rgba(113, 161, 209, 0.9)');
		gradient.addColorStop(1, 'rgba(113, 161, 209, 0)');
		ctx.fillStyle = gradient;
		ctx.beginPath();
		ctx.arc(playerX, playerZ, 10, 0, Math.PI * 2);
		ctx.fill();
		
		// Player dot
		ctx.fillStyle = '#71a1d1';
		ctx.beginPath();
		ctx.arc(playerX, playerZ, 5, 0, Math.PI * 2);
		ctx.fill();
		
		// Player facing direction (based on player.rotation + direction offset)
		const dirLength = 15;
		let facingAngle = state.player.rotation;
		
		// If player is moving, calculate facing based on direction
		// direction is [left/right, up/down, front/back]
		if (state.player.direction && (state.player.direction[0] !== 0 || state.player.direction[2] !== 0)) {
			// Calculate angle from direction vector: atan2(left/right, front/back)
			const directionAngle = Math.atan2(state.player.direction[0], state.player.direction[2]) * (180 / Math.PI);
			facingAngle = state.player.rotation + directionAngle;
		}
		
		// Subtract 45 degrees to correct the coordinate system offset
		const playerAngle = ((facingAngle - 45) * Math.PI) / 180;
		ctx.strokeStyle = '#71a1d1';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(playerX, playerZ);
		ctx.lineTo(
			playerX + Math.sin(playerAngle) * dirLength,
			playerZ + Math.cos(playerAngle) * dirLength
		);
		ctx.stroke();
	}
};

let unhook = () => {};

const hook = ({state$, actions}) => {
	let subs = [];

	// Render minimap every frame
	subs.push(
		time.frame().pipe(
			withLatestFrom(state$, (t, state) => state)
		).subscribe(state => {
			if (state.minimap && state.minimap.enabled) {
				render(state);
			}
		})
	);

	unhook = () => {
		subs.forEach(sub => sub.unsubscribe());
		canvas = null;
		ctx = null;
	};
};

module.exports = {
	hook,
	unhook: () => unhook()
};

