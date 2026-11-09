// The shapes the scenes are drawn with (#60, #327), as SVG path data on the 400×200 canvas: one
// place for a pine, a person, a wheel, so every scene draws them the same way.
import type { Shape } from './scenes';

const r2 = (value: number) => Math.round(value * 100) / 100;

export const disc = (x: number, y: number, r: number) =>
	`M${r2(x - r)} ${r2(y)}a${r2(r)} ${r2(r)} 0 1 1 ${r2(r * 2)} 0a${r2(r)} ${r2(r)} 0 1 1 ${r2(-r * 2)} 0Z`;

export const rect = (x: number, y: number, w: number, h: number) =>
	`M${r2(x)} ${r2(y)}h${r2(w)}v${r2(h)}h${r2(-w)}Z`;

/** A rectangle with round corners */
export const rounded = (x: number, y: number, w: number, h: number, r: number) =>
	`M${x + r} ${y}h${w - 2 * r}q${r} 0 ${r} ${r}v${h - 2 * r}q0 ${r} ${-r} ${r}h${-(w - 2 * r)}q${-r} 0 ${-r} ${-r}v${-(h - 2 * r)}q0 ${-r} ${r} ${-r}Z`;

export const tri = (ax: number, ay: number, bx: number, by: number, cx: number, cy: number) =>
	`M${ax} ${ay}L${bx} ${by}L${cx} ${cy}Z`;

/** A filled pine, standing on y, h tall */
export const pine = (x: number, y: number, h: number, trunk = 0.04) => {
	const w = h * 0.36;
	return [
		`M${r2(x)} ${r2(y - h)}L${r2(x + w * 0.62)} ${r2(y - h * 0.58)}H${r2(x - w * 0.62)}Z`,
		`M${r2(x)} ${r2(y - h * 0.76)}L${r2(x + w * 0.82)} ${r2(y - h * 0.32)}H${r2(x - w * 0.82)}Z`,
		`M${r2(x)} ${r2(y - h * 0.5)}L${r2(x + w)} ${r2(y - h * 0.08)}H${r2(x - w)}Z`,
		`M${r2(x - h * trunk)} ${r2(y - h * 0.1)}h${r2(h * trunk * 2)}V${r2(y)}h${r2(-h * trunk * 2)}Z`
	].join('');
};

/** A round tree, standing on y, h tall */
export const roundTree = (x: number, y: number, h: number, trunk = 0.04) => {
	const r = h * 0.36;
	const cy = y - h + r;
	return `${disc(x, cy, r)}M${r2(x - h * trunk)} ${r2(cy)}h${r2(h * trunk * 2)}V${r2(y)}h${r2(-h * trunk * 2)}Z`;
};

/** A round-shouldered person standing on y, h tall */
export const person = (x: number, y: number, h: number) =>
	`${disc(x, y - h + h * 0.16, h * 0.16)}M${r2(x - h * 0.2)} ${r2(y)}v${r2(-h * 0.42)}q0 ${r2(-h * 0.2)} ${r2(h * 0.2)} ${r2(-h * 0.2)}t${r2(h * 0.2)} ${r2(h * 0.2)}v${r2(h * 0.42)}Z`;

/** Someone sitting, seen from the side, their seat at y, facing right (or left with -1) */
/** Someone sitting in side view, their seat at y, facing right (1) or left (-1): slim legs bent at the knee */
export const sitting = (x: number, y: number, h: number, facing = 1) => {
	const f = facing;
	const thick = h * 0.11;
	const hip = y - thick / 2;
	const knee = x + f * h * 0.34;
	return `${disc(x, y - h * 0.82, h * 0.15)}M${r2(x - h * 0.17)} ${r2(y)}v${r2(-h * 0.45)}q0 ${r2(-h * 0.2)} ${r2(h * 0.17)} ${r2(-h * 0.2)}t${r2(h * 0.17)} ${r2(h * 0.2)}v${r2(h * 0.45)}Z${limb(x, hip, knee, hip, thick)}${limb(knee, hip, knee + f * h * 0.04, y + h * 0.32, thick * 0.9)}`;
};

export const heart = (x: number, y: number, s: number) =>
	`M${x} ${y + s}C${x - s * 1.6} ${y - s * 0.1} ${x - s * 0.7} ${y - s} ${x} ${y - s * 0.3}C${x + s * 0.7} ${y - s} ${x + s * 1.6} ${y - s * 0.1} ${x} ${y + s}Z`;

/** A five-pointed star around x, y */
export const star = (x: number, y: number, r: number) => {
	const points = Array.from({ length: 10 }, (_, i) => {
		const radius = i % 2 ? r * 0.45 : r;
		const angle = -Math.PI / 2 + (i * Math.PI) / 5;
		return `${r2(x + radius * Math.cos(angle))} ${r2(y + radius * Math.sin(angle))}`;
	});
	return `M${points.join('L')}Z`;
};

/** A four-pointed sparkle around x, y: a star that twinkles */
export const sparkle = (x: number, y: number, r: number) =>
	`M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`;

/** A falling leaf around x, y, s long */
export const leaf = (x: number, y: number, s: number) =>
	`M${x - s / 2} ${y}q${s / 2} ${-s / 2} ${s} 0q${-s / 2} ${s / 2} ${-s} 0Z`;

/** A small wave line from x, n crests long */
export const waves = (x: number, y: number, n: number, w = 22) =>
	`M${x} ${y}` + `q${w / 2} -5 ${w} 0t${w} 0`.repeat(n);

/** A bird in flight, a small "m" */
export const bird = (x: number, y: number, s = 5) =>
	`M${x - s} ${y}q${s / 2} ${-s} ${s} 0q${s / 2} ${-s} ${s} 0`;

/** Steam or smoke curling up from x, y */
export const steam = (x: number, y: number, h = 20) =>
	`M${x} ${y}q-5 ${-h / 4} 0 ${-h / 2}t0 ${-h / 2}`;

/** A wheel: the tyre, and its hub in the header's own color */
export const wheel = (x: number, y: number, r: number, strength = 1): Shape[] => [
	{ d: disc(x, y, r), strength },
	{ d: disc(x, y, r * 0.4), strength: 1, cut: true }
];

/** A boat's hull on the water line y, w long */
export const hull = (x: number, y: number, w: number, h: number) =>
	`M${x} ${y - h}h${w}l${-h * 0.8} ${h}h${-(w - h * 1.6)}Z`;

/** A flag on a pole standing on y */
export const flag = (x: number, y: number, h: number, w = h * 0.4) =>
	`${rect(x - 1.5, y - h, 3, h)}M${x + 1.5} ${y - h}h${w}l${-w * 0.25} ${w * 0.35}l${w * 0.25} ${w * 0.35}h${-w}Z`;

/** A house's walls and its pitched roof, standing on y */
export const house = (x: number, y: number, w: number, h: number, roof: number, eave = 8) =>
	`${rect(x, y - h, w, h)}${tri(x - eave, y - h + 2, x + w / 2, y - h - roof, x + w + eave, y - h + 2)}`;

/** Where everything stands: flat across the whole header, so things line up on it and nothing floats */
export const GROUND_Y = 186;
export const GROUND: Shape = { d: 'M-200 200V186H400V200Z', strength: 0.95 };
/** Where everything floats: the water line, across the whole header */
export const WATER_Y = 182;
export const WATER: Shape = { d: 'M-200 200V182H400V200Z', strength: 0.4 };

/** A limb from one point to another, w wide, its end rounded; always wound like `disc`, so overlaps fill */
export function limb(x1: number, y1: number, x2: number, y2: number, w: number) {
	const length = Math.hypot(x2 - x1, y2 - y1) || 1;
	const [nx, ny] = [(-(y2 - y1) / length) * (w / 2), ((x2 - x1) / length) * (w / 2)];
	const corners = [
		[x1 + nx, y1 + ny],
		[x2 + nx, y2 + ny],
		[x2 - nx, y2 - ny],
		[x1 - nx, y1 - ny]
	];
	const area = corners.reduce((sum, [ax, ay], i) => {
		const [bx, by] = corners[(i + 1) % 4];
		return sum + (ax * by - bx * ay);
	}, 0);
	const ordered = area < 0 ? corners.toReversed() : corners;
	return `M${ordered.map(([x, y]) => `${r2(x)} ${r2(y)}`).join('L')}Z${disc(x2, y2, w / 2)}${disc(x1, y1, w / 2)}`;
}

/** What someone wears or carries; people stay simple silhouettes */
export type Pose = {
	hat?: 'beanie' | 'helmet' | 'cap';
	/** A rucksack on their back, on this side */
	pack?: 'left' | 'right';
};

function headWear(x: number, top: number, r: number, hat: Pose['hat']) {
	if (hat === 'beanie')
		return `M${r2(x - r)} ${r2(top + r)}a${r2(r)} ${r2(r)} 0 0 1 ${r2(r * 2)} 0Z${disc(x, top - r * 0.15, r * 0.3)}`;
	if (hat === 'helmet')
		return `M${r2(x - r * 1.15)} ${r2(top + r * 1.05)}a${r2(r * 1.15)} ${r2(r * 1.15)} 0 0 1 ${r2(r * 2.3)} 0Z`;
	if (hat === 'cap')
		return `M${r2(x - r)} ${r2(top + r)}a${r2(r)} ${r2(r)} 0 0 1 ${r2(r * 2)} 0Z${rect(x, top + r * 0.8, r * 1.5, r * 0.35)}`;
	return '';
}

/** Someone standing on y, h tall: a simple silhouette, with a hat or rucksack if given */
export function figure(x: number, y: number, h: number, pose: Pose = {}) {
	const r = h * 0.16;
	const top = y - h;
	const pack = pose.pack
		? rounded(
				pose.pack === 'left' ? x - h * 0.32 : x + h * 0.14,
				y - h * 0.62,
				h * 0.18,
				h * 0.3,
				h * 0.05
			)
		: '';
	return `${pack}${person(x, y, h)}${headWear(x, top, r, pose.hat)}`;
}

/** Someone sitting on a seat at seatY, h tall when standing: the same silhouette, shorter */
export function seated(x: number, seatY: number, h: number, pose: Pose = {}) {
	return figure(x, seatY, h * 0.72, pose);
}

/** A filled cloud */
export const cloud = (x: number, y: number, w: number) =>
	`${disc(x, y, w * 0.18)}${disc(x + w * 0.22, y - w * 0.08, w * 0.24)}${disc(x + w * 0.46, y, w * 0.2)}${rect(x, y, w * 0.46, w * 0.18)}`;

/** Flames on x, y, h tall */
export const flame = (x: number, y: number, h: number) =>
	`M${x} ${y}c${-h * 0.4} ${-h * 0.3} ${-h * 0.25} ${-h * 0.65} 0 ${-h}c${h * 0.25} ${h * 0.35} ${h * 0.4} ${h * 0.7} 0 ${h}Z`;

/** Logs crossed under a fire on y */
export const logs = (x: number, y: number, w: number) =>
	`${limb(x - w / 2, y - 2, x + w / 2, y - 7, 5)}${limb(x - w / 2, y - 7, x + w / 2, y - 2, 5)}`;

/** A wide fire from x0 to x1 on y: flames of changing height, one shape */
export function fire(x0: number, x1: number, y: number, h: number) {
	const n = Math.max(3, Math.round((x1 - x0) / 10));
	const step = (x1 - x0) / n;
	let d = `M${x0} ${y}`;
	for (let i = 0; i < n; i++) {
		const tip = h * (0.55 + 0.45 * Math.abs(Math.sin(i * 1.7 + 0.6)));
		d += `Q${r2(x0 + step * i)} ${r2(y - tip * 0.5)} ${r2(x0 + step * (i + 0.5))} ${r2(y - tip)}Q${r2(x0 + step * (i + 1))} ${r2(y - tip * 0.45)} ${r2(x0 + step * (i + 1))} ${r2(y - tip * 0.2)}`;
	}
	return `${d}L${x1} ${y}Z`;
}

/** An off-road tyre around x, y: knobbly tread blocks round its edge, r to the tread's tips */
export function knobbyTyre(x: number, y: number, r: number, blocks = 12) {
	const points = Array.from({ length: blocks * 4 }, (_, i) => {
		const outer = Math.floor(i / 2) % 2 === 0;
		const radius = outer ? r : r * 0.92;
		const angle = (i / (blocks * 4)) * Math.PI * 2;
		return `${r2(x + radius * Math.cos(angle))} ${r2(y + radius * Math.sin(angle))}`;
	});
	return `M${points.join('L')}Z`;
}
