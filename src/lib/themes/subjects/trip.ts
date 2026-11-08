// A trip (#327): travelling the way you do in each place. Everything stands on GROUND_Y or floats
// on WATER_Y, the main subject in the free space on the right, more around it.
import type { ThemeId } from '../palettes';
import type { Scene } from '../scenes';
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
				{ d: 'M120 186Q260 136 460 146V186Z', strength: 0.25 },
				{
					d:
						roundTree(220, 150, 26) +
						roundTree(250, 150, 34) +
						roundTree(286, 150, 28) +
						roundTree(322, 150, 36) +
						roundTree(360, 150, 30) +
						roundTree(392, 150, 34),
					strength: 0.35
				}
			]
		},
		shapes: [
			{ d: 'M-200 200V188H400V200Z', strength: 0.6 },
			{
				d:
					rect(204, 186, 6, 3) +
					rect(216, 186, 6, 3) +
					rect(228, 186, 6, 3) +
					rect(240, 186, 6, 3) +
					rect(252, 186, 6, 3) +
					rect(264, 186, 6, 3) +
					rect(276, 186, 6, 3) +
					rect(288, 186, 6, 3) +
					rect(300, 186, 6, 3) +
					rect(312, 186, 6, 3) +
					rect(324, 186, 6, 3) +
					rect(336, 186, 6, 3) +
					rect(348, 186, 6, 3) +
					rect(360, 186, 6, 3) +
					rect(372, 186, 6, 3) +
					rect(384, 186, 6, 3) +
					rect(396, 186, 6, 3),
				strength: 0.9
			},
			{ d: rounded(214, 140, 108, 38, 5), strength: 0.9, motion: 'idle' },
			{
				d: 'M326 178v-34q0-6 6-6h36q16 0 22 14l6 12v14Z' + rect(338, 126, 8, 12),
				strength: 1,
				motion: 'idle'
			},
			{
				d:
					rect(226, 146, 20, 14) +
					rect(252, 146, 20, 14) +
					rect(290, 146, 20, 14) +
					'M370 146h8l10 14h-18Z',
				strength: 1,
				cut: true,
				motion: 'idle'
			},
			{
				d:
					disc(236, 152, 4) +
					rect(232, 155, 8, 5) +
					disc(262, 152, 4) +
					rect(258, 155, 8, 5) +
					disc(300, 152, 4) +
					rect(296, 155, 8, 5),
				strength: 0.9,
				motion: 'idle'
			},
			{ d: rect(214, 166, 182, 2), strength: 1, cut: true, motion: 'idle' },
			{
				d:
					disc(232, 182, 5) +
					disc(250, 182, 5) +
					disc(286, 182, 5) +
					disc(304, 182, 5) +
					disc(344, 182, 6) +
					disc(372, 182, 6),
				strength: 1,
				motion: 'idle'
			},
			{ d: rect(258, 0, 10, 200) + rect(378, 0, 8, 200), strength: 1, snow: true },
			{
				d: 'M258 14.1l5.5 1.75l-5.5 1.75ZM268 31.1l-6.6 1.5l6.6 1.5ZM258 50.0l6.5 1.3l-6.5 1.3ZM268 72.0l-5.2 1.3l5.2 1.3ZM258 90.9l7.5 1.35l-7.5 1.35ZM268 108.3l-6.9 1.95l6.9 1.95ZM258 130.1l6.2 2.0l-6.2 2.0ZM268 144.9l-7.6 1.45l7.6 1.45ZM258 164.7l5.4 1.5l-5.4 1.5ZM268 189.0l-5.5 1.7l5.5 1.7ZM378 18.1l6.3 1.35l-6.3 1.35ZM386 42.6l-4.2 1.45l4.2 1.45ZM378 65.7l4.5 1.75l-4.5 1.75ZM386 82.0l-5.1 1.6l5.1 1.6ZM378 100.5l6.0 1.3l-6.0 1.3ZM386 121.5l-4.0 1.45l4.0 1.45ZM378 143.6l6.2 1.55l-6.2 1.55ZM386 161.9l-4.6 2.0l4.6 2.0ZM378 182.2l5.5 1.55l-5.5 1.55Z',
				strength: 1
			}
		],
		lines: [{ d: steam(342, 120, 22) + steam(330, 112, 18), strength: 0.5, motion: 'rise' }]
	},
	// A loaded bike leaning on its stand by the field path, flowers in its basket
	meadow: {
		shapes: [
			GROUND,
			{ d: disc(282, 164, 22), strength: 1 },
			{ d: disc(282, 164, 18), strength: 1, cut: true },
			{ d: disc(362, 164, 22), strength: 1 },
			{ d: disc(362, 164, 18), strength: 1, cut: true },
			{ d: rounded(264, 128, 28, 30, 6) + rect(268, 124, 34, 4), strength: 0.9 },
			{ d: rounded(356, 120, 22, 14, 3), strength: 0.85 },
			{ d: disc(362, 116, 4) + disc(370, 114, 3) + disc(377, 117, 3), strength: 1 },
			{ d: rect(238, 160, 4, 26) + 'M226 156h28l6 6-6 6h-28Z', strength: 0.7 }
		],
		lines: [
			{
				d: 'M282 164L308 130H346L362 164M308 130L324 164L346 130M346 130L344 114h12M302 126h16',
				strength: 1
			},
			{ d: 'M324 164L318 186', strength: 1 }
		]
	},
	// A sailboat passing the lighthouse, the crew at the helm
	coast: {
		shapes: [
			WATER,
			{ d: hull(240, 186, 116, 18), strength: 1, motion: 'rock' },
			{ d: rect(246, 172, 104, 3), strength: 1, cut: true, motion: 'rock' },
			{ d: disc(336, 178, 5), strength: 1, cut: true, motion: 'rock' },
			{ d: rect(296, 66, 4, 102), strength: 1, motion: 'rock' },
			{ d: tri(302, 72, 302, 160, 352, 160), strength: 0.9, motion: 'rock' },
			{ d: tri(294, 86, 294, 160, 252, 160), strength: 0.65, motion: 'rock' },
			{ d: 'M300 66l14 4-14 4Z', strength: 1, motion: 'flutter' },
			{ d: figure(268, 168, 22, { hat: 'cap' }), strength: 1, motion: 'rock' }
		],
		lines: [
			{ d: waves(220, 194, 4), strength: 0.6, motion: 'flow' },
			{ d: bird(370, 96), strength: 0.6, motion: 'fly' }
		]
	},
	// A camper van under the lights, windows warm, someone stepping out to look up
	aurora: {
		shapes: [
			GROUND,
			{ d: rounded(268, 124, 124, 50, 14), strength: 1 },
			{ d: 'M272 130q4-8 14-8h92q10 0 12 8Z', strength: 1, snow: true },
			{
				d: rect(282, 138, 22, 16) + rect(312, 138, 22, 16) + 'M348 138h26q8 0 10 16h-36Z',
				strength: 1,
				snow: true
			},
			{ d: rect(272, 160, 116, 3), strength: 1, cut: true },
			{ d: disc(298, 174, 12) + disc(362, 174, 12), strength: 1 },
			{ d: disc(298, 174, 5) + disc(362, 174, 5), strength: 1, cut: true },
			{ d: figure(242, 186, 52, { hat: 'beanie' }), strength: 1 }
		]
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
