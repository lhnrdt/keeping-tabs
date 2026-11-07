// Avatars (#61): your initials, one of the nature icons or your own drawing (#158), on a palette
// tint, chosen in your profile. Stored with you as one value, e.g. "deer:moss", "initials:clay" or
// "drawn:sky:1:M10 12L14 16"; none chosen means initials on a tint derived from you (as before).
import { isTint, type Tint } from './tints';

export const AVATAR_ICONS = [
	'trees',
	'tree',
	'plant',
	'leaf',
	'mushroom',
	'mountain',
	'feather',
	'fish',
	'butterfly',
	'flower',
	'cactus',
	'snowflake',
	'sun',
	'moon',
	'cloud',
	'coffee',
	'campfire',
	'tent',
	'sailboat',
	'bike',
	'paw',
	'cat',
	'dog',
	'deer'
] as const;

export type AvatarIcon = (typeof AVATAR_ICONS)[number];

/** A drawing (#158): its lines as path data on a DRAWING_SIZE square, and how thick they are */
export type Drawing = { width: number; d: string };

/** `icon` null: initials, or the drawing if there is one */
export type AvatarChoice = { icon: AvatarIcon | null; tint: Tint; drawing?: Drawing };

const INITIALS = 'initials';
export const DRAWN = 'drawn';

/** The drawing's square; whole numbers in it are fine enough for an avatar */
export const DRAWING_SIZE = 48;
/** Line thicknesses to choose from, by their number */
export const STROKE_WIDTHS = [2, 3.5, 5] as const;
/** Plenty for a small drawing, and it stays a small value */
export const MAX_DRAWING = 3000;
/** Only lines: moves and line-tos between whole-number points, nothing else */
const PATH = /^(?:M\d{1,2} \d{1,2}(?:L\d{1,2} \d{1,2})*)+$/;

export const isDrawingPath = (value: string) => value.length <= MAX_DRAWING && PATH.test(value);

export const isAvatarIcon = (value: unknown): value is AvatarIcon =>
	AVATAR_ICONS.includes(value as AvatarIcon);

/** A stored or submitted avatar, or null when it isn't a valid one */
export function parseAvatar(value: unknown): AvatarChoice | null {
	if (typeof value !== 'string') return null;
	if (value.startsWith(`${DRAWN}:`)) return parseDrawn(value);
	const parts = value.split(':');
	if (parts.length !== 2) return null;
	const [icon, tint] = parts;
	if (!isTint(tint) || (icon !== INITIALS && !isAvatarIcon(icon))) return null;
	return { icon: icon === INITIALS ? null : icon, tint };
}

function parseDrawn(value: string): AvatarChoice | null {
	const [, tint, width, d, ...rest] = value.split(':');
	const thickness = Number(width);
	if (rest.length || !isTint(tint) || !(thickness in STROKE_WIDTHS) || !isDrawingPath(d ?? '')) {
		return null;
	}
	return { icon: null, tint, drawing: { width: thickness, d } };
}

export const formatAvatar = ({ icon, tint, drawing }: AvatarChoice) =>
	drawing ? `${DRAWN}:${tint}:${drawing.width}:${drawing.d}` : `${icon ?? INITIALS}:${tint}`;
