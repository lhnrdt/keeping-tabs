// An icon for each part of the insights: their sections, the tiles at the top and the kinds of
// costs, so each is found at a glance. The single place to change them.
import type { IconName } from '#lib/icons.ts';
import type { Kind } from './expense-kinds';
import type { Section, Tile } from './sections';

export const SECTION_ICONS: Record<Section, IconName> = {
	recap: 'photo',
	budget: 'budget',
	highlights: 'sparkles',
	overTime: 'overTime',
	categories: 'byCategory',
	kinds: 'splitShares',
	kindMonths: 'month',
	fixedCosts: 'repeats',
	driving: 'kindCar',
	biggest: 'bigOneOff',
	whoPays: 'paidBy',
	howOften: 'often',
	myPosition: 'balances',
	settling: 'settling'
};

export const TILE_ICONS: Record<Tile, IconName> = {
	spent: 'expense',
	myShare: 'you',
	perPerson: 'group',
	perDay: 'day',
	perMeal: 'kindFood',
	change: 'trend',
	count: 'activity',
	fixedPerMonth: 'repeats'
};

export const KIND_ICONS: Record<Kind, IconName> = {
	fixed: 'repeats',
	everyday: 'everyday',
	occasional: 'date',
	big: 'bigOneOff'
};
