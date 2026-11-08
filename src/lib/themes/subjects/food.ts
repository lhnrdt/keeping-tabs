// Eating together (#327): food and drink, in each theme its own way.
import type { ThemeId } from '../palettes';
import type { Scene } from '../scenes';
import { disc, GROUND, rect, rounded, sitting, steam, tri, WATER } from '../draw';

export const FOOD: Record<ThemeId, Scene> = {
	// A pot on the table, steaming
	forest: {
		shapes: [
			GROUND,
			{ d: rect(256, 158, 108, 7), strength: 1 },
			{ d: rect(270, 165, 7, 21) + rect(343, 165, 7, 21), strength: 0.9 },
			{ d: 'M282 118h56v30q0 10-10 10h-36q-10 0-10-10Z', strength: 1 },
			{ d: rect(276, 110, 68, 7), strength: 1 },
			{ d: rect(272, 126, 10, 7) + rect(338, 126, 10, 7), strength: 1 },
			{ d: rect(298, 130, 24, 5), strength: 1, cut: true }
		],
		lines: [{ d: steam(294, 100) + steam(326, 100), strength: 0.8, motion: 'rise' }]
	},
	// Fishing from the jetty, a fish on the line
	fjord: {
		shapes: [
			WATER,
			{ d: rect(224, 170, 120, 8), strength: 1 },
			{ d: sitting(300, 170, 50), strength: 1 },
			{ d: 'M360 132q14-10 26 0q-12 10-26 0ZM386 132l8-7v14Z', strength: 1, motion: 'bob' }
		],
		lines: [
			{ d: 'M312 140Q350 80 374 96', strength: 0.9 },
			{ d: 'M374 96V128', strength: 0.6 }
		]
	},
	// Fondue in a mountain hut
	mountains: {
		shapes: [
			GROUND,
			{ d: rect(250, 160, 140, 7), strength: 1 },
			{ d: rect(262, 167, 7, 19) + rect(371, 167, 7, 19), strength: 0.9 },
			{ d: 'M290 120h52v20q0 16-26 16t-26-16Z', strength: 1 },
			{ d: tri(306, 160, 316, 142, 326, 160), strength: 0.8, motion: 'flicker' },
			{ d: disc(366, 146, 14), strength: 0.85 },
			{ d: disc(362, 142, 3) + disc(370, 150, 2.5), strength: 1, cut: true }
		],
		lines: [{ d: 'M272 98L304 128M360 96L330 128', strength: 0.9 }]
	},
	// Tea for two: the pot, and a cup each
	heather: {
		shapes: [
			GROUND,
			{ d: 'M286 186q-10-46 32-46t32 46Z', strength: 1 },
			{ d: rounded(296, 128, 44, 12, 5) + disc(318, 124, 5), strength: 1 },
			{ d: 'M290 164q-18 0-24-22l7-2q5 16 17 16Z', strength: 1 },
			{ d: 'M350 150a14 14 0 1 1 0 26v-6a8 8 0 1 0 0-14Z', strength: 1 },
			{ d: rect(296, 160, 44, 5), strength: 1, cut: true },
			{ d: rounded(240, 168, 24, 18, 4) + rounded(374, 168, 22, 18, 4), strength: 0.85 }
		],
		lines: [{ d: steam(252, 160, 16) + steam(266, 136, 18), strength: 0.7, motion: 'rise' }]
	},
	// A basket of berries and a jar of jam
	birch: {
		shapes: [
			GROUND,
			{ d: 'M252 152h84l-10 34h-64Z', strength: 1 },
			{ d: 'M262 160h64M266 170h56', strength: 1, cut: true },
			{
				d: disc(270, 148, 7) + disc(288, 144, 8) + disc(306, 146, 7) + disc(322, 148, 7),
				strength: 0.8
			},
			{ d: rounded(348, 136, 36, 50, 6), strength: 1 },
			{ d: rect(344, 130, 44, 8), strength: 0.85 },
			{ d: rect(354, 152, 24, 14), strength: 1, cut: true }
		]
	},
	// A picnic basket, bread and a bottle
	meadow: {
		shapes: [
			GROUND,
			{ d: rect(260, 146, 70, 40), strength: 1 },
			{ d: 'M270 146a25 25 0 0 1 50 0h-6a19 19 0 0 0-38 0Z', strength: 1 },
			{ d: rect(266, 160, 58, 4) + rect(266, 172, 58, 4), strength: 1, cut: true },
			{ d: 'M346 186v-40q0-8 6-12v-14h8v14q6 4 6 12v40Z', strength: 0.9 },
			{ d: 'M332 186l52-26q6-2 8 3l-50 27Z', strength: 0.8 }
		]
	},
	// Ice cream on the beach
	coast: {
		shapes: [
			GROUND,
			{ d: tri(282, 186, 270, 140, 294, 140) + tri(346, 186, 334, 136, 358, 136), strength: 0.85 },
			{ d: disc(282, 132, 13) + disc(282, 114, 10) + disc(346, 126, 13), strength: 1 },
			{ d: 'M274 146l16 0M338 142l16 0', strength: 1, cut: true }
		]
	},
	// Hot chocolate in the cold
	aurora: {
		shapes: [
			GROUND,
			{ d: rounded(266, 136, 40, 50, 6) + rounded(326, 140, 36, 46, 6), strength: 1 },
			{
				d: 'M306 148q14 0 14 12t-14 12v-6q8 0 8-6t-8-6ZM362 152q12 0 12 11t-12 11v-6q6 0 6-5t-6-5Z',
				strength: 1
			},
			{ d: rect(274, 144, 24, 8), strength: 1, cut: true }
		],
		lines: [{ d: steam(286, 126) + steam(344, 130), strength: 0.8, motion: 'rise' }]
	},
	// An apple pie, apples around it
	autumn: {
		shapes: [
			GROUND,
			{ d: 'M258 186l6-14h108l6 14Z', strength: 0.85 },
			{ d: 'M266 172q4-28 52-28t52 28Z', strength: 1 },
			{
				d:
					rect(270, 160, 96, 4) +
					rect(284, 150, 70, 4) +
					rect(294, 146, 4, 26) +
					rect(316, 144, 4, 28) +
					rect(338, 146, 4, 26),
				strength: 1,
				cut: true
			},
			{ d: disc(254, 178, 9) + disc(384, 176, 10), strength: 0.85 }
		],
		lines: [{ d: steam(306, 140) + steam(330, 140), strength: 0.8, motion: 'rise' }]
	}
};
