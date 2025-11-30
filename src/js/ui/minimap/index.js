'use strict';

const {obj} = require('iblokz-data');
// const h = require('snabbdom/h').default;

const {h, div, canvas} = require('iblokz-snabbdom-helpers');

module.exports = ({state, actions}) => {
	if (!state.minimap || !state.minimap.enabled) return h('div');

	return div('.minimap', {
		style: {
			position: 'absolute',
			top: '64px',
			right: '16px',
			width: `${state.minimap.size}px`,
			height: `${state.minimap.size}px`,
			background: 'rgba(0, 50, 70, 0.3)',
			border: '1px solid #71a1d1',
			'border-left-width': '4px',
			'box-shadow': 'inset 0px 0px 24px rgba(113, 161, 209, 0.5)',
			'z-index': '1000',
			opacity: '0.7',
			'font-family': 'Nova Flat'
		}
	}, [
		canvas('#minimap-canvas', {
			attrs: {
				width: state.minimap.size,
				height: state.minimap.size
			},
			style: {
				display: 'block',
				width: '100%',
				height: '100%'
			}
		}),
		div('.minimap-label', {
			style: {
				position: 'absolute',
				top: '5px',
				left: '5px',
				color: 'white',
				'font-size': '11px',
				'font-family': 'Nova Flat',
				'text-transform': 'uppercase',
				'letter-spacing': '1px',
				padding: '0px 5px'
			}
		}, 'Tactical View'),
		// Camera viewport indicator
		div('.viewport-status', {
			style: {
				position: 'absolute',
				bottom: '5px',
				left: '5px',
				color: '#71a1d1',
				'font-size': '9px',
				'font-family': 'monospace',
				padding: '2px 5px',
				background: 'rgba(0, 0, 0, 0.5)',
				border: '1px solid rgba(113, 161, 209, 0.3)'
			}
		}, (() => {
			if (!state.camera || !state.camera.angle) return 'VIEW: 3RD PERSON';
			const cameraY = state.camera.angle.y;
			// Below 190 = elevated, 190-240 = 3rd person, above 240 = top-down
			if (cameraY > 240) return 'VIEW: TOP-DOWN';
			if (cameraY >= 190) return 'VIEW: 3RD PERSON';
			return 'VIEW: ELEVATED';
		})())
	]);
};

