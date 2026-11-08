// Two people (#327): a couple, in each theme its own way.
import type { ThemeId } from '../palettes';
import type { Scene } from '../scenes';
import { disc, GROUND, heart, hull, person, rect, sitting, star, WATER } from '../draw';

export const PARTNER: Record<ThemeId, Scene> = {
	// Two on a bench, a heart between them
	forest: {
		shapes: [
			GROUND,
			{ d: person(292, 168, 58) + person(330, 168, 58), strength: 1 },
			{ d: rect(266, 164, 90, 7), strength: 1 },
			{ d: rect(274, 171, 7, 15) + rect(341, 171, 7, 15), strength: 0.9 },
			{ d: heart(311, 94, 10), strength: 1, motion: 'pulse' }
		]
	},
	// Two in a rowing boat
	fjord: {
		shapes: [
			WATER,
			{ d: hull(262, 180, 116, 18), strength: 1, motion: 'rock' },
			{
				d: `${disc(300, 140, 8)}${disc(340, 140, 8)}M290 162v-10q0-8 10-8t10 8v10ZM330 162v-10q0-8 10-8t10 8v10Z`,
				strength: 1,
				motion: 'rock'
			},
			{ d: heart(320, 112, 7), strength: 1, motion: 'pulse' }
		],
		lines: [{ d: 'M290 158L246 186M350 158L394 186', strength: 0.9, motion: 'rock' }]
	},
	// Two on the top, hand in hand
	mountains: {
		shapes: [
			{ d: 'M214 200L326 150L400 176V200Z', strength: 0.95 },
			{ d: person(312, 154, 50) + person(342, 160, 46), strength: 1 }
		],
		lines: [{ d: 'M322 132q8 4 12 0', strength: 1 }],
		dots: []
	},
	// Two walking hand in hand
	heather: {
		shapes: [
			GROUND,
			{ d: person(296, 186, 64) + person(334, 186, 58), strength: 1 },
			{ d: heart(316, 100, 9), strength: 1, motion: 'pulse' }
		],
		lines: [{ d: 'M308 150q8 6 14 0', strength: 1 }]
	},
	// A heart carved in a birch
	birch: {
		shapes: [
			GROUND,
			{ d: 'M296 0h44l4 200H292Z', strength: 0.9 },
			{ d: heart(318, 104, 14), strength: 1, cut: true },
			{
				d: 'M296 40l10 3-10 3ZM344 70l-12 3 12 3ZM294 160l12 3-12 3ZM344 150l-10 3 10 3Z',
				strength: 1,
				cut: true
			}
		]
	},
	// A picnic for two on a blanket
	meadow: {
		shapes: [
			GROUND,
			{ d: 'M240 192L270 172H372L396 192Z', strength: 0.8 },
			{
				d: 'M262 184l10-8h20l-10 8ZM302 184l10-8h20l-10 8ZM342 184l10-8h20l-10 8Z',
				strength: 1,
				cut: true
			},
			{ d: sitting(286, 172, 54) + sitting(352, 172, 54, -1), strength: 1 },
			{ d: heart(318, 104, 8), strength: 1, motion: 'pulse' }
		]
	},
	// Two on a jetty, watching the sea
	coast: {
		shapes: [
			WATER,
			{ d: rect(270, 170, 130, 8), strength: 1 },
			{ d: sitting(320, 170, 48, -1) + sitting(352, 170, 48, -1), strength: 1 }
		],
		lines: [{ d: 'M282 178V198M330 178V200M378 178V200', strength: 0.9 }]
	},
	// Under one blanket, a shooting star above
	aurora: {
		shapes: [
			GROUND,
			{ d: disc(298, 150, 10) + disc(334, 150, 10), strength: 1 },
			{ d: 'M252 186Q260 156 316 156Q376 156 384 186Z', strength: 0.95 },
			{ d: star(364, 70, 7), strength: 1, motion: 'pulse' }
		],
		lines: [{ d: 'M358 74L300 100', strength: 0.6 }]
	},
	// Two under one umbrella
	autumn: {
		shapes: [
			GROUND,
			{ d: person(300, 186, 62) + person(336, 186, 60), strength: 1 },
			{ d: 'M262 112a56 34 0 0 1 112 0Z', strength: 1, motion: 'sway' }
		],
		lines: [{ d: 'M318 112V146', strength: 1 }]
	}
};
