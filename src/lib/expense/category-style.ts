// How expense categories are presented: icon and label per category (SSOT for the picker
// and the expense list).
import type { IconName } from '#lib/icons.ts';
import { m } from '#lib/paraglide/messages.js';
import type { ExpenseCategory } from './categories';

export const categoryIcons: Record<ExpenseCategory, IconName> = {
	other: 'expense',
	groceries: 'categoryGroceries',
	dining: 'categoryDining',
	drinks: 'categoryDrinks',
	transport: 'categoryTransport',
	lodging: 'categoryLodging',
	home: 'categoryHome',
	fun: 'categoryFun',
	shopping: 'categoryShopping',
	gifts: 'categoryGifts',
	health: 'categoryHealth'
};

export const categoryLabels: Record<ExpenseCategory, () => string> = {
	other: m.category_other,
	groceries: m.category_groceries,
	dining: m.category_dining,
	drinks: m.category_drinks,
	transport: m.category_transport,
	lodging: m.category_lodging,
	home: m.category_home,
	fun: m.category_fun,
	shopping: m.category_shopping,
	gifts: m.category_gifts,
	health: m.category_health
};
