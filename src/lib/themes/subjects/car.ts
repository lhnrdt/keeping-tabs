// A car shared (#327): on the road, in each theme its own way.
import type { ThemeId } from '../palettes';
import type { Scene, Shape } from '../scenes';
import { GROUND, hull, rect, rounded, tri, WATER, wheel } from '../draw';

const IDLE = 'idle' as const;

/** The everyday car, its front to the right, standing on y */
const hatchback = (x: number, y: number): Shape[] => [
	{
		d: `M${x} ${y}v-14q0-7 8-9l22-5 20-22q4-4 10-4h36q7 0 11 6l14 20 10 3q7 2 7 9v16Z`,
		strength: 1,
		motion: IDLE
	},
	{
		d: `M${x + 40} ${y - 30}l14-15q2-2 6-2h10v17ZM${x + 78} ${y - 47}h16q3 0 5 3l10 14h-31Z`,
		strength: 1,
		cut: true,
		motion: IDLE
	},
	...wheel(x + 32, y, 13),
	...wheel(x + 106, y, 13)
];

export const CAR: Record<ThemeId, Scene> = {
	// A little car on the road through the trees
	forest: {
		shapes: [GROUND, ...hatchback(246, 176)],
		lines: [{ d: 'M226 194h24M264 192h24M340 191h24', strength: 0.8, motion: 'flow' }]
	},
	// On the ferry across the fjord
	fjord: {
		shapes: [
			WATER,
			{ d: hull(232, 186, 168, 16), strength: 1, motion: 'rock' },
			{ d: rect(360, 140, 30, 30), strength: 0.9, motion: 'rock' },
			{ d: rect(366, 146, 18, 8), strength: 1, cut: true, motion: 'rock' },
			{
				d: 'M262 170v-10q0-5 6-6l14-3 12-13q3-3 7-3h22q5 0 7 4l9 12 6 2q5 1 5 6v11Z',
				strength: 1,
				motion: 'rock'
			},
			...wheel(278, 170, 8).map((s) => ({ ...s, motion: 'rock' as const })),
			...wheel(328, 170, 8).map((s) => ({ ...s, motion: 'rock' as const }))
		]
	},
	// Up the winding mountain road
	mountains: {
		shapes: [
			{ d: 'M214 200L400 110V200Z', strength: 0.95 },
			{
				d: 'M220 200Q300 186 260 170T330 140T400 122V130Q340 146 342 158T276 180Q320 194 236 200Z',
				strength: 1,
				cut: true
			},
			{
				d: 'M300 152v-9q0-4 5-5l11-3 10-11q2-2 6-2h16q4 0 6 3l7 10 5 2q4 1 4 5v10Z',
				strength: 1,
				motion: IDLE
			},
			...wheel(314, 152, 6),
			...wheel(352, 152, 6)
		]
	},
	// A sturdy four-by-four, spare wheel on the back
	heather: {
		shapes: [
			GROUND,
			{ d: rounded(250, 124, 124, 50, 6) + rect(250, 150, 136, 24), strength: 1, motion: IDLE },
			{
				d: rect(262, 132, 30, 18) + rect(300, 132, 30, 18) + rect(338, 132, 26, 18),
				strength: 1,
				cut: true,
				motion: IDLE
			},
			{ d: rect(270, 112, 84, 8), strength: 0.85 },
			{ d: rounded(236, 134, 14, 30, 6), strength: 0.9 },
			...wheel(282, 176, 13),
			...wheel(358, 176, 13)
		]
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
			...hatchback(238, 176)
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
			...hatchback(246, 176)
		]
	}
};
