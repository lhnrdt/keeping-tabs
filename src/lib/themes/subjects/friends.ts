// Friends (#327): a few of you together, in each theme its own way.
import type { ThemeId } from '../palettes';
import { type Scene, curtain, rays } from '../scenes';
import {
	bird,
	cloud,
	disc,
	figure,
	GROUND,
	house,
	hull,
	limb,
	person,
	pine,
	rect,
	rounded,
	roundTree,
	seated,
	sitting,
	sparkle,
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
	// Sauna evening by the lake: the hut smoking on the shore, two on the jetty, one just jumped in
	birch: {
		backdrop: {
			shapes: [
				{ d: 'M250 168Q300 158 360 162T410 158V168Z', strength: 0.35 },
				{
					d:
						rect(270, 148, 1.2, 16) +
						rect(282, 142, 1.2, 22) +
						rect(294, 150, 1.2, 14) +
						rect(306, 144, 1.2, 20) +
						rect(320, 140, 1.2, 24) +
						rect(334, 148, 1.2, 16) +
						rect(348, 144, 1.2, 20) +
						rect(362, 146, 1.2, 18) +
						rect(376, 142, 1.2, 22) +
						rect(390, 148, 1.2, 16) +
						rect(402, 144, 1.2, 20),
					strength: 1,
					snow: true
				},
				{
					d:
						disc(268, 148, 5) +
						disc(272, 151, 5) +
						disc(267, 154, 5) +
						disc(275, 158, 5) +
						disc(283, 142, 4.5) +
						disc(278, 146, 5) +
						disc(284, 150, 4.5) +
						disc(287, 155, 4.5) +
						disc(292, 150, 4.5) +
						disc(299, 153, 5) +
						disc(299, 156, 5) +
						disc(288, 159, 4.5) +
						disc(307, 144, 4.5) +
						disc(311, 148, 5) +
						disc(303, 152, 5) +
						disc(302, 156, 5) +
						disc(320, 140, 5) +
						disc(319, 145, 5) +
						disc(317, 149, 4.5) +
						disc(326, 154, 4.5) +
						disc(337, 148, 4.5) +
						disc(339, 151, 5) +
						disc(338, 154, 5) +
						disc(336, 158, 5) +
						disc(346, 144, 5) +
						disc(352, 148, 4.5) +
						disc(354, 152, 5) +
						disc(347, 156, 5) +
						disc(362, 146, 5) +
						disc(367, 150, 5) +
						disc(357, 153, 4.5) +
						disc(366, 157, 5) +
						disc(377, 142, 5) +
						disc(377, 146, 5) +
						disc(373, 150, 5) +
						disc(377, 155, 5) +
						disc(388, 148, 4.5) +
						disc(389, 151, 5) +
						disc(389, 154, 5) +
						disc(388, 158, 4.5) +
						disc(399, 144, 5) +
						disc(405, 148, 5) +
						disc(405, 152, 5) +
						disc(408, 156, 5),
					strength: 0.35
				}
			],
			lines: [{ d: 'M276 172h18M312 173h26M352 172h20', strength: 0.4, motion: 'shimmer' }]
		},
		shapes: [
			{ d: 'M-200 200V176H400V200Z', strength: 0.4 },
			{ d: 'M196 200V178Q210 172 250 172L262 178V200Z', strength: 0.75 },
			{ d: rect(224, 140, 36, 34), strength: 0.9 },
			{ d: 'M218 142L242 124L266 142Z' + rect(250, 122, 5, 12), strength: 1 },
			{ d: rect(232, 150, 9, 8) + 'M244 174V156h9V174Z', strength: 1, cut: true },
			{
				d:
					rect(258, 170, 92, 4) +
					rect(270, 174, 3, 14) +
					rect(306, 174, 3, 14) +
					rect(344, 174, 3, 14),
				strength: 1
			},
			{
				d:
					seated(306, 170, 40, { hat: 'beanie' }) +
					limb(302, 168, 308, 184, 3) +
					limb(310, 168, 315, 184, 3),
				strength: 0.85
			},
			{
				d: seated(330, 170, 42) + limb(326, 168, 331, 185, 3) + limb(334, 168, 339, 185, 3),
				strength: 1
			},
			{ d: disc(374, 179, 4.5) + limb(378, 180, 382, 168, 2.6), strength: 1, motion: 'rock' },
			{ d: 'M364 183l-6-9 5 3ZM385 183l5-9-5 3ZM368 179l-3-11 5 6Z', strength: 0.8, motion: 'rise' }
		],
		lines: [
			{ d: steam(252, 116, 22) + steam(246, 108, 18), strength: 0.5, motion: 'rise' },
			{ d: 'M362 186q14 4 28 0M358 191q18 5 36 0', strength: 0.6, motion: 'flow' }
		]
	},
	// A kickabout on the meadow: the shot flying in, the keeper stretching for it
	meadow: {
		backdrop: {
			shapes: [
				{ d: 'M60 186Q220 136 460 148V186Z', strength: 0.22 },
				{ d: 'M150 186Q300 158 470 166V186Z', strength: 0.34 },
				{ d: roundTree(220, 170, 40) + roundTree(248, 172, 30), strength: 0.4 }
			]
		},
		shapes: [
			{ d: GROUND.d, strength: 0.5 },
			{
				d:
					rect(366, 152, 1, 34) +
					rect(372, 152, 1, 34) +
					rect(378, 152, 1, 34) +
					rect(384, 152, 1, 34) +
					rect(390, 152, 1, 34) +
					rect(362, 156, 34, 1) +
					rect(362, 162, 34, 1) +
					rect(362, 168, 34, 1) +
					rect(362, 174, 34, 1) +
					rect(362, 180, 34, 1),
				strength: 0.5
			},
			{ d: rect(360, 150, 3, 36) + rect(360, 150, 38, 3), strength: 1 },
			{
				d: figure(372, 186, 48) + limb(366, 158, 352, 146, 3.4) + limb(376, 158, 364, 142, 3.4),
				strength: 0.85
			},

			{ d: figure(290, 186, 56, { hat: 'cap' }) + limb(296, 178, 312, 168, 3.6), strength: 1 },
			{ d: disc(336, 146, 8.5), strength: 1, motion: 'fly' },
			{
				d: 'M334 142l3 1-1 3-3-1ZM340 149l2 2-2 2-2-2ZM331 150l2 1-1 2-2-1Z',
				strength: 1,
				cut: true,
				motion: 'fly'
			}
		],
		lines: [{ d: 'M314 164q8-10 14-14M312 156q8-6 14-8', strength: 0.5 }]
	},
	// Beach volleyball: the spike going over the net, the block going up
	coast: {
		backdrop: {
			shapes: [{ d: 'M-200 186V166H400V186Z', strength: 0.36 }],
			lines: [{ d: waves(220, 176, 4), strength: 0.45, motion: 'flow' }]
		},
		shapes: [
			{ d: 'M-200 200V184H400V200Z', strength: 0.45 },
			{ d: rect(318, 128, 2.4, 58) + rect(318, 128, 2.4, 2), strength: 1 },
			{ d: rect(310, 130, 18, 24), strength: 0.75 },
			{
				d:
					rect(310, 134, 18, 1) +
					rect(310, 138, 18, 1) +
					rect(310, 142, 18, 1) +
					rect(310, 146, 18, 1) +
					rect(310, 150, 18, 1) +
					rect(312, 130, 1, 24) +
					rect(316, 130, 1, 24) +
					rect(320, 130, 1, 24) +
					rect(324, 130, 1, 24),
				strength: 1,
				cut: true
			},
			{ d: rect(308, 128, 22, 3), strength: 1 },
			{ d: figure(296, 180, 54, { hat: 'cap' }) + limb(302, 150, 312, 124, 3.4), strength: 1 },
			{
				d: figure(344, 184, 50) + limb(338, 156, 328, 130, 3.2) + limb(348, 156, 338, 128, 3.2),
				strength: 0.85
			},
			{ d: figure(256, 186, 46), strength: 0.7 },
			{ d: disc(318, 116, 6.5), strength: 1, motion: 'bob' }
		],
		lines: [{ d: 'M314 113q4 3 8 0M313 118q5 2 10 0', strength: 0.6, motion: 'bob' }]
	},
	// Three friends soaking in the big wooden hot tub, steam rising, the sauna glowing behind, the lights overhead
	aurora: {
		backdrop: {
			night: true,
			shapes: [
				{ d: curtain(236, 400, 58, 28, 36), strength: 0.51, motion: 'shimmer' },
				{ d: 'M190 186V170Q260 160 330 164T410 162V186Z', strength: 0.4 },
				{
					d:
						pine(258, 170, 30) +
						pine(274, 170, 40) +
						pine(290, 170, 32) +
						pine(352, 170, 42) +
						pine(370, 170, 34) +
						pine(388, 170, 44) +
						pine(402, 170, 36),
					strength: 0.5
				},
				{ d: house(208, 172, 30, 20, 12, 3) + rect(228, 146, 5, 10), strength: 0.75 },
				{ d: rect(214, 160, 8, 7), strength: 1, cut: true }
			],
			lines: [{ d: rays(236, 400, 58, 28, 36), strength: 0.9, motion: 'shimmer' }]
		},
		shapes: [
			{
				d: sparkle(256, 18, 8.8) + sparkle(392, 22, 8.8) + sparkle(370, 70, 6.1),
				strength: 0.55,
				motion: 'twinkle'
			},
			{
				d: sparkle(256, 18, 6.5) + sparkle(392, 22, 6.5) + sparkle(370, 70, 4.5),
				strength: 1,
				snow: true,
				motion: 'twinkle'
			},
			{ d: sparkle(318, 10, 6.8) + sparkle(286, 46, 6.1), strength: 0.55, motion: 'twinkle-late' },
			{
				d: sparkle(318, 10, 5) + sparkle(286, 46, 4.5),
				strength: 1,
				snow: true,
				motion: 'twinkle-late'
			},
			{ d: GROUND.d, strength: 0.6 },
			{
				d: figure(290, 168, 50) + figure(324, 166, 54, { hat: 'beanie' }) + figure(358, 168, 48),
				strength: 1
			},
			{
				d:
					limb(278, 142, 264, 150, 4.4) +
					limb(370, 142, 386, 150, 4.4) +
					limb(334, 140, 342, 120, 4.2) +
					rounded(338, 110, 9, 11, 2),
				strength: 1
			},
			{ d: 'M262 152H388L382 196H268Z', strength: 0.85 },
			{ d: rect(258, 148, 134, 6), strength: 1 },
			{ d: rect(266, 168, 118, 3) + rect(268, 184, 114, 3), strength: 0.95 }
		],
		lines: [
			{
				d: steam(306, 140, 24) + steam(344, 138, 26) + steam(372, 142, 20),
				strength: 0.5,
				motion: 'rise'
			},
			{ d: steam(230, 142, 22), strength: 0.4, motion: 'rise' }
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
