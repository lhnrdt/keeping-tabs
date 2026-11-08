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
