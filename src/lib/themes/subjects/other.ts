// Any other group (#327): somewhere to go, in each theme its own way.
import type { ThemeId } from '../palettes';
import type { Scene } from '../scenes';
import {
	bird,
	disc,
	figure,
	flag,
	GROUND,
	house,
	hull,
	person,
	pine,
	rect,
	rounded,
	seated,
	tri,
	WATER,
	waves
} from '../draw';

export const OTHER: Record<ThemeId, Scene> = {
	// Friends meeting at the signpost where the forest path forks, one checking the map
	forest: {
		backdrop: {
			shapes: [
				{ d: 'M200 186C240 160 300 150 400 156V186Z', strength: 0.3 },
				{
					d: 'M232 140L238.7 152.6H225.3ZM232 147.2L240.86 160.4H223.14ZM232 155.0L242.8 167.6H221.2ZM230.8 167.0h2.4V170h-2.4ZM254 128L262.04 143.12H245.96ZM254 136.64L264.63 152.48H243.37ZM254 146.0L266.96 161.12H241.04ZM252.56 160.4h2.88V164h-2.88ZM276 130L282.7 142.6H269.3ZM276 137.2L284.86 150.4H267.14ZM276 145.0L286.8 157.6H265.2ZM274.8 157.0h2.4V160h-2.4ZM300 122L307.59 136.28H292.41ZM300 130.16L310.04 145.12H289.96ZM300 139.0L312.24 153.28H287.76ZM298.64 152.6h2.72V156h-2.72ZM330 124L336.7 136.6H323.3ZM330 131.2L338.86 144.4H321.14ZM330 139.0L340.8 151.6H319.2ZM328.8 151.0h2.4V154h-2.4ZM356 116L364.04 131.12H347.96ZM356 124.64L366.63 140.48H345.37ZM356 134.0L368.96 149.12H343.04ZM354.56 148.4h2.88V152h-2.88ZM384 120L391.14 133.44H376.86ZM384 127.68L393.45 141.76H374.55ZM384 136.0L395.52 149.44H372.48ZM382.72 148.8h2.56V152h-2.56Z',
					strength: 0.4
				}
			]
		},
		shapes: [
			GROUND,
			{ d: pine(396, 186, 84) + pine(236, 186, 58), strength: 0.5 },
			{ d: 'M300 200L316 186H326L304 200ZM336 200L330 186H340L366 200Z', strength: 1, cut: true },
			{ d: rect(324, 98, 6, 88), strength: 1 },
			{ d: 'M330 104h36l9 8-9 8h-36Z', strength: 1 },
			{ d: 'M324 126h-30l-9 8 9 8h30Z', strength: 0.85 },
			{ d: rect(336, 110, 22, 3) + rect(298, 132, 20, 3), strength: 1, cut: true },
			{ d: figure(262, 186, 56, { pack: 'left' }), strength: 1 },
			{ d: 'M266 146l12 4 12-4v16l-12 4-12-4Z', strength: 0.8 },
			{ d: 'M278 150v16', strength: 1, cut: true },
			{ d: figure(372, 186, 60, { hat: 'cap' }), strength: 0.9 }
		],
		lines: [{ d: 'M278 150v16', strength: 0.9 }]
	},
	// Someone at the end of the jetty, feet over the water, the rowing boat tied up beside it
	fjord: {
		backdrop: {
			shapes: [
				{ d: 'M200 182L236 140L258 160L290 120L330 182Z', strength: 0.35 },
				{ d: 'M346 182L362 96L400 80V182Z', strength: 0.5 }
			]
		},
		shapes: [
			WATER,
			{ d: hull(234, 190, 56, 12), strength: 0.85, motion: 'rock' },
			{ d: rect(300, 168, 100, 8), strength: 1 },
			{ d: rect(304, 176, 4, 18) + rect(340, 176, 4, 20) + rect(376, 176, 4, 20), strength: 0.9 },
			{ d: seated(318, 168, 54, { hat: 'cap' }), strength: 1 },
			{ d: rect(311, 168, 4, 18) + rect(319, 168, 4, 16), strength: 1 },
			{ d: figure(362, 168, 46), strength: 0.9 },
			{ d: rounded(380, 138, 12, 60, 4), strength: 0.95 }
		],
		lines: [
			{ d: 'M286 180Q296 184 304 176', strength: 0.7 },
			{ d: waves(226, 197, 2) + waves(330, 197, 2), strength: 0.5, motion: 'flow' }
		]
	},
	// A summit cross with prayer flags on the top of a peak, a climber just arriving
	mountains: {
		backdrop: {
			shapes: [
				{ d: 'M200 186L240 136L266 158L292 126L330 186Z', strength: 0.4 },
				{ d: 'M300 186L362 120L400 146V186Z', strength: 0.32 }
			]
		},
		shapes: [
			{ d: 'M214 200L318 98L400 160V200Z', strength: 0.95 },
			{ d: 'M290 126L318 98L346 120L332 116L324 126L316 116L304 124Z', strength: 1, snow: true },
			{ d: 'M258 168l8-6 8 2-2 6ZM336 150l8-5 7 3-3 5ZM360 172l7-4 6 2-2 4Z', strength: 1 },
			{ d: rect(316, 62, 5, 38) + rect(306, 72, 25, 4), strength: 1 },
			{
				d:
					tri(333, 78, 344, 85, 335, 93) +
					tri(351, 98, 361, 106, 351, 112) +
					tri(369, 121, 378, 130, 367, 134),
				strength: 0.85,
				motion: 'flutter'
			},
			{ d: figure(282, 132, 36, { hat: 'helmet', pack: 'left' }), strength: 1 }
		],
		lines: [
			{ d: 'M321 64Q356 96 392 152', strength: 0.8 },
			{ d: 'M294 112L297 132', strength: 0.9 }
		]
	},
	// Someone climbing over the gate instead of opening it
	heather: {
		shapes: [
			GROUND,
			{ d: rect(236, 150, 70, 36) + rect(350, 150, 50, 36), strength: 0.85 },
			{ d: 'M244 160h20v6h-20ZM272 172h24v6h-24ZM358 160h22v6h-22Z', strength: 1, cut: true },
			{ d: rect(306, 140, 6, 46) + rect(344, 140, 6, 46), strength: 1 },
			{ d: person(328, 148, 48), strength: 1 }
		],
		lines: [{ d: 'M312 148h32M312 162h32M312 176h32M312 176L344 148', strength: 1 }]
	},
	// Hanging a birdhouse on a birch, from a ladder
	birch: {
		shapes: [
			GROUND,
			{ d: 'M342 0h22l4 200h-30Z', strength: 0.9 },
			{ d: 'M342 50l10 3-10 3ZM366 140l-10 3 10 3Z', strength: 1, cut: true },
			{ d: house(316, 112, 28, 22, 12, 3), strength: 1 },
			{ d: disc(330, 102, 4), strength: 1, cut: true },
			{ d: person(304, 148, 46), strength: 1 }
		],
		lines: [
			{
				d: 'M282 186L314 108M302 186L334 108M286 176h20M292 160h20M298 144h20M304 128h20',
				strength: 0.9
			}
		]
	},
	// A windmill turning
	meadow: {
		shapes: [
			GROUND,
			{ d: 'M302 186l8-80h16l8 80Z', strength: 1 },
			{
				d:
					tri(318, 104, 302, 50, 312, 48) +
					tri(318, 104, 372, 92, 372, 102) +
					tri(318, 104, 334, 158, 324, 160) +
					tri(318, 104, 264, 116, 264, 106),
				strength: 0.9,
				motion: 'pulse'
			},
			{ d: rect(312, 166, 12, 20), strength: 1, cut: true }
		]
	},
	// Someone paddleboarding past the buoy
	coast: {
		shapes: [
			WATER,
			{ d: 'M346 180l6-32h18l6 32Z', strength: 0.85, motion: 'rock' },
			{ d: rect(348, 160, 26, 6), strength: 1, cut: true, motion: 'rock' },
			{ d: rounded(250, 180, 76, 6, 3), strength: 1, motion: 'rock' },
			{ d: person(288, 180, 54), strength: 1, motion: 'rock' }
		],
		lines: [
			{ d: 'M300 140L312 192', strength: 0.9, motion: 'rock' },
			{ d: waves(230, 194, 4) + bird(380, 80), strength: 0.6, motion: 'flow' }
		]
	},
	// A telescope pointed at the sky
	aurora: {
		shapes: [
			GROUND,
			{ d: 'M282 128l70-34 8 14-70 34Z', strength: 1 },
			{ d: rounded(272, 128, 20, 18, 4), strength: 1 }
		],
		lines: [{ d: 'M318 124L292 186M318 124L344 186M318 124V186', strength: 0.9 }]
	},
	// A mailbox, leaves blowing past
	autumn: {
		shapes: [
			GROUND,
			{ d: rect(314, 140, 8, 46), strength: 1 },
			{ d: 'M290 140v-22q0-14 14-14h28q14 0 14 14v22Z', strength: 1 },
			{ d: flag(346, 136, 26, 12), strength: 1, motion: 'flutter' }
		]
	}
};
