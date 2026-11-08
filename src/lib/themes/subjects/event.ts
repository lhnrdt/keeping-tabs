// Something's on (#327): a party or an event, in each theme its own way.
import type { ThemeId } from '../palettes';
import { type Scene, curtain, rays } from '../scenes';
import {
	disc,
	figure,
	flag,
	flame,
	GROUND,
	hull,
	limb,
	logs,
	pine,
	rect,
	rounded,
	seated,
	sparkle,
	tri
} from '../draw';

export const EVENT: Record<ThemeId, Scene> = {
	// A wide clearing at night: friends round the campfire, lights strung high between the pines
	forest: {
		backdrop: {
			shapes: [{ d: 'M210 0h12v186h-12ZM260 0h8v186h-8ZM378 0h10v186h-10Z', strength: 0.3 }]
		},
		shapes: [
			GROUND,
			{ d: pine(230, 186, 120) + pine(400, 186, 124), strength: 0.55 },
			{
				d:
					seated(268, 186, 40) +
					seated(290, 186, 36) +
					seated(346, 186, 38, { hat: 'beanie' }) +
					seated(368, 186, 40),
				strength: 1
			},
			{ d: logs(318, 186, 22), strength: 0.9 },
			{ d: flame(312, 181, 16) + flame(324, 181, 22), strength: 1, motion: 'flicker' }
		],
		lines: [{ d: 'M236 80Q318 140 396 76', strength: 0.7 }],
		dots: [
			[256, 94, 4, 1],
			[280, 106, 4, 1],
			[306, 112, 4, 1],
			[332, 112, 4, 1],
			[358, 104, 4, 1],
			[380, 92, 4, 1],
			[316, 150, 1.5, 0.8],
			[324, 142, 1.2, 0.7]
		]
	},
	// Midsummer by the fjord: the pole wrapped in leaves, wreaths hanging, dancers round it
	fjord: {
		backdrop: {
			shapes: [
				{ d: 'M200 186Q250 156 300 174T400 162V186Z', strength: 0.35 },
				{ d: 'M210 186Q270 168 330 180T400 176V186Z', strength: 0.5 }
			]
		},
		shapes: [
			GROUND,
			{ d: disc(252, 92, 13), strength: 0.35 },
			{ d: rect(316, 48, 6, 138) + rect(290, 76, 58, 5), strength: 1 },
			{
				d: [58, 70, 82, 94, 106, 118, 130, 142, 154, 166]
					.map(
						(y, i) =>
							`M${i % 2 ? 322 : 316} ${y}q${i % 2 ? 9 : -9} -2 ${i % 2 ? 10 : -10} 6q${i % 2 ? -7 : 7} 2 ${i % 2 ? -10 : 10} -6Z`
					)
					.join(''),
				strength: 0.9
			},
			{
				d: [0, 1, 2, 3, 4, 5, 6, 7]
					.map(
						(i) =>
							disc(296 + 10 * Math.cos(i * 0.785), 100 + 10 * Math.sin(i * 0.785), 3.6) +
							disc(342 + 10 * Math.cos(i * 0.785), 100 + 10 * Math.sin(i * 0.785), 3.6)
					)
					.join(''),
				strength: 1,
				motion: 'sway'
			},
			{ d: 'M294 110l-3 12 4-1 2 3ZM340 110l-3 12 4-1 2 3Z', strength: 0.8, motion: 'flutter' },
			{ d: figure(258, 186, 38) + figure(360, 186, 46), strength: 1 },
			{
				d:
					figure(282, 186, 44) +
					'M274 186l4-18h8l4 18Z' +
					figure(384, 186, 40) +
					'M376 186l4-16h8l4 16Z',
				strength: 0.9
			},
			{
				d:
					disc(306, 184, 3) +
					disc(312, 182, 3) +
					disc(328, 182, 3) +
					disc(334, 184, 3) +
					disc(240, 184, 4) +
					disc(398, 185, 4),
				strength: 0.8
			}
		],
		lines: [{ d: 'M264 164l12 0M366 164l12 0', strength: 0.9 }]
	},
	// Everyone together on a summit above a sea of clouds, flags planted in the snow
	mountains: {
		backdrop: {
			shapes: [
				{ d: 'M190 166L230 120L266 166ZM360 166L388 128L416 166Z', strength: 0.35 },
				{ d: 'M-200 200V164' + 'q12-10 24 0'.repeat(25) + 'V200Z', strength: 1, snow: true }
			]
		},
		shapes: [
			{ d: 'M236 200L304 140Q320 128 336 140L400 200Z', strength: 0.95 },
			{
				d: 'M284 158L304 140Q320 128 336 140L356 158L348 155L342 162L334 154L324 160L316 153L306 161L298 154Z',
				strength: 1,
				snow: true
			},
			{ d: 'M-200 200V184' + 'q14-12 28 0'.repeat(22) + 'V200Z', strength: 1, snow: true },
			{
				d:
					figure(306, 139, 30) +
					figure(320, 133, 32, { hat: 'beanie' }) +
					figure(334, 139, 30, { hat: 'helmet' }),
				strength: 1
			},
			{ d: flag(294, 148, 30, 13) + flag(348, 148, 30, 13), strength: 1, motion: 'flutter' }
		]
	},
	// Highland games: tossing the caber, the crowd watching over the hay bales, bunting above
	heather: {
		backdrop: {
			shapes: [{ d: 'M80 200Q240 120 420 136T560 150V200Z', strength: 0.26 }]
		},
		shapes: [
			{
				d:
					figure(226, 178, 30) +
					figure(244, 178, 34, { hat: 'cap' }) +
					figure(262, 178, 28) +
					figure(280, 178, 32) +
					figure(298, 178, 30, { hat: 'cap' }),
				strength: 0.5
			},
			{ d: rect(208, 102, 3, 84) + rect(300, 96, 3, 90), strength: 0.5 },
			{
				d:
					rounded(214, 166, 30, 20, 4) +
					rounded(246, 166, 30, 20, 4) +
					rounded(278, 166, 30, 20, 4),
				strength: 0.75
			},
			{
				d: rect(214, 175, 94, 1.6) + rect(244, 166, 2, 20) + rect(276, 166, 2, 20),
				strength: 1,
				cut: true
			},
			{
				d: 'M217.5 108.1l4 9 4-9ZM229.0 109.4l4 9 4-9ZM240.5 109.8l4 9 4-9ZM252.0 109.5l4 9 4-9ZM263.5 108.3l4 9 4-9ZM275.0 106.4l4 9 4-9ZM286.5 103.6l4 9 4-9Z',
				strength: 0.7,
				motion: 'flutter'
			},
			GROUND,
			{ d: figure(320, 186, 64), strength: 1 },
			{ d: 'M306 186l2-22h24l2 22Z', strength: 0.7 },
			{ d: rect(307, 164, 26, 2), strength: 1, cut: true },
			{
				d: 'M333 166l9 2 30-136-7-1Z' + limb(326, 142, 338, 160, 4) + limb(332, 148, 340, 164, 4),
				strength: 1
			}
		],
		lines: [{ d: 'M210 106Q256 116 302 100', strength: 0.6 }]
	},
	// The crayfish party: paper hats round the long table, the moon lanterns hanging low from the birches
	birch: {
		backdrop: {
			shapes: [
				{
					d:
						disc(210.8, 0, 10.5) +
						disc(216.7, 11, 10.2) +
						disc(214.6, 22, 11.1) +
						disc(206.0, 33, 11.5) +
						disc(205.7, 44, 11.3) +
						disc(206.3, 55, 10.3) +
						disc(212.6, 66, 12.5) +
						disc(387.1, 0, 12.9) +
						disc(385.3, 11, 12.1) +
						disc(384.5, 22, 10.7) +
						disc(401.0, 33, 10.6) +
						disc(394.6, 44, 11.4) +
						disc(391.2, 55, 11.5) +
						disc(386.5, 66, 12.5),
					strength: 0.7
				},
				{ d: rect(210, 0, 6, 186) + rect(390, 0, 6, 186), strength: 1, snow: true }
			]
		},
		shapes: [
			{ d: GROUND.d, strength: 0.55 },
			{
				d:
					seated(236, 170, 46) +
					seated(262, 170, 46) +
					seated(288, 170, 46) +
					seated(330, 170, 46) +
					seated(356, 170, 46),
				strength: 0.85
			},
			{
				d:
					tri(231, 136, 236, 122, 241, 136) +
					tri(283, 136, 288, 122, 293, 136) +
					tri(351, 136, 356, 122, 361, 136),
				strength: 1
			},
			{ d: rect(220, 164, 156, 6) + rect(228, 170, 4, 16) + rect(364, 170, 4, 16), strength: 1 },
			{
				d:
					limb(268, 152, 273, 132, 2.6) +
					rect(270.5, 124, 5, 8) +
					limb(282, 152, 278, 132, 2.6) +
					rect(275.5, 125, 5, 8) +
					limb(350, 152, 346, 132, 2.6) +
					rect(343.5, 124, 5, 8),
				strength: 1
			},
			{ d: disc(250, 86, 10) + disc(306, 98, 12) + disc(362, 84, 10), strength: 1, motion: 'sway' },
			{
				d:
					disc(247, 84, 1.4) +
					disc(253, 84, 1.4) +
					disc(303, 96, 1.6) +
					disc(309, 96, 1.6) +
					disc(359, 82, 1.4) +
					disc(365, 82, 1.4),
				strength: 1,
				cut: true,
				motion: 'sway'
			}
		],
		lines: [
			{ d: 'M213 56Q300 92 393 56', strength: 0.7 },
			{ d: 'M250 66V76M306 76V86M362 64V74', strength: 0.7 },
			{ d: 'M247 89q3 3 6 0M302 102q4 3 8 0M359 87q3 3 6 0', strength: 1, motion: 'sway' },
			{ d: 'M271 120l-3-4M280 120l3-4M345 120l-3-4', strength: 0.8 }
		]
	},
	// The open-air concert in the field: the stage lit up, the crowd's arms in the air up close
	meadow: {
		backdrop: {
			shapes: [
				{ d: 'M60 186Q220 136 460 148V186Z', strength: 0.22 },
				{ d: 'M150 186Q300 158 470 166V186Z', strength: 0.34 }
			]
		},
		shapes: [
			{ d: GROUND.d, strength: 0.5 },
			{ d: rect(300, 160, 96, 8) + rect(306, 168, 4, 18) + rect(386, 168, 4, 18), strength: 1 },
			{
				d: 'M296 120Q348 96 400 120V126H296Z' + rect(298, 124, 4, 36) + rect(394, 124, 4, 36),
				strength: 0.85
			},
			{ d: rect(306, 136, 12, 24) + rect(378, 136, 12, 24), strength: 1 },
			{
				d: disc(310, 142, 3) + disc(310, 152, 3.5) + disc(382, 142, 3) + disc(382, 152, 3.5),
				strength: 1,
				cut: true
			},
			{
				d: figure(348, 160, 30) + limb(352, 144, 358, 136, 2.4) + rect(356, 134, 1.4, 26),
				strength: 1
			},
			{
				d:
					figure(212, 204, 52) +
					figure(240, 206, 60) +
					figure(268, 204, 50) +
					figure(292, 206, 56) +
					limb(250, 172, 244, 124, 4.4) +
					limb(300, 174, 310, 130, 4.4) +
					limb(220, 176, 212, 134, 4),
				strength: 1
			}
		],
		lines: [{ d: 'M318 126l-20 30M348 124v24M378 126l20 30', strength: 0.6, motion: 'shimmer' }]
	},
	// Fireworks over the harbour, the crowd on the pier watching
	coast: {
		backdrop: {
			shapes: [
				{ d: 'M-200 186V170H400V186Z', strength: 0.36 },
				{ d: hull(330, 172, 40, 6) + rect(348, 150, 2, 18), strength: 0.5 }
			]
		},
		shapes: [
			{
				d:
					rect(196, 178, 204, 6) +
					rect(206, 184, 4, 16) +
					rect(246, 184, 4, 16) +
					rect(286, 184, 4, 16) +
					rect(326, 184, 4, 16) +
					rect(366, 184, 4, 16),
				strength: 1
			},
			{
				d:
					figure(226, 178, 40) +
					figure(248, 178, 46, { hat: 'cap' }) +
					figure(270, 178, 38) +
					figure(292, 178, 44) +
					limb(254, 150, 262, 132, 3.4),
				strength: 1
			}
		],
		lines: [
			{
				d: 'M307.7 60.0L322.0 60.0M306.7 63.8L319.1 71.0M303.9 66.7L311.0 79.1M300.0 67.7L300.0 82.0M296.2 66.7L289.0 79.1M293.3 63.8L280.9 71.0M292.3 60.0L278.0 60.0M293.3 56.2L280.9 49.0M296.1 53.3L289.0 40.9M300.0 52.3L300.0 38.0M303.9 53.3L311.0 40.9M306.7 56.1L319.1 49.0',
				strength: 0.9,
				motion: 'pulse'
			},
			{
				d: 'M357.6 84.0L368.0 84.0M356.5 87.3L364.9 93.4M353.7 89.3L356.9 99.2M350.3 89.3L347.1 99.2M347.5 87.3L339.1 93.4M346.4 84.0L336.0 84.0M347.5 80.7L339.1 74.6M350.3 78.7L347.1 68.8M353.7 78.7L356.9 68.8M356.5 80.7L364.9 74.6',
				strength: 0.75,
				motion: 'pulse'
			},
			{
				d: 'M258.5 92.0L267.0 92.0M257.2 95.2L263.2 101.2M254.0 96.5L254.0 105.0M250.8 95.2L244.8 101.2M249.5 92.0L241.0 92.0M250.8 88.8L244.8 82.8M254.0 87.5L254.0 79.0M257.2 88.8L263.2 82.8',
				strength: 0.6,
				motion: 'pulse'
			},
			{ d: 'M300 160V86M352 160V102', strength: 0.3 }
		]
	},
	// Skating on the frozen lake: skaters near and far under a string of lights, the aurora in bands
	aurora: {
		backdrop: {
			night: true,
			shapes: [
				{ d: curtain(206, 400, 40, 20, 22), strength: 0.44, motion: 'shimmer' },
				{ d: curtain(220, 400, 76, 24, 22), strength: 0.37, motion: 'shimmer' },
				{ d: curtain(240, 400, 110, 18, 18), strength: 0.31, motion: 'shimmer' },
				{ d: 'M190 164Q260 152 330 158T410 154V168H190Z', strength: 0.4 }
			],
			lines: [
				{ d: rays(206, 400, 40, 20, 22), strength: 0.78, motion: 'shimmer' },
				{ d: rays(220, 400, 76, 24, 22), strength: 0.66, motion: 'shimmer' },
				{ d: rays(240, 400, 110, 18, 18), strength: 0.54, motion: 'shimmer' }
			]
		},
		shapes: [
			{ d: sparkle(226, 16, 8.1) + sparkle(386, 14, 8.8), strength: 0.55, motion: 'twinkle' },
			{
				d: sparkle(226, 16, 6) + sparkle(386, 14, 6.5),
				strength: 1,
				snow: true,
				motion: 'twinkle'
			},
			{ d: sparkle(300, 8, 6.8) + sparkle(350, 94, 6.1), strength: 0.55, motion: 'twinkle-late' },
			{
				d: sparkle(300, 8, 5) + sparkle(350, 94, 4.5),
				strength: 1,
				snow: true,
				motion: 'twinkle-late'
			},
			{ d: 'M190 168H410V200H190Z', strength: 0.18 },
			{ d: figure(352, 168, 14, { hat: 'beanie' }) + figure(326, 170, 18), strength: 0.6 },
			{
				d: figure(296, 178, 30) + limb(290, 164, 280, 168, 2.4) + rect(287, 178, 18, 1.6),
				strength: 0.8
			},
			{
				d:
					figure(240, 190, 58, { hat: 'beanie' }) +
					limb(250, 158, 268, 150, 4.4) +
					limb(230, 158, 214, 166, 4.4) +
					rect(226, 190, 30, 2.4) +
					rect(232, 186, 3, 4) +
					rect(246, 186, 3, 4),
				strength: 1
			},
			{ d: rect(396, 100, 3, 68) + rect(204, 104, 3, 96), strength: 1 },
			{
				d:
					disc(214, 118, 4) +
					disc(240, 127, 4) +
					disc(268, 134, 4) +
					disc(296, 137, 4) +
					disc(324, 135, 4) +
					disc(352, 128, 4) +
					disc(378, 116, 4),
				strength: 0.6
			},
			{
				d:
					disc(214, 118, 2.8) +
					disc(240, 127, 2.8) +
					disc(268, 134, 2.8) +
					disc(296, 137, 2.8) +
					disc(324, 135, 2.8) +
					disc(352, 128, 2.8) +
					disc(378, 116, 2.8),
				strength: 1,
				snow: true,
				motion: 'twinkle'
			}
		],
		lines: [
			{ d: 'M206 106Q300 150 398 102', strength: 0.7 },
			{ d: 'M262 194q30 5 60 -2M300 184q22 4 44 0M330 176q14 3 28 0', strength: 0.4 }
		]
	},
	// A Ferris wheel at the fair
	autumn: {
		shapes: [
			GROUND,
			{ d: disc(318, 104, 54), strength: 0.9 },
			{ d: disc(318, 104, 48), strength: 1, cut: true },
			{ d: tri(318, 104, 286, 186, 296, 186) + tri(318, 104, 350, 186, 340, 186), strength: 1 },
			{
				d:
					rect(310, 46, 16, 12) +
					rect(358, 98, 16, 12) +
					rect(262, 98, 16, 12) +
					rect(310, 150, 16, 12),
				strength: 1
			}
		],
		lines: [{ d: 'M318 56V152M270 104H366M284 70L352 138M352 70L284 138', strength: 0.6 }]
	}
};
