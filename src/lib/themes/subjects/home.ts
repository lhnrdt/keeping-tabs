// A shared home (#327): where you live together, in each theme its own way.
import type { ThemeId } from '../palettes';
import type { Scene } from '../scenes';
import { disc, GROUND, house, pine, rect, rounded, steam, WATER, waves } from '../draw';

export const HOME: Record<ThemeId, Scene> = {
	// A log cabin built from the forest's own timber, a woodpile by the door, smoke rising
	forest: {
		backdrop: {
			shapes: [
				{
					d: 'M214 82L237.21 125.68H190.79ZM214 106.96L244.7 152.72H183.3ZM214 134.0L251.44 177.68H176.56ZM209.84 175.6h8.32V186h-8.32ZM238 68L264.34 117.56H211.66ZM238 96.32L272.83 148.24H203.17ZM238 127.0L280.48 176.56H195.52ZM233.28 174.2h9.44V186h-9.44ZM262 90L283.43 130.32H240.57ZM262 113.04L290.34 155.28H233.66ZM262 138.0L296.56 178.32H227.44ZM258.16 176.4h7.68V186h-7.68ZM380 76L404.55 122.2H355.45ZM380 102.4L412.47 150.8H347.53ZM380 131.0L419.6 177.2H340.4ZM375.6 175.0h8.8V186h-8.8ZM404 58L432.57 111.76H375.43ZM404 88.72L441.79 145.04H366.21ZM404 122.0L450.08 175.76H357.92ZM398.88 173.2h10.24V186h-10.24ZM354 88L375.87 129.16H332.13ZM354 111.52L382.93 154.64H325.07ZM354 137.0L389.28 178.16H318.72ZM350.08 176.2h7.84V186h-7.84Z',
					strength: 0.4
				}
			]
		},
		shapes: [
			GROUND,
			{ d: pine(240, 186, 64) + pine(398, 186, 80), strength: 0.5 },
			{ d: rect(348, 104, 11, 30), strength: 1 },
			{ d: house(282, 186, 92, 52, 40, 10), strength: 1 },
			{
				d:
					rect(282, 146, 8, 2) +
					rect(306, 146, 44, 2) +
					rect(366, 146, 8, 2) +
					rect(282, 172, 36, 2) +
					rect(338, 172, 36, 2),
				strength: 1,
				cut: true
			},
			{
				d: rect(318, 154, 20, 32) + rect(290, 140, 16, 16) + rect(350, 140, 16, 16),
				strength: 1,
				cut: true
			},
			{
				d:
					rect(297, 140, 2, 16) +
					rect(290, 147, 16, 2) +
					rect(357, 140, 2, 16) +
					rect(350, 147, 16, 2),
				strength: 1
			},
			{
				d:
					disc(252, 180, 6) +
					disc(264, 180, 6) +
					disc(276, 180, 6) +
					disc(258, 170, 6) +
					disc(270, 170, 6),
				strength: 0.85
			},
			{
				d:
					disc(252, 180, 2) +
					disc(264, 180, 2) +
					disc(276, 180, 2) +
					disc(258, 170, 2) +
					disc(270, 170, 2),
				strength: 1,
				cut: true
			}
		],
		lines: [{ d: steam(353, 96, 22), strength: 0.7, motion: 'rise' }]
	},
	// The red boathouse on short stilts, a boat nosing out of its door onto the fjord
	fjord: {
		backdrop: {
			shapes: [
				{ d: 'M206 182Q300 50 400 182Z', strength: 0.3 },
				{ d: 'M200 182V176Q300 170 400 174V182Z', strength: 0.45 },
				{ d: 'M224 176v-6l4-3 4 3v6ZM238 176v-5l3-3 3 3v5Z', strength: 0.6 }
			]
		},
		shapes: [
			WATER,
			{ d: house(262, 176, 96, 58, 36, 10), strength: 1 },
			{ d: 'M294 176v-34q0-8 8-8h20q8 0 8 8v34Z', strength: 1, cut: true },
			{ d: rect(305, 102, 14, 12), strength: 1, cut: true },
			{ d: rect(268, 176, 4, 18) + rect(348, 176, 4, 18), strength: 0.9 },
			{ d: 'M290 186l8-10h28l4 10q-8 6-20 6t-20-6Z', strength: 0.85, motion: 'rock' },
			{ d: rect(358, 168, 42, 6), strength: 1 },
			{ d: rect(372, 174, 3, 22) + rect(394, 174, 3, 22), strength: 0.9 },
			{ d: 'M230 200q2-16 16-18q14 0 18 18ZM250 200q4-10 14-10t12 10Z', strength: 0.95 }
		],
		lines: [{ d: waves(280, 194, 1) + waves(334, 197, 1), strength: 0.5, motion: 'flow' }]
	},
	// A hut on the ridge, skis in the rack, smoke rising
	mountains: {
		backdrop: {
			shapes: [
				{ d: 'M200 150L250 80L300 140L340 74L400 150Z', strength: 0.3 },
				{
					d: 'M250 80L264 98L256 94L250 102L244 94L236 98ZM340 74L356 94L346 90L340 98L334 90L324 94Z',
					strength: 1,
					snow: true
				},
				{ d: 'M282 150Q300 122 318 150Z', strength: 1, snow: true }
			]
		},
		shapes: [
			{ d: 'M214 200L296 152L348 160L400 138V200Z', strength: 0.95 },
			{ d: rect(336, 112, 10, 30), strength: 1 },
			{ d: house(294, 162, 64, 34, 24, 8), strength: 1 },
			{ d: 'M286 130L326 104L366 130L360 132L326 110L292 132Z', strength: 1, snow: true },
			{
				d: rect(318, 142, 16, 20) + rect(302, 136, 10, 10) + rect(342, 136, 10, 10),
				strength: 1,
				cut: true
			},
			{ d: rect(370, 118, 3, 38) + rect(376, 116, 3, 40) + rect(384, 120, 3, 34), strength: 0.9 }
		],
		lines: [{ d: steam(341, 104), strength: 0.8, motion: 'rise' }]
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
	// A farmhouse, the washing out on the line
	meadow: {
		shapes: [
			GROUND,
			{ d: house(304, 180, 74, 48, 30, 10), strength: 1 },
			{
				d: rect(332, 150, 18, 30) + rect(312, 146, 12, 12) + rect(358, 146, 12, 12),
				strength: 1,
				cut: true
			},
			{ d: rect(238, 126, 4, 60) + rect(290, 126, 4, 60), strength: 1 },
			{ d: rect(248, 130, 14, 18) + rect(268, 130, 16, 24), strength: 0.8, motion: 'flutter' }
		],
		lines: [{ d: 'M240 128Q266 136 292 128', strength: 0.9 }]
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
	// Someone crawling out of the igloo into the night
	aurora: {
		shapes: [
			GROUND,
			{ d: 'M258 186a60 60 0 0 1 120 0Z', strength: 0.95 },
			{ d: 'M300 186v-14a18 18 0 0 1 36 0v14Z', strength: 1, cut: true },
			{ d: disc(318, 172, 8) + 'M306 186q0-8 12-8t12 8Z', strength: 1 }
		],
		lines: [
			{
				d: 'M270 160h96M262 172h34M340 172h34M286 146h64M318 128v18M296 146v14M340 146v14',
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
