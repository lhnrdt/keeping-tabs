// Any other group (#327): somewhere to go, in each theme its own way.
import type { ThemeId } from '../palettes';
import type { Scene } from '../scenes';
import { bird, disc, flag, GROUND, house, hull, rect, rounded, tri, WATER, waves } from '../draw';

export const OTHER: Record<ThemeId, Scene> = {
	// A signpost: where to next
	forest: {
		shapes: [
			GROUND,
			{ d: rect(306, 92, 8, 94), strength: 1 },
			{ d: 'M314 100h38l12 10-12 10h-38Z', strength: 1 },
			{ d: 'M306 126h-36l-12 10 12 10h36Z', strength: 0.85 },
			{ d: 'M322 108h28v4h-28Z M272 134h26v4h-26Z', strength: 1, cut: true }
		],
		lines: [{ d: bird(350, 70), strength: 0.8, motion: 'fly' }]
	},
	// A rowing boat moored at the jetty
	fjord: {
		shapes: [
			WATER,
			{ d: rect(330, 164, 70, 8), strength: 1 },
			{ d: hull(262, 184, 70, 14), strength: 1, motion: 'rock' }
		],
		lines: [
			{ d: 'M342 172V200M374 172V200', strength: 0.9 },
			{ d: 'M330 172Q314 184 302 172', strength: 0.7 }
		]
	},
	// A cairn on the top, a flag on it
	mountains: {
		shapes: [
			{ d: 'M214 200L318 142L400 170V200Z', strength: 0.95 },
			{
				d:
					rounded(296, 132, 44, 12, 6) +
					rounded(302, 120, 32, 12, 6) +
					rounded(308, 108, 20, 12, 6),
				strength: 1
			},
			{ d: flag(318, 108, 44), strength: 1, motion: 'flutter' }
		]
	},
	// A gate in a stone wall
	heather: {
		shapes: [
			GROUND,
			{ d: rect(236, 150, 70, 36) + rect(350, 150, 50, 36), strength: 0.85 },
			{ d: 'M244 160h20v6h-20ZM272 172h24v6h-24ZM358 160h22v6h-22Z', strength: 1, cut: true },
			{ d: rect(306, 140, 6, 46) + rect(344, 140, 6, 46), strength: 1 }
		],
		lines: [{ d: 'M312 148h32M312 162h32M312 176h32M312 176L344 148', strength: 1 }]
	},
	// A birdhouse on a pole
	birch: {
		shapes: [
			GROUND,
			{ d: rect(314, 120, 8, 66), strength: 1 },
			{ d: house(302, 128, 32, 26, 16, 4), strength: 1 },
			{ d: disc(318, 112, 5), strength: 1, cut: true }
		],
		lines: [{ d: bird(266, 90) + bird(370, 76, 4), strength: 0.8, motion: 'fly' }]
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
	// A buoy bobbing on the waves
	coast: {
		shapes: [
			WATER,
			{ d: 'M298 178l8-44h24l8 44Z', strength: 1, motion: 'rock' },
			{ d: rect(300, 150, 36, 8), strength: 1, cut: true, motion: 'rock' },
			{ d: rect(312, 120, 12, 14) + disc(318, 116, 6), strength: 1, motion: 'rock' }
		],
		lines: [{ d: waves(236, 190, 4) + bird(370, 80), strength: 0.6, motion: 'flow' }]
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
