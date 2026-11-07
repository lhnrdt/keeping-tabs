// The header's scene by the time of day (#291): at night the moon takes the sun's place, or comes up
// beside what's there, with a few stars. A scene that's a night sky already stays as it is.
import type { Dot, Scene, Shape } from './scenes';

/** From nine in the evening to six in the morning */
export const isNight = (hour: number) => hour >= 21 || hour < 6;

const disc = (x: number, y: number, r: number) =>
	`M${x - r} ${y}a${r} ${r} 0 1 1 ${r * 2} 0a${r} ${r} 0 1 1 ${-r * 2} 0Z`;

/** A crescent: a disc with another in the header's own color over most of it */
const moon = (x: number, y: number, r: number, strength: number): Shape[] => [
	{ d: disc(x, y, r), strength },
	{ d: disc(x + r * 0.45, y - r * 0.3, r * 0.82), strength: 1, cut: true }
];

/**
 * Up and to the left of the landscapes, clear of the header's text, and low enough to stay in
 * view: a wide header shows the canvas from about y 40 down
 */
const MOON = { x: 236, y: 62, r: 9, strength: 0.4 };
const STARS: Dot[] = [
	[212, 84, 1.3, 0.6],
	[268, 50, 1.2, 0.5],
	[300, 72, 1, 0.45],
	[340, 48, 1.4, 0.55],
	[392, 60, 1.2, 0.5]
];

export const hasSun = (scene: Scene) => scene.shapes.some((shape) => shape.sun);

/** The moon instead of any sun, its rays gone */
export const moonForSun = (scene: Scene): Scene => ({
	...scene,
	shapes: scene.shapes.flatMap((shape) =>
		shape.sun ? moon(shape.sun.x, shape.sun.y, shape.sun.r, shape.strength) : [shape]
	),
	lines: scene.lines?.filter((line) => !line.rays)
});

/** A landscape's night: with a moon of its own unless something in front already has one */
export function atNight(scene: Scene, { ownMoon = true } = {}): Scene {
	if (scene.night) return scene;
	const night = moonForSun(scene);
	return {
		...night,
		shapes:
			hasSun(scene) || !ownMoon
				? night.shapes
				: [...moon(MOON.x, MOON.y, MOON.r, MOON.strength), ...night.shapes],
		dots: [...STARS, ...(scene.dots ?? [])]
	};
}
