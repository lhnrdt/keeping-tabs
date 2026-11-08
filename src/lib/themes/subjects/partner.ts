// Two people (#327): a couple, in each theme its own way.
import type { ThemeId } from '../palettes';
import { reflected, type Scene, type Shape } from '../scenes';
import {
	disc,
	figure,
	fire,
	GROUND,
	heart,
	hull,
	limb,
	person,
	pine,
	rect,
	seated,
	sitting,
	star,
	tri,
	WATER
} from '../draw';

/** Two in a boat, on the water at y 160 */
const BOAT_FOR_TWO: Shape[] = [
	{ d: seated(300, 150, 52) + seated(335, 150, 48), strength: 1 },
	{ d: hull(270, 160, 100, 14), strength: 1 }
];
/** ...and their oars, dipping in (not reflected: they're in the water) */
const OARS: Shape[] = [
	{ d: limb(284, 152, 254, 166, 2.5) + limb(356, 152, 386, 166, 2.5), strength: 0.9 },
	{ d: 'M248 162l-6 6 4 3 6-6ZM392 162l6 6-4 3-6-6Z', strength: 0.9 }
];

export const PARTNER: Record<ThemeId, Scene> = {
	// Two at the top of the fire lookout, above the pines, watching the sun go down
	forest: {
		backdrop: {
			shapes: [
				{ d: 'M200 186C250 150 320 144 400 150V186Z', strength: 0.25 },
				{
					d: 'M212 150L220.93 166.8H203.07ZM212 159.6L223.81 177.2H200.19ZM212 170.0L226.4 186.8H197.6ZM210.4 186.0h3.2V190h-3.2ZM228 144L238.27 163.32H217.73ZM228 155.04L241.58 175.28H214.42ZM228 167.0L244.56 186.32H211.44ZM226.16 185.4h3.68V190h-3.68ZM244 150L252.93 166.8H235.07ZM244 159.6L255.81 177.2H232.19ZM244 170.0L258.4 186.8H229.6ZM242.4 186.0h3.2V190h-3.2ZM260 146L269.82 164.48H250.18ZM260 156.56L272.99 175.92H247.01ZM260 168.0L275.84 186.48H244.16ZM258.24 185.6h3.52V190h-3.52ZM276 152L284.48 167.96H267.52ZM276 161.12L287.22 177.84H264.78ZM276 171.0L289.68 186.96H262.32ZM274.48 186.2h3.04V190h-3.04ZM292 148L301.37 165.64H282.63ZM292 158.08L304.4 176.56H279.6ZM292 169.0L307.12 186.64H276.88ZM290.32 185.8h3.36V190h-3.36ZM368 146L377.82 164.48H358.18ZM368 156.56L380.99 175.92H355.01ZM368 168.0L383.84 186.48H352.16ZM366.24 185.6h3.52V190h-3.52ZM384 150L392.93 166.8H375.07ZM384 159.6L395.81 177.2H372.19ZM384 170.0L398.4 186.8H369.6ZM382.4 186.0h3.2V190h-3.2ZM400 144L410.27 163.32H389.73ZM400 155.04L413.58 175.28H386.42ZM400 167.0L416.56 186.32H383.44ZM398.16 185.4h3.68V190h-3.68Z',
					strength: 0.45
				}
			]
		},
		shapes: [
			GROUND,
			{ d: disc(254, 96, 16), strength: 0.35 },
			{ d: pine(244, 186, 62) + pine(398, 186, 80), strength: 0.5 },
			{ d: limb(302, 186, 314, 106, 4) + limb(358, 186, 346, 106, 4), strength: 1 },
			{
				d:
					limb(305, 166, 355, 136, 2.5) +
					limb(355, 166, 305, 136, 2.5) +
					rect(306, 166, 48, 3) +
					rect(309, 136, 42, 3),
				strength: 0.9
			},
			{ d: figure(320, 104, 30) + figure(338, 104, 28), strength: 1 },
			{ d: rect(306, 92, 48, 14) + rect(302, 104, 56, 4), strength: 1 },
			{
				d: tri(298, 66, 330, 50, 362, 66) + rect(308, 66, 3, 26) + rect(349, 66, 3, 26),
				strength: 1
			},
			{ d: heart(330, 34, 6), strength: 1, motion: 'pulse' }
		]
	},
	// Two in a rowing boat on mirror-calm water, mirrored in it below
	fjord: {
		backdrop: {
			shapes: [
				{ d: 'M150 160L204 58L272 160Z', strength: 0.45 },
				{ d: 'M450 160L398 54L334 160Z', strength: 0.45 },
				{ d: 'M268 160L302 112L336 160Z', strength: 0.28 },
				{ d: 'M292 100a10 10 0 1 1 20 0a10 10 0 1 1 -20 0Z', strength: 0.3 }
			]
		},
		shapes: [
			{ d: 'M-200 200V160H400V200Z', strength: 0.4 },
			...reflected(160, BOAT_FOR_TWO, 0.6),
			{ d: rect(262, 176, 116, 1.5) + rect(280, 186, 80, 1.5), strength: 1, cut: true },
			...BOAT_FOR_TWO,
			...OARS,
			{ d: heart(318, 92, 7), strength: 1, motion: 'pulse' }
		],
		lines: [{ d: 'M214 172h22M384 176h14M222 188h30', strength: 0.4, motion: 'flow' }]
	},
	// Two roped together on a snowy knife-edge ridge, against the big low sun
	mountains: {
		backdrop: {
			shapes: [
				{ d: 'M262 168a52 52 0 0 1 104 0Z', strength: 0.7 },
				{ d: 'M200 200L250 150L290 170L340 140L400 168V200Z', strength: 0.3 }
			]
		},
		shapes: [
			{ d: 'M214 200L280 162L330 134L400 176V200Z', strength: 0.95 },
			{
				d: 'M262 172L280 162L330 134L360 152L350 150L344 156L334 150L322 156L308 152L296 162L288 160Z',
				strength: 1,
				snow: true
			},
			{
				d:
					figure(296, 156, 40, { hat: 'helmet', pack: 'left' }) +
					figure(332, 136, 42, { hat: 'beanie', pack: 'left' }),
				strength: 1
			},
			{ d: heart(314, 96, 6), strength: 1, motion: 'pulse' },
			{ d: 'M372 200l6-12 10-2 8 14ZM230 200l5-8 8 1 4 7Z', strength: 1 }
		],
		lines: [{ d: 'M302 140Q316 140 328 122', strength: 1 }]
	},
	// Two under one umbrella in the moorland rain
	heather: {
		backdrop: {
			shapes: [
				{ d: 'M80 200Q220 120 380 132T560 150V200Z', strength: 0.22 },
				{ d: 'M160 200Q300 156 460 166V200Z', strength: 0.34 }
			]
		},
		shapes: [
			{ d: GROUND.d, strength: 0.6 },
			{ d: 'M296 194a28 3 0 1 0 56 0a28 3 0 1 0 -56 0Z', strength: 1, cut: true },
			{ d: figure(310, 186, 58) + limb(318, 166, 330, 170, 3.4), strength: 0.8 },
			{
				d:
					figure(348, 186, 54, { hat: 'cap' }) +
					limb(340, 158, 330, 146, 3.4) +
					limb(330, 170, 340, 166, 3.4),
				strength: 1
			},
			{ d: limb(328, 152, 328, 112, 2.4) + 'M328 152q0 6 5 6t5-6', strength: 1 },
			{
				d:
					'M282 114q46-44 92 0q-7-5-15 0q-8-5-16 0q-8-5-15 0q-8-5-16 0q-8-5-15 0q-8-5-15 0Z' +
					rect(327, 86, 2, 6),
				strength: 1
			},
			{ d: heart(352, 70, 7), strength: 1, motion: 'pulse' },
			{
				d:
					disc(376, 198, 10) +
					disc(390, 194, 12) +
					disc(402, 198, 9) +
					disc(222, 199, 8) +
					disc(236, 197, 9),
				strength: 1
			},
			{
				d:
					disc(382, 190, 1.6) +
					disc(392, 186, 1.6) +
					disc(398, 192, 1.6) +
					disc(228, 192, 1.4) +
					disc(240, 191, 1.4),
				strength: 1,
				cut: true
			}
		],
		lines: [
			{
				d: 'M240 70l-4 10M262 96l-4 10M226 128l-4 10M282 60l-4 10M386 90l-4 10M392 136l-4 10M250 152l-4 10M370 50l-4 10',
				strength: 0.45,
				motion: 'flow'
			}
		]
	},
	// Two carving a heart into a birch
	birch: {
		shapes: [
			GROUND,
			{ d: 'M318 0h40l4 200h-48Z', strength: 0.9 },
			{ d: heart(338, 104, 12), strength: 1, cut: true, motion: 'pulse' },
			{ d: 'M318 40l10 3-10 3ZM362 70l-12 3 12 3ZM316 160l12 3-12 3Z', strength: 1, cut: true },
			{ d: person(272, 186, 62) + person(300, 186, 58), strength: 1 }
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
