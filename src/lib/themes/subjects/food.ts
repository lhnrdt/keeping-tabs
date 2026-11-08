// Eating together (#327): food and drink, in each theme its own way.
import type { ThemeId } from '../palettes';
import type { Scene } from '../scenes';
import {
	disc,
	flame,
	GROUND,
	limb,
	logs,
	pine,
	rect,
	rounded,
	sitting,
	steam,
	tri,
	WATER
} from '../draw';

export const FOOD: Record<ThemeId, Scene> = {
	// Close up: wild mushrooms sizzling in a big pan, flames licking up its sides
	forest: {
		backdrop: {
			shapes: [
				{
					d: 'M214 30h10v156h-10ZM244 20h14v166h-14ZM372 26h12v160h-12ZM396 16h8v170h-8Z',
					strength: 0.35
				}
			]
		},
		shapes: [
			GROUND,
			{ d: pine(240, 186, 64), strength: 0.45 },
			{ d: disc(270, 184, 6) + disc(372, 184, 6), strength: 0.8 },
			{ d: logs(320, 186, 90), strength: 0.9 },
			{ d: 'M276 157h88q-6 20-26 20h-36q-20 0-26-20Z', strength: 1 },
			{ d: limb(364, 161, 396, 145, 6), strength: 1 },
			{
				d: 'M280 157a9 7 0 0 1 18 0ZM302 157a12 10 0 0 1 24 0ZM330 157a10 8 0 0 1 20 0ZM350 157a8 6 0 0 1 16 0Z',
				strength: 1
			},
			{ d: 'M287 153h4v4h-4ZM312 151h4v6h-4ZM338 153h4v4h-4Z', strength: 1, cut: true },
			{ d: flame(266, 178, 36) + flame(374, 178, 38), strength: 0.55, motion: 'flicker' },
			{ d: flame(266, 178, 16) + flame(374, 178, 18), strength: 1, cut: true, motion: 'flicker' }
		],
		lines: [
			{
				d: steam(298, 135, 22) + steam(322, 131, 24) + steam(346, 135, 22),
				strength: 0.6,
				motion: 'rise'
			}
		]
	},
	// The day's catch grilling on the jetty, someone waiting with a plate, the rod still out
	fjord: {
		backdrop: {
			shapes: [
				{ d: 'M314 116a16 16 0 1 1 32 0a16 16 0 1 1 -32 0Z', strength: 0.3 },
				{ d: 'M200 182Q260 146 320 166T400 156V182Z', strength: 0.35 }
			]
		},
		shapes: [
			WATER,
			{ d: rect(250, 170, 150, 10), strength: 1 },
			{
				d:
					rect(280, 170, 1.5, 10) +
					rect(310, 170, 1.5, 10) +
					rect(340, 170, 1.5, 10) +
					rect(370, 170, 1.5, 10),
				strength: 1,
				cut: true
			},
			{ d: rect(262, 180, 5, 16) + rect(320, 180, 5, 18) + rect(378, 180, 5, 18), strength: 0.9 },
			{ d: rect(280, 138, 64, 16) + rect(284, 154, 4, 16) + rect(336, 154, 4, 16), strength: 1 },
			{ d: rect(282, 140, 60, 4), strength: 1, cut: true },
			{
				d: 'M286 136q12-10 26 0q-12 8-26 0ZM312 136l7-6v12ZM318 136q12-10 24 0q-12 8-24 0ZM342 136l7-6v12Z',
				strength: 1
			},
			{ d: sitting(380, 170, 52, -1), strength: 1 },
			{ d: rect(354, 160, 16, 3), strength: 1 },
			{ d: limb(258, 170, 280, 72, 2.5) + rounded(258, 150, 8, 8, 3), strength: 1 },
			{ d: disc(236, 184, 3), strength: 1 }
		],
		lines: [
			{ d: 'M280 72Q246 96 236 182', strength: 0.6 },
			{ d: steam(300, 120, 18) + steam(326, 116, 18), strength: 0.6, motion: 'rise' }
		]
	},
	// Lunch on the hut's sunny terrace: mugs steaming, skis stuck in the snow in a row behind
	mountains: {
		backdrop: {
			shapes: [
				{ d: 'M170 200L262 74L330 146L372 100L440 200Z', strength: 0.3 },
				{ d: 'M262 74L280 96L270 92L262 102L254 92L244 96Z', strength: 1, snow: true }
			]
		},
		shapes: [
			{ d: 'M-200 200V170Q100 164 400 168V200Z', strength: 1, snow: true },
			{
				d: [234, 244, 254, 264, 274, 352, 362, 372, 382, 392]
					.map((x) => limb(x, 170, x + 1, 112, 3) + limb(x + 1, 112, x - 2, 106, 3))
					.join(''),
				strength: 0.75
			},
			{ d: rect(290, 92, 3, 66) + 'M262 96q30-22 60 0Z', strength: 0.85 },
			{ d: rect(268, 148, 76, 5) + rect(274, 153, 4, 17) + rect(334, 153, 4, 17), strength: 1 },
			{
				d:
					rounded(282, 138, 10, 10, 2) +
					rounded(302, 138, 10, 10, 2) +
					rounded(322, 138, 10, 10, 2),
				strength: 1
			},
			{
				d:
					rect(250, 156, 18, 4) +
					rect(256, 160, 3, 10) +
					rect(344, 156, 18, 4) +
					rect(353, 160, 3, 10),
				strength: 0.9
			},
			{ d: sitting(260, 156, 44, 1) + sitting(352, 156, 44, -1), strength: 1 }
		],
		lines: [
			{
				d: steam(287, 126, 12) + steam(307, 124, 12) + steam(327, 126, 12),
				strength: 0.7,
				motion: 'rise'
			}
		]
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
	// A pie cooling on the windowsill
	autumn: {
		shapes: [
			{ d: rect(262, 70, 112, 116), strength: 0.85 },
			{
				d: rect(274, 82, 40, 44) + rect(322, 82, 40, 44) + rect(274, 132, 88, 20),
				strength: 1,
				cut: true
			},
			{ d: rect(254, 152, 128, 8), strength: 1 },
			{ d: 'M282 152q2-20 36-20t36 20Z', strength: 1 },
			{
				d: rect(296, 140, 44, 3) + rect(306, 134, 3, 18) + rect(326, 134, 3, 18),
				strength: 1,
				cut: true
			}
		],
		lines: [{ d: steam(306, 124) + steam(330, 124), strength: 0.8, motion: 'rise' }]
	}
};
