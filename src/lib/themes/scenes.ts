// Each nature theme's header scene (#60, #274): a small flat landscape in the header's right part,
// so it reads as a place and stays clear of the text. Layers go back to front, in one color at
// rising strength; `cut` shapes are in the header's own color, like snow or birch marks. The
// canvas is 400×200, and the scene stays anchored to its bottom right corner.
import type { ThemeId } from './palettes';

/** How it moves, if it does (styles/scene-motion.css) */
export type SceneMotion =
	| 'rise'
	| 'bob'
	| 'bob-slow'
	| 'flutter'
	| 'pulse'
	| 'idle'
	| 'drift'
	| 'breathe'
	| 'flicker'
	| 'sway'
	| 'rock'
	| 'flow'
	| 'fly'
	| 'shimmer'
	| 'twinkle'
	| 'twinkle-late'
	| 'turn'
	| 'swing'
	| 'walk'
	| 'fall'
	| 'nod'
	| 'breeze'
	| 'cloud';

/** What a shape does, once, when the header is tapped (#327) */
export type TapMove =
	| 'drive'
	| 'drive-left'
	| 'hop'
	| 'spin'
	| 'swing'
	| 'float'
	| 'burst'
	| 'wave'
	| 'sail'
	| 'flash'
	| 'glint'
	| 'gust'
	| 'puff';

export type Shape = {
	tap?: TapMove;
	/** Where it turns round when it moves, if not its own bottom middle: so parts of one thing move as one */
	origin?: [x: number, y: number];
	d: string;
	strength: number;
	cut?: boolean;
	/** Soft white, in light and dark */
	snow?: boolean;
	motion?: SceneMotion;
	/** Drawn mirrored around this x (see `mirrored`) */
	mirror?: number;
	/** Drawn upside down around this y, like a reflection in water (see `reflected`) */
	reflect?: number;
	/** Turned by this many degrees around a point, e.g. someone leaning into a slope */
	rotate?: { deg: number; x: number; y: number };
	/** The sun, which the moon takes the place of at night (time-of-day.ts) */
	sun?: { x: number; y: number; r: number };
};
export type Line = {
	tap?: TapMove;
	origin?: [x: number, y: number];
	d: string;
	strength: number;
	motion?: SceneMotion;
	/** A sun's rays: gone at night */
	rays?: boolean;
};
export type Dot = [x: number, y: number, r: number, strength: number];
export type Scene = {
	shapes: Shape[];
	lines?: Line[];
	dots?: Dot[];
	/** Already a night sky, at any time of day */
	night?: boolean;
	/** A group's scene with its own background, instead of the theme's one landscape (#327) */
	backdrop?: Scene;
};

/** The transform for a shape drawn mirrored or reflected, if it is: [a, b, c, d, e, f] */
export function flipOf(shape: {
	mirror?: number;
	reflect?: number;
	rotate?: { deg: number; x: number; y: number };
}) {
	if (shape.rotate) {
		const a = (shape.rotate.deg * Math.PI) / 180;
		const [cos, sin] = [Math.cos(a), Math.sin(a)];
		const { x, y } = shape.rotate;
		return [cos, sin, -sin, cos, x - x * cos + y * sin, y - x * sin - y * cos] as const;
	}
	if (shape.mirror === undefined && shape.reflect === undefined) return undefined;
	const x = shape.mirror === undefined ? 1 : -1;
	const y = shape.reflect === undefined ? 1 : -1;
	return [x, 0, 0, y, (shape.mirror ?? 0) * 2, (shape.reflect ?? 0) * 2] as const;
}

/** The SVG transform for a shape drawn mirrored or reflected, if it is */
export const mirrorOf = (shape: Parameters<typeof flipOf>[0]) => {
	const flip = flipOf(shape);
	return flip ? `matrix(${flip.join(' ')})` : undefined;
};

/** These shapes reflected in water whose surface is at y, faint */
export const reflected = (y: number, shapes: Shape[], strength = 0.3): Shape[] =>
	shapes.map((shape) => ({
		...shape,
		reflect: y,
		strength: shape.strength * strength,
		motion: undefined
	}));

/** These shapes drawn mirrored around x, e.g. so a car faces into the header */
export const mirrored = (x: number, shapes: Shape[]): Shape[] =>
	shapes.map((shape) => ({ ...shape, mirror: x }));

/** A round sun at x, y */
const sun = (x: number, y: number, r: number, strength: number): Shape => ({
	d: `M${x - r} ${y}a${r} ${r} 0 1 1 ${r * 2} 0a${r} ${r} 0 1 1 ${-r * 2} 0Z`,
	strength,
	sun: { x, y, r }
});

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

/** The aurora's wavy bottom edge at x, around y, rising and falling by `wave` */
const auroraEdge = (x: number, y: number, wave: number) =>
	y + Math.sin(x / 26) * wave * 0.5 + Math.sin(x / 11 + 1) * wave * 0.15;

/** An aurora curtain from x0 to x1: a soft band above its wavy edge, `height` tall */
export function curtain(x0: number, x1: number, y: number, wave: number, height: number) {
	const xs = Array.from({ length: Math.floor((x1 - x0) / 6) + 1 }, (_, i) => x0 + i * 6);
	const bottom = xs.map((x) => `${x} ${Math.round(auroraEdge(x, y, wave))}`);
	const top = xs.toReversed().map((x) => `${x} ${Math.round(auroraEdge(x, y, wave) - height)}`);
	return `M${bottom.join('L')}L${top.join('L')}Z`;
}

/** The rays the aurora is made of: thin streaks rising from its edge, of changing length */
export function rays(x0: number, x1: number, y: number, wave: number, height: number) {
	return Array.from({ length: Math.floor((x1 - x0) / 5) + 1 }, (_, i) => {
		const x = x0 + i * 5;
		const edge = Math.round(auroraEdge(x, y, wave));
		const length = Math.round(height * (0.7 + 0.5 * Math.abs(Math.sin(x / 9))));
		return `M${x} ${edge}v${-length}`;
	}).join('');
}

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
			{ d: 'M200 200L262 112L300 150L346 98L400 150V200Z', strength: 0.35 },
			// Snow caps end on the slopes of their peaks, and the ones behind go behind what's in front
			{ d: 'M262 112L278 128L270 123L264 132L257 125L250.7 128Z', strength: 1, snow: true },
			{
				d: 'M346 98L364.7 116L356 112L350 120L343 113L336 119L330.1 116Z',
				strength: 1,
				snow: true
			},
			{ d: 'M250 200L324 104L400 188V200Z', strength: 0.7 },
			{ d: 'M324 104L347.5 130L338 123L330 135L322 125L314 134L304 130Z', strength: 1, snow: true },
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
			sun(348, 62, 26, 0.35),
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
			sun(268, 44, 18, 0.3),
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
		night: true,
		shapes: [
			{ d: curtain(222, 400, 64, 30, 34), strength: 0.22, motion: 'shimmer' },
			{ d: curtain(250, 400, 104, 22, 24), strength: 0.18, motion: 'shimmer' },
			{ d: 'M195 200C240 168 280 150 320 158C350 164 372 146 400 150V200Z', strength: 0.4 },
			{ d: 'M230 200C280 178 340 172 400 178V200Z', strength: 0.6 },
			{ d: pine(288, 190, 36) + pine(316, 192, 46) + pine(370, 190, 40), strength: 0.9 }
		],
		lines: [
			{ d: rays(222, 400, 64, 30, 34), strength: 0.45, motion: 'shimmer' },
			{ d: rays(250, 400, 104, 22, 24), strength: 0.35, motion: 'shimmer' }
		],
		dots: [
			[232, 22, 1.6, 0.8],
			[262, 14, 1.2, 0.7],
			[214, 92, 1.3, 0.7],
			[338, 18, 1.4, 0.8],
			[384, 30, 1.2, 0.7],
			[240, 134, 1.2, 0.6],
			[396, 120, 1.4, 0.7]
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
