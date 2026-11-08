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
	// Off-road: a classic double-cab 4×4, its white roof and spare wheel, mud flying behind
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
			{
				d: 'M251.03 168.31 V149.53 Q251.39 146.64 254.64 146.64 L290.03 145.56 L296.53 127.86 H349.97 V145.56 H393.31 V167.94ZM246.69 165.06 H251.75 V168.67 H246.69Z',
				strength: 1,
				motion: 'idle'
			},
			{
				d:
					'M294.36 122.44 H355.75 V127.14 H294.36Z' +
					limb(289.31, 149.53, 295.81, 124.97, 1.81) +
					limb(351.78, 125.69, 351.78, 145.92, 1.81) +
					limb(355.03, 124.97, 392.22, 146.28, 1.81),
				strength: 0.55,
				motion: 'idle'
			},
			{
				d: 'M291.47 143.75 L297.25 130.03 H298.69 V143.75ZM299.78 130.03 H318.56 V143.75 H299.78ZM325.42 130.03 H346.36 V143.75 H325.42Z',
				strength: 1,
				cut: true,
				motion: 'idle'
			},
			{
				d:
					knobbyTyre(268.0, 173.0, 13.0) +
					knobbyTyre(362.61, 173.0, 13.0) +
					knobbyTyre(361.53, 139.42, 4.51),
				strength: 1,
				motion: 'idle'
			},
			{
				d: disc(268.0, 173.0, 7.15) + disc(362.61, 173.0, 7.15) + disc(361.53, 139.42, 2.48),
				strength: 1,
				cut: true
			},
			{
				d: disc(268.0, 173.0, 2.86) + disc(362.61, 173.0, 2.86) + disc(361.53, 139.42, 0.99),
				strength: 1,
				motion: 'idle'
			},
			{
				d: disc(398, 180, 3.5) + disc(404, 171, 3) + disc(396, 166, 2.5) + disc(402, 160, 2.2),
				strength: 0.8,
				motion: 'rise'
			},
			{ d: pine(422, 186, 118), strength: 0.75 }
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
	// Over the pass between high snow walls: the station wagon, its roof box packed, the pass sign by the road
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
			{ d: rect(382, 128, 3, 30) + rounded(370, 116, 28, 14, 3), strength: 1 },
			{ d: rect(374, 120, 20, 2) + rect(378, 125, 12, 2), strength: 1, cut: true },
			{ d: rect(238, 136, 4, 50), strength: 0.9 },
			{ d: rect(238, 142, 4, 6) + rect(238, 154, 4, 6), strength: 1, cut: true },
			...mirrored(318, [
				{
					d: 'M257.58 177 L257 167.71 Q257 161.9 259.32 159 L267.45 150.29 Q268.61 149.13 270.94 149.13 L281.39 147.39 L298.81 147.74 Q313.32 147.97 322.03 149.71 L327.26 150.29 Q333.64 154.94 342.94 160.16 L356.87 161.32 Q365.58 162.48 369.64 163.65 Q375.45 165.39 377.77 167.71 Q378.94 170.03 378.94 177 L374.29 178.74 H263.97ZM272.1 146.81 H322.03 V147.97 H272.1ZM274.42 146.81 H276.74 V149.13 H274.42ZM317.39 146.81 H319.71 V149.13 H317.39Z',
					strength: 1,
					motion: 'idle'
				},
				{
					d: 'M269.77 146.23 Q269.77 138.1 277.9 138.1 L305.77 138.1 Q317.39 138.1 322.03 142.16 Q324.94 146.23 319.71 146.23Z',
					strength: 0.85,
					motion: 'idle'
				},
				{
					d: 'M272.1 151.45 L290.68 150.87 V160.16 H269.77ZM293.58 150.87 H311 V160.16 H293.58ZM313.32 150.87 H326.1 L339.45 159.58 H313.32ZM368.48 164.81 L376.03 166.55 L375.45 168.29 L368.48 166.55ZM257.58 159 H262.23 V163.06 H257.58Z',
					strength: 1,
					cut: true,
					motion: 'idle'
				},
				{ d: disc(284.29, 177.0, 9.0) + disc(361.52, 177.0, 9.0), strength: 1, motion: 'idle' },
				{ d: disc(284.29, 177.0, 5.58) + disc(361.52, 177.0, 5.58), strength: 1, cut: true },
				{
					d:
						limb(284.29, 177.0, 284.29, 171.42, 1.17) +
						limb(284.29, 177.0, 289.6, 175.28, 1.17) +
						limb(284.29, 177.0, 287.57, 181.51, 1.17) +
						limb(284.29, 177.0, 281.01, 181.51, 1.17) +
						limb(284.29, 177.0, 278.98, 175.28, 1.17) +
						limb(361.52, 177.0, 361.52, 171.42, 1.17) +
						limb(361.52, 177.0, 366.83, 175.28, 1.17) +
						limb(361.52, 177.0, 364.8, 181.51, 1.17) +
						limb(361.52, 177.0, 358.24, 181.51, 1.17) +
						limb(361.52, 177.0, 356.21, 175.28, 1.17) +
						disc(284.29, 177.0, 1.8) +
						disc(361.52, 177.0, 1.8),
					strength: 1,
					motion: 'idle'
				}
			])
		]
	},
	// A little open-top sports car over the old humpback bridge, a scarf flying, the burn under its arch
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
			{
				d: 'M317.71 137.07 Q313.14 134.79 308.86 136.21 Q304.57 137.64 298.86 134.5 L298.29 136.79 Q304.29 140.21 309.14 138.79 Q313.43 137.36 317.43 139.64Z',
				strength: 0.8,
				motion: 'flutter'
			},
			{
				d: 'M316.71 135.21 A2.14286 2.14286 0 1 1 321 135.21 A2.14286 2.14286 0 1 1 316.71 135.21ZM317.14 136.21 H320.57 V140.21 H317.14ZM323.14 135.64 A2.14286 2.14286 0 1 1 327.43 135.64 A2.14286 2.14286 0 1 1 323.14 135.64ZM323.57 136.64 H327 V140.21 H323.57Z',
				strength: 0.85,
				motion: 'idle'
			},
			{
				d: 'M271.71 155.93 Q270 154.79 269.86 152.36 L269.57 143.07 Q269.71 139.5 270.29 137.36 L275.29 138.36 Q282.43 137.07 288.86 135.5 Q293.14 134.21 296 133.07 Q297.71 131.36 300.29 131.07 L304.57 130.93 Q306 131.07 306.43 131.93 L306.86 139.07 L336 141.07 L338.86 140.5 Q344.57 139.79 349.57 139.79 Q355.29 139.79 359.57 141.36 Q364.57 143.36 368.14 145.93 Q370.57 148.79 371 153.07 L371 155.93Z',
				strength: 0.85,
				motion: 'idle'
			},
			{
				d: 'M297.14 142.07 Q297.71 148.07 307.71 151.07 Q301.71 147.36 301 141.93Z',
				strength: 1,
				motion: 'idle'
			},
			{ d: limb(339.57, 140.5, 324.86, 131.93, 1.6), strength: 1, motion: 'idle' },
			{
				d: 'M360.57 141.64 L364 143.36 L363.71 144.07 L360.29 142.36ZM300.71 136.21 A1 1 0 1 1 302.71 136.21 A1 1 0 1 1 300.71 136.21Z',
				strength: 1,
				cut: true,
				motion: 'idle'
			},
			{ d: disc(286.0, 151.5, 9.0) + disc(352.0, 151.5, 9.0), strength: 1, motion: 'idle' },
			{ d: disc(286.0, 151.5, 5.58) + disc(352.0, 151.5, 5.58), strength: 1, cut: true },
			{
				d:
					limb(286.0, 151.5, 286.0, 145.92, 1.17) +
					limb(286.0, 151.5, 291.31, 149.78, 1.17) +
					limb(286.0, 151.5, 289.28, 156.01, 1.17) +
					limb(286.0, 151.5, 282.72, 156.01, 1.17) +
					limb(286.0, 151.5, 280.69, 149.78, 1.17) +
					limb(352.0, 151.5, 352.0, 145.92, 1.17) +
					limb(352.0, 151.5, 357.31, 149.78, 1.17) +
					limb(352.0, 151.5, 355.28, 156.01, 1.17) +
					limb(352.0, 151.5, 348.72, 156.01, 1.17) +
					limb(352.0, 151.5, 346.69, 149.78, 1.17) +
					disc(286.0, 151.5, 1.8) +
					disc(352.0, 151.5, 1.8),
				strength: 1,
				motion: 'idle'
			},
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
