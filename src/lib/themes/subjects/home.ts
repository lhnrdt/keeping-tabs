// A shared home (#327): where you live together, in each theme its own way.
import type { ThemeId } from '../palettes';
import { type Scene, curtain, rays } from '../scenes';
import {
	disc,
	GROUND,
	house,
	limb,
	pine,
	rect,
	rounded,
	roundTree,
	seated,
	sparkle,
	steam,
	WATER,
	waves
} from '../draw';

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
	// A mountain hut on the ridge on its stone base, skis leaning by the door, smoke rising
	mountains: {
		backdrop: {
			shapes: [
				{ d: 'M184 200L250 80L300 140L340 74L412 200Z', strength: 0.3 },
				{
					d: 'M250 80L264 98L256 94L250 102L244 94L236 98ZM340 74L356 94L346 90L340 98L334 90L324 94Z',
					strength: 1,
					snow: true
				}
			]
		},
		shapes: [
			{ d: 'M214 200L284 168H368L400 156V200Z', strength: 0.95 },
			{ d: rect(318, 168, 16, 4), strength: 0.8 },
			{ d: rect(336, 118, 10, 30), strength: 1 },
			{ d: house(294, 168, 64, 34, 24, 8), strength: 1 },
			{ d: 'M286 136L326 110L366 136L360 139L326 116L292 139Z', strength: 1, snow: true },
			{
				d: rect(318, 148, 16, 20) + rect(302, 142, 10, 10) + rect(342, 142, 10, 10),
				strength: 1,
				cut: true
			},
			{
				d:
					limb(366, 168, 380, 122, 3) +
					limb(380, 122, 384, 117, 3) +
					limb(382, 168, 368, 122, 3) +
					limb(368, 122, 364, 117, 3),
				strength: 1
			}
		],
		lines: [{ d: steam(341, 110), strength: 0.8, motion: 'rise' }]
	},
	// The croft: a long low house with a chimney at each end, smoke bent by the wind, washing on the line
	heather: {
		backdrop: {
			shapes: [{ d: 'M120 200Q260 104 440 118V200Z', strength: 0.3 }]
		},
		shapes: [
			GROUND,
			{ d: rect(276, 110, 10, 20) + rect(364, 110, 10, 20), strength: 1 },
			{ d: rect(272, 146, 106, 40), strength: 0.8 },
			{ d: 'M266 150q2-24 22-26h74q20 2 22 26Z' + rounded(284, 120, 82, 6, 3), strength: 1 },
			{
				d: rect(290, 158, 12, 12) + rect(350, 158, 12, 12) + 'M318 186v-22q0-6 7-6t7 6v22Z',
				strength: 1,
				cut: true
			},
			{ d: rect(232, 150, 3, 36), strength: 0.9 },
			{
				d: 'M240 155h12l4 4-3 3-2-2v10h-10v-10l-2 2-3-3Z' + 'M262 157h10v15h-4v-9h-2v9h-4Z',
				strength: 0.85,
				motion: 'flutter'
			},
			{
				d:
					rect(198, 188, 204, 16) +
					'M198 189l2 -8h5l-1 8ZM205 189l3 -9h5l-2 9ZM212 189l2 -10h5l-1 10ZM219 189l3 -8h5l-2 8ZM226 189l2 -9h5l-1 9ZM233 189l3 -10h5l-2 10ZM240 189l2 -8h5l-1 8ZM247 189l3 -9h5l-2 9ZM254 189l2 -10h5l-1 10ZM261 189l3 -8h5l-2 8ZM268 189l2 -9h5l-1 9ZM275 189l3 -10h5l-2 10ZM282 189l2 -8h5l-1 8ZM289 189l3 -9h5l-2 9ZM296 189l2 -10h5l-1 10ZM303 189l3 -8h5l-2 8ZM310 189l2 -9h5l-1 9ZM317 189l3 -10h5l-2 10ZM324 189l2 -8h5l-1 8ZM331 189l3 -9h5l-2 9ZM338 189l2 -10h5l-1 10ZM345 189l3 -8h5l-2 8ZM352 189l2 -9h5l-1 9ZM359 189l3 -10h5l-2 10ZM366 189l2 -8h5l-1 8ZM373 189l3 -9h5l-2 9ZM380 189l2 -10h5l-1 10ZM387 189l3 -8h5l-2 8ZM394 189l2 -9h5l-1 9ZM401 189l3 -10h5l-2 10Z',
				strength: 1
			},
			{
				d:
					rect(198, 195, 204, 1.4) +
					rect(214, 188, 1.6, 6) +
					rect(246, 188, 1.6, 6) +
					rect(280, 188, 1.6, 6) +
					rect(312, 188, 1.6, 6) +
					rect(348, 188, 1.6, 6) +
					rect(382, 188, 1.6, 6) +
					rect(230, 196, 1.6, 6) +
					rect(264, 196, 1.6, 6) +
					rect(296, 196, 1.6, 6) +
					rect(330, 196, 1.6, 6) +
					rect(364, 196, 1.6, 6),
				strength: 1,
				cut: true
			}
		],
		lines: [
			{ d: 'M235 153L272 157', strength: 0.6 },
			{ d: 'M369 108q-6-8-18-9t-24-8M281 108q-6-8-16-9t-20-7', strength: 0.5, motion: 'rise' }
		]
	},
	// The red summer cottage with white corners, the pennant flying from the flagpole, the picket fence
	birch: {
		backdrop: {
			shapes: [
				{ d: 'M190 156Q250 120 320 132T410 122V160H190Z', strength: 0.3 },
				{ d: 'M190 156H410V166H190Z', strength: 0.2 },
				{
					d:
						rect(236, 106, 2, 44) +
						rect(248, 112, 2, 38) +
						rect(258, 116, 2, 34) +
						rect(380, 95, 2, 51) +
						rect(392, 101, 2, 45) +
						rect(402, 95, 2, 51),
					strength: 1,
					snow: true
				},
				{
					d:
						disc(239, 116, 9) +
						disc(239, 118, 6) +
						disc(236, 119, 8) +
						disc(241, 102, 7) +
						disc(249, 118, 6) +
						disc(245, 112, 9) +
						disc(251, 109, 8) +
						disc(244, 118, 6) +
						disc(262, 114, 7) +
						disc(264, 127, 7) +
						disc(264, 121, 8) +
						disc(254, 129, 8) +
						disc(384, 99, 7) +
						disc(374, 103, 7) +
						disc(383, 97, 8) +
						disc(377, 105, 8) +
						disc(392, 109, 7) +
						disc(393, 111, 7) +
						disc(396, 109, 9) +
						disc(390, 97, 8) +
						disc(401, 91, 7) +
						disc(404, 95, 9) +
						disc(403, 93, 8) +
						disc(400, 108, 9),
					strength: 0.6
				}
			],
			lines: [{ d: 'M262 160h22M300 161h30M344 160h18', strength: 0.5, motion: 'shimmer' }]
		},
		shapes: [
			{ d: GROUND.d, strength: 0.55 },
			{ d: rect(350, 112, 7, 18), strength: 1 },
			{ d: rect(292, 140, 76, 46), strength: 0.85 },
			{ d: 'M284 143L330 106L376 143Z', strength: 1 },
			{
				d:
					rect(294, 143, 3, 43) +
					rect(363, 143, 3, 43) +
					'M287 141.5L330 107L373 141.5L370 143L330 111L290 143Z' +
					rect(301.5, 148.5, 16, 1.5) +
					rect(301.5, 163, 16, 1.5) +
					rect(301.5, 148.5, 1.5, 16) +
					rect(316, 148.5, 1.5, 16) +
					rect(308.75, 150, 1.5, 13) +
					rect(303, 155.75, 13, 1.5) +
					rect(342.5, 148.5, 16, 1.5) +
					rect(342.5, 163, 16, 1.5) +
					rect(342.5, 148.5, 1.5, 16) +
					rect(357, 148.5, 1.5, 16) +
					rect(349.75, 150, 1.5, 13) +
					rect(344, 155.75, 13, 1.5) +
					'M323.5 186V159.5h15V186h-1.5V161h-12V186Z',
				strength: 1,
				cut: true
			},
			{ d: disc(251.2, 91, 2.2) + rect(250, 92, 2.4, 94), strength: 1 },
			{ d: 'M252.4 94L292 98.5L252.4 103Z', strength: 1, motion: 'flutter' },
			{
				d:
					'M204 192V180l2-3 2 3V192ZM212 192V180l2-3 2 3V192ZM220 192V180l2-3 2 3V192ZM228 192V180l2-3 2 3V192ZM236 192V180l2-3 2 3V192ZM244 192V180l2-3 2 3V192ZM252 192V180l2-3 2 3V192ZM260 192V180l2-3 2 3V192ZM268 192V180l2-3 2 3V192ZM276 192V180l2-3 2 3V192ZM284 192V180l2-3 2 3V192ZM292 192V180l2-3 2 3V192ZM300 192V180l2-3 2 3V192ZM308 192V180l2-3 2 3V192ZM316 192V180l2-3 2 3V192ZM324 192V180l2-3 2 3V192ZM332 192V180l2-3 2 3V192ZM340 192V180l2-3 2 3V192ZM348 192V180l2-3 2 3V192ZM356 192V180l2-3 2 3V192ZM364 192V180l2-3 2 3V192ZM372 192V180l2-3 2 3V192ZM380 192V180l2-3 2 3V192Z' +
					rect(200, 182, 200, 2.4) +
					rect(200, 187, 200, 2.4),
				strength: 1
			},
			{ d: disc(244, 186, 7.5) + disc(272, 186, 7.5), strength: 1 },
			{ d: disc(244, 186, 5.8) + disc(272, 186, 5.8), strength: 1, cut: true },
			{
				d:
					limb(244, 186, 254, 172, 1.8) +
					limb(254, 172, 268, 172, 1.8) +
					limb(268, 172, 272, 186, 1.8) +
					limb(254, 172, 258, 186, 1.8) +
					limb(244, 186, 258, 186, 1.8) +
					limb(258, 186, 268, 172, 1.8) +
					limb(252, 168, 256, 168, 2.4) +
					limb(266, 166, 270, 166, 2.4) +
					limb(268, 172, 267, 166, 1.8),
				strength: 1
			},
			{ d: rect(376, 0, 11, 200) + rect(222, 0, 5, 200), strength: 1, snow: true },
			{
				d: 'M376 11.6l5.9 1.55l-5.9 1.55ZM387 36.0l-6.0 1.35l6.0 1.35ZM376 51.4l8.0 1.35l-8.0 1.35ZM387 74.4l-7.7 1.35l7.7 1.35ZM376 91.8l7.0 1.55l-7.0 1.55ZM387 114.5l-5.8 1.25l5.8 1.25ZM376 133.0l6.8 1.4l-6.8 1.4ZM387 147.1l-6.7 1.95l6.7 1.95ZM376 165.2l6.2 1.7l-6.2 1.7ZM387 186.9l-8.6 1.9l8.6 1.9ZM222 52.0l2.8 1.5l-2.8 1.5ZM227 77.3l-3.2 1.8l3.2 1.8ZM222 89.7l3.3 1.9l-3.3 1.9ZM227 111.8l-3.9 1.9l3.9 1.9ZM222 129.3l2.5 1.8l-2.5 1.8ZM227 146.1l-2.5 1.8l2.5 1.8ZM222 170.6l3.8 1.95l-3.8 1.95ZM227 184.2l-2.6 1.35l2.6 1.35Z',
				strength: 1
			}
		]
	},
	// The farmhouse and its red barn, sunflowers taller than the fence
	meadow: {
		backdrop: {
			shapes: [
				{ d: 'M150 186Q210 132 290 140T420 140V186Z', strength: 0.28 },
				{
					d:
						house(196, 140, 12, 8, 6, 2) +
						house(212, 138, 14, 9, 7, 2) +
						'M230 138V112L234 102L238 112V138Z' +
						rect(228, 120, 12, 18) +
						house(244, 140, 12, 8, 6, 2),
					strength: 0.6
				},
				{
					d: roundTree(296, 146, 22) + roundTree(310, 144, 26) + roundTree(394, 146, 28),
					strength: 0.5
				}
			]
		},
		shapes: [
			{ d: GROUND.d, strength: 0.5 },
			{ d: 'M328 186V138L356 116L384 138V186Z', strength: 1 },
			{ d: 'M344 186V158h24V186Z', strength: 1, cut: true },
			{
				d: limb(345, 159, 367, 185, 2) + limb(367, 159, 345, 185, 2) + rect(352, 126, 8, 8),
				strength: 0.9
			},
			{ d: house(270, 186, 50, 30, 20, 4), strength: 0.8 },
			{
				d: rect(280, 164, 10, 10) + rect(300, 164, 10, 10) + 'M291 186V172h8V186Z',
				strength: 1,
				cut: true
			},
			{ d: disc(380, 186, 12), strength: 0.85 },
			{ d: disc(380, 186, 7.5) + disc(380, 186, 3), strength: 1, cut: true },
			{
				d:
					rect(204, 178, 120, 2.4) +
					rect(206, 174, 3, 16) +
					rect(218, 174, 3, 16) +
					rect(230, 174, 3, 16) +
					rect(242, 174, 3, 16) +
					rect(254, 174, 3, 16) +
					rect(266, 174, 3, 16) +
					rect(278, 174, 3, 16) +
					rect(290, 174, 3, 16) +
					rect(302, 174, 3, 16) +
					rect(314, 174, 3, 16),
				strength: 0.9
			},
			{
				d:
					limb(226, 190, 226, 150, 2) +
					limb(244, 190, 244, 140, 2) +
					limb(262, 190, 262, 148, 2) +
					limb(280, 190, 280, 138, 2),
				strength: 0.9
			},
			{
				d:
					disc(232.5, 150.0, 2.9250000000000003) +
					disc(230.6, 154.6, 2.9250000000000003) +
					disc(226.0, 156.5, 2.9250000000000003) +
					disc(221.4, 154.6, 2.9250000000000003) +
					disc(219.5, 150.0, 2.9250000000000003) +
					disc(221.4, 145.4, 2.9250000000000003) +
					disc(226.0, 143.5, 2.9250000000000003) +
					disc(230.6, 145.4, 2.9250000000000003) +
					disc(250.5, 140.0, 2.9250000000000003) +
					disc(248.6, 144.6, 2.9250000000000003) +
					disc(244.0, 146.5, 2.9250000000000003) +
					disc(239.4, 144.6, 2.9250000000000003) +
					disc(237.5, 140.0, 2.9250000000000003) +
					disc(239.4, 135.4, 2.9250000000000003) +
					disc(244.0, 133.5, 2.9250000000000003) +
					disc(248.6, 135.4, 2.9250000000000003) +
					disc(268.5, 148.0, 2.9250000000000003) +
					disc(266.6, 152.6, 2.9250000000000003) +
					disc(262.0, 154.5, 2.9250000000000003) +
					disc(257.4, 152.6, 2.9250000000000003) +
					disc(255.5, 148.0, 2.9250000000000003) +
					disc(257.4, 143.4, 2.9250000000000003) +
					disc(262.0, 141.5, 2.9250000000000003) +
					disc(266.6, 143.4, 2.9250000000000003) +
					disc(286.5, 138.0, 2.9250000000000003) +
					disc(284.6, 142.6, 2.9250000000000003) +
					disc(280.0, 144.5, 2.9250000000000003) +
					disc(275.4, 142.6, 2.9250000000000003) +
					disc(273.5, 138.0, 2.9250000000000003) +
					disc(275.4, 133.4, 2.9250000000000003) +
					disc(280.0, 131.5, 2.9250000000000003) +
					disc(284.6, 133.4, 2.9250000000000003),
				strength: 0.8
			},
			{
				d: disc(226, 150, 4) + disc(244, 140, 4) + disc(262, 148, 4) + disc(280, 138, 4),
				strength: 1
			}
		]
	},
	// The row of striped beach huts on the sand, the sea beyond, dune grass up close
	coast: {
		backdrop: {
			shapes: [
				{ d: 'M-200 186V166H400V186Z', strength: 0.36 },
				{ d: 'M372 166Q380 136 400 132V166Z', strength: 0.45 },
				{
					d:
						rect(166, 148, 64, 4) +
						rect(172, 152, 1.6, 14) +
						rect(182, 152, 1.6, 14) +
						rect(192, 152, 1.6, 14) +
						rect(202, 152, 1.6, 14) +
						rect(212, 152, 1.6, 14) +
						rect(222, 152, 1.6, 14) +
						rect(232, 152, 1.6, 14) +
						rect(218, 136, 12, 12) +
						'M216 136L224 128L232 136Z',
					strength: 0.55
				}
			],
			lines: [{ d: waves(220, 176, 4), strength: 0.45, motion: 'flow' }]
		},
		shapes: [
			{ d: 'M-200 200V184H400V200Z', strength: 0.4 },
			{
				d:
					house(236, 188, 30, 36, 16, 4) +
					house(272, 188, 30, 36, 16, 4) +
					house(308, 188, 30, 36, 16, 4) +
					house(344, 188, 30, 36, 16, 4),
				strength: 0.9
			},
			{
				d:
					rect(277, 158, 4, 30) +
					rect(285, 158, 4, 30) +
					rect(293, 158, 4, 30) +
					rect(349, 158, 4, 30) +
					rect(357, 158, 4, 30) +
					rect(365, 158, 4, 30) +
					'M245 188V166h12V188Z' +
					'M317 188V166h12V188Z',
				strength: 1,
				cut: true
			},
			{
				d: 'M196 200Q236 182 280 194Q296 198 300 200Z' + 'M352 200Q380 186 400 188V200Z',
				strength: 0.85
			}
		],
		lines: [
			{
				d: 'M222 192l-5-16M228 191l-1-18M234 192l4-15M372 194l-3-15M378 193l1-17M386 194l3-14',
				strength: 0.9,
				motion: 'sway'
			}
		]
	},
	// Glass igloos in a row along the forest edge, the nearest lit up, the aurora's crown right overhead
	aurora: {
		backdrop: {
			night: true,
			shapes: [
				{ d: curtain(220, 400, 40, 14, 44), strength: 0.32, motion: 'shimmer' },
				{ d: curtain(260, 380, 92, 10, 18), strength: 0.2, motion: 'shimmer' },
				{
					d:
						pine(200, 186, 40) +
						pine(214, 186, 64) +
						pine(228, 186, 48) +
						pine(244, 186, 58) +
						pine(290, 186, 46) +
						pine(304, 186, 56) +
						pine(372, 186, 52) +
						pine(386, 186, 62) +
						pine(400, 186, 50),
					strength: 0.45
				}
			],
			lines: [
				{ d: rays(220, 400, 40, 14, 44), strength: 0.6, motion: 'shimmer' },
				{ d: rays(260, 380, 92, 10, 18), strength: 0.4, motion: 'shimmer' }
			]
		},
		shapes: [
			{
				d: sparkle(214, 22, 9.5) + sparkle(300, 10, 7.4) + sparkle(352, 104, 6.8),
				strength: 0.55,
				motion: 'twinkle'
			},
			{
				d: sparkle(214, 22, 7) + sparkle(300, 10, 5.5) + sparkle(352, 104, 5),
				strength: 1,
				snow: true,
				motion: 'twinkle'
			},
			{ d: sparkle(250, 90, 6.8) + sparkle(390, 44, 8.8), strength: 0.55, motion: 'twinkle-late' },
			{
				d: sparkle(250, 90, 5) + sparkle(390, 44, 6.5),
				strength: 1,
				snow: true,
				motion: 'twinkle-late'
			},
			{ d: GROUND.d, strength: 0.6 },
			{ d: 'M225 186a11 11 0 0 1 22 0Z' + 'M252 186a16 16 0 0 1 32 0Z', strength: 0.75 },
			{
				d: 'M227 186a9 9 0 0 1 18 0Z' + 'M254.5 186a13.5 13.5 0 0 1 27.0 0Z',
				strength: 1,
				cut: true
			},
			{
				d:
					limb(236, 175, 236, 186, 1) +
					limb(268, 170, 268, 186, 1.2) +
					rect(256, 179, 24, 1.2) +
					disc(232, 182, 2) +
					disc(264, 180, 2.4) +
					disc(273, 181, 2.2),
				strength: 0.75
			},
			{ d: 'M296 186a34 34 0 0 1 68 0Z', strength: 0.95 },
			{ d: 'M300 186a30 30 0 0 1 60 0Z', strength: 1, cut: true },
			{
				d:
					limb(330, 152, 330, 186, 1.6) +
					limb(308, 162, 308, 186, 1.6) +
					limb(352, 162, 352, 186, 1.6) +
					rect(300, 172, 60, 1.6),
				strength: 0.9
			},
			{ d: seated(318, 182, 32) + seated(342, 182, 30), strength: 0.85 },
			{ d: 'M376 200Q384 168 400 166V200Z' + pine(396, 200, 90), strength: 1 }
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
