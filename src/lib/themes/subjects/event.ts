// Something's on (#327): a party or an event, in each theme its own way.
import type { ThemeId } from '../palettes';
import type { Scene } from '../scenes';
import {
	disc,
	figure,
	flag,
	flame,
	GROUND,
	logs,
	person,
	pine,
	rect,
	rounded,
	seated,
	tri,
	wheel
} from '../draw';

const BULBS: [number, number][] = [
	[270, 92],
	[292, 104],
	[316, 110],
	[340, 106],
	[362, 96]
];

export const EVENT: Record<ThemeId, Scene> = {
	// A wide clearing at night: friends round the campfire, lights strung high between the pines
	forest: {
		backdrop: {
			shapes: [{ d: 'M210 0h12v186h-12ZM260 0h8v186h-8ZM378 0h10v186h-10Z', strength: 0.3 }]
		},
		shapes: [
			GROUND,
			{ d: pine(230, 186, 120) + pine(400, 186, 124), strength: 0.55 },
			{
				d:
					seated(268, 186, 40) +
					seated(290, 186, 36) +
					seated(346, 186, 38, { hat: 'beanie' }) +
					seated(368, 186, 40),
				strength: 1
			},
			{ d: logs(318, 186, 22), strength: 0.9 },
			{ d: flame(312, 181, 16) + flame(324, 181, 22), strength: 1, motion: 'flicker' }
		],
		lines: [{ d: 'M236 80Q318 140 396 76', strength: 0.7 }],
		dots: [
			[256, 94, 4, 1],
			[280, 106, 4, 1],
			[306, 112, 4, 1],
			[332, 112, 4, 1],
			[358, 104, 4, 1],
			[380, 92, 4, 1],
			[316, 150, 1.5, 0.8],
			[324, 142, 1.2, 0.7]
		]
	},
	// Midsummer by the fjord: the pole wrapped in leaves, wreaths hanging, dancers round it
	fjord: {
		backdrop: {
			shapes: [
				{ d: 'M200 186Q250 156 300 174T400 162V186Z', strength: 0.35 },
				{ d: 'M210 186Q270 168 330 180T400 176V186Z', strength: 0.5 }
			]
		},
		shapes: [
			GROUND,
			{ d: disc(252, 92, 13), strength: 0.35 },
			{ d: rect(316, 48, 6, 138) + rect(290, 76, 58, 5), strength: 1 },
			{
				d: [58, 70, 82, 94, 106, 118, 130, 142, 154, 166]
					.map(
						(y, i) =>
							`M${i % 2 ? 322 : 316} ${y}q${i % 2 ? 9 : -9} -2 ${i % 2 ? 10 : -10} 6q${i % 2 ? -7 : 7} 2 ${i % 2 ? -10 : 10} -6Z`
					)
					.join(''),
				strength: 0.9
			},
			{
				d: [0, 1, 2, 3, 4, 5, 6, 7]
					.map(
						(i) =>
							disc(296 + 10 * Math.cos(i * 0.785), 100 + 10 * Math.sin(i * 0.785), 3.6) +
							disc(342 + 10 * Math.cos(i * 0.785), 100 + 10 * Math.sin(i * 0.785), 3.6)
					)
					.join(''),
				strength: 1,
				motion: 'sway'
			},
			{ d: 'M294 110l-3 12 4-1 2 3ZM340 110l-3 12 4-1 2 3Z', strength: 0.8, motion: 'flutter' },
			{ d: figure(258, 186, 38) + figure(360, 186, 46), strength: 1 },
			{
				d:
					figure(282, 186, 44) +
					'M274 186l4-18h8l4 18Z' +
					figure(384, 186, 40) +
					'M376 186l4-16h8l4 16Z',
				strength: 0.9
			},
			{
				d:
					disc(306, 184, 3) +
					disc(312, 182, 3) +
					disc(328, 182, 3) +
					disc(334, 184, 3) +
					disc(240, 184, 4) +
					disc(398, 185, 4),
				strength: 0.8
			}
		],
		lines: [{ d: 'M264 164l12 0M366 164l12 0', strength: 0.9 }]
	},
	// Everyone on the summit together, flags out
	mountains: {
		shapes: [
			{ d: 'M214 200L318 132L400 170V200Z', strength: 0.95 },
			{ d: 'M290 150L318 132L346 150L334 146L326 154L318 146L306 152Z', strength: 1, snow: true },
			{
				d:
					person(290, 156, 34) + person(310, 140, 36) + person(332, 142, 36) + person(352, 156, 34),
				strength: 1
			},
			{ d: flag(300, 108, 30, 14) + flag(344, 112, 28, 13), strength: 1, motion: 'flutter' }
		],
		lines: [{ d: 'M296 128l-10-14M346 132l12-14', strength: 0.9 }]
	},
	// A festival marquee, its flags flying
	heather: {
		shapes: [
			GROUND,
			{ d: 'M248 186V146L288 116L318 136L348 116L388 146V186Z', strength: 1 },
			{ d: 'M302 186v-28h32v28Z', strength: 1, cut: true },
			{ d: 'M288 116V92l14 5-14 5ZM348 116V92l14 5-14 5Z', strength: 1, motion: 'flutter' }
		]
	},
	// Balloons and bunting
	birch: {
		shapes: [
			GROUND,
			{ d: disc(292, 100, 20), strength: 1, motion: 'bob' },
			{ d: disc(334, 88, 23), strength: 0.85, motion: 'bob-slow' },
			{
				d: 'M250 62l12 18 8-23Z M284 52l10 20 11-19Z M320 44l9 21 13-17Z M358 42l6 22 14-14Z',
				strength: 0.9
			}
		],
		lines: [
			{ d: 'M230 66Q310 36 396 40', strength: 0.8 },
			{ d: 'M292 120q6 30-2 66', strength: 0.8, motion: 'bob' },
			{ d: 'M334 111q-6 34 2 75', strength: 0.8, motion: 'bob-slow' }
		]
	},
	// A cake on the table, candles lit
	meadow: {
		shapes: [
			GROUND,
			{ d: rect(256, 160, 128, 7), strength: 1 },
			{ d: rect(268, 167, 7, 19) + rect(365, 167, 7, 19), strength: 0.9 },
			{ d: rounded(282, 128, 76, 32, 4), strength: 1 },
			{ d: rounded(296, 104, 48, 24, 4), strength: 0.9 },
			{ d: rect(282, 140, 76, 4), strength: 1, cut: true },
			{ d: rect(308, 90, 3, 14) + rect(319, 88, 3, 16) + rect(330, 90, 3, 14), strength: 1 },
			{
				d: disc(309.5, 84, 3) + disc(320.5, 82, 3) + disc(331.5, 84, 3),
				strength: 1,
				motion: 'flicker'
			}
		]
	},
	// Paper lanterns along the beach
	coast: {
		shapes: [
			GROUND,
			{
				d:
					rounded(262, 92, 18, 24, 8) +
					rounded(300, 104, 18, 24, 8) +
					rounded(338, 104, 18, 24, 8) +
					rounded(372, 92, 18, 24, 8),
				strength: 1,
				motion: 'sway'
			},
			{
				d:
					rect(262, 102, 18, 3) +
					rect(300, 114, 18, 3) +
					rect(338, 114, 18, 3) +
					rect(372, 102, 18, 3),
				strength: 1,
				cut: true,
				motion: 'sway'
			}
		],
		lines: [{ d: 'M240 84Q320 118 398 84', strength: 0.8 }]
	},
	// Sky lanterns rising into the night
	aurora: {
		shapes: [
			GROUND,
			{ d: 'M272 120h20l-3 22h-14Z', strength: 1, motion: 'rise' },
			{ d: 'M316 80h24l-4 26h-16Z', strength: 0.9, motion: 'bob' },
			{ d: 'M360 108h18l-3 20h-12Z', strength: 0.8, motion: 'bob-slow' },
			{
				d: rect(278, 136, 8, 4) + rect(324, 100, 8, 4) + rect(366, 122, 6, 4),
				strength: 1,
				cut: true
			}
		]
	},
	// A Ferris wheel at the fair
	autumn: {
		shapes: [
			GROUND,
			{ d: disc(318, 104, 54), strength: 0.9 },
			{ d: disc(318, 104, 48), strength: 1, cut: true },
			{ d: tri(318, 104, 286, 186, 296, 186) + tri(318, 104, 350, 186, 340, 186), strength: 1 },
			{
				d:
					rect(310, 46, 16, 12) +
					rect(358, 98, 16, 12) +
					rect(262, 98, 16, 12) +
					rect(310, 150, 16, 12),
				strength: 1
			}
		],
		lines: [{ d: 'M318 56V152M270 104H366M284 70L352 138M352 70L284 138', strength: 0.6 }]
	}
};
