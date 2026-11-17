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

	const selected = anim.clipIndices || [];
	const overriding = selected.length > 0;
	const title = selection.kind === 'player'
		? 'Character Edit — Player'
		: `Character Edit — ${selection.guardId || 'NPC'}`;

	return div('.character-edit', [
		div('.character-edit-title', title),
		div('.character-edit-meta',
			(anim.paused ? 'action paused' : 'action running')
			+ (overriding ? ` · ${selected.length} clip${selected.length === 1 ? '' : 's'}` : ' · game anims')
		),
		div('.character-edit-actions', [
			button(`[type="button"]`, {
				on: {click: () => actions.toggleCharacterPaused()}
			}, [
				i('.fa', {
					class: {
						'fa-pause': !anim.paused,
						'fa-play': anim.paused
					}
				}),
				anim.paused ? ' Resume action' : ' Pause action'
			])
		]),
		div('.character-edit-section', 'Animations'),
		div('.character-edit-clips',
			anim.clips.map(clip => button(`.character-edit-clip[type="button"]`, {
				class: {'is-active': selected.indexOf(clip.index) !== -1},
				on: {click: () => actions.toggleAnimClip(clip.index)}
			}, [
				span('.character-edit-clip-name', clip.name),
				span('.character-edit-clip-dur', `${clip.duration.toFixed(2)}s`)
			]))
		)
	]);
};
