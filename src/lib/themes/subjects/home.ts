// A shared home (#327): where you live together, in each theme its own way.
import type { ThemeId } from '../palettes';
import type { Scene } from '../scenes';
import { disc, GROUND, house, rect, rounded, steam, tri, WATER } from '../draw';

export const HOME: Record<ThemeId, Scene> = {
	// A log cabin, smoke from its chimney
	forest: {
		shapes: [
			GROUND,
			{ d: rect(336, 100, 12, 36), strength: 1 },
			{ d: house(270, 186, 80, 50, 42, 12), strength: 1 },
			{ d: rect(300, 156, 20, 30), strength: 1, cut: true },
			{ d: rect(278, 148, 14, 14) + rect(328, 148, 14, 14), strength: 1, cut: true }
		],
		lines: [{ d: steam(342, 92), strength: 0.8, motion: 'rise' }]
	},
	// A boathouse on stilts over the water
	fjord: {
		shapes: [
			WATER,
			{ d: house(270, 168, 96, 46, 30, 10), strength: 1 },
			{ d: 'M296 168v-30q0-8 8-8h28q8 0 8 8v30Z', strength: 1, cut: true }
		],
		lines: [{ d: 'M276 168V196M302 168V198M334 168V198M360 168V196', strength: 0.9 }]
	},
	// An A-frame chalet with snow on its roof
	mountains: {
		shapes: [
			GROUND,
			{ d: tri(256, 186, 318, 90, 380, 186), strength: 1 },
			{ d: tri(304, 112, 318, 90, 332, 112), strength: 1, snow: true },
			{ d: tri(304, 186, 318, 160, 332, 186), strength: 1, cut: true },
			{ d: disc(318, 136, 9), strength: 1, cut: true }
		]
	},
	// A stone cottage with a thatched roof and a round door
	heather: {
		shapes: [
			GROUND,
			{ d: rounded(270, 136, 96, 50, 6), strength: 0.9 },
			{ d: 'M258 144Q318 84 378 144Z', strength: 1 },
			{ d: 'M306 186v-16a12 12 0 0 1 24 0v16Z', strength: 1, cut: true },
			{ d: disc(286, 158, 7) + disc(350, 158, 7), strength: 1, cut: true }
		]
	},
	// A treehouse up in a birch, a ladder to it
	birch: {
		shapes: [
			GROUND,
			{ d: rect(312, 60, 14, 126), strength: 0.9 },
			{ d: rect(280, 116, 80, 6), strength: 1 },
			{ d: house(292, 116, 54, 34, 20, 6), strength: 1 },
			{ d: rect(312, 92, 14, 14), strength: 1, cut: true }
		],
		lines: [
			{ d: 'M282 122L270 186M294 122L282 186M274 140h14M272 156h14M270 172h14', strength: 0.9 }
		]
	},
	// A farmhouse behind its fence
	meadow: {
		shapes: [
			GROUND,
			{ d: house(284, 180, 74, 48, 30, 10), strength: 1 },
			{
				d: rect(312, 150, 18, 30) + rect(292, 146, 12, 12) + rect(338, 146, 12, 12),
				strength: 1,
				cut: true
			},
			{
				d: 'M250 186v-22l4-4 4 4v22ZM272 186v-22l4-4 4 4v22ZM366 186v-22l4-4 4 4v22ZM388 186v-22l4-4 4 4v22Z',
				strength: 0.85
			}
		],
		lines: [{ d: 'M248 170h40M362 170h36', strength: 0.85 }]
	},
	// A row of beach huts
	coast: {
		shapes: [
			GROUND,
			{
				d:
					house(256, 182, 36, 44, 18, 4) +
					house(302, 182, 36, 48, 18, 4) +
					house(348, 182, 36, 44, 18, 4),
				strength: 1
			},
			{
				d: rect(266, 152, 16, 30) + rect(312, 148, 16, 34) + rect(358, 152, 16, 30),
				strength: 1,
				cut: true
			}
		]
	},
	// An igloo, warm light in its door
	aurora: {
		shapes: [
			GROUND,
			{ d: 'M258 186a60 60 0 0 1 120 0Z', strength: 0.95 },
			{ d: 'M300 186v-14a18 18 0 0 1 36 0v14Z', strength: 1, cut: true }
		],
		lines: [
			{
				d: 'M270 160h96M262 172h112M286 146h64M318 128v18M296 146v14M340 146v14M284 160v12M352 160v12',
				strength: 0.35
			}
		]
	},
	// A house with a porch, pumpkins on the steps
	autumn: {
		shapes: [
			GROUND,
			{ d: house(276, 186, 88, 52, 32, 10), strength: 1 },
			{ d: rect(272, 152, 96, 5) + rect(276, 157, 4, 29) + rect(360, 157, 4, 29), strength: 1 },
			{
				d: rect(312, 160, 16, 26) + rect(290, 144, 14, 0) + rect(334, 128, 14, 14),
				strength: 1,
				cut: true
			},
			{ d: disc(262, 178, 9) + disc(380, 180, 7), strength: 0.9 }
		]
	}
};
