'use strict';

/**
 * Procedural Level Generation Utilities
 * Generates Liberty Island-style compound layouts
 */

/**
 * Generate perimeter walls with gate
 */
const generatePerimeter = (size, gateWidth = 16, gateSide = 'west') => {
	const wallThickness = 4;
	const wallHeight = 8;
	const halfSize = size / 2;
	
	const walls = [];
	
	// North wall
	walls.push({
		id: 'wall-north',
		pos: [0, -halfSize + wallThickness / 2],
		size: [size, wallThickness],
		height: wallHeight
	});
	
	// South wall
	walls.push({
		id: 'wall-south',
		pos: [0, halfSize - wallThickness / 2],
		size: [size, wallThickness],
		height: wallHeight
	});
	
	// East wall
	walls.push({
		id: 'wall-east',
		pos: [halfSize - wallThickness / 2, 0],
		size: [wallThickness, size],
		height: wallHeight
	});
	
	// West wall (with gate opening)
	const gateOffset = gateWidth / 2;
	walls.push({
		id: 'wall-west-north',
		pos: [-halfSize + wallThickness / 2, -gateOffset - (halfSize - gateOffset) / 2],
		size: [wallThickness, halfSize - gateOffset],
		height: wallHeight
	});
	walls.push({
		id: 'wall-west-south',
		pos: [-halfSize + wallThickness / 2, gateOffset + (halfSize - gateOffset) / 2],
		size: [wallThickness, halfSize - gateOffset],
		height: wallHeight
	});
	
	return {
		walls,
		gate: {
			pos: [-halfSize, 0],
			size: [wallThickness, gateWidth],
			orientation: gateSide
		}
	};
};

/**
 * Generate building positions
 * Returns array of buildings with positions, avoiding overlaps
 */
const generateBuildings = (count, compoundSize, minSize = 15, maxSize = 25) => {
	const buildings = [];
	const margin = 20; // Distance from perimeter
	const spacing = 15; // Min spacing between buildings
	
	const buildingTypes = ['admin', 'barracks', 'storage', 'warehouse', 'lab'];
	
	for (let i = 0; i < count; i++) {
		let attempts = 0;
		let validPosition = false;
		let building;
		
		while (!validPosition && attempts < 50) {
			const width = minSize + Math.random() * (maxSize - minSize);
			const depth = minSize + Math.random() * (maxSize - minSize);
			const height = 10 + Math.random() * 8;
			
			const x = (Math.random() - 0.5) * (compoundSize - margin * 2 - width);
			const z = (Math.random() - 0.5) * (compoundSize - margin * 2 - depth);
			
			building = {
				id: `building-${i + 1}`,
				pos: [Math.round(x), Math.round(z)],
				size: [Math.round(width), Math.round(depth)],
				height: Math.round(height),
				type: buildingTypes[i % buildingTypes.length]
			};
			
			// Check for overlaps
			validPosition = true;
			for (const existingBuilding of buildings) {
				const dx = Math.abs(building.pos[0] - existingBuilding.pos[0]);
				const dz = Math.abs(building.pos[1] - existingBuilding.pos[1]);
				const minDx = (building.size[0] + existingBuilding.size[0]) / 2 + spacing;
				const minDz = (building.size[1] + existingBuilding.size[1]) / 2 + spacing;
				
				if (dx < minDx && dz < minDz) {
					validPosition = false;
					break;
				}
			}
			
			attempts++;
		}
		
		if (validPosition) {
			buildings.push(building);
		}
	}
	
	return buildings;
};

/**
 * Generate pathway network connecting buildings and gate
 */
const generatePathways = (buildings, compoundSize, gatePos) => {
	const pathways = [];
	const pathWidth = 4;
	const halfSize = compoundSize / 2;
	
	// Main path from gate to center
	pathways.push({
		id: 'path-entry',
		pos: [gatePos[0] / 2, 0],
		size: [Math.abs(gatePos[0]), pathWidth],
		orientation: 'horizontal'
	});
	
	// Perimeter pathway (inner loop)
	const perimeterOffset = 15;
	
	// North path
	pathways.push({
		id: 'path-perimeter-north',
		pos: [0, -halfSize + perimeterOffset],
		size: [compoundSize - 2 * perimeterOffset, pathWidth],
		orientation: 'horizontal'
	});
	
	// South path
	pathways.push({
		id: 'path-perimeter-south',
		pos: [0, halfSize - perimeterOffset],
		size: [compoundSize - 2 * perimeterOffset, pathWidth],
		orientation: 'horizontal'
	});
	
	// East path
	pathways.push({
		id: 'path-perimeter-east',
		pos: [halfSize - perimeterOffset, 0],
		size: [pathWidth, compoundSize - 2 * perimeterOffset],
		orientation: 'vertical'
	});
	
	// West path
	pathways.push({
		id: 'path-perimeter-west',
		pos: [-halfSize + perimeterOffset, 0],
		size: [pathWidth, compoundSize - 2 * perimeterOffset],
		orientation: 'vertical'
	});
	
	// Connect buildings to nearby paths
	buildings.forEach((building, idx) => {
		pathways.push({
			id: `path-building-${idx + 1}`,
			pos: building.pos,
			size: [12, pathWidth],
			orientation: 'horizontal'
		});
	});
	
	return pathways;
};

/**
 * Place props (trees, lamps, benches) along pathways and in green spaces
 */
const generateProps = (pathways, buildings, compoundSize, density = 1.0) => {
	const props = {
		trees: [],
		lamps: [],
		benches: []
	};
	
	// Trees in open areas (avoid pathways and buildings)
	const treeCount = Math.round(10 * density);
	for (let i = 0; i < treeCount; i++) {
		const x = (Math.random() - 0.5) * (compoundSize * 0.8);
		const z = (Math.random() - 0.5) * (compoundSize * 0.8);
		props.trees.push({
			pos: [Math.round(x), Math.round(z)]
		});
	}
	
	// Lamps along pathways (every ~20 units)
	pathways.forEach((pathway, idx) => {
		if (pathway.orientation === 'horizontal') {
			const lampCount = Math.floor(pathway.size[0] / 20);
			for (let i = 0; i < lampCount; i++) {
				props.lamps.push({
					pos: [
						pathway.pos[0] - pathway.size[0] / 2 + i * 20,
						pathway.pos[1] + 3
					]
				});
			}
		} else {
			const lampCount = Math.floor(pathway.size[1] / 20);
			for (let i = 0; i < lampCount; i++) {
				props.lamps.push({
					pos: [
						pathway.pos[0] + 3,
						pathway.pos[1] - pathway.size[1] / 2 + i * 20
					]
				});
			}
		}
	});
	
	// Benches near pathways (randomly)
	const benchCount = Math.round(4 * density);
	for (let i = 0; i < benchCount; i++) {
		const pathway = pathways[Math.floor(Math.random() * pathways.length)];
		const offset = (Math.random() - 0.5) * 10;
		props.benches.push({
			pos: [
				pathway.pos[0] + offset,
				pathway.pos[1] + offset
			],
			rotation: Math.floor(Math.random() * 4) * 90
		});
	}
	
	return props;
};

/**
 * Generate guard positions and patrol routes
 */
const generateGuards = (buildings, pathways, compoundSize, gatePos, objectivePos) => {
	const guards = [];
	const safeZoneRadius = 25; // No guards near gate
	
	// 1. Gate guard (outside safe zone)
	guards.push({
		id: 'guard-gate',
		startPos: [gatePos[0] + safeZoneRadius, 0, 0],
		type: 'stationary',
		rotation: 270,
		state: 'idle'
	});
	
	// 2. Objective guard
	guards.push({
		id: 'guard-objective',
		startPos: [objectivePos[0] + 5, 0, objectivePos[1] - 5],
		type: 'stationary',
		rotation: 225,
		state: 'idle'
	});
	
	// 3. Building guards (one per building)
	buildings.forEach((building, idx) => {
		if (idx < 1) { // Only first building for now
			guards.push({
				id: `guard-building-${idx + 1}`,
				startPos: [building.pos[0] - 10, 0, building.pos[1] + 5],
				type: 'stationary',
				rotation: 0,
				state: 'idle'
			});
		}
	});
	
	// 4. Patrol routes along perimeter paths
	const perimeterOffset = 15;
	
	// North patrol
	guards.push({
		id: 'patrol-north',
		startPos: [-compoundSize / 4, 0, -compoundSize / 2 + perimeterOffset],
		type: 'patrol',
		route: [
			[-compoundSize / 4, 0, -compoundSize / 2 + perimeterOffset],
			[compoundSize / 4, 0, -compoundSize / 2 + perimeterOffset],
			[compoundSize / 4, 0, -compoundSize / 2 + perimeterOffset + 10],
			[-compoundSize / 4, 0, -compoundSize / 2 + perimeterOffset + 10]
		],
		mode: 'walk'
	});
	
	// East patrol
	guards.push({
		id: 'patrol-east',
		startPos: [compoundSize / 2 - perimeterOffset, 0, -compoundSize / 4],
		type: 'patrol',
		route: [
			[compoundSize / 2 - perimeterOffset, 0, -compoundSize / 4],
			[compoundSize / 2 - perimeterOffset, 0, compoundSize / 4]
		],
		mode: 'walk'
	});
	
	// South patrol
	guards.push({
		id: 'patrol-south',
		startPos: [-compoundSize / 4, 0, compoundSize / 2 - perimeterOffset],
		type: 'patrol',
		route: [
			[-compoundSize / 4, 0, compoundSize / 2 - perimeterOffset],
			[compoundSize / 4, 0, compoundSize / 2 - perimeterOffset],
			[compoundSize / 4, 0, compoundSize / 2 - perimeterOffset - 10],
			[-compoundSize / 4, 0, compoundSize / 2 - perimeterOffset - 10]
		],
		mode: 'walk'
	});
	
	return guards;
};

/**
 * Convert compound layout to grid format
 * @param {number} gridSize - Size of grid (gridSize x gridSize)
 * @param {number} tileSize - Size of each tile in world units
 * @param {object} compound - Compound layout data
 * @returns {object} {map: [[]], assets: [[]]}
 */
const compoundToGrid = (gridSize, tileSize, compound) => {
	// Initialize grids
	const map = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
	const assets = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
	
	const worldSize = gridSize * tileSize;
	const halfWorld = worldSize / 2;
	
	// Helper to convert world coords to grid coords
	// Must match inverse of: world = (grid - gridSize/2 + 1) * tileSize
	// So: grid = world/tileSize + gridSize/2 - 1
	const toGrid = (worldX, worldZ) => {
		const x = Math.round(worldX / tileSize + gridSize / 2 - 1);
		const z = Math.round(worldZ / tileSize + gridSize / 2 - 1);
		return [
			Math.max(0, Math.min(gridSize - 1, x)),
			Math.max(0, Math.min(gridSize - 1, z))
		];
	};
	
	// Helper to fill rectangle in grid
	const fillRect = (grid, centerX, centerZ, width, depth, value) => {
		// Convert center position and corners to grid
		const halfW = width / 2;
		const halfD = depth / 2;
		const [x1, z1] = toGrid(centerX - halfW, centerZ - halfD);
		const [x2, z2] = toGrid(centerX + halfW, centerZ + halfD);
		
		// Fill the rectangle
		for (let z = Math.min(z1, z2); z <= Math.max(z1, z2); z++) {
			for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
				if (x >= 0 && x < gridSize && z >= 0 && z < gridSize) {
					grid[z][x] = value;
				}
			}
		}
	};
	
	// Perimeter walls
	if (compound.perimeter && compound.perimeter.walls) {
		compound.perimeter.walls.forEach(wall => {
			fillRect(map, wall.pos[0], wall.pos[1], wall.size[0], wall.size[1], 2);
		});
	}
	
	// Buildings as walls
	if (compound.buildings) {
		compound.buildings.forEach(building => {
			fillRect(map, building.pos[0], building.pos[1], building.size[0], building.size[1], 2);
		});
	}
	
	// Pathways as tiles
	if (compound.pathways) {
		compound.pathways.forEach(pathway => {
			fillRect(map, pathway.pos[0], pathway.pos[1], pathway.size[0], pathway.size[1], 1);
		});
	}
	
	// Props as assets
	if (compound.props) {
		// Lamps (asset 1)
		if (compound.props.lamps) {
			compound.props.lamps.forEach(lamp => {
				const [x, z] = toGrid(lamp.pos[0], lamp.pos[1]);
				if (assets[z][x] === 0) assets[z][x] = 1;
			});
		}
		
		// Benches (asset 2)
		if (compound.props.benches) {
			compound.props.benches.forEach(bench => {
				const [x, z] = toGrid(bench.pos[0], bench.pos[1]);
				if (assets[z][x] === 0) assets[z][x] = 2;
			});
		}
		
		// Trees (assets 3-5)
		if (compound.props.trees) {
			compound.props.trees.forEach((tree, i) => {
				const [x, z] = toGrid(tree.pos[0], tree.pos[1]);
				if (assets[z][x] === 0) {
					assets[z][x] = 3 + (i % 3); // Rotate through tree types 3, 4, 5
				}
			});
		}
	}
	
	return {
		needsReload: false,
		map,
		assets
	};
};

/**
 * Main generator function - creates complete compound level
 */
const generateCompound = (options = {}) => {
	const {
		gridSize = 29, // Grid dimensions (matches current level)
		tileSize = 5,  // Size of each tile
		buildingCount = 3,
		density = 1.0,
		seed = Math.random()
	} = options;
	
	const worldSize = gridSize * tileSize;
	
	// Generate compound structure
	const perimeter = generatePerimeter(worldSize);
	const buildings = generateBuildings(buildingCount, worldSize);
	const pathways = generatePathways(buildings, worldSize, perimeter.gate.pos);
	const props = generateProps(pathways, buildings, worldSize, density);
	
	const objectivePos = [0, -5]; // Center area
	const guards = generateGuards(buildings, pathways, worldSize, perimeter.gate.pos, objectivePos);
	
	const playerStart = {
		pos: [perimeter.gate.pos[0] - 5, 0.2, 0],
		rotation: 90
	};
	
	const compound = {
		perimeter,
		buildings,
		pathways,
		props
	};
	
	// Convert to grid format and add metadata
	const gridData = compoundToGrid(gridSize, tileSize, compound);
	
	return {
		...gridData,
		playerStart,
		guards
	};
};

module.exports = {
	generatePerimeter,
	generateBuildings,
	generatePathways,
	generateProps,
	generateGuards,
	generateCompound
};

