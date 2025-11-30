'use strict';

// lib
const { Observable } = require('rxjs');

const load = path => new Observable(observer => {
	const image = new Image();

	image.src = path;

	image.onload = () => {
		console.log('loaded image' + path);
		observer.next(image);
		observer.complete();
	};

	image.onError = err => observer.error(err);
});

const getData = (image, dim = 256) => {
	// const canvas = document.createElement('canvas');
	// canvas.width = image.width;
	// canvas.height = image.height;
	var canvas = document.createElement('canvas');
	canvas.width = dim;
	canvas.height = dim;
	var context = canvas.getContext('2d');

	let size = dim * dim;
	let data = new Float32Array(size);

	context.drawImage(image, 0, 0);

	for (let i = 0; i < size; i++) {
		data[i] = 0;
	}

	var imgd = context.getImageData(0, 0, dim, dim);
	var pix = imgd.data;

	var j = 0;
	for (var i = 0, n = pix.length; i < n; i += (4)) {
		var all = pix[i] + pix[i + 1] + pix[i + 2];
		data[j++] = all / 3;
	}

	return data;
};

const everyFirstOutOfFour = (d, i) => (i + 3) / 4 === parseInt((i + 3) / 4, 10);

const simplifyData = data => data.filter(everyFirstOutOfFour);

module.exports = {
	load,
	getData,
	simplifyData
};
