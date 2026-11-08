// Friends (#327): a few of you together, in each theme its own way.
import type { ThemeId } from '../palettes';
import type { Scene } from '../scenes';
import {
	bird,
	cloud,
	disc,
	figure,
	GROUND,
	hull,
	limb,
	person,
	pine,
	rect,
	rounded,
	seated,
	sitting,
	steam,
	WATER,
	waves
} from '../draw';

export const FRIENDS: Record<ThemeId, Scene> = {
	// Friends at a rope swing on a big old pine: one swinging out high, two watching
	forest: {
		backdrop: {
			shapes: [
				{ d: 'M200 186C240 130 300 116 400 124V186Z', strength: 0.18 },
				{ d: 'M200 186C250 150 320 140 400 146V186Z', strength: 0.3 }
			]
		},
		shapes: [
			GROUND,
			{ d: pine(380, 92, 76), strength: 0.75 },
			{ d: rect(372, 70, 16, 116) + 'M372 82L326 72L326 66L376 74Z', strength: 0.9 },
			{ d: sitting(276, 138, 46, -1), strength: 1, motion: 'sway' },
			{ d: rounded(262, 138, 30, 5, 2), strength: 1, motion: 'sway' },
			{ d: figure(322, 186, 54) + figure(348, 186, 48, { hat: 'beanie' }), strength: 1 }
		],
		lines: [
			{ d: 'M328 70L264 140M332 70L290 140', strength: 1, motion: 'sway' },
			{ d: 'M294 152Q308 160 324 162M292 162Q306 170 322 172', strength: 0.5 }
		]
	},
	// Friends out on a rock tongue high above the fjord, one sitting at the tip, legs over the drop
	fjord: {
		backdrop: {
			shapes: [
				{ d: 'M110 200L210 88L236 96L286 200Z', strength: 0.4 },
				{ d: 'M236 182L276 124L306 182Z', strength: 0.22 }
			]
		},
		shapes: [
			WATER,
			{ d: hull(258, 186, 18, 5), strength: 0.7 },
			{ d: 'M356 98L400 90V182H350L360 152L352 128L366 116Z', strength: 0.65 },
			{ d: 'M276 112L290 107L372 100L366 114L340 118L298 116Z', strength: 1 },
			{ d: sitting(284, 110, 42, -1), strength: 1 },
			{
				d: sitting(320, 107, 40, -1) + figure(350, 104, 44, { hat: 'beanie', pack: 'right' }),
				strength: 0.9
			},
			{ d: cloud(236, 140, 50) + cloud(292, 150, 40), strength: 0.25, motion: 'drift' }
		],
		lines: [
			{ d: waves(230, 196, 3) + bird(250, 122) + bird(266, 132, 4), strength: 0.5, motion: 'flow' }
		]
	},
	// A rope team of three crossing the glacier, a crevasse gaping in front of them
	mountains: {
		backdrop: {
			shapes: [
				{ d: 'M150 200L240 84L290 130L344 70L430 200Z', strength: 0.3 },
				{
					d: 'M240 84L256 104L248 100L242 108L234 100L226 104ZM344 70L362 92L350 88L344 96L336 88L328 92Z',
					strength: 1,
					snow: true
				}
			]
		},
		shapes: [
			{ d: 'M-200 200V166Q240 160 300 166T400 162V200Z', strength: 1, snow: true },
			{
				d: 'M212 184L224 180L236 182L250 177L266 180L282 176L298 179L320 178L312 186L296 192L278 194L258 196L238 194L222 190Z',
				strength: 0.5
			},
			{ d: 'M228 186Q264 180 306 182Q266 190 228 186Z', strength: 1 },
			{
				d: 'M236 182l3 6 2-6ZM256 178l3 7 2-7ZM284 177l3 6 2-6ZM300 179l2 5 2-5Z',
				strength: 1,
				snow: true
			},
			{ d: 'M372 164l4-14 8-2 6 6 2 10ZM230 168l3-8 7 1 3 7Z', strength: 0.6 },
			{
				d:
					figure(262, 166, 40, { hat: 'helmet', pack: 'left' }) +
					figure(310, 165, 40, { hat: 'helmet', pack: 'left' }) +
					figure(352, 164, 40, { hat: 'helmet', pack: 'left' }),
				strength: 1
			}
		],
		lines: [{ d: 'M268 146Q288 152 304 145M316 145Q332 150 346 144', strength: 1 }]
	},
	// Flying a kite together on the windy hilltop, the kite high above the moor
	heather: {
		backdrop: {
			shapes: [{ d: 'M60 200Q180 160 300 172T540 176V200Z', strength: 0.26 }]
		},
		shapes: [
			{ d: 'M200 200Q280 150 400 156V200Z', strength: 0.7 },
			{ d: seated(294, 166, 42, { hat: 'beanie' }), strength: 0.85 },
			{ d: figure(322, 161, 50) + limb(328, 134, 336, 110, 3.6), strength: 1 },
			{ d: figure(352, 157, 30, { hat: 'cap' }) + limb(356, 140, 364, 128, 2.6), strength: 0.85 },
			{
				d:
					'M354 26l13 18-13 24-13-24Z' +
					limb(354, 68, 348, 80, 1.4) +
					limb(348, 80, 356, 92, 1.4) +
					limb(356, 92, 350, 104, 1.4) +
					'M348 80l-5-3v6ZM348 80l5-3v6ZM356 92l-5-3v6ZM356 92l5-3v6Z',
				strength: 1,
				rotate: { deg: -24, x: 354, y: 44 },
				motion: 'sway'
			},
			{
				d: rect(341, 43, 26, 1.6) + rect(353, 27, 1.6, 40),
				strength: 1,
				cut: true,
				rotate: { deg: -24, x: 354, y: 44 },
				motion: 'sway'
			},
			{
				d:
					disc(214, 198, 10) +
					disc(228, 194, 12) +
					disc(242, 199, 9) +
					disc(384, 196, 10) +
					disc(398, 193, 11),
				strength: 1
			},
			{
				d:
					disc(220, 190, 1.6) +
					disc(230, 186, 1.6) +
					disc(236, 192, 1.6) +
					disc(390, 188, 1.6) +
					disc(396, 184, 1.4),
				strength: 1,
				cut: true
			}
		],
		lines: [{ d: 'M336 110Q356 90 354 44', strength: 0.6 }]
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
