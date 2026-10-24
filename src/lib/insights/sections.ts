// Which insights a group shows, in which order, by its type (#169): the questions people of
// that kind of group ask first come first. The single place to change it.
import type { GroupKind } from '#lib/group/kinds.ts';

export type Tile =
	'spent' | 'myShare' | 'perPerson' | 'perDay' | 'change' | 'count' | 'fixedPerMonth';
/** Every insight section there is, in the order they're offered (#174) */
export const SECTIONS = [
	'overTime',
	'categories',
	'kinds',
	'fixedCosts',
	'biggest',
	'whoPays',
	'howOften'
] as const;
export type Section = (typeof SECTIONS)[number];

export const isSection = (value: unknown): value is Section => SECTIONS.includes(value as Section);

export type Layout = { tiles: [Tile, Tile, Tile, Tile]; sections: Section[] };

export const LAYOUTS: Record<GroupKind, Layout> = {
	trip: {
		tiles: ['spent', 'perPerson', 'perDay', 'myShare'],
		sections: ['overTime', 'kinds', 'categories', 'biggest', 'whoPays']
	},
	event: {
		tiles: ['spent', 'perPerson', 'count', 'myShare'],
		sections: ['categories', 'whoPays', 'biggest', 'overTime']
	},
	home: {
		tiles: ['fixedPerMonth', 'change', 'perPerson', 'myShare'],
		sections: ['fixedCosts', 'overTime', 'kinds', 'categories', 'howOften', 'whoPays', 'biggest']
	},
	partner: {
		tiles: ['spent', 'myShare', 'change', 'count'],
		sections: ['whoPays', 'overTime', 'categories', 'kinds', 'biggest']
	},
	friends: {
		tiles: ['spent', 'myShare', 'count', 'perPerson'],
		sections: ['howOften', 'whoPays', 'biggest', 'categories', 'overTime']
	},
	food: {
		tiles: ['spent', 'count', 'perPerson', 'myShare'],
		sections: ['howOften', 'overTime', 'biggest', 'whoPays']
	},
	car: {
		tiles: ['spent', 'fixedPerMonth', 'change', 'myShare'],
		sections: ['overTime', 'fixedCosts', 'kinds', 'whoPays', 'biggest']
	},
	other: {
		tiles: ['spent', 'myShare', 'perPerson', 'perDay'],
		sections: ['overTime', 'categories', 'kinds', 'biggest', 'whoPays']
	}
};

/** As stored with a group: comma-separated, in order; null or unknown values = suggestions */
export function parseSections(value: string | null | undefined): Section[] | null {
	if (!value) return null;
	const sections = value.split(',').filter(isSection);
	return sections.length ? [...new Set(sections)] : null;
}

/** What a group shows: its own choice, else its type's suggestions */
export const sectionsFor = (kind: GroupKind, chosen: string | null | undefined) =>
	parseSections(chosen) ?? LAYOUTS[kind].sections;

/**
 * A choice to store: the chosen sections in the suggested order, then the others in the
 * offered order; null when it's just the suggestions (so a later type change applies)
 */
export function choiceToStore(kind: GroupKind, chosen: readonly Section[]): string | null {
	const suggested = LAYOUTS[kind].sections;
	const ordered = [
		...suggested.filter((section) => chosen.includes(section)),
		...SECTIONS.filter((section) => chosen.includes(section) && !suggested.includes(section))
	];
	const same =
		ordered.length === suggested.length && ordered.every((section, i) => section === suggested[i]);
	return same || ordered.length === 0 ? null : ordered.join(',');
}
