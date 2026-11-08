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
	// A walker on the moor path, heading for the cairn, the wind in their scarf
	heather: {
		shapes: [
			GROUND,
			{ d: rect(226, 172, 44, 14), strength: 0.5 },
			{
				d:
					rounded(366, 174, 24, 12, 5) +
					rounded(369, 163, 18, 11, 5) +
					rounded(372, 153, 12, 10, 4),
				strength: 0.75
			},
			{ d: figure(310, 186, 62, { hat: 'beanie', pack: 'left' }), strength: 1 },
			{ d: 'M316 140h14l6 10-4 2-6-8h-10Z', strength: 1, motion: 'flutter' },
			{ d: limb(326, 150, 330, 186, 2), strength: 0.9 }
		],
		lines: [
			{ d: 'M270 186Q320 184 366 186', strength: 0.4 },
			{ d: 'M236 116h22M248 128h28M232 140h18', strength: 0.5, motion: 'flow' }
		],
		dots: [
			[282, 182, 2, 0.8],
			[290, 180, 2, 0.8],
			[348, 181, 2, 0.8],
			[356, 182, 2, 0.8]
		]
	},
	// Lazy in a hammock between two birches, shoes left below
	birch: {
		shapes: [
			GROUND,
			{ d: 'M256 0h12v186h-12ZM372 0h12v186h-12Z', strength: 0.75 },
			{
				d: 'M256 60l8 3-8 3ZM384 90l-8 3 8 3ZM256 140l8 3-8 3ZM384 30l-8 3 8 3Z',
				strength: 1,
				cut: true
			},
			{ d: 'M268 118Q320 164 372 118L372 126Q320 176 268 126Z', strength: 1, motion: 'sway' },
			{ d: disc(294, 126, 8) + rounded(300, 130, 44, 11, 5), strength: 1, motion: 'sway' },
			{ d: rect(326, 116, 14, 10), strength: 0.8, motion: 'sway' },
			{ d: rounded(300, 180, 12, 6, 3) + rounded(316, 180, 12, 6, 3), strength: 0.8 },
			{ d: rounded(352, 176, 8, 10, 2), strength: 0.7 }
		]
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
