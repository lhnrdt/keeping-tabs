// What an expense was for. Stored only when chosen by hand; otherwise derived from its title.

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
	'health'
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const isExpenseCategory = (value: unknown): value is ExpenseCategory =>
	EXPENSE_CATEGORIES.includes(value as ExpenseCategory);
