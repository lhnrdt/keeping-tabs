// Turns what's drawn with a finger or mouse into an avatar's path (#158): points in the drawing's
// square, whole numbers, and only as many as the line needs.
import { DRAWING_SIZE, isDrawingPath } from './avatars';

export type Point = [x: number, y: number];

/** Closer than this to the last point kept, a point adds nothing to see */
const MIN_STEP = 1.5;

const clamp = (value: number) => Math.min(DRAWING_SIZE - 1, Math.max(0, Math.round(value)));

/** A stroke's points, thinned out and in whole numbers */
export function simplified(points: readonly Point[]): Point[] {
	const kept: Point[] = [];
	for (const [x, y] of points) {
		const point: Point = [clamp(x), clamp(y)];
		const last = kept.at(-1);
		if (!last || Math.hypot(point[0] - last[0], point[1] - last[1]) >= MIN_STEP) kept.push(point);
	}
	return kept;
}

/** All strokes as one path; a single tap is a dot */
export function pathOf(strokes: readonly Point[][]) {
	return strokes
		.map(simplified)
		.filter((stroke) => stroke.length > 0)
		.map(([first, ...rest]) => {
			const line = rest.length ? rest : [first];
			return `M${first[0]} ${first[1]}` + line.map(([x, y]) => `L${x} ${y}`).join('');
		})
		.join('');
}

/** Whether these strokes still fit in an avatar */
export const fits = (strokes: readonly Point[][]) => {
	const d = pathOf(strokes);
	return d === '' || isDrawingPath(d);
};
