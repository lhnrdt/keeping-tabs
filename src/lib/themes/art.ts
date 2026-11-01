// Each nature theme's motif (#60, #274): a small flat scene in a round window (120×120), for empty
// states, errors and the welcome page. Layers go back to front, in the theme's accent color at
// rising strength; `cut` shapes are in the page's own color, like birch marks, and `snow` is white in
// light and dark. The headers' larger scenes are in scenes.ts.
import type { Dot, Line, Shape } from './scenes';
import type { ThemeId } from './palettes';

export type Motif = { shapes: (Shape & { snow?: boolean })[]; lines?: Line[]; dots?: Dot[] };

/** A filled pine, standing on y, h tall */
const pine = (x: number, y: number, h: number) => {
	const w = h * 0.36;
	return [
		`M${x} ${y - h}L${x + w * 0.62} ${y - h * 0.58}H${x - w * 0.62}Z`,
		`M${x} ${y - h * 0.76}L${x + w * 0.82} ${y - h * 0.32}H${x - w * 0.82}Z`,
		`M${x} ${y - h * 0.5}L${x + w} ${y - h * 0.08}H${x - w}Z`,
		`M${x - h * 0.05} ${y - h * 0.1}h${h * 0.1}V${y}h${-h * 0.1}Z`
	].join('');
};

const disc = (x: number, y: number, r: number) =>
	`M${x - r} ${y}a${r} ${r} 0 1 1 ${r * 2} 0a${r} ${r} 0 1 1 ${-r * 2} 0Z`;

/** A round tree, standing on y, h tall */
const roundTree = (x: number, y: number, h: number) => {
	const r = h * 0.38;
	const cy = y - h + r;
	return `${disc(x, cy, r)}M${x - h * 0.05} ${cy}h${h * 0.1}V${y}h${-h * 0.1}Z`;
};

/** Everything below a wavy line at y, for water */
const water = (y: number, shift = 0) =>
	`M${-10 + shift} ${y}` + 'q10 -5 20 0t20 0'.repeat(4) + 'V130H-10Z';

/** A falling leaf at x, y */
const leaf = (x: number, y: number, s: number) =>
	`M${x} ${y}c${s * 0.5} ${-s * 0.5} ${s} ${-s * 0.1} ${s} ${s * 0.4}c${-s * 0.5} ${s * 0.3} ${-s} 0 ${-s} ${-s * 0.4}Z`;

export const MOTIFS: Record<ThemeId, Motif> = {
	forest: {
		shapes: [
			{ d: 'M0 84q30-20 60-8t60-6V130H0Z', strength: 0.22 },
			{ d: pine(34, 92, 40), strength: 0.45 },
			{ d: pine(90, 90, 44), strength: 0.45 },
			{ d: pine(60, 98, 66), strength: 0.9 },
			{ d: 'M0 96q60-10 120 0V130H0Z', strength: 0.65 }
		]
	},
	fjord: {
		shapes: [
			{ d: disc(62, 40, 11), strength: 0.4 },
			{ d: 'M0 34l20 8 12 20 8 28H0Z', strength: 0.6 },
			{ d: 'M120 22l-22 16-14 26-8 26h44Z', strength: 0.85 },
			{ d: water(84), strength: 0.35 },
			{ d: water(98, 8), strength: 0.6 }
		]
	},
	mountains: {
		shapes: [
			{ d: disc(88, 36, 9), strength: 0.4 },
			{ d: 'M-4 92L30 50l34 42Z', strength: 0.4 },
			{ d: 'M22 100L66 32l44 68Z', strength: 0.85 },
			{ d: 'M66 32l-14 22 8-3 6 5 7-5 8 3Z', strength: 1, snow: true },
			{ d: 'M0 96q60-8 120 0V130H0Z', strength: 0.55 }
		]
	},
	heather: {
		shapes: [
			{ d: 'M0 86q34-18 70-8t50-4V130H0Z', strength: 0.25 },
			{ d: 'M0 98q60-12 120 0V130H0Z', strength: 0.6 }
		],
		lines: [
			{ d: 'M42 100q-2-22 4-38', strength: 0.85 },
			{ d: 'M62 100q0-28 2-48', strength: 0.85 },
			{ d: 'M80 100q2-20-2-34', strength: 0.85 }
		],
		dots: [
			[46, 60, 3.4, 1],
			[42, 68, 3, 0.8],
			[49, 72, 2.8, 0.8],
			[64, 48, 3.6, 1],
			[59, 58, 3.2, 0.8],
			[68, 58, 3.2, 0.8],
			[61, 68, 2.8, 0.7],
			[78, 62, 3.4, 1],
			[83, 70, 3, 0.8],
			[75, 74, 2.8, 0.8]
		]
	},
	birch: {
		shapes: [
			{ d: disc(36, 40, 22), strength: 0.3 },
			{ d: disc(84, 34, 26), strength: 0.4 },
			{ d: 'M0 98q60-8 120 0V130H0Z', strength: 0.5 },
			{ d: 'M36 100V44h7v56ZM58 104V26h8v78ZM84 100V40h7v60Z', strength: 0.9 },
			{
				d: 'M36 58h4v2.5h-4ZM39 76h4v2.5h-4ZM58 44h5v2.5h-5ZM61 66h5v2.5h-5ZM58 86h5v2.5h-5ZM84 56h4v2.5h-4ZM87 78h4v2.5h-4Z',
				strength: 1,
				cut: true
			}
		]
	},
	meadow: {
		shapes: [
			{ d: 'M0 82q36-16 74-6t46-2V130H0Z', strength: 0.28 },
			{ d: 'M0 96q60-12 120 0V130H0Z', strength: 0.6 },
			{ d: disc(40, 62, 8.5), strength: 0.9 },
			{ d: disc(78, 48, 10), strength: 0.9 },
			{ d: disc(60, 74, 6.5), strength: 0.75 },
			{ d: disc(40, 62, 3), strength: 1, cut: true },
			{ d: disc(78, 48, 3.5), strength: 1, cut: true },
			{ d: disc(60, 74, 2.2), strength: 1, cut: true }
		],
		lines: [
			{ d: 'M40 71q-2 14 0 30', strength: 0.85 },
			{ d: 'M78 59q3 20 0 42', strength: 0.85 },
			{ d: 'M60 81q1 10 0 20', strength: 0.75 }
		]
	},
	coast: {
		shapes: [
			{ d: disc(38, 44, 13), strength: 0.45 },
			{ d: 'M72 92l3-40h12l3 40Z', strength: 0.9 },
			{ d: 'M73 66h16v8H73Z', strength: 1, cut: true },
			{ d: 'M74 52l7-8 7 8Z', strength: 0.9 },
			{ d: 'M50 106q10-12 24-15q18-4 34-1l12 8V130H50Z', strength: 0.7 },
			{ d: water(90), strength: 0.35 },
			{ d: water(102, 8), strength: 0.6 }
		]
	},
	aurora: {
		shapes: [
			{ d: 'M-4 44c20-16 34 10 54-2s40-18 74-2v22c-30-16-50-6-72 4s-36-14-56 0Z', strength: 0.3 },
			{ d: 'M-4 62c22-12 36 10 58 0s40-14 70 0v14c-28-12-48-4-70 6s-36-10-58-2Z', strength: 0.5 },
			{ d: 'M0 100l26-22 22 16 26-26 46 32V130H0Z', strength: 0.9 }
		],
		dots: [
			[30, 24, 1.6, 0.9],
			[58, 18, 1.3, 0.8],
			[84, 26, 1.8, 0.9],
			[96, 44, 1.3, 0.7],
			[20, 40, 1.2, 0.7]
		]
	},
	autumn: {
		shapes: [
			{ d: roundTree(32, 90, 44), strength: 0.45 },
			{ d: roundTree(82, 94, 60), strength: 0.85 },
			{ d: leaf(50, 40, 9), strength: 0.8 },
			{ d: leaf(38, 76, 8), strength: 0.65 },
			{ d: leaf(58, 64, 7), strength: 0.75 },
			{ d: 'M0 96q60-8 120 0V130H0Z', strength: 0.55 }
		]
	}
};
