'use strict';

/**
 * Qoole-style undo/redo: stack of { undo, redo } functions.
 * Same-title edits within COALESCE_MS share one entry (drag coalescing).
 */

const COALESCE_MS = 3000;

class History {
	constructor() {
		this.events = [];
		this.index = -1;
	}

	add(undo, redo, title) {
		this.index++;
		if (this.events.length > this.index) {
			this.events.splice(this.index, this.events.length - this.index);
		}

		const time = Date.now();
		const last = this.index > 0 ? this.events[this.index - 1] : null;

		// Qoole: join rapid same-title edits — keep first undo, replace redo
		if (last && title === last.title && (time - last.time) < COALESCE_MS) {
			this.index--;
			last.time = time;
			last.redo = redo;
			return;
		}

		this.events.push({undo, redo, title, time});
	}

	undo() {
		if (this.index < 0) return false;
		this.events[this.index--].undo();
		return true;
	}

	redo() {
		if (this.index >= this.events.length - 1) return false;
		this.events[++this.index].redo();
		return true;
	}

	clear() {
		this.events = [];
		this.index = -1;
	}

	canUndo() {
		return this.index >= 0;
	}

	canRedo() {
		return this.index < this.events.length - 1;
	}
}

module.exports = History;
