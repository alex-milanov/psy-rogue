'use strict';

const {div, button, span, i} = require('iblokz-snabbdom-helpers');

const isCharacterSelection = selection =>
	selection && (selection.kind === 'player' || selection.kind === 'guard');

module.exports = ({state, actions}) => {
	const anim = state.editor && state.editor.anim;
	const selection = state.editor && state.editor.selection;
	if (!isCharacterSelection(selection) || !anim || !anim.clips || !anim.clips.length) {
		return div();
	}

	const title = selection.kind === 'player'
		? 'Player Anims'
		: `Guard Anims (${selection.guardId || 'npc'})`;

	return div('.anim-preview', [
		div('.anim-preview-title', title),
		div('.anim-preview-meta',
			anim.playing ? 'playing' : 'paused'
			+ (anim.clipIndex != null ? ` · clip ${anim.clipIndex}` : '')
		),
		div('.anim-preview-actions', [
			button(`[type="button"]`, {
				on: {click: () => actions.toggleAnimPlaying()}
			}, [
				i('.fa', {
					class: {
						'fa-pause': anim.playing,
						'fa-play': !anim.playing
					}
				}),
				anim.playing ? ' Pause' : ' Play'
			])
		]),
		div('.anim-preview-clips',
			anim.clips.map(clip => button(`.anim-clip[type="button"]`, {
				class: {'is-active': anim.clipIndex === clip.index},
				on: {click: () => actions.setAnimClip(clip.index)}
			}, [
				span('.anim-clip-name', clip.name),
				span('.anim-clip-dur', `${clip.duration.toFixed(2)}s`)
			]))
		)
	]);
};
