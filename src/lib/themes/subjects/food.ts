// Eating together (#327): food and drink, in each theme its own way.
import type { ThemeId } from '../palettes';
import type { Scene } from '../scenes';
import {
	disc,
	figure,
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
	// Close up: a steaming mug held up in a mittened hand, the snowy peaks beyond
	mountains: {
		backdrop: {
			shapes: [
				{ d: 'M120 200L210 98L258 146L280 128L330 200ZM330 200L392 92L460 200Z', strength: 0.35 },
				{
					d: 'M210 98L228 120L218 116L210 124L202 116L192 120ZM392 92L404 108L396 105L392 112L388 105L380 108Z',
					strength: 1,
					snow: true
				},
				{ d: 'M-200 200V176Q100 170 400 174V200Z', strength: 1, snow: true }
			]
		},
		shapes: [
			{ d: 'M300 112h52v58q0 14-14 14h-24q-14 0-14-14Z', strength: 0.7 },
			{ d: 'M352 124q22 0 22 20t-22 20v-8q12 0 12-12t-12-12Z', strength: 0.7 },
			{ d: 'M302 113a24 6 0 1 0 48 0a24 6 0 1 0 -48 0Z', strength: 1, cut: true },
			{ d: 'M306 114a20 4 0 1 0 40 0a20 4 0 1 0 -40 0Z', strength: 0.5 },
			{ d: limb(226, 230, 274, 186, 36), strength: 0.55 },
			{ d: limb(268, 192, 282, 178, 34), strength: 0.75 },
			{ d: rounded(282, 144, 48, 38, 15), strength: 1 },
			{ d: limb(290, 150, 324, 140, 12), strength: 1 }
		],
		lines: [
			{
				d: steam(316, 98, 26) + steam(330, 94, 30) + steam(342, 98, 24),
				strength: 0.8,
				motion: 'rise'
			}
		]
	},
	// Bilberry picking: a brimming basket close up, a picker among the heather behind
	heather: {
		backdrop: {
			shapes: [
				{ d: 'M80 200Q220 128 400 140T560 150V200Z', strength: 0.24 },
				{ d: 'M140 200Q260 160 420 170V200Z', strength: 0.38 }
			]
		},
		shapes: [
			{ d: GROUND.d, strength: 0.6 },
			{
				d: figure(258, 186, 44, { hat: 'beanie' }) + limb(264, 160, 270, 168, 3.2),
				strength: 0.75
			},
			{ d: 'M266 172h12l-1 10h-10Z' + 'M267 172q5-8 10 0h-1.6q-3.4-5.5-6.8 0Z', strength: 0.75 },
			{
				d:
					disc(221.0, 188.0, 3) +
					disc(227.0, 181.7, 4) +
					disc(233.0, 177.7, 4) +
					disc(239.0, 177.7, 4) +
					disc(245.0, 181.7, 4) +
					disc(251.0, 188.0, 3) +
					'M221.0 188Q236 171.2 251.0 188Z' +
					disc(273.0, 188.0, 3) +
					disc(279.8, 180.6, 4) +
					disc(286.6, 176.0, 4) +
					disc(293.4, 176.0, 4) +
					disc(300.2, 180.6, 4) +
					disc(307.0, 188.0, 3) +
					'M273.0 188Q290 168.4 307.0 188Z',
				strength: 0.85
			},
			{
				d:
					disc(226, 180, 1.4) +
					disc(236, 177, 1.4) +
					disc(246, 180, 1.4) +
					disc(280, 179, 1.4) +
					disc(290, 175, 1.4) +
					disc(300, 179, 1.4),
				strength: 1,
				cut: true
			},
			{ d: 'M306 160q42-80 84 0h-6q-36-68-72 0Z', strength: 0.85 },
			{
				d:
					disc(312, 154, 7.0) +
					disc(323, 155, 6.4) +
					disc(334, 154, 5.8) +
					disc(345, 155, 7.0) +
					disc(356, 154, 6.4) +
					disc(367, 155, 5.8) +
					disc(378, 154, 7.0) +
					disc(389, 155, 6.4) +
					disc(324, 144, 7.0) +
					disc(336, 146, 6.2) +
					disc(348, 144, 7.0) +
					disc(360, 146, 6.2) +
					disc(372, 144, 7.0) +
					disc(342, 135, 6.5) +
					disc(357, 136, 6) +
					disc(290, 197, 4.5) +
					disc(280, 199, 4),
				strength: 1
			},
			{
				d:
					disc(309.5, 151.5, 1.4) +
					disc(325, 152.5, 1.4) +
					disc(332.5, 151, 1.4) +
					disc(347.5, 153, 1.4) +
					disc(353, 152.5, 1.4) +
					disc(364.5, 152.5, 1.4) +
					disc(380, 151.5, 1.4) +
					disc(387.5, 152, 1.4) +
					disc(326.5, 142, 1.4) +
					disc(333, 144.5, 1.4) +
					disc(345.5, 141.5, 1.4) +
					disc(362, 143.5, 1.4) +
					disc(370.5, 141, 1.4) +
					disc(344.5, 133, 1.4) +
					disc(354, 134.5, 1.4) +
					disc(287.5, 194.5, 1.4) +
					disc(282, 196.5, 1.4),
				strength: 1,
				cut: true
			},
			{ d: 'M300 156h96l-9 50h-78Z', strength: 0.7 },
			{ d: rect(304, 170, 88, 2) + rect(306, 184, 84, 2), strength: 1, cut: true }
		]
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
