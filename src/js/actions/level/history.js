'use strict';

const History = require('../../util/history');

// Singleton — not exported via adapt()'d actions tree
module.exports = new History();
