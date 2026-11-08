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
export const sitting = (x: number, y: number, h: number, facing = 1) => {
	const f = facing;
	return `${disc(x, y - h * 0.82, h * 0.15)}M${r2(x - h * 0.17)} ${r2(y)}v${r2(-h * 0.45)}q0 ${r2(-h * 0.2)} ${r2(h * 0.17)} ${r2(-h * 0.2)}t${r2(h * 0.17)} ${r2(h * 0.2)}v${r2(h * 0.45)}Z${rect(f > 0 ? x : x - h * 0.42, y - h * 0.12, h * 0.42, h * 0.12)}${rect(f > 0 ? x + h * 0.3 : x - h * 0.42, y - h * 0.12, h * 0.12, h * 0.4)}`;
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

/** The ground the subject stands on */
export const GROUND: Shape = { d: 'M214 200C262 186 340 180 400 184V200Z', strength: 0.95 };
/** Water in front, for what floats */
export const WATER: Shape = { d: 'M210 200C250 190 330 186 400 188V200Z', strength: 0.4 };
