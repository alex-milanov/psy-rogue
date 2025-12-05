'use strict';

const {fn, obj} = require('iblokz-data');

const generate = gridSize => (new Array(gridSize)
	.fill({}).map(() => new Array(gridSize).fill({})));

const traverse = (grid, cb) => grid.map((row, y) =>
	row.map((col, x) => cb({x, y}, col))
);

const filter = (mtrx, f) => {
	let arr = [];
	traverse(mtrx, (pos, cell) => f(pos, cell, mtrx) ? arr.push({pos, cell}) : false);
	return arr;
};

const getArea = (grid, pos, radius = 1) => fn.pipe(
	() => new Array(radius * 2 + 1).fill(new Array(radius * 2 + 1).fill({})),
	area => traverse(area, ({x, y}) =>
		grid[pos.y - radius + y] && grid[pos.y - radius + y][pos.x - radius + x] || false)
)();

const calcOrigin = (gridSize, cellSize = 8) => -(gridSize / 2) * cellSize;

module.exports = {
	generate,
	traverse,
	filter,
	getArea,
	calcOrigin
};
