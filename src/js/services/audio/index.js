'use strict';
// lib
const {obj, fn} = require('iblokz-data');
const file = require('../../util/file');
const a = require('../../util/audio');
const sampler = require('../../util/audio/sources/sampler');
const lfo = require('../../util/audio/effects/lfo');
const reverb = require('../../util/audio/effects/reverb');
const adsr = require('../../util/audio/controls/adsr');

const song = require('./song.json');

const rack = {
	1: {
		voices: {}, // a.start(a.vco({type: 'square'})),
		// adsr1: a.adsr({gain: 0}),
		vcf: a.vcf({cutoff: 0.64}),
		reverb: a.create('reverb'),
		lfo: a.start(a.lfo({})),
		volume: a.vca({gain: 0.3}),
		context: a.context
	},
	2: {
		voices: {}, // a.start(a.vco({type: 'square'})),
		// adsr1: a.adsr({gain: 0}),
		vcf: a.vcf({cutoff: 0.64}),
		reverb: a.create('reverb'),
		lfo: a.start(a.lfo({})),
		volume: a.vca({gain: 0.3}),
		context: a.context
	},
	3: {
		voices: {}, // a.start(a.vco({type: 'square'})),
		// adsr1: a.adsr({gain: 0}),
		vcf: a.vcf({cutoff: 0.64}),
		reverb: a.create('reverb'),
		lfo: a.start(a.lfo({})),
		volume: a.vca({gain: 0.3}),
		context: a.context
	}
};

let unhook = () => {};
const hook = ({state$, actions}) => {
	let subs = [];
	console.log(song.session.tracks);
	unhook = () => subs.forEach(sub => sub.unsubscribe());
};

module.exports = {
	hook,
	unhook: () => unhook()
};
