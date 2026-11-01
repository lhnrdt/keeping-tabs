// Each nature theme's motif (#60): line art (120×120) for empty states, errors and the welcome
// page. Paths only, so ThemeMotif draws them with the theme's colors. `faint` paths are drawn
// lighter. The headers' scenes are in scenes.ts.
import type { ThemeId } from './palettes';

type Art = { paths: string[]; faint?: string[]; dots?: [number, number, number][] };

/** A pine at x, standing on y, h tall */
const pine = (x: number, y: number, h: number) =>
	`M${x} ${y - h}l${h * 0.28} ${h * 0.45}h${-h * 0.12}l${h * 0.22} ${h * 0.4}h${-h * 0.76}l${h * 0.22} ${-h * 0.4}h${-h * 0.12}z M${x} ${y - h * 0.15}v${h * 0.15}`;

/** A leaf at x, y pointing right-down, s long */
const leaf = (x: number, y: number, s: number) =>
	`M${x} ${y}c${s * 0.3} ${-s * 0.35} ${s * 0.85} ${-s * 0.2} ${s} ${s * 0.25}c${-s * 0.45} ${s * 0.2} ${-s * 0.85} ${s * 0.05} ${-s} ${-s * 0.25}z M${x} ${y}l${s * 0.8} ${s * 0.12}`;

/** A small flower at x, y */
const flower = (x: number, y: number, r: number) =>
	`M${x} ${y - r}a${r} ${r} 0 1 1 0 ${r * 2}a${r} ${r} 0 1 1 0 ${-r * 2}z M${x} ${y + r}v${r * 3}`;

export const MOTIFS: Record<ThemeId, Art> = {
	forest: {
		paths: [pine(46, 96, 56), pine(78, 96, 72), 'M14 98h92'],
		faint: ['M20 106h80']
	},
	fjord: {
		paths: ['M14 30l20 40-6 26', 'M106 24l-22 46 8 26', 'M24 96q9-5 18 0t18 0t18 0t18 0'],
		faint: ['M30 106q8-4 16 0t16 0t16 0t16 0', 'M56 80l6-3 6 3']
	},
	mountains: {
		paths: ['M12 96l30-46 14 18 20-30 32 58z', 'M42 50l-7 11 7-3 6 4z', 'M76 38l-8 12 8-3 7 4z'],
		faint: ['M90 26a8 8 0 1 0 16 0a8 8 0 1 0-16 0', 'M16 106h88']
	},
	heather: {
		paths: [
			'M60 104c0-24 4-46 14-64',
			'M66 70c-10-6-18-6-24 0',
			'M70 56c8-6 16-6 22 0',
			'M60 104h-30M60 104h30'
		],
		dots: [
			[74, 38, 3.5],
			[66, 46, 3],
			[78, 50, 3],
			[40, 68, 3],
			[94, 54, 3],
			[48, 76, 2.5]
		]
	},
	birch: {
		paths: [
			'M40 104V22',
			'M52 104V30',
			'M74 104V16',
			'M86 104V24',
			'M42 44h6M42 70h8M76 36h7M76 64h6M76 88h8',
			leaf(86, 30, 16),
			'M22 104h78'
		]
	},
	meadow: {
		paths: [
			flower(40, 52, 8),
			flower(78, 40, 9),
			flower(62, 70, 6),
			'M40 76c0 10 0 20 2 28M78 67c-2 14-2 26 0 37',
			'M18 104h86'
		],
		faint: ['M26 104c2-10 6-16 10-20M96 104c-2-12-6-18-10-22']
	},
	coast: {
		paths: [
			'M14 74q11-7 23 0t23 0t23 0t23 0',
			'M14 90q11-7 23 0t23 0t23 0t23 0',
			'M14 106q11-7 23 0t23 0t23 0t23 0'
		],
		faint: ['M70 40a14 14 0 1 1 28 0', 'M66 54h36']
	},
	aurora: {
		paths: [
			'M10 50c20 14 34-16 54 0s32 18 50 0',
			'M10 62c20 14 34-16 54 0s32 18 50 0',
			'M12 100c20-18 42-22 62-10s30 12 36 8'
		],
		dots: [
			[24, 22, 1.6],
			[52, 16, 1.4],
			[84, 24, 1.8],
			[102, 14, 1.4]
		]
	},
	autumn: {
		paths: [leaf(30, 56, 52), leaf(70, 88, 26), 'M20 106h84'],
		faint: ['M92 30c4 6 2 12-4 16']
	}
};
