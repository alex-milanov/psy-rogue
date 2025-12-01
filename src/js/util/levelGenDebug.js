'use strict';

const levelGen = require('./levelGen');

/**
 * Debug utilities for level generation
 * Outputs text/JSON representations for testing
 */

/**
 * Convert level data to JSON string
 */
const toJSON = (levelData, pretty = true) => {
	return JSON.stringify(levelData, null, pretty ? 2 : 0);
};

/**
 * Generate ASCII map visualization from grid format
 */
const gridToASCII = (levelData) => {
	const map = levelData.map;
	const assets = levelData.assets;
	const gridSize = map.length;
	
	// Tile type to character mapping (using 2 chars for consistent spacing)
	const tileChars = {
		0: '  ',  // Ground (2 spaces)
		1: '··',  // Tiles/pathway
		2: '██'   // Wall
	};
	
	// Asset type to emoji mapping (emojis are 2 chars wide)
	const assetChars = {
		0: '',     // None
		1: '💡',  // Lamp
		2: '🪑',   // Bench
		3: '🌳',  // Tree 1
		4: '🌳',  // Tree 2
		5: '🌳'   // Tree 3
	};
	
	let output = `\nPROCEDURAL LEVEL (${gridSize}x${gridSize})\n`;
	output += '═'.repeat(gridSize * 2) + '\n';
	
	for (let z = 0; z < gridSize; z++) {
		let row = '';
		for (let x = 0; x < gridSize; x++) {
			const tile = map[z][x];
			const asset = assets[z][x];
			
			// Asset takes precedence for display
			if (asset !== 0) {
				row += assetChars[asset];
			} else {
				row += tileChars[tile];
			}
		}
		output += row + '\n';
	}
	
	output += '═'.repeat(gridSize * 2) + '\n';
	output += '\nLEGEND:\n';
	output += '  ██ = Wall (value 2)\n';
	output += '  ·· = Pathway/Tiles (value 1)\n';
	output += '     = Ground (value 0)\n';
	output += '  💡 = Lamp (asset 1)\n';
	output += '  🪑 = Bench (asset 2)\n';
	output += '  🌳 = Tree (assets 3-5)\n';
	
	return output;
};

/**
 * Generate ASCII map visualization (legacy compound format)
 */
const toASCII = (levelData) => {
	const size = levelData.size;
	const scale = 2; // 2 units per character
	const gridSize = Math.floor(size / scale);
	
	// Initialize grid
	const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(' '));
	
	// Helper to convert world coords to grid coords
	const toGrid = (x, z) => {
		const gx = Math.floor((x + size / 2) / scale);
		const gz = Math.floor((z + size / 2) / scale);
		return [
			Math.max(0, Math.min(gridSize - 1, gx)),
			Math.max(0, Math.min(gridSize - 1, gz))
		];
	};
	
	// Draw perimeter walls
	for (let i = 0; i < gridSize; i++) {
		grid[0][i] = '═';
		grid[gridSize - 1][i] = '═';
		grid[i][0] = '║';
		grid[i][gridSize - 1] = '║';
	}
	grid[0][0] = '╔';
	grid[0][gridSize - 1] = '╗';
	grid[gridSize - 1][0] = '╚';
	grid[gridSize - 1][gridSize - 1] = '╝';
	
	// Draw gate
	const [gx, gz] = toGrid(levelData.perimeter.gate.pos[0], levelData.perimeter.gate.pos[1]);
	for (let i = -1; i <= 1; i++) {
		if (gz + i >= 0 && gz + i < gridSize) {
			grid[gz + i][gx] = '▓';
		}
	}
	
	// Draw pathways
	levelData.pathways.forEach(path => {
		const [px, pz] = toGrid(path.pos[0], path.pos[1]);
		const w = Math.floor(path.size[0] / scale / 2);
		const h = Math.floor(path.size[1] / scale / 2);
		
		for (let i = -w; i <= w; i++) {
			for (let j = -h; j <= h; j++) {
				const x = px + i;
				const z = pz + j;
				if (x >= 0 && x < gridSize && z >= 0 && z < gridSize) {
					if (grid[z][x] === ' ') {
						grid[z][x] = '·';
					}
				}
			}
		}
	});
	
	// Draw buildings
	levelData.buildings.forEach(building => {
		const [bx, bz] = toGrid(building.pos[0], building.pos[1]);
		const w = Math.floor(building.size[0] / scale / 2);
		const h = Math.floor(building.size[1] / scale / 2);
		
		// Draw building outline
		for (let i = -w; i <= w; i++) {
			for (let j = -h; j <= h; j++) {
				const x = bx + i;
				const z = bz + j;
				if (x >= 0 && x < gridSize && z >= 0 && z < gridSize) {
					if (i === -w || i === w || j === -h || j === h) {
						grid[z][x] = '█';
					}
				}
			}
		}
		
		// Add building door
		grid[bz + h][bx] = '▓';
	});
	
	// Draw trees
	levelData.props.trees.forEach(tree => {
		const [tx, tz] = toGrid(tree.pos[0], tree.pos[1]);
		if (tx >= 0 && tx < gridSize && tz >= 0 && tz < gridSize) {
			if (grid[tz][tx] === ' ') {
				grid[tz][tx] = '🌳';
			}
		}
	});
	
	// Draw lamps
	levelData.props.lamps.forEach(lamp => {
		const [lx, lz] = toGrid(lamp.pos[0], lamp.pos[1]);
		if (lx >= 0 && lx < gridSize && lz >= 0 && lz < gridSize) {
			if (grid[lz][lx] === '·' || grid[lz][lx] === ' ') {
				grid[lz][lx] = '💡';
			}
		}
	});
	
	// Draw benches
	levelData.props.benches.forEach(bench => {
		const [bx, bz] = toGrid(bench.pos[0], bench.pos[1]);
		if (bx >= 0 && bx < gridSize && bz >= 0 && bz < gridSize) {
			if (grid[bz][bx] === '·' || grid[bz][bx] === ' ') {
				grid[bz][bx] = '🪑';
			}
		}
	});
	
	// Draw guards
	levelData.guards.forEach(guard => {
		const [gx, gz] = toGrid(guard.startPos[0], guard.startPos[2]);
		if (gx >= 0 && gx < gridSize && gz >= 0 && gz < gridSize) {
			grid[gz][gx] = guard.type === 'stationary' ? '🧍' : '🚶';
		}
	});
	
	// Draw objective
	const [ox, oz] = toGrid(levelData.objective.pos[0], levelData.objective.pos[1]);
	if (ox >= 0 && ox < gridSize && oz >= 0 && oz < gridSize) {
		grid[oz][ox] = '★';
	}
	
	// Draw player start
	const [px, pz] = toGrid(levelData.playerStart.pos[0], levelData.playerStart.pos[2]);
	if (px >= 0 && px < gridSize && pz >= 0 && pz < gridSize) {
		grid[pz][px] = '👤';
	}
	
	// Convert grid to string
	let output = `\nCOMPOUND: ${levelData.name} (${levelData.size}x${levelData.size})\n`;
	output += '═'.repeat(gridSize) + '\n';
	output += grid.map(row => row.join('')).join('\n');
	output += '\n' + '═'.repeat(gridSize) + '\n';
	
	return output;
};

/**
 * Generate summary report
 */
const toSummary = (levelData) => {
	let output = `\nLEVEL SUMMARY: ${levelData.name}\n`;
	output += '='.repeat(50) + '\n\n';
	
	output += `Compound Size: ${levelData.size}x${levelData.size}\n`;
	output += `Buildings: ${levelData.buildings.length}\n`;
	output += `Pathways: ${levelData.pathways.length}\n`;
	output += `Guards: ${levelData.guards.length}\n`;
	output += `  - Stationary: ${levelData.guards.filter(g => g.type === 'stationary').length}\n`;
	output += `  - Patrol: ${levelData.guards.filter(g => g.type === 'patrol').length}\n`;
	output += `Props:\n`;
	output += `  - Trees: ${levelData.props.trees.length}\n`;
	output += `  - Lamps: ${levelData.props.lamps.length}\n`;
	output += `  - Benches: ${levelData.props.benches.length}\n\n`;
	
	output += 'BUILDINGS:\n';
	levelData.buildings.forEach((b, i) => {
		output += `  ${i + 1}. ${b.id} (${b.type})\n`;
		output += `     Position: [${b.pos[0]}, ${b.pos[1]}]\n`;
		output += `     Size: ${b.size[0]}x${b.size[1]}, Height: ${b.height}\n`;
	});
	
	output += '\nGUARDS:\n';
	levelData.guards.forEach((g, i) => {
		output += `  ${i + 1}. ${g.id} (${g.type})\n`;
		output += `     Start: [${g.startPos[0]}, ${g.startPos[2]}]\n`;
		if (g.type === 'patrol') {
			output += `     Waypoints: ${g.route.length}\n`;
		} else {
			output += `     Rotation: ${g.rotation}°\n`;
		}
	});
	
	output += `\nOBJECTIVE: ${levelData.objective.type}\n`;
	output += `  Position: [${levelData.objective.pos[0]}, ${levelData.objective.pos[1]}]\n`;
	
	output += `\nPLAYER START:\n`;
	output += `  Position: [${levelData.playerStart.pos[0]}, ${levelData.playerStart.pos[2]}]\n`;
	output += `  Rotation: ${levelData.playerStart.rotation}°\n\n`;
	
	return output;
};

/**
 * Test generator with different options
 */
const runTests = () => {
	console.log('\n' + '='.repeat(60));
	console.log('LEVEL GENERATOR DEBUG OUTPUT');
	console.log('='.repeat(60));
	
	// Test 1: Default compound
	console.log('\n\nTEST 1: Default Compound (3 buildings)');
	console.log('-'.repeat(60));
	const level1 = levelGen.generateCompound();
	console.log(toASCII(level1));
	console.log(toSummary(level1));
	
	// Test 2: Smaller compound
	console.log('\n\nTEST 2: Smaller Compound (2 buildings)');
	console.log('-'.repeat(60));
	const level2 = levelGen.generateCompound({
		size: 100,
		buildingCount: 2,
		density: 0.7
	});
	console.log(toASCII(level2));
	console.log(toSummary(level2));
	
	// Test 3: Larger compound
	console.log('\n\nTEST 3: Larger Compound (4 buildings)');
	console.log('-'.repeat(60));
	const level3 = levelGen.generateCompound({
		size: 140,
		buildingCount: 4,
		density: 1.2
	});
	console.log(toASCII(level3));
	console.log(toSummary(level3));
	
	// Output JSON of first level
	console.log('\n\nJSON OUTPUT (Test 1):');
	console.log('-'.repeat(60));
	console.log(toJSON(level1));
};

module.exports = {
	toJSON,
	toASCII,
	gridToASCII,
	toSummary,
	runTests
};

// Run tests if executed directly
if (require.main === module) {
	runTests();
}

