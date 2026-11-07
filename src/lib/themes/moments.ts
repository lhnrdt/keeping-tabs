// Small scenes for when something's off (#291), in the motifs' round window (120×120) and style:
// lost on the way, a car with its bonnet up, a tent without signal, a cabin shut for the night.
// The same in every theme, in its accent color.
import type { Motif } from './art';

export type Moment = 'lost' | 'broken' | 'offline' | 'locked';

const disc = (x: number, y: number, r: number) =>
	`M${x - r} ${y}a${r} ${r} 0 1 1 ${r * 2} 0a${r} ${r} 0 1 1 ${-r * 2} 0Z`;

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

const ground = { d: 'M-10 92Q60 82 130 92V130H-10Z', strength: 0.35 };

export const MOMENTS: Record<Moment, Motif> = {
	// Not found: a signpost pointing both ways
	lost: {
		shapes: [
			{ d: pine(20, 92, 38) + pine(102, 92, 32), strength: 0.45 },
			ground,
			{ d: 'M58 92V38h4V92Z', strength: 0.9 },
			{ d: 'M62 44h24l6 6-6 6H62Z', strength: 0.75, motion: 'flutter' },
			{ d: 'M58 60H36l-6 6 6 6h22Z', strength: 0.6 }
		],
		dots: [
			[28, 30, 1.6, 0.5],
			[94, 24, 1.4, 0.4]
		]
	},
	// Something broke: a car with its bonnet up, steaming
	broken: {
		shapes: [
			{ d: pine(14, 94, 34), strength: 0.4 },
			{ d: 'M-10 94H130V130H-10Z', strength: 0.3 },
			{ d: 'M20 88V76q0-5 5-5h11l10-12h24l10 12h6V88Z', strength: 0.85 },
			{ d: 'M50 62h9v9H42ZM62 62h7l7 9H62Z', strength: 1, cut: true },
			{ d: 'M78 71l13-17 4 3-11 14Z', strength: 0.7 },
			{ d: disc(36, 88, 7) + disc(76, 88, 7), strength: 1 },
			{ d: disc(36, 88, 2.4) + disc(76, 88, 2.4), strength: 1, cut: true },
			{ d: disc(88, 48, 3.5), strength: 0.22, motion: 'rise' },
			{ d: disc(95, 39, 2.6), strength: 0.16, motion: 'drift' }
		]
	},
	// Offline: a tent out of reach, its signal crossed out
	offline: {
		shapes: [
			{ d: disc(94, 26, 7), strength: 0.45 },
			{ d: pine(100, 92, 36), strength: 0.45 },
			ground,
			{ d: 'M28 92L54 50L80 92Z', strength: 0.85 },
			{ d: 'M54 92L47 76h14Z', strength: 1, cut: true }
		],
		lines: [
			{ d: 'M46 34q8-8 16 0', strength: 0.55, motion: 'pulse' },
			{ d: 'M41 28q13-13 26 0', strength: 0.4, motion: 'pulse' },
			{ d: 'M42 40L66 20', strength: 0.85 }
		],
		dots: [
			[54, 38, 2, 0.6],
			[16, 22, 1.4, 0.5],
			[28, 14, 1.1, 0.4],
			[76, 12, 1.2, 0.4]
		]
	},
	// Locked: a cabin shut, its door with a keyhole and no light inside
	locked: {
		shapes: [
			{ d: pine(16, 92, 40) + pine(104, 92, 34), strength: 0.45 },
			ground,
			{ d: 'M34 92V66h52V92Z', strength: 0.75 },
			{ d: 'M28 68L60 42L92 68Z', strength: 0.95 },
			{ d: 'M74 52V40h7v18Z', strength: 0.85 },
			{ d: 'M54 92V72h12V92Z', strength: 1 },
			{ d: disc(60, 80, 1.8) + 'M59.1 80h1.8v5h-1.8Z', strength: 1, cut: true },
			{ d: 'M39 72h9v8h-9ZM72 72h9v8h-9Z', strength: 1 }
		],
		dots: [[96, 22, 1.3, 0.4]]
	}
};
