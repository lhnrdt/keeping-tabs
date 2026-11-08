// Friends (#327): a few of you together, in each theme its own way.
import type { ThemeId } from '../palettes';
import type { Scene } from '../scenes';
import { disc, GROUND, hull, person, rect, rounded, sitting, steam, WATER } from '../draw';

export const FRIENDS: Record<ThemeId, Scene> = {
	// Friends side by side, tall and small
	forest: {
		shapes: [
			GROUND,
			{ d: person(262, 186, 54) + person(360, 186, 56), strength: 0.8, motion: 'bob-slow' },
			{ d: person(296, 186, 66) + person(330, 186, 62), strength: 1 }
		]
	},
	// Three paddling one canoe
	fjord: {
		shapes: [
			WATER,
			{ d: hull(244, 180, 144, 14), strength: 1, motion: 'rock' },
			{
				d: `${disc(278, 146, 7)}${disc(316, 144, 7)}${disc(354, 146, 7)}M268 166v-8q0-8 10-8t10 8v8ZM306 166v-8q0-8 10-8t10 8v8ZM344 166v-8q0-8 10-8t10 8v8Z`,
				strength: 1,
				motion: 'rock'
			}
		],
		lines: [
			{ d: 'M296 150L268 190M334 150L306 190M372 150L344 190', strength: 0.9, motion: 'rock' }
		]
	},
	// A rope team on the way up
	mountains: {
		shapes: [
			{ d: 'M214 200L400 120V200Z', strength: 0.95 },
			{ d: person(268, 178, 40) + person(314, 158, 40) + person(360, 139, 40), strength: 1 }
		],
		lines: [{ d: 'M276 160Q296 158 306 140Q336 136 352 120', strength: 0.9 }]
	},
	// Three on a stone wall
	heather: {
		shapes: [
			GROUND,
			{ d: rect(248, 156, 148, 30), strength: 0.85 },
			{
				d: 'M256 164h22v8h-22ZM288 164h26v8h-26ZM326 164h24v8h-24ZM360 164h28v8h-28ZM270 176h26v6h-26ZM308 176h30v6h-30ZM350 176h26v6h-26Z',
				strength: 1,
				cut: true
			},
			{ d: sitting(276, 156, 46) + sitting(320, 156, 50) + sitting(364, 156, 44), strength: 1 }
		]
	},
	// Throwing a frisbee
	birch: {
		shapes: [
			GROUND,
			{ d: person(262, 186, 60) + person(378, 186, 56), strength: 1 },
			{ d: 'M308 112q12-6 24 0q-12 6-24 0Z', strength: 1, motion: 'bob' }
		],
		lines: [{ d: 'M282 118h18M286 124h12', strength: 0.6 }]
	},
	// A kickabout in front of the goal
	meadow: {
		shapes: [
			GROUND,
			{ d: rect(330, 120, 6, 66) + rect(390, 120, 6, 66) + rect(330, 116, 66, 6), strength: 1 },
			{ d: person(270, 186, 58) + person(352, 186, 50), strength: 1 },
			{ d: disc(306, 178, 8), strength: 1, motion: 'bob' }
		],
		lines: [{ d: 'M338 130L388 180M350 124L392 168M336 150L370 184', strength: 0.35 }]
	},
	// Beach volleyball over the net
	coast: {
		shapes: [
			GROUND,
			{ d: rect(296, 116, 4, 70) + rect(336, 116, 4, 70), strength: 1 },
			{ d: rect(300, 120, 36, 22), strength: 0.45 },
			{
				d: 'M306 120v22h2v-22ZM314 120v22h2v-22ZM322 120v22h2v-22ZM330 120v22h2v-22ZM300 130h36v2h-36Z',
				strength: 1,
				cut: true
			},
			{ d: person(262, 186, 60) + person(374, 186, 58), strength: 1 },
			{ d: disc(318, 90, 9), strength: 1, motion: 'bob' }
		]
	},
	// A hot tub under the stars, steam rising
	aurora: {
		shapes: [
			GROUND,
			{ d: disc(280, 150, 9) + disc(314, 146, 10) + disc(350, 150, 9), strength: 1 },
			{ d: rounded(250, 156, 136, 30, 6), strength: 1 }
		],
		lines: [
			{ d: steam(268, 140) + steam(334, 136), strength: 0.7, motion: 'rise' },
			{ d: 'M250 168h136', strength: 0.4 }
		]
	},
	// Flying a kite
	autumn: {
		shapes: [
			GROUND,
			{ d: person(276, 186, 62) + person(312, 186, 52), strength: 1 },
			{ d: 'M352 54l18 22-18 26-18-26Z', strength: 1, motion: 'sway' },
			{ d: 'M352 62v32M340 76h24', strength: 1, cut: true }
		],
		lines: [{ d: 'M286 130Q330 120 352 102M352 102q-6 10 0 18t0 18', strength: 0.8 }]
	}
};
