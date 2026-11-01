// Each nature theme's header scene (#60, #274): a small flat landscape in the header's right part,
// so it reads as a place and stays clear of the text. Layers go back to front, in one color at
// rising strength; `cut` shapes are in the header's own color, like snow or birch marks. The
// canvas is 400×200, and the scene stays anchored to its bottom right corner.
import type { ThemeId } from './palettes';

/** How it moves, if it does (styles/scene-motion.css) */
export type SceneMotion =
	'rise' | 'bob' | 'bob-slow' | 'flutter' | 'pulse' | 'idle' | 'drift' | 'breathe' | 'flicker';

export type Shape = { d: string; strength: number; cut?: boolean; motion?: SceneMotion };
export type Line = { d: string; strength: number; motion?: SceneMotion };
export type Dot = [x: number, y: number, r: number, strength: number];
export type Scene = { shapes: Shape[]; lines?: Line[]; dots?: Dot[] };

/** A filled pine, standing on y, h tall */
const pine = (x: number, y: number, h: number) => {
	const w = h * 0.36;
	return [
		`M${x} ${y - h}L${x + w * 0.62} ${y - h * 0.58}H${x - w * 0.62}Z`,
		`M${x} ${y - h * 0.76}L${x + w * 0.82} ${y - h * 0.32}H${x - w * 0.82}Z`,
		`M${x} ${y - h * 0.5}L${x + w} ${y - h * 0.08}H${x - w}Z`,
		`M${x - h * 0.04} ${y - h * 0.1}h${h * 0.08}V${y}h${-h * 0.08}Z`
	].join('');
};

/** A round tree, standing on y, h tall */
const roundTree = (x: number, y: number, h: number) => {
	const r = h * 0.36;
	const cy = y - h + r;
	return (
		`M${x - r} ${cy}a${r} ${r} 0 1 1 ${r * 2} 0a${r} ${r} 0 1 1 ${-r * 2} 0Z` +
		`M${x - h * 0.04} ${cy}h${h * 0.08}V${y}h${-h * 0.08}Z`
	);
};

/** A small wave line from x, n crests long */
const waves = (x: number, y: number, n: number, w = 22) =>
	`M${x} ${y}` + `q${w / 2} -5 ${w} 0t${w} 0`.repeat(n);

/** A flower on a stem from the ground at x, y */
const stem = (x: number, y: number, h: number) => `M${x} ${y}q2 ${-h / 2} 0 ${-h}`;

export const SCENES: Record<ThemeId, Scene> = {
	forest: {
		shapes: [
			{ d: 'M190 200C250 150 320 128 400 122V200Z', strength: 0.35 },
			{ d: pine(262, 170, 50) + pine(296, 158, 62) + pine(384, 140, 66), strength: 0.5 },
			{ d: 'M250 200C300 172 350 166 400 170V200Z', strength: 0.6 },
			{ d: pine(318, 186, 74) + pine(356, 180, 92), strength: 0.85 }
		]
	},
	fjord: {
		shapes: [
			{ d: 'M205 164L244 84L268 118L302 56L338 112L368 78L400 112V164Z', strength: 0.35 },
			{ d: 'M205 164L232 124L252 164Z', strength: 0.55 },
			{ d: 'M332 164L356 96L382 76L400 88V164Z', strength: 0.65 },
			{ d: 'M205 164H400V200H250C232 190 216 178 205 164Z', strength: 0.22 },
			{ d: 'M278 158h26l-5 7h-16Z M290 157v-15l9 13Z', strength: 0.85 }
		],
		lines: [
			{ d: waves(226, 176, 3), strength: 0.5, motion: 'drift' },
			{ d: waves(298, 188, 4), strength: 0.5, motion: 'drift' }
		]
	},
	mountains: {
		shapes: [
			{ d: 'M200 200L262 92L300 142L348 70L400 138V200Z', strength: 0.35 },
			{ d: 'M250 200L324 86L400 184V200Z', strength: 0.7 },
			{ d: 'M324 86L346 115L334 110L324 122L314 110L303 118Z', strength: 1, cut: true },
			{ d: 'M300 200C330 182 370 176 400 182V200Z', strength: 0.9 }
		]
	},
	heather: {
		shapes: [
			{ d: 'M195 200C240 142 310 122 400 118V200Z', strength: 0.3 },
			{ d: 'M240 200C290 158 340 148 400 152V200Z', strength: 0.5 },
			{ d: 'M285 200C320 178 360 172 400 176V200Z', strength: 0.75 }
		],
		dots: [
			[272, 160, 2.2, 0.8],
			[284, 150, 2.6, 0.8],
			[298, 144, 2.2, 0.8],
			[306, 158, 2.6, 0.8],
			[322, 150, 2.2, 0.9],
			[334, 142, 2.6, 0.8],
			[350, 152, 2.2, 0.9],
			[368, 140, 2.6, 0.9],
			[384, 150, 2.2, 0.9]
		]
	},
	birch: {
		shapes: [
			{ d: 'M270 0h10L284 200H266Z', strength: 0.4 },
			{ d: 'M316 0h14L334 200H310Z', strength: 0.6 },
			{ d: 'M368 0h12L384 200H362Z', strength: 0.5 },
			{
				d: 'M266 42l9 3-9 3ZM284 90l-10 3 10 3ZM265 140l11 3-11 3ZM310 60l12 3-12 3ZM334 118l-13 3 13 3ZM310 164l12 3-12 3ZM382 34l-10 3 10 3ZM362 98l11 3-11 3ZM384 148l-11 3 11 3Z',
				strength: 1,
				cut: true
			},
			{ d: 'M230 200C280 182 340 178 400 184V200Z', strength: 0.7 }
		],
		dots: [
			[286, 30, 3, 0.45],
			[300, 52, 3.5, 0.5],
			[346, 24, 3, 0.5],
			[352, 62, 3.5, 0.45],
			[258, 74, 3, 0.4]
		]
	},
	meadow: {
		shapes: [
			{ d: 'M322 62a26 26 0 1 1 52 0a26 26 0 1 1 -52 0Z', strength: 0.35 },
			{ d: 'M195 200C250 150 330 134 400 142V200Z', strength: 0.35 },
			{ d: 'M250 200C300 170 350 164 400 172V200Z', strength: 0.65 }
		],
		lines: [
			{ d: stem(290, 184, 26) + stem(322, 176, 30) + stem(352, 172, 24), strength: 0.8 },
			{ d: stem(378, 176, 28), strength: 0.8 }
		],
		dots: [
			[290, 156, 4.5, 0.85],
			[322, 144, 5, 0.85],
			[352, 146, 4.5, 0.85],
			[378, 146, 5, 0.85]
		]
	},
	coast: {
		shapes: [
			{ d: 'M250 44a18 18 0 1 1 36 0a18 18 0 1 1 -36 0Z', strength: 0.3 },
			{ d: 'M300 200L318 150L352 134L400 128V200Z', strength: 0.6 },
			{ d: 'M352 134L356 72H374L378 134Z', strength: 0.8 },
			{ d: 'M354 92H376L377 106H353Z', strength: 1, cut: true },
			{ d: 'M352 72L365 56L378 72Z', strength: 0.9 }
		],
		lines: [
			{ d: waves(210, 168, 4), strength: 0.5, motion: 'drift' },
			{ d: waves(230, 182, 3), strength: 0.5, motion: 'drift' },
			{ d: waves(206, 194, 4), strength: 0.5, motion: 'drift' }
		]
	},
	aurora: {
		shapes: [
			{
				d: 'M250 0C262 40 244 80 262 124L292 110C278 72 296 36 284 0Z',
				strength: 0.25,
				motion: 'breathe'
			},
			{
				d: 'M300 0C314 44 296 84 314 116L348 104C332 66 350 34 338 0Z',
				strength: 0.35,
				motion: 'breathe'
			},
			{ d: 'M356 0C366 36 352 70 368 100L400 92V0Z', strength: 0.25 },
			{ d: 'M195 200L262 134L306 166L352 122L400 158V200Z', strength: 0.5 },
			{ d: pine(286, 192, 38) + pine(322, 196, 48) + pine(372, 194, 42), strength: 0.9 }
		],
		dots: [
			[232, 36, 1.6, 0.8],
			[222, 84, 1.3, 0.7],
			[244, 110, 1.3, 0.7],
			[392, 112, 1.6, 0.7]
		]
	},
	autumn: {
		shapes: [
			{ d: 'M195 200C250 156 330 134 400 136V200Z', strength: 0.35 },
			{ d: roundTree(284, 166, 54) + roundTree(388, 142, 56), strength: 0.5 },
			{ d: 'M250 200C300 176 350 170 400 176V200Z', strength: 0.65 },
			{ d: roundTree(340, 182, 88), strength: 0.85 }
		],
		dots: [
			[296, 96, 2.4, 0.7],
			[270, 118, 2, 0.6],
			[386, 88, 2.4, 0.7],
			[244, 148, 2, 0.6]
		]
	}
};
