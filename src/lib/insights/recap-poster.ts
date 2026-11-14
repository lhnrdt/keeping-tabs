// A finished trip's recap as a picture to share (#291): the group's scene across the bottom, in its
// header's colors, with its name, dates, total and a few numbers above. Drawn on a canvas in the
// browser, from the same scenes as the headers.
import { SUBJECT_INK } from '#lib/themes/group-subjects.ts';
import { flipOf, type Scene } from '#lib/themes/scenes.ts';

export type PosterColors = { background: string; line: string; text: string };
export type PosterLayer = { scene: Scene; strength: number; subject?: boolean };
export type PosterText = {
	app: string;
	name: string;
	dates: string;
	total: string;
	lines: string[];
};

const WIDTH = 1080;
const HEIGHT = 1350;
const PADDING = 90;
/** The scenes' own canvas, drawn across the poster's width */
const SCENE_WIDTH = 400;
const SCENE_HEIGHT = 200;
const SNOW_STRENGTH = 0.6;

function drawScene(
	ctx: CanvasRenderingContext2D,
	{ scene, strength, subject }: PosterLayer,
	colors: PosterColors
) {
	// As in the header: the subject in the text's color, the landscape in the line color
	const ink = subject ? colors.text : colors.line;
	strength *= subject ? SUBJECT_INK : 1;
	for (const shape of scene.shapes) {
		ctx.save();
		const flip = flipOf(shape);
		if (flip) ctx.transform(...flip);
		const path = new Path2D(shape.d);
		if (!shape.cut) {
			ctx.globalAlpha = 1;
			ctx.fillStyle = colors.background;
			ctx.fill(path);
		}
		ctx.globalAlpha = shape.snow ? SNOW_STRENGTH : shape.cut ? 1 : shape.strength * strength;
		ctx.fillStyle = shape.snow ? '#fff' : shape.cut ? colors.background : ink;
		ctx.fill(path);
		ctx.restore();
	}
	ctx.strokeStyle = ink;
	ctx.lineWidth = subject ? 2.2 : 1.5;
	ctx.lineCap = 'round';
	for (const line of scene.lines ?? []) {
		ctx.globalAlpha = line.strength * strength;
		ctx.stroke(new Path2D(line.d));
	}
	ctx.fillStyle = ink;
	for (const [x, y, r, dot] of scene.dots ?? []) {
		ctx.globalAlpha = dot * strength;
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.fill();
	}
	ctx.globalAlpha = 1;
}

/** One line of text, made smaller until it fits */
function fitted(
	ctx: CanvasRenderingContext2D,
	text: string,
	font: (size: number) => string,
	size: number
) {
	let current = size;
	ctx.font = font(current);
	while (ctx.measureText(text).width > WIDTH - PADDING * 2 && current > size / 2) {
		current -= 4;
		ctx.font = font(current);
	}
	return current;
}

export async function recapPoster(
	layers: PosterLayer[],
	colors: PosterColors,
	text: PosterText,
	fonts: { display: string; body: string }
): Promise<Blob> {
	await document.fonts?.ready;
	const canvas = document.createElement('canvas');
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	const ctx = canvas.getContext('2d')!;
	ctx.fillStyle = colors.background;
	ctx.fillRect(0, 0, WIDTH, HEIGHT);

	// The scene across the bottom, anchored to its bottom right like in the header
	const scale = WIDTH / SCENE_WIDTH;
	ctx.save();
	ctx.translate(0, HEIGHT - SCENE_HEIGHT * scale);
	ctx.scale(scale, scale);
	for (const layer of layers) drawScene(ctx, layer, colors);
	ctx.restore();

	const display = (size: number) => `600 ${size}px ${fonts.display}`;
	const body = (size: number, weight = 400) => `${weight} ${size}px ${fonts.body}`;
	ctx.fillStyle = colors.text;
	ctx.textBaseline = 'alphabetic';
	let y = PADDING + 30;
	ctx.globalAlpha = 0.7;
	ctx.font = body(30, 600);
	ctx.fillText(text.app, PADDING, y);
	ctx.globalAlpha = 1;
	y += 110;
	const nameSize = fitted(ctx, text.name, display, 84);
	ctx.fillText(text.name, PADDING, y);
	y += nameSize * 0.2 + 56;
	ctx.globalAlpha = 0.75;
	ctx.font = body(38);
	ctx.fillText(text.dates, PADDING, y);
	ctx.globalAlpha = 1;
	y += 150;
	fitted(ctx, text.total, display, 130);
	ctx.fillText(text.total, PADDING, y);
	y += 80;
	ctx.font = body(38, 500);
	for (const line of text.lines) {
		ctx.fillText(line, PADDING, y);
		y += 58;
	}

	return new Promise((resolve, reject) =>
		canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('No picture'))), 'image/png')
	);
}
