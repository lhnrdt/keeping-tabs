// Something's on (#327): a party or an event, in each theme its own way.
import type { ThemeId } from '../palettes';
import type { Scene } from '../scenes';
import { disc, GROUND, person, pine, rect, rounded, tri } from '../draw';

const BULBS: [number, number][] = [
	[270, 92],
	[292, 104],
	[316, 110],
	[340, 106],
	[362, 96]
];

/** A firework bursting around x, y */
const burst = (x: number, y: number, r: number) =>
	Array.from({ length: 10 }, (_, i) => {
		const a = (i * Math.PI) / 5;
		const [c, s] = [Math.cos(a), Math.sin(a)];
		return `M${x + c * r * 0.4} ${y + s * r * 0.4}L${x + c * r} ${y + s * r}`;
	}).join('');

export const EVENT: Record<ThemeId, Scene> = {
	// String lights between the pines
	forest: {
		shapes: [GROUND, { d: pine(254, 186, 110) + pine(380, 186, 104), strength: 0.9 }],
		lines: [{ d: 'M254 86Q316 128 378 90', strength: 0.8 }],
		dots: BULBS.map(([x, y]) => [x, y + 4, 4, 1] as [number, number, number, number])
	},
	// A midsummer pole, wreaths hanging from it
	fjord: {
		shapes: [
			GROUND,
			{ d: rect(314, 50, 8, 136) + rect(286, 78, 64, 6), strength: 1 },
			{ d: disc(292, 100, 12) + disc(344, 100, 12), strength: 1, motion: 'sway' },
			{ d: disc(292, 100, 8) + disc(344, 100, 8), strength: 1, cut: true, motion: 'sway' },
			{ d: person(262, 186, 44) + person(374, 186, 44), strength: 0.85 }
		]
	},
	// Fireworks over the peaks
	mountains: {
		shapes: [{ d: 'M214 200L290 140L330 168L380 120L400 136V200Z', strength: 0.95 }],
		lines: [
			{ d: burst(282, 70, 26), strength: 0.9, motion: 'pulse' },
			{ d: burst(352, 56, 22), strength: 0.8, motion: 'pulse' },
			{ d: 'M282 136V100M352 116V82', strength: 0.4 }
		],
		dots: [
			[312, 92, 2.5, 0.9],
			[250, 50, 2, 0.8],
			[384, 88, 2, 0.8]
		]
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
