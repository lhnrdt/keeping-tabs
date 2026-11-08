// A car shared (#327): on the road, in each theme its own way.
import type { ThemeId } from '../palettes';
import { mirrored, type Scene, type Shape } from '../scenes';
import {
	disc,
	figure,
	GROUND,
	knobbyTyre,
	limb,
	pine,
	rect,
	rounded,
	steam,
	tri,
	WATER,
	waves,
	wheel
} from '../draw';

const IDLE = 'idle' as const;

/** The everyday car, its front to the right, its wheels on the ground at `ground` */
const hatchback = (x: number, ground: number): Shape[] => {
	const y = ground - 13;
	return [
		{
			d: `M${x} ${y}v-14q0-7 8-9l22-5 20-22q4-4 10-4h36q7 0 11 6l14 20 10 3q7 2 7 9v16Z`,
			strength: 1,
			motion: IDLE
		},
		{
			d:
				`M${x + 40} ${y - 30}l14-15q2-2 6-2h10v17ZM${x + 78} ${y - 47}h16q3 0 5 3l10 14h-31Z` +
				rect(x + 74, y - 28, 2, 24) +
				rect(x + 132, y - 18, 6, 4),
			strength: 1,
			cut: true,
			motion: IDLE
		},
		...wheel(x + 32, y, 13),
		...wheel(x + 106, y, 13)
	];
};

export const CAR: Record<ThemeId, Scene> = {
	// Off-road: a 4×4 on a rough forest track, facing into the header, mud flying behind
	forest: {
		backdrop: {
			shapes: [
				{ d: 'M200 186L400 120V186Z', strength: 0.3 },
				{
					d: 'M300 114L308.93 130.8H291.07ZM300 123.6L311.81 141.2H288.19ZM300 134.0L314.4 150.8H285.6ZM298.4 150.0h3.2V154h-3.2ZM340 96L349.82 114.48H330.18ZM340 106.56L352.99 125.92H327.01ZM340 118.0L355.84 136.48H324.16ZM338.24 135.6h3.52V140h-3.52ZM380 80L390.27 99.32H369.73ZM380 91.04L393.58 111.28H366.42ZM380 103.0L396.56 122.32H363.44ZM378.16 121.4h3.68V126h-3.68Z',
					strength: 0.4
				}
			]
		},
		shapes: [
			GROUND,
			{ d: pine(232, 186, 66), strength: 0.5 },
			{ d: 'M240 186l6-8 10 2 4 6Z', strength: 0.85 },
			...mirrored(318, [
				{ d: 'M274 148v-32q0-6 6-6h64q6 0 6 6v32Z', strength: 1, motion: 'idle' },
				{ d: 'M350 148v-16h24q8 0 8 8v8Z', strength: 1, motion: 'idle' },
				{ d: rounded(270, 146, 112, 18, 4), strength: 1, motion: 'idle' },
				{
					d: rect(284, 118, 26, 20) + 'M316 118h20l10 20h-30Z',
					strength: 1,
					cut: true,
					motion: 'idle'
				},
				{ d: rect(374, 141, 6, 4), strength: 1, cut: true, motion: 'idle' },
				{ d: rect(276, 102, 72, 3) + rect(282, 105, 3, 5) + rect(339, 105, 3, 5), strength: 1 },
				{ d: rect(286, 90, 24, 12) + rect(316, 94, 26, 8), strength: 0.9 },
				{ d: rounded(264, 120, 10, 30, 4), strength: 1, motion: 'idle' },
				{ d: knobbyTyre(298, 169, 17) + knobbyTyre(358, 169, 17), strength: 1 },
				{ d: disc(298, 169, 8) + disc(358, 169, 8), strength: 1, cut: true },
				{ d: disc(298, 169, 4) + disc(358, 169, 4), strength: 1 },
				{
					d: disc(272, 178, 3.5) + disc(262, 170, 3) + disc(256, 180, 2.5) + disc(266, 160, 2.2),
					strength: 0.8,
					motion: 'rise'
				}
			]),
			{ d: pine(404, 186, 118), strength: 0.75 }
		]
	},
	// Crossing on the ferry: the car on the open deck, the bridge and funnel behind, foam at the stern
	fjord: {
		backdrop: {
			shapes: [
				{ d: 'M200 182L250 110L320 182Z', strength: 0.32 },
				{ d: 'M250 110L262 124L254 121L248 128L242 121L238 124Z', strength: 1, snow: true },
				{ d: 'M200 182V176Q300 172 400 176V182Z', strength: 0.45 }
			]
		},
		shapes: [
			WATER,
			{ d: 'M236 168h164v8l-8 12H250Z', strength: 0.75, motion: 'rock' },
			{ d: rect(236, 164, 164, 4), strength: 0.7, motion: 'rock' },
			{ d: 'M236 164l-12-24 8-3 12 24Z', strength: 0.7, motion: 'rock' },
			{
				d: rect(248, 150, 2, 14) + rect(340, 150, 2, 14) + rect(248, 150, 94, 2),
				strength: 0.7,
				motion: 'rock'
			},
			{ d: figure(252, 164, 28, { hat: 'cap' }), strength: 1, motion: 'rock' },
			{ d: rect(352, 124, 40, 40) + rect(358, 108, 26, 16), strength: 0.75, motion: 'rock' },
			{
				d:
					rect(358, 130, 8, 8) +
					rect(370, 130, 8, 8) +
					rect(382, 130, 6, 8) +
					rect(362, 112, 18, 6),
				strength: 1,
				cut: true,
				motion: 'rock'
			},
			{ d: rect(368, 92, 10, 16), strength: 0.7, motion: 'rock' },
			{
				d: 'M262 158v-8q0-5 6-6l14-3 12-12q3-3 7-3h22q5 0 7 4l9 12 6 2q5 1 5 6v8Z',
				strength: 1,
				motion: 'rock'
			},
			{
				d: rect(296, 132, 12, 10) + rect(314, 132, 12, 10),
				strength: 1,
				cut: true,
				motion: 'rock'
			},
			{ d: disc(278, 158, 6) + disc(330, 158, 6), strength: 1, motion: 'rock' },
			{ d: disc(278, 158, 2.5) + disc(330, 158, 2.5), strength: 1, cut: true, motion: 'rock' },
			{
				d: disc(396, 186, 6) + disc(388, 190, 5) + disc(380, 186, 4),
				strength: 1,
				cut: true,
				motion: 'flow'
			},
			{ d: rect(214, 146, 7, 48), strength: 0.9 },
			{ d: rect(214, 156, 7, 6) + rect(214, 170, 7, 6), strength: 1, cut: true },
			{ d: disc(217.5, 142, 4), strength: 1 }
		],
		lines: [
			{ d: steam(373, 84, 18), strength: 0.5, motion: 'rise' },
			{ d: waves(236, 196, 4), strength: 0.5, motion: 'flow' }
		]
	},
	// Over the pass between high snow walls, skis on the roof, the pass sign by the road
	mountains: {
		backdrop: {
			shapes: [
				{ d: 'M170 200L250 86L310 150L356 92L430 200Z', strength: 0.3 },
				{
					d: 'M250 86L266 106L256 102L250 110L244 102L234 106ZM356 92L370 110L362 106L356 114L350 106L342 110Z',
					strength: 1,
					snow: true
				}
			]
		},
		shapes: [
			{ d: 'M-200 200V186H400V200Z', strength: 0.95 },
			{
				d: 'M-200 186V164Q-100 156 0 162T160 158Q204 154 224 162Q238 170 244 186ZM400 186V158Q384 150 372 156Q362 164 358 186Z',
				strength: 1,
				snow: true
			},
			{ d: rect(374, 128, 3, 30) + rounded(362, 116, 28, 14, 3), strength: 1 },
			{ d: rect(366, 120, 20, 2) + rect(370, 125, 12, 2), strength: 1, cut: true },
			{ d: rect(238, 136, 4, 50), strength: 0.9 },
			{ d: rect(238, 142, 4, 6) + rect(238, 154, 4, 6), strength: 1, cut: true },
			...mirrored(318, [
				{
					d: 'M262 177v-12q0-6 7-7l16-3 13-14q3-3 8-3h26q6 0 8 4l11 13 7 2q6 1 6 7v13Z',
					strength: 1,
					motion: 'idle'
				},
				{ d: 'M300 153l12-12h10v12ZM326 141h14l9 12h-23Z', strength: 1, cut: true, motion: 'idle' },
				{ d: rect(296, 129, 46, 3) + 'M298 129q2-12 16-12h18q10 0 12 12Z', strength: 0.9 },
				{ d: disc(282, 177, 9) + disc(352, 177, 9), strength: 1, motion: 'idle' },
				{ d: disc(282, 177, 4) + disc(352, 177, 4), strength: 1, cut: true }
			])
		]
	},
	// Over the old humpback bridge, the burn running under its arch
	heather: {
		backdrop: {
			shapes: [
				{ d: 'M60 200Q200 120 360 130T560 140V200Z', strength: 0.22 },
				{ d: 'M120 200Q260 150 440 160V200Z', strength: 0.34 }
			]
		},
		shapes: [
			{ d: 'M-200 200V190H230V200ZM410 200V190H600V200Z', strength: 0.6 },
			{ d: 'M214 200V188Q320 132 426 188V200Z', strength: 0.75 },
			{ d: 'M282 200V192a38 30 0 0 1 76 0V200Z', strength: 1, cut: true },
			{ d: rect(282, 192, 76, 8), strength: 0.4 },
			{ d: 'M276 200V192a44 36 0 0 1 88 0V200h-6V192a38 30 0 0 0 -76 0V200Z', strength: 1 },
			{ d: 'M214 184Q320 126 426 184v5Q320 133 214 189Z', strength: 1 },
			{
				d:
					limb(360.7, 178.2, 355.1, 180.5, 1.4) +
					limb(351.1, 166.5, 346.9, 170.8, 1.4) +
					limb(336.8, 158.7, 334.5, 164.3, 1.4) +
					limb(320.0, 156.0, 320.0, 162.0, 1.4) +
					limb(303.2, 158.7, 305.5, 164.3, 1.4) +
					limb(288.9, 166.5, 293.1, 170.8, 1.4) +
					limb(279.3, 178.2, 284.9, 180.5, 1.4),
				strength: 1,
				cut: true
			},
			{ d: 'M296 148v-8q0-4 4-5l8-2 6-10h22l8 10 6 2q4 1 4 5v8Z', strength: 1, motion: 'idle' },
			{ d: 'M316 132l4-6h7v6ZM331 132v-6h4l4 6Z', strength: 1, cut: true, motion: 'idle' },
			{ d: disc(306, 150, 6) + disc(340, 150, 6), strength: 1, motion: 'idle' },
			{ d: disc(306, 150, 2.4) + disc(340, 150, 2.4), strength: 1, cut: true },
			{
				d:
					disc(232, 198, 9) +
					disc(246, 194, 11) +
					disc(260, 199, 8) +
					disc(388, 197, 10) +
					disc(400, 193, 11),
				strength: 1
			},
			{
				d:
					disc(238, 190, 1.6) +
					disc(248, 186, 1.6) +
					disc(254, 192, 1.6) +
					disc(392, 189, 1.6) +
					disc(398, 186, 1.4),
				strength: 1,
				cut: true
			}
		],
		lines: [{ d: waves(290, 197, 2, 15), strength: 0.6, motion: 'flow' }]
	},
	// A round little classic
	birch: {
		shapes: [
			GROUND,
			{ d: 'M244 178q0-22 28-26q14-30 46-30t46 30q28 4 28 26Z', strength: 1, motion: IDLE },
			{
				d: 'M290 150q8-18 24-18v18ZM322 132q16 0 24 18h-24Z',
				strength: 1,
				cut: true,
				motion: IDLE
			},
			...wheel(278, 178, 13),
			...wheel(358, 178, 13)
		]
	},
	// A convertible, a scarf in the wind
	meadow: {
		shapes: [
			GROUND,
			{
				d: 'M244 176v-14q0-8 10-10l40-6 10-12h30l8 12 36 4q12 2 12 12v14Z',
				strength: 1,
				motion: IDLE
			},
			{ d: tri(318, 134, 326, 120, 330, 134), strength: 0.8 },
			{ d: 'M302 128q-6-10 4-14q-14 0-24 4q8 2 8 6Z', strength: 1, motion: 'flutter' },
			...wheel(276, 176, 13),
			...wheel(360, 176, 13)
		]
	},
	// A camper van with a board on the roof
	coast: {
		shapes: [
			GROUND,
			{ d: rounded(246, 124, 136, 54, 16), strength: 1, motion: IDLE },
			{
				d: rect(262, 136, 28, 18) + rect(298, 136, 28, 18) + 'M334 136h28q8 0 10 18h-38Z',
				strength: 1,
				cut: true,
				motion: IDLE
			},
			{ d: rect(248, 156, 134, 4), strength: 1, cut: true, motion: IDLE },
			{ d: rounded(240, 110, 150, 10, 5), strength: 0.85 },
			...wheel(282, 178, 13),
			...wheel(350, 178, 13)
		]
	},
	// Headlights on, through the snowy night
	aurora: {
		shapes: [
			GROUND,
			{ d: tri(372, 150, 400, 132, 400, 176), strength: 0.25, motion: 'breathe' },
			...hatchback(238, 186)
		],
		dots: [
			[268, 120, 2, 0.8],
			[300, 104, 1.6, 0.7],
			[340, 116, 2, 0.8],
			[388, 98, 1.6, 0.7]
		]
	},
	// Packed for a weekend away
	autumn: {
		shapes: [
			GROUND,
			{ d: rect(276, 112, 84, 6), strength: 1 },
			{ d: rounded(282, 92, 34, 20, 4) + rounded(320, 98, 30, 14, 4), strength: 0.9 },
			...hatchback(246, 186)
		]
	}
};
