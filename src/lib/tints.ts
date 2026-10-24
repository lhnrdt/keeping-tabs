// Muted tints that give groups and members a recognisable color (style guide palette).
// The utilities with the actual colors live in styles/theme.css (`tint-<name>`).

export const TINTS = ['sage', 'clay', 'sand', 'moss', 'sky'] as const;

export type Tint = (typeof TINTS)[number];

export const isTint = (value: unknown): value is Tint => TINTS.includes(value as Tint);

/** The same id always gets the same tint. */
export function tintFor(id: string): Tint {
	let hash = 0;
	for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
	return TINTS[hash % TINTS.length];
}

// Written out in full so Tailwind finds and generates each utility
const TINT_CLASSES: Record<Tint, string> = {
	sage: 'tint-sage',
	clay: 'tint-clay',
	sand: 'tint-sand',
	moss: 'tint-moss',
	sky: 'tint-sky'
};

/** Class that sets --tint-bg, --tint-fg and --tint-line: the chosen tint, else one derived from the id. */
export const tintClass = (id: string, chosen?: Tint | null) => TINT_CLASSES[chosen ?? tintFor(id)];

/** A group's tint: the chosen one, else the nature theme's own (#60), so groups match it */
export const groupTintClass = (chosen?: Tint | null) =>
	chosen ? TINT_CLASSES[chosen] : 'tint-theme';
