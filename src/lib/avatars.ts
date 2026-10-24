// Avatars (#61): your initials or one of the nature icons, on a palette tint, chosen in your
// profile. Stored with you as one value, e.g. "deer:moss" or "initials:clay"; none chosen
// means initials on a tint derived from you (as before).
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

/** `icon` null: initials */
export type AvatarChoice = { icon: AvatarIcon | null; tint: Tint };

const INITIALS = 'initials';

export const isAvatarIcon = (value: unknown): value is AvatarIcon =>
	AVATAR_ICONS.includes(value as AvatarIcon);

/** A stored or submitted avatar, or null when it isn't a valid one */
export function parseAvatar(value: unknown): AvatarChoice | null {
	if (typeof value !== 'string') return null;
	const parts = value.split(':');
	if (parts.length !== 2) return null;
	const [icon, tint] = parts;
	if (!isTint(tint) || (icon !== INITIALS && !isAvatarIcon(icon))) return null;
	return { icon: icon === INITIALS ? null : icon, tint };
}

export const formatAvatar = ({ icon, tint }: AvatarChoice) => `${icon ?? INITIALS}:${tint}`;
