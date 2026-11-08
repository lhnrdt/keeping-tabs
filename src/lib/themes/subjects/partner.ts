// Two people (#327): a couple, in each theme its own way.
import type { ThemeId } from '../palettes';
import { reflected, type Scene, type Shape, curtain, rays } from '../scenes';
import {
	disc,
	figure,
	GROUND,
	heart,
	hull,
	limb,
	person,
	pine,
	rect,
	rounded,
	seated,
	tri,
	waves
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
	// Their initials in a heart, carved into the big birch, the two of them close by
	birch: {
		backdrop: {
			shapes: [
				{
					d:
						disc(225.6, 22, 11.4) +
						disc(229.6, 33, 9.2) +
						disc(231.4, 44, 11.2) +
						disc(225.8, 55, 11.3) +
						disc(223.9, 66, 11.0) +
						disc(221.0, 77, 9.7) +
						disc(232.4, 88, 11.2) +
						disc(220.4, 99, 11.4) +
						disc(225.1, 110, 10.4) +
						disc(266.4, 22, 11.5) +
						disc(269.5, 33, 11.7) +
						disc(262.0, 44, 10.8) +
						disc(266.9, 55, 11.2) +
						disc(257.9, 66, 10.3) +
						disc(266.4, 77, 9.0) +
						disc(263.3, 88, 9.8) +
						disc(264.7, 99, 10.9) +
						disc(268.8, 110, 10.7) +
						disc(292.7, 22, 9.3) +
						disc(293.0, 33, 10.2) +
						disc(292.2, 44, 10.8) +
						disc(296.9, 55, 11.2) +
						disc(288.9, 66, 11.4) +
						disc(289.1, 77, 10.5) +
						disc(294.9, 88, 11.1) +
						disc(293.1, 99, 9.1) +
						disc(296.7, 110, 9.5),
					strength: 0.7
				},
				{
					d: rect(226, 0, 2.5, 186) + rect(262, 0, 2, 186) + rect(292, 0, 2.5, 186),
					strength: 1,
					snow: true
				}
			]
		},
		shapes: [
			{ d: GROUND.d, strength: 0.6 },
			{ d: 'M334 0H376V186L382 192H328L334 186Z', strength: 1, snow: true },
			{
				d: 'M334 11.3l12.0 1.1l-12.0 1.1ZM376 28.0l-14.1 1.4l14.1 1.4ZM334 37.5l12.9 1.45l-12.9 1.45ZM376 50.1l-15.4 1.4l15.4 1.4ZM334 64.6l13.3 1.1l-13.3 1.1ZM376 71.6l-15.1 1.1l15.1 1.1ZM334 88.0l14.4 1.05l-14.4 1.05ZM376 101.5l-10.7 1.5l10.7 1.5ZM334 114.4l11.9 1.45l-11.9 1.45ZM376 125.9l-11.3 1.4l11.3 1.4ZM334 133.5l16.3 1.4l-16.3 1.4ZM376 152.8l-10.8 1.2l10.8 1.2ZM334 162.3l14.3 1.1l-14.3 1.1ZM376 176.9l-15.8 1.2l15.8 1.2Z',
				strength: 0.75
			},
			{
				d: 'M326 192l2-8 2 8ZM330 192l3-10 1 10ZM378 192l2-9 2 9ZM382 192l3-7 1 7Z',
				strength: 0.9
			},
			{ d: heart(354, 132, 11), strength: 1 },
			{ d: heart(354, 132, 7.5), strength: 1, snow: true },
			{ d: figure(320, 186, 56, { hat: 'cap' }) + limb(326, 152, 338, 136, 3.4), strength: 1 },
			{ d: figure(288, 186, 50), strength: 0.8 },
			{ d: heart(304, 112, 5), strength: 0.8, motion: 'pulse' }
		]
	},
	// Lying in the grass, heads together, a cloud drifting by in the shape of a heart
	meadow: {
		backdrop: {
			shapes: [
				{ d: 'M60 186Q220 136 460 148V186Z', strength: 0.22 },
				{ d: 'M150 186Q300 158 470 166V186Z', strength: 0.34 }
			]
		},
		shapes: [
			{ d: GROUND.d, strength: 0.5 },
			{ d: heart(306, 90, 20), strength: 0.45, motion: 'drift' },
			{ d: rounded(232.4, 172.5, 62.1, 13.5, 6.8) + disc(302.6, 176.6, 10), strength: 1 },
			{ d: rounded(321.5, 172.5, 62.1, 13.5, 6.8) + disc(316.1, 171.2, 10), strength: 0.8 },
			{
				d: limb(291.8, 175.2, 302.6, 164.4, 4.1) + limb(324.2, 175.2, 313.4, 161.7, 4.1),
				strength: 0.9
			},
			{ d: limb(300, 178, 296, 146, 3.4), strength: 1 },
			{
				d: disc(230, 182, 2.5) + disc(240, 180, 2.5) + disc(380, 181, 2.5) + disc(392, 183, 2.5),
				strength: 1
			}
		],
		lines: [
			{
				d: 'M220 186l-2-10M228 186l1-12M236 186l3-10M376 186l-2-11M388 186l2-12M396 186l-1-10',
				strength: 0.8,
				motion: 'sway'
			}
		]
	},
	// At the end of the jetty, the sun going down into the sea, the two of them side by side
	coast: {
		backdrop: {
			shapes: [{ d: 'M-200 186V166H400V186Z', strength: 0.36 }],
			lines: [{ d: 'M342 172h40M350 178h24M356 184h12', strength: 0.5, motion: 'shimmer' }]
		},
		shapes: [
			{ d: 'M338 166a24 24 0 0 1 48 0Z', strength: 0.5 },
			{
				d:
					rect(196, 172, 140, 5) +
					rect(214, 177, 4, 23) +
					rect(260, 177, 4, 23) +
					rect(306, 177, 4, 23),
				strength: 1
			},
			{ d: seated(290, 172, 44) + seated(310, 172, 40), strength: 1 },
			{
				d:
					limb(287, 170, 293, 186, 3) +
					limb(293, 170, 298, 186, 3) +
					limb(307, 170, 312, 185, 3) +
					limb(313, 170, 318, 185, 3),
				strength: 1
			},
			{ d: heart(300, 116, 7), strength: 1, motion: 'pulse' }
		],
		lines: [{ d: waves(340, 192, 2, 14), strength: 0.5, motion: 'flow' }]
	},
	// From behind them on the bench, one blanket round both, the lights low over the far shore and its reflection
	aurora: {
		backdrop: {
			night: true,
			shapes: [
				{ d: curtain(200, 400, 96, 20, 30), strength: 0.3, motion: 'shimmer' },
				{ d: 'M190 150Q250 136 300 144T410 140V154H190Z', strength: 0.32 },
				{ d: 'M190 154H410V200H190Z', strength: 0.1 },
				{ d: curtain(200, 400, 172, 8, 12), strength: 0.14, motion: 'shimmer' }
			],
			lines: [{ d: rays(200, 400, 96, 20, 30), strength: 0.6, motion: 'shimmer' }],
			dots: [
				[226, 30, 1.6, 0.8],
				[300, 18, 1.2, 0.8],
				[386, 26, 1.4, 0.8],
				[246, 70, 1.2, 0.8]
			]
		},
		shapes: [
			{ d: disc(282, 134, 12) + disc(326, 136, 11), strength: 1 },
			{ d: 'M254 186Q254 150 282 146L304 156L326 148Q356 150 356 186Z', strength: 0.85 },
			{
				d:
					rect(236, 170, 140, 6) +
					rect(236, 182, 140, 6) +
					rect(246, 188, 6, 12) +
					rect(360, 188, 6, 12),
				strength: 1
			},
			{ d: heart(304, 112, 7), strength: 1, motion: 'pulse' }
		]
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
