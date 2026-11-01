// What an expense was for. Stored only when chosen by hand; otherwise derived from its title.
import type { GroupKind } from '#lib/group/kinds.ts';

export const EXPENSE_CATEGORIES = [
	'other',
	'groceries',
	'dining',
	'drinks',
	'transport',
	'lodging',
	'home',
	'fun',
	'shopping',
	'gifts',
	'health',
	'fuel',
	'parking',
	'tolls',
	'repairs',
	'insurance',
	'rent',
	'utilities',
	'internet'
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const isExpenseCategory = (value: unknown): value is ExpenseCategory =>
	EXPENSE_CATEGORIES.includes(value as ExpenseCategory);

/** What a kind of group spends on, most likely first; the rest is one tap further */
const BY_GROUP_KIND: Record<GroupKind, readonly ExpenseCategory[]> = {
	other: [
		'groceries',
		'dining',
		'drinks',
		'transport',
		'lodging',
		'home',
		'fun',
		'shopping',
		'gifts',
		'health'
	],
	trip: ['lodging', 'transport', 'fuel', 'dining', 'drinks', 'groceries', 'fun', 'shopping'],
	home: ['rent', 'utilities', 'internet', 'groceries', 'home', 'shopping'],
	partner: [
		'groceries',
		'dining',
		'rent',
		'home',
		'transport',
		'fun',
		'shopping',
		'gifts',
		'health'
	],
	friends: ['dining', 'drinks', 'fun', 'groceries', 'transport', 'gifts'],
	food: ['groceries', 'dining', 'drinks'],
	event: ['dining', 'drinks', 'fun', 'lodging', 'transport', 'gifts', 'shopping'],
	car: ['fuel', 'parking', 'tolls', 'repairs', 'insurance', 'transport']
};

/**
 * The categories a group offers, "Other" last: its kind's, or all of them. `shown` is the one
 * in use right now, which is there even when it doesn't fit the group.
 */
export function categoriesFor(
	kind: GroupKind,
	{ all = false, shown }: { all?: boolean; shown?: ExpenseCategory } = {}
): ExpenseCategory[] {
	const offered = all ? EXPENSE_CATEGORIES : BY_GROUP_KIND[kind];
	return [
		...new Set([...offered, ...(shown ? [shown] : [])].filter((category) => category !== 'other')),
		'other'
	];
}
