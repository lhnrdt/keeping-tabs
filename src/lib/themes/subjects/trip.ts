// A trip (#327): out there, in each theme its own way.
import type { ThemeId } from '../palettes';
import type { Scene } from '../scenes';
import { disc, GROUND, hull, person, pine, rect, rounded, tri, WATER, waves, wheel } from '../draw';

export const TRIP: Record<ThemeId, Scene> = {
	// A tent among the pines, its door open
	forest: {
		shapes: [
			GROUND,
			{ d: pine(384, 186, 70), strength: 0.8 },
			{ d: 'M250 186L304 106L358 186Z', strength: 1 },
			{ d: 'M304 138L285 186H323Z', strength: 1, cut: true },
			{ d: 'M304 106v-16l14 6-14 6Z', strength: 0.9, motion: 'flutter' }
		],
		lines: [{ d: 'M250 186L232 192M358 186L372 192', strength: 0.8 }]
	},
	// A kayak out on the fjord
	fjord: {
		shapes: [
			WATER,
			{ d: 'M244 176h132q-10 10-30 10h-74q-20 0-28-10Z', strength: 1, motion: 'rock' },
			{ d: `${disc(310, 140, 8)}M299 176v-20q0-10 11-10t11 10v20Z`, strength: 1, motion: 'rock' }
		],
		lines: [
			{ d: 'M270 136L352 186', strength: 0.9, motion: 'rock' },
			{ d: waves(236, 192, 3), strength: 0.5, motion: 'flow' }
		]
	},
	// A hiker on the way up, the top in sight
	mountains: {
		shapes: [
			{ d: 'M214 200L400 128V200Z', strength: 0.95 },
			{ d: person(300, 164, 58), strength: 1 },
			{ d: rounded(276, 118, 16, 26, 5), strength: 0.85 },
			{ d: 'M380 136V100l16 6-16 6Z', strength: 1, motion: 'flutter' }
		],
		lines: [{ d: 'M318 132L330 162', strength: 0.9 }]
	},
	// A rucksack resting against a stone, a stick beside it
	heather: {
		shapes: [
			GROUND,
			{ d: 'M296 186q6-30 40-32q34 2 40 32Z', strength: 0.8 },
			{ d: rounded(264, 124, 42, 62, 12), strength: 1 },
			{ d: rect(270, 150, 30, 14) + rect(276, 128, 18, 6), strength: 1, cut: true }
		],
		lines: [{ d: 'M318 96L300 186', strength: 0.9 }]
	},
	// A hammock between two posts, swinging
	birch: {
		shapes: [
			GROUND,
			{ d: rect(256, 104, 8, 82) + rect(376, 104, 8, 82), strength: 1 },
			{ d: 'M264 120Q320 172 376 120L376 128Q320 184 264 128Z', strength: 1, motion: 'sway' }
		],
		lines: [{ d: 'M264 120L254 112M376 120L386 112', strength: 0.8 }]
	},
	// A bicycle with full bags
	meadow: {
		shapes: [
			GROUND,
			{ d: disc(278, 166, 20), strength: 1 },
			{ d: disc(278, 166, 16), strength: 1, cut: true },
			{ d: disc(356, 166, 20), strength: 1 },
			{ d: disc(356, 166, 16), strength: 1, cut: true },
			{ d: rounded(266, 120, 30, 26, 6), strength: 0.85 }
		],
		lines: [
			{
				d: 'M278 166L304 132H342L356 166M304 132L318 166L342 132M342 132L338 116h12M300 128h14',
				strength: 1
			}
		]
	},
	// A sailboat on the waves
	coast: {
		shapes: [
			WATER,
			{ d: hull(258, 182, 110, 16), strength: 1, motion: 'rock' },
			{ d: rect(310, 74, 4, 92), strength: 1, motion: 'rock' },
			{ d: tri(316, 78, 316, 160, 368, 160), strength: 0.9, motion: 'rock' },
			{ d: tri(308, 92, 308, 160, 268, 160), strength: 0.7, motion: 'rock' }
		],
		lines: [{ d: waves(228, 194, 4), strength: 0.5, motion: 'flow' }]
	},
	// A camper van under the night sky, its windows lit
	aurora: {
		shapes: [
			GROUND,
			{ d: rounded(244, 128, 136, 48, 14), strength: 1 },
			{ d: rect(264, 112, 60, 16), strength: 0.85 },
			{
				d: rect(258, 140, 26, 18) + rect(292, 140, 26, 18) + rect(334, 140, 30, 18),
				strength: 1,
				cut: true
			},
			...wheel(276, 176, 12),
			...wheel(350, 176, 12)
		]
	},
	// A hot air balloon over the hills
	autumn: {
		shapes: [
			{ d: `${disc(318, 78, 38)}M290 104L346 104L330 128H306Z`, strength: 1, motion: 'bob' },
			{
				d: 'M306 46q12 32 0 72h6q12-40 0-72ZM330 46q-12 32 0 72h-6q-12-40 0-72Z',
				strength: 1,
				cut: true,
				motion: 'bob'
			},
			{ d: rect(306, 142, 24, 18), strength: 1, motion: 'bob' }
		],
		lines: [{ d: 'M306 128L308 142M330 128L328 142', strength: 0.9, motion: 'bob' }]
	}
};
