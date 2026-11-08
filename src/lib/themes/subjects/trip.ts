// A trip (#327): travelling the way you do in each place. Everything stands on GROUND_Y or floats
// on WATER_Y, the main subject in the free space on the right, more around it.
import type { ThemeId } from '../palettes';
import { type Scene, curtain, rays } from '../scenes';
import {
	bird,
	disc,
	figure,
	flame,
	GROUND,
	hull,
	limb,
	logs,
	pine,
	rect,
	rounded,
	roundTree,
	seated,
	sparkle,
	steam,
	tri,
	WATER,
	waves
} from '../draw';

export const TRIP: Record<ThemeId, Scene> = {
	// A tent among the pines, someone on a log by the campfire
	forest: {
		backdrop: {
			shapes: [
				{ d: 'M200 186Q260 110 400 128V186Z', strength: 0.32 },
				{
					d: 'M250 110L258.93 126.8H241.07ZM250 119.6L261.81 137.2H238.19ZM250 130.0L264.4 146.8H235.6ZM248.4 146.0h3.2V150h-3.2ZM318 74L329.16 95.0H306.84ZM318 86.0L332.76 108.0H303.24ZM318 99.0L336.0 120.0H300.0ZM316.0 119.0h4.0V124h-4.0Z',
					strength: 0.45
				}
			]
		},
		shapes: [
			GROUND,
			{ d: pine(398, 186, 86), strength: 0.5 },
			{ d: 'M314 186L346 120L378 186Z', strength: 1 },
			{ d: tri(346, 148, 335, 186, 357, 186), strength: 1, cut: true },
			{ d: tri(346, 148, 357, 186, 366, 186), strength: 0.7 },
			{ d: rect(345, 106, 2, 16) + 'M347 106l11 4-11 4Z', strength: 1, motion: 'flutter' },
			{ d: rounded(230, 176, 34, 10, 5), strength: 0.85 },
			{ d: seated(246, 176, 60, { hat: 'beanie' }), strength: 1 },
			{
				d: disc(270, 184, 3) + disc(278, 186, 3) + disc(298, 186, 3) + disc(306, 184, 3),
				strength: 0.8
			},
			{ d: logs(288, 186, 24), strength: 0.9 },
			{ d: flame(288, 181, 24), strength: 1, motion: 'flicker' }
		],
		lines: [{ d: steam(288, 150, 22), strength: 0.6, motion: 'rise' }]
	},
	// A small kayak below the huge cliff, the waterfall pouring down into the fjord
	fjord: {
		backdrop: {
			shapes: [
				{ d: 'M200 182L250 110L300 182Z', strength: 0.3 },
				{ d: 'M256 182L298 92L340 182Z', strength: 0.42 }
			]
		},
		shapes: [
			{
				d: 'M336 182L344 152L340 132L352 104L348 84L362 60L374 44L400 38V182Z',
				strength: 0.75
			},
			{ d: pine(390, 40, 22) + pine(376, 46, 16), strength: 0.75 },
			{ d: 'M362 54h14q-2 64-8 128h-12q6-66 6-128Z', strength: 1, cut: true, motion: 'flow' },
			WATER,
			{ d: 'M232 180h18q-2 3-8 3h-4q-4 0-6-3Z' + disc(241, 176, 2.5), strength: 0.5 },
			{ d: disc(356, 182, 7) + disc(368, 180, 8) + disc(380, 183, 6), strength: 1, cut: true },
			{ d: figure(288, 180, 34, { hat: 'cap' }), strength: 1, motion: 'rock' },
			{ d: 'M252 176h76q-6 8-20 8h-38q-12 0-18-8Z', strength: 1, motion: 'rock' },
			{ d: limb(258, 186, 318, 150, 2), strength: 1, motion: 'rock' },
			{ d: 'M252 182l6 9 5-4-6-8ZM318 150l3-9 5 3-4 8Z', strength: 1, motion: 'rock' }
		],
		lines: [
			{ d: waves(226, 193, 2) + waves(300, 196, 2), strength: 0.6, motion: 'flow' },
			{ d: bird(300, 96) + bird(326, 82, 4), strength: 0.6, motion: 'fly' }
		]
	},
	// Two ski tourers skinning up the slope, their zig-zag track behind them in the snow
	mountains: {
		backdrop: {
			shapes: [
				{ d: 'M224 200L300 76L376 200Z', strength: 0.28 },
				{ d: 'M300 76L316 94L306 90L300 98L294 90L284 94Z', strength: 1, snow: true },
				{ d: 'M362 52a12 12 0 1 1 24 0a12 12 0 1 1 -24 0Z', strength: 0.35 }
			]
		},
		shapes: [
			{ d: 'M214 200L400 108V200Z', strength: 1, snow: true },
			{ d: 'M362 129l6-6 9 2-1 5ZM344 140l5-4 7 2-1 3Z', strength: 0.8 },
			{ d: limb(250, 183, 280, 168, 2.2) + limb(280, 168, 286, 162, 2.2), strength: 0.85 },
			{
				d:
					figure(266, 175, 32, { hat: 'beanie', pack: 'left' }) +
					limb(258, 154, 254, 178, 1.8) +
					limb(274, 152, 274, 170, 1.8),
				strength: 0.85
			},
			{ d: limb(298, 159, 348, 134, 3) + limb(348, 134, 356, 125, 3), strength: 1 },
			{
				d:
					figure(324, 146, 52, { hat: 'helmet', pack: 'left' }) +
					limb(310, 118, 304, 152, 2.4) +
					limb(334, 116, 334, 142, 2.4),
				strength: 1
			},
			{ d: 'M196 200Q232 180 270 192Q290 196 300 200Z', strength: 1, snow: true }
		],
		lines: [{ d: 'M240 199L300 184L272 180L332 164L306 160', strength: 1 }]
	},
	// The long walk: the path winding over the moor to the cairn on the far hill, a fingerpost in front
	heather: {
		backdrop: {
			shapes: [
				{ d: 'M120 200Q240 112 460 124V200Z', strength: 0.3 },
				{ d: 'M160 200Q290 146 460 152V200Z', strength: 0.36 }
			]
		},
		shapes: [
			{
				d: rounded(347, 118, 18, 9, 3) + rounded(350, 110, 12, 9, 3) + rounded(353, 103, 7, 8, 3),
				strength: 0.7
			},
			{ d: 'M150 200Q240 172 330 168T440 164V200Z', strength: 0.6 },
			{ d: 'M258 200C290 188 330 178 370 168h6C352 180 334 190 322 200Z', strength: 1, cut: true },
			{ d: figure(318, 189, 38, { hat: 'cap', pack: 'left' }), strength: 1 },
			{ d: rect(232, 126, 5, 76) + 'M237 132h28l6 6-6 6h-28Z', strength: 1 },
			{
				d:
					disc(376, 198, 10) +
					disc(390, 194, 12) +
					disc(402, 198, 9) +
					disc(208, 199, 8) +
					disc(220, 197, 9),
				strength: 1
			},
			{
				d:
					disc(382, 190, 1.6) +
					disc(392, 186, 1.6) +
					disc(398, 192, 1.6) +
					disc(214, 192, 1.4) +
					disc(224, 191, 1.4),
				strength: 1,
				cut: true
			}
		],
		lines: [{ d: 'M374 168Q360 158 368 148T356 127', strength: 0.5 }]
	},
	// The little train through the birch wood, faces at the windows, white trunks close by
	birch: {
		backdrop: {
			shapes: [
				{ d: 'M120 186Q260 150 460 156V186Z', strength: 0.22 },
				{
					d:
						disc(223, 100, 8) +
						disc(218, 110, 7) +
						disc(228, 112, 7) +
						disc(223, 120, 6) +
						disc(241, 92, 8) +
						disc(236, 102, 7) +
						disc(246, 104, 7) +
						disc(241, 112, 6) +
						disc(263, 104, 8) +
						disc(258, 114, 7) +
						disc(268, 116, 7) +
						disc(263, 124, 6) +
						disc(285, 88, 8) +
						disc(280, 98, 7) +
						disc(290, 100, 7) +
						disc(285, 108, 6) +
						disc(307, 98, 8) +
						disc(302, 108, 7) +
						disc(312, 110, 7) +
						disc(307, 118, 6) +
						disc(345, 90, 8) +
						disc(340, 100, 7) +
						disc(350, 102, 7) +
						disc(345, 110, 6) +
						disc(373, 102, 8) +
						disc(368, 112, 7) +
						disc(378, 114, 7) +
						disc(373, 122, 6) +
						disc(395, 94, 8) +
						disc(390, 104, 7) +
						disc(400, 106, 7) +
						disc(395, 114, 6),
					strength: 0.7
				},
				{
					d:
						rect(222, 96, 2, 90) +
						rect(240, 88, 2.5, 98) +
						rect(262, 100, 2, 86) +
						rect(284, 84, 2.5, 102) +
						rect(306, 94, 2, 92) +
						rect(344, 86, 2.5, 100) +
						rect(372, 98, 2, 88) +
						rect(394, 90, 2.5, 96),
					strength: 1,
					snow: true
				}
			]
		},
		shapes: [
			{ d: 'M-200 200V188H400V200Z', strength: 0.6 },
			{
				d:
					rect(0, 187, 6, 3) +
					rect(12, 187, 6, 3) +
					rect(24, 187, 6, 3) +
					rect(36, 187, 6, 3) +
					rect(48, 187, 6, 3) +
					rect(60, 187, 6, 3) +
					rect(72, 187, 6, 3) +
					rect(84, 187, 6, 3) +
					rect(96, 187, 6, 3) +
					rect(108, 187, 6, 3) +
					rect(120, 187, 6, 3) +
					rect(132, 187, 6, 3) +
					rect(144, 187, 6, 3) +
					rect(156, 187, 6, 3) +
					rect(168, 187, 6, 3) +
					rect(180, 187, 6, 3) +
					rect(192, 187, 6, 3) +
					rect(204, 187, 6, 3) +
					rect(216, 187, 6, 3) +
					rect(228, 187, 6, 3) +
					rect(240, 187, 6, 3) +
					rect(252, 187, 6, 3) +
					rect(264, 187, 6, 3) +
					rect(276, 187, 6, 3) +
					rect(288, 187, 6, 3) +
					rect(300, 187, 6, 3) +
					rect(312, 187, 6, 3) +
					rect(324, 187, 6, 3) +
					rect(336, 187, 6, 3) +
					rect(348, 187, 6, 3) +
					rect(360, 187, 6, 3) +
					rect(372, 187, 6, 3) +
					rect(384, 187, 6, 3) +
					rect(396, 187, 6, 3),
				strength: 0.9
			},
			{ d: rect(-200, 185, 600, 2), strength: 1 },
			{
				d:
					rounded(206, 146, 60, 32, 4) +
					rounded(272, 146, 60, 32, 4) +
					rect(264, 170, 10, 2) +
					rect(330, 170, 10, 2),
				strength: 0.85,
				motion: 'idle'
			},
			{ d: rect(204, 143, 64, 4) + rect(270, 143, 64, 4), strength: 1, motion: 'idle' },
			{
				d:
					rect(212, 152, 12, 11) +
					rect(230, 152, 12, 11) +
					rect(248, 152, 12, 11) +
					rect(278, 152, 12, 11) +
					rect(296, 152, 12, 11) +
					rect(314, 152, 12, 11),
				strength: 1,
				cut: true,
				motion: 'idle'
			},
			{
				d:
					disc(236, 157, 3.4) +
					rect(232.5, 159.5, 7, 3.5) +
					disc(284, 157, 3.4) +
					rect(280.5, 159.5, 7, 3.5) +
					disc(320, 157, 3.4) +
					rect(316.5, 159.5, 7, 3.5),
				strength: 0.9,
				motion: 'idle'
			},
			{
				d:
					rect(338, 138, 20, 38) +
					rect(335, 134, 26, 4) +
					rounded(356, 152, 36, 22, 10) +
					rect(380, 138, 7, 14) +
					rect(378, 135, 11, 3) +
					disc(368, 152, 4) +
					rect(336, 174, 60, 4) +
					'M392 178l8 8h-10Z',
				strength: 1,
				motion: 'idle'
			},
			{ d: rect(342, 143, 12, 10), strength: 1, cut: true, motion: 'idle' },
			{
				d:
					disc(218, 181, 4.5) +
					disc(254, 181, 4.5) +
					disc(284, 181, 4.5) +
					disc(320, 181, 4.5) +
					disc(350, 180, 5.5) +
					disc(366, 180, 5.5) +
					disc(382, 180, 5.5),
				strength: 1,
				motion: 'idle'
			},
			{
				d: disc(350, 180, 2) + disc(366, 180, 2) + disc(382, 180, 2),
				strength: 1,
				cut: true,
				motion: 'idle'
			},
			{ d: rect(348, 179, 36, 1.8), strength: 1, motion: 'idle' },
			{ d: rect(265, 0, 9, 200) + rect(330, 0, 9, 200), strength: 1, snow: true },
			{
				d: 'M265 14.1l4.9 1.75l-4.9 1.75ZM274 31.1l-5.9 1.5l5.9 1.5ZM265 50.0l5.9 1.3l-5.9 1.3ZM274 72.0l-4.7 1.3l4.7 1.3ZM265 90.9l6.7 1.35l-6.7 1.35ZM274 108.3l-6.2 1.95l6.2 1.95ZM265 130.1l5.6 2.0l-5.6 2.0ZM274 144.9l-6.8 1.45l6.8 1.45ZM265 164.7l4.8 1.5l-4.8 1.5ZM274 189.0l-5.0 1.7l5.0 1.7ZM330 15.2l7.1 1.35l-7.1 1.35ZM339 37.8l-4.7 1.45l4.7 1.45ZM330 59.0l5.1 1.75l-5.1 1.75ZM339 73.5l-5.7 1.6l5.7 1.6ZM330 90.1l6.7 1.3l-6.7 1.3ZM339 109.3l-4.6 1.45l4.6 1.45ZM330 129.5l6.9 1.55l-6.9 1.55ZM339 145.9l-5.2 2.0l5.2 2.0ZM330 164.3l6.2 1.55l-6.2 1.55ZM339 187.9l-5.4 1.75l5.4 1.75Z',
				strength: 1
			}
		],
		lines: [{ d: steam(384, 130, 22) + steam(372, 122, 18), strength: 0.5, motion: 'rise' }]
	},
	// Cycling the lane between the wheat fields, round hay bales out in the stubble
	meadow: {
		backdrop: {
			shapes: [
				{ d: 'M60 186Q220 136 460 148V186Z', strength: 0.22 },
				{ d: 'M150 186Q300 158 470 166V186Z', strength: 0.34 },
				{ d: disc(236, 170, 8) + disc(262, 166, 7) + disc(350, 162, 6), strength: 0.6 }
			],
			lines: [{ d: 'M170 182Q290 170 420 172M190 178Q300 166 420 166', strength: 0.4 }]
		},
		shapes: [
			{ d: 'M-200 200V186H400V200Z', strength: 0.45 },
			{ d: disc(274.2, 171.7, 14.3) + disc(341.8, 171.7, 14.3), strength: 1 },
			{ d: disc(274.2, 171.7, 11.7) + disc(341.8, 171.7, 11.7), strength: 1, cut: true },
			{
				d:
					limb(274.2, 171.7, 297.6, 171.7, 2.6) +
					limb(297.6, 171.7, 289.8, 141.8, 2.6) +
					limb(289.8, 141.8, 328.8, 141.8, 2.6) +
					limb(328.8, 141.8, 341.8, 171.7, 2.6) +
					limb(297.6, 171.7, 328.8, 141.8, 2.6) +
					limb(326.2, 134.0, 331.4, 141.8, 2.6) +
					limb(321.0, 132.7, 334.0, 132.7, 3.1) +
					rounded(283.3, 136.6, 15.6, 5.2, 2.6),
				strength: 1
			},
			{ d: rounded(331.4, 119.7, 18.2, 13.0, 2.6), strength: 0.85 },
			{
				d: disc(336.6, 117.1, 3.4) + disc(344.4, 115.8, 3.4) + disc(340.5, 111.9, 3.1),
				strength: 1
			},
			{
				d:
					disc(305.4, 89.8, 7.8) +
					'M292.4 139.2q-2.6 -33.8 15.6 -39.0q10.4 2.6 7.8 18.2l-5.2 20.8Z' +
					limb(310.6, 108.0, 323.6, 131.4, 4.4) +
					limb(297.6, 139.2, 305.4, 156.1, 4.7) +
					limb(305.4, 156.1, 297.6, 171.7, 4.4),
				strength: 1
			}
		],
		lines: [
			{
				d: 'M212 200l-1-22M218 200l1-26M226 200l-2-20M390 200l1-24M396 200l-1-20',
				strength: 1,
				motion: 'sway'
			}
		],
		dots: [
			[211, 178, 2.4, 1],
			[219, 174, 2.4, 1],
			[224, 180, 2.4, 1],
			[391, 176, 2.4, 1],
			[395, 180, 2.4, 1]
		]
	},
	// A sailboat rounding the lighthouse on its rocky point
	coast: {
		backdrop: {
			shapes: [{ d: 'M-200 186V168H400V186Z', strength: 0.3 }]
		},
		shapes: [
			{ d: WATER.d, strength: 0.4 },
			{ d: 'M340 186Q346 168 362 164Q384 158 400 162V186Z', strength: 0.9 },
			{
				d: 'M364 164L368 112H380L384 164Z' + rect(364, 104, 20, 8) + 'M366 104L374 94L382 104Z',
				strength: 1
			},
			{
				d: rect(366.5, 126, 15, 5) + rect(365.5, 144, 17, 5) + rect(368, 106, 12, 4),
				strength: 1,
				cut: true
			},
			{ d: hull(246, 182, 70, 9), strength: 1, motion: 'rock' },
			{
				d:
					rect(280, 110, 2.6, 64) +
					tri(284, 114, 284, 168, 316, 168) +
					tri(278, 122, 278, 168, 252, 168),
				strength: 0.9,
				motion: 'rock'
			},
			{ d: figure(262, 174, 18, { hat: 'cap' }), strength: 1, motion: 'rock' }
		],
		lines: [
			{ d: waves(212, 190, 2) + waves(300, 194, 2), strength: 0.6, motion: 'flow' },
			{ d: 'M384 110l18-6M384 112l18 4', strength: 0.4, motion: 'shimmer' }
		]
	},
	// A snowmobile out on the frozen lake, its track curving back to the shore, the lights mirrored in the ice
	aurora: {
		backdrop: {
			night: true,
			shapes: [
				{ d: curtain(236, 400, 72, 18, 30), strength: 0.3, motion: 'shimmer' },
				{
					d:
						pine(212, 160, 16) +
						pine(224, 160, 22) +
						pine(236, 160, 14) +
						pine(254, 160, 20) +
						pine(270, 160, 26) +
						pine(286, 160, 18) +
						pine(304, 160, 22) +
						pine(322, 160, 16) +
						pine(338, 160, 24) +
						pine(356, 160, 18) +
						pine(372, 160, 22) +
						pine(388, 160, 16) +
						pine(400, 160, 20),
					strength: 0.45
				},
				{ d: 'M200 160H410V200H200Z', strength: 0.12 },
				{ d: curtain(236, 400, 176, 8, 10), strength: 0.16, motion: 'shimmer' }
			],
			lines: [{ d: rays(236, 400, 72, 18, 30), strength: 0.6, motion: 'shimmer' }]
		},
		shapes: [
			{
				d: sparkle(246, 22, 9.5) + sparkle(380, 20, 9.5) + sparkle(350, 46, 7.4),
				strength: 0.55,
				motion: 'twinkle'
			},
			{
				d: sparkle(246, 22, 7) + sparkle(380, 20, 7) + sparkle(350, 46, 5.5),
				strength: 1,
				snow: true,
				motion: 'twinkle'
			},
			{ d: sparkle(300, 12, 7.4) + sparkle(268, 52, 6.8), strength: 0.55, motion: 'twinkle-late' },
			{
				d: sparkle(300, 12, 5.5) + sparkle(268, 52, 5),
				strength: 1,
				snow: true,
				motion: 'twinkle-late'
			},
			{ d: 'M196 200Q240 190 300 186T400 190V200Z', strength: 0.55 },
			{ d: 'M362 176L400 166V188Z', strength: 0.3, motion: 'shimmer' },
			{ d: rounded(306, 178, 32, 7, 3.5), strength: 1, motion: 'idle' },
			{
				d: disc(312, 181.5, 2) + disc(322, 181.5, 2) + disc(332, 181.5, 2),
				strength: 1,
				cut: true,
				motion: 'idle'
			},
			{
				d:
					'M308 178L312 168H330L346 162L362 170L360 178Z' +
					'M346 162l6 -9 3 1 -4 9Z' +
					rect(312, 164, 18, 4),
				strength: 1,
				motion: 'idle'
			},
			{
				d:
					limb(334, 186, 362, 186, 2) +
					'M362 184q5 0 5 -5h2q0 7 -7 7Z' +
					limb(348, 178, 352, 186, 2),
				strength: 1,
				motion: 'idle'
			},
			{
				d: figure(322, 168, 26, { hat: 'helmet' }) + limb(326, 154, 344, 160, 2.6),
				strength: 1,
				motion: 'idle'
			},
			{ d: pine(210, 206, 70) + pine(228, 204, 40), strength: 0.95 }
		],
		lines: [{ d: 'M306 184Q280 188 262 192T230 200', strength: 0.5 }]
	},
	// Two hikers on a path of fallen leaves, under red trees, a trail sign ahead
	autumn: {
		shapes: [
			GROUND,
			{ d: roundTree(376, 186, 100) + roundTree(240, 186, 70), strength: 0.55 },
			{ d: rect(354, 156, 4, 30) + 'M342 152h24l6 6-6 6h-24Z', strength: 0.8 },
			{ d: figure(286, 186, 58, { pack: 'left', hat: 'cap' }), strength: 1 },
			{ d: figure(320, 186, 50, { pack: 'left' }), strength: 0.85 },
			{ d: limb(300, 156, 304, 186, 2), strength: 0.9 }
		],
		dots: [
			[256, 120, 2.5, 0.8],
			[310, 96, 2, 0.7],
			[340, 128, 2.5, 0.8],
			[270, 184, 2, 0.8],
			[334, 184, 2, 0.8],
			[346, 183, 2, 0.8]
		]
	}
};
