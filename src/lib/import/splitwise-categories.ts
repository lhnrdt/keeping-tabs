// Splitwise's categories (English and German exports) → ours. Unknown ones, like
// "General"/"Allgemein", stay automatic so the title decides.
import type { ExpenseCategory } from '#lib/expense/categories.ts';
import { categorize } from '#lib/expense/categorize.ts';

const SPLITWISE: Record<string, ExpenseCategory> = {
	groceries: 'groceries',
	lebensmittel: 'groceries',
	'dining out': 'dining',
	restaurant: 'dining',
	'food and drink - other': 'dining',
	'essen und trinken - sonstiges': 'dining',
	liquor: 'drinks',
	alkohol: 'drinks',
	car: 'transport',
	auto: 'transport',
	'gas/fuel': 'transport',
	treibstoff: 'transport',
	parking: 'transport',
	parken: 'transport',
	taxi: 'transport',
	'bus/train': 'transport',
	'bus/zug': 'transport',
	plane: 'transport',
	flugzeug: 'transport',
	bicycle: 'transport',
	fahrrad: 'transport',
	hotel: 'lodging',
	rent: 'home',
	miete: 'home',
	mortgage: 'home',
	furniture: 'home',
	mobel: 'home',
	'household supplies': 'home',
	haushaltsgegenstande: 'home',
	electricity: 'home',
	elektrizitat: 'home',
	'heat/gas': 'home',
	water: 'home',
	wasser: 'home',
	'tv/phone/internet': 'home',
	cleaning: 'home',
	reinigung: 'home',
	maintenance: 'home',
	movies: 'fun',
	kino: 'fun',
	games: 'fun',
	spiele: 'fun',
	music: 'fun',
	musik: 'fun',
	entertainment: 'fun',
	sports: 'health',
	sport: 'health',
	clothing: 'shopping',
	kleidung: 'shopping',
	electronics: 'shopping',
	elektronik: 'shopping',
	gifts: 'gifts',
	geschenke: 'gifts',
	medical: 'health',
	'medical expenses': 'health',
	medikamente: 'health'
};

const plain = (text: string) =>
	text
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.trim()
		.toLowerCase();

/** Our category for a Splitwise one, or null to let the title decide. */
export function fromSplitwiseCategory(category: string): ExpenseCategory | null {
	const known = SPLITWISE[plain(category)];
	if (known) return known;
	const guessed = category.trim() ? categorize(category) : 'other';
	return guessed === 'other' ? null : guessed;
}
