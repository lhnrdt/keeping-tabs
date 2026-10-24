// Which insights a group shows, in which order, by its type (#169): the questions people of
// that kind of group ask first come first. The single place to change it.
import type { GroupKind } from '#lib/group/kinds.ts';

export type Tile =
	'spent' | 'myShare' | 'perPerson' | 'perDay' | 'change' | 'count' | 'fixedPerMonth';
export type Section =
	'overTime' | 'categories' | 'kinds' | 'fixedCosts' | 'biggest' | 'whoPays' | 'howOften';

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
