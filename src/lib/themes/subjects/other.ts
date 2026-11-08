// Any other group (#327): somewhere to go, in each theme its own way.
import type { ThemeId } from '../palettes';
import type { Scene } from '../scenes';
import {
	bird,
	disc,
	figure,
	flag,
	GROUND,
	hull,
	limb,
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
				{ d: 'M200 200L240 136L266 158L292 126L330 200Z', strength: 0.4 },
				{ d: 'M300 200L362 120L400 146V200Z', strength: 0.32 }
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
	// A stone circle on the knoll, a walker standing in the gateway of its tallest stones
	heather: {
		backdrop: {
			shapes: [
				{ d: 'M100 200Q260 120 460 150V200Z', strength: 0.2 },
				{ d: 'M60 200Q200 150 320 162T520 170V200Z', strength: 0.32 }
			]
		},
		shapes: [
			{ d: 'M226 188l2-12l4-4l5 2l1 14Z', strength: 0.32 },
			{ d: 'M246 184l1-18l5-6l6 2l2 22Z', strength: 0.4 },
			{ d: 'M270 178l1-26l6-8l8 2l3 6l1 26Z', strength: 0.48 },
			{ d: 'M298 172l2-34l7-8l9 3l3 8l1 31Z', strength: 0.56 },
			{ d: 'M332 174l3-76l7-4l9 2l2 78ZM372 174l1-80l9-2l8 4l2 78Z', strength: 0.66 },
			{ d: 'M326 98l4-9l64-3l5 8l-3 9l-66 3Z', strength: 0.75 },
			{ d: figure(362, 170, 34, { hat: 'beanie' }), strength: 1 },
			{ d: 'M150 200Q250 160 330 166T420 172V200Z', strength: 0.7 },
			{ d: 'M282 202l2-24l8-8l11 3l4 29Z', strength: 0.9 },
			{
				d:
					disc(372, 198, 10) +
					disc(386, 193, 12) +
					disc(400, 197, 9) +
					disc(204, 199, 8) +
					disc(217, 197, 9),
				strength: 1
			},
			{
				d:
					disc(378, 190, 1.6) +
					disc(388, 185, 1.6) +
					disc(394, 191, 1.6) +
					disc(210, 192, 1.4) +
					disc(220, 191, 1.4),
				strength: 1,
				cut: true
			}
		]
	},
	// Fetching the post: the mailbox on its post by the gravel road, the birch wood white behind
	birch: {
		backdrop: {
			shapes: [
				{
					d:
						rect(240, 0, 3, 186) +
						rect(258, 0, 4, 186) +
						rect(276, 0, 3, 186) +
						rect(298, 0, 4, 186) +
						rect(318, 0, 3, 186) +
						rect(338, 0, 4, 186) +
						rect(356, 0, 3, 186),
					strength: 1,
					snow: true
				},
				{
					d: 'M240 83.9l1.3 1.45l-1.3 1.45ZM243 101.5l-1.8 1.15l1.8 1.15ZM240 126.1l1.5 1.05l-1.5 1.05ZM243 145.0l-1.9 1.15l1.9 1.15ZM240 171.3l1.7 1.25l-1.7 1.25ZM258 82.2l1.7 1.45l-1.7 1.45ZM262 102.4l-1.8 0.95l1.8 0.95ZM258 125.7l2.1 0.95l-2.1 0.95ZM262 145.3l-1.8 1.5l1.8 1.5ZM258 172.8l2.8 1.3l-2.8 1.3ZM276 80.0l1.4 1.35l-1.4 1.35ZM279 106.4l-1.5 1.0l1.5 1.0ZM276 127.2l1.3 1.15l-1.3 1.15ZM279 144.6l-1.5 0.8l1.5 0.8ZM276 170.7l1.4 1.1l-1.4 1.1ZM298 78.6l2.4 0.95l-2.4 0.95ZM302 100.4l-2.5 1.1l2.5 1.1ZM298 128.0l2.2 1.15l-2.2 1.15ZM302 148.8l-1.9 1.2l1.9 1.2ZM298 166.1l2.7 1.2l-2.7 1.2ZM318 82.6l1.2 1.1l-1.2 1.1ZM321 102.4l-1.8 1.25l1.8 1.25ZM318 124.3l1.8 1.05l-1.8 1.05ZM321 148.9l-1.4 1.1l1.4 1.1ZM318 166.3l2.1 1.4l-2.1 1.4ZM338 77.9l1.9 1.15l-1.9 1.15ZM342 105.6l-2.3 1.3l2.3 1.3ZM338 126.7l2.7 1.05l-2.7 1.05ZM342 148.8l-1.8 1.25l1.8 1.25ZM338 165.3l2.3 1.25l-2.3 1.25ZM356 82.2l1.6 1.0l-1.6 1.0ZM359 102.5l-1.6 1.2l1.6 1.2ZM356 122.5l1.5 1.1l-1.5 1.1ZM359 148.5l-1.6 1.05l1.6 1.05ZM356 168.2l1.5 1.0l-1.5 1.0Z',
					strength: 0.5
				}
			]
		},
		shapes: [
			{ d: GROUND.d, strength: 0.6 },
			{ d: rect(372, 0, 8, 186) + rect(388, 0, 6, 186), strength: 1, snow: true },
			{
				d: 'M372 16.5l6.0 2.05l-6.0 2.05ZM380 36.4l-5.2 1.85l5.2 1.85ZM372 58.4l5.9 1.55l-5.9 1.55ZM380 72.3l-6.0 1.8l6.0 1.8ZM372 97.1l4.0 1.85l-4.0 1.85ZM380 115.7l-4.5 2.2l4.5 2.2ZM372 136.0l4.1 1.5l-4.1 1.5ZM380 152.0l-6.3 1.8l6.3 1.8ZM372 168.3l5.0 1.5l-5.0 1.5ZM388 33.6l4.7 1.55l-4.7 1.55ZM394 46.7l-4.5 2.05l4.5 2.05ZM388 71.4l3.6 1.95l-3.6 1.95ZM394 90.9l-4.0 1.6l4.0 1.6ZM388 109.4l3.7 2.05l-3.7 2.05ZM394 134.0l-4.7 1.9l4.7 1.9ZM388 149.6l3.5 1.55l-3.5 1.55ZM394 166.2l-3.8 1.75l3.8 1.75Z',
				strength: 1
			},
			{
				d:
					disc(250, 192, 1.5) +
					disc(268, 195, 1.2) +
					disc(286, 191, 1.4) +
					disc(358, 193, 1.5) +
					disc(372, 196, 1.2),
				strength: 1
			},
			{ d: rect(338, 138, 4, 48), strength: 0.9 },
			{ d: 'M330 187l2-7 2 7ZM334 187l3-9 1 9ZM342 187l2-8 3 8ZM346 187l3-6 1 6Z', strength: 0.9 },
			{ d: 'M326 140v-12q0-8 8-8h12q8 0 8 8v12Z', strength: 1 },
			{ d: rect(354, 122, 2, 14) + 'M356 122h8v5h-8Z', strength: 1, motion: 'flutter' },
			{ d: rect(328, 136, 24, 1.6), strength: 1, cut: true },
			{ d: figure(300, 186, 52, { hat: 'cap' }) + limb(306, 160, 316, 146, 3.6), strength: 1 },
			{ d: 'M312 134h16v11h-16Z', strength: 1, snow: true },
			{ d: rect(212, 0, 18, 200), strength: 1, snow: true },
			{
				d: 'M212 13.4l11.9 1.8l-11.9 1.8ZM230 35.3l-12.4 1.55l12.4 1.55ZM212 49.6l13.5 1.7l-13.5 1.7ZM230 70.4l-14.4 1.85l14.4 1.85ZM212 94.2l11.6 2.0l-11.6 2.0ZM230 107.7l-12.4 2.15l12.4 2.15ZM212 129.7l13.0 2.0l-13.0 2.0ZM230 145.0l-13.1 1.95l13.1 1.95ZM212 165.9l9.2 2.15l-9.2 2.15ZM230 186.3l-12.9 2.15l12.9 2.15Z',
				strength: 1
			}
		],
		lines: [{ d: 'M312 134.5l8 5.5 8-5.5', strength: 0.8 }]
	},
	// Picking wildflowers in the long grass, the meadow in bloom right up close
	meadow: {
		backdrop: {
			shapes: [
				{ d: 'M60 186Q220 136 460 148V186Z', strength: 0.22 },
				{ d: 'M150 186Q300 158 470 166V186Z', strength: 0.34 }
			]
		},
		shapes: [
			{ d: GROUND.d, strength: 0.5 },
			{ d: figure(300, 186, 54, { hat: 'cap' }) + limb(306, 156, 318, 146, 3.2), strength: 1 },
			{
				d:
					limb(318, 146, 324, 122, 1.4) +
					limb(318, 146, 314, 120, 1.4) +
					limb(318, 146, 330, 128, 1.4) +
					disc(324, 120, 5) +
					disc(313, 118, 5) +
					disc(331, 126, 4.5),
				strength: 1
			},
			{
				d:
					limb(214, 200, 216, 150, 1.6) +
					limb(226, 200, 228, 138, 1.6) +
					limb(240, 200, 242, 156, 1.6) +
					limb(370, 200, 372, 146, 1.6) +
					limb(384, 200, 386, 134, 1.6) +
					limb(396, 200, 398, 152, 1.6),
				strength: 0.9
			},
			{
				d:
					disc(221.0, 150.0, 2.25) +
					disc(219.54, 153.54, 2.25) +
					disc(216.0, 155.0, 2.25) +
					disc(212.46, 153.54, 2.25) +
					disc(211.0, 150.0, 2.25) +
					disc(212.46, 146.46, 2.25) +
					disc(216.0, 145.0, 2.25) +
					disc(219.54, 146.46, 2.25) +
					disc(228, 138, 7) +
					disc(247.0, 156.0, 2.25) +
					disc(245.54, 159.54, 2.25) +
					disc(242.0, 161.0, 2.25) +
					disc(238.46, 159.54, 2.25) +
					disc(237.0, 156.0, 2.25) +
					disc(238.46, 152.46, 2.25) +
					disc(242.0, 151.0, 2.25) +
					disc(245.54, 152.46, 2.25) +
					disc(372, 146, 7) +
					disc(391.0, 134.0, 2.25) +
					disc(389.54, 137.54, 2.25) +
					disc(386.0, 139.0, 2.25) +
					disc(382.46, 137.54, 2.25) +
					disc(381.0, 134.0, 2.25) +
					disc(382.46, 130.46, 2.25) +
					disc(386.0, 129.0, 2.25) +
					disc(389.54, 130.46, 2.25) +
					disc(398, 152, 7),
				strength: 1
			},
			{
				d:
					disc(216, 150, 2.2) +
					disc(228, 138, 2.6) +
					disc(242, 156, 2.2) +
					disc(372, 146, 2.6) +
					disc(386, 134, 2.2) +
					disc(398, 152, 2.6),
				strength: 1,
				cut: true
			}
		],
		lines: [
			{
				d: 'M206 200l-2-14M232 200l2-16M252 200l-3-12M360 200l3-13M392 200l-2-14',
				strength: 0.8,
				motion: 'sway'
			}
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
