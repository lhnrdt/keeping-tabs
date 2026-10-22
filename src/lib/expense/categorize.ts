// Guesses an expense's category from its title (English and German), e.g. "Lidl" → groceries.
import { withinOneEdit } from '#lib/text/typo.ts';
import type { ExpenseCategory } from './categories';
import { normalizeTitle } from './normalize';

/**
 * Keywords per category, lowercase without accents. Earlier categories win when several
 * match. Up to 3 letters must be the whole word ("bar", not "barbecue"), 4 letters start a
 * word ("rent" in "rental"), longer ones may appear anywhere ("einkauf" in "Wocheneinkauf")
 * and tolerate one typo.
 */
const KEYWORDS: [Exclude<ExpenseCategory, 'other'>, string[]][] = [
	[
		'lodging',
		[
			'hotel',
			'hostel',
			'airbnb',
			'motel',
			'booking',
			'unterkunft',
			'ferienwohnung',
			'apartment',
			'cabin',
			'hutte',
			'camping',
			'accommodation'
		]
	],
	[
		'transport',
		[
			'taxi',
			'uber',
			'bolt',
			'train',
			'zug',
			'bahn',
			'bus',
			'tram',
			'metro',
			'ubahn',
			'sbahn',
			'flight',
			'flug',
			'ferry',
			'fahre',
			'fuel',
			'petrol',
			'benzin',
			'diesel',
			'tanken',
			'parking',
			'parken',
			'parkhaus',
			'toll',
			'maut',
			'vignette',
			'mietwagen',
			'rental car',
			'car hire',
			'sixt',
			'europcar'
		]
	],
	[
		'groceries',
		[
			'groceries',
			'grocery',
			'supermarket',
			'supermarkt',
			'einkauf',
			'lebensmittel',
			'aldi',
			'lidl',
			'rewe',
			'edeka',
			'kaufland',
			'netto',
			'penny',
			'tesco',
			'migros',
			'coop',
			'spar',
			'billa',
			'hofer',
			'market',
			'markt'
		]
	],
	[
		'drinks',
		[
			'bar',
			'pub',
			'beer',
			'bier',
			'wine',
			'wein',
			'drinks',
			'getranke',
			'cocktail',
			'shots',
			'kneipe'
		]
	],
	[
		'dining',
		[
			'restaurant',
			'dinner',
			'lunch',
			'breakfast',
			'brunch',
			'pizza',
			'sushi',
			'burger',
			'kebab',
			'doner',
			'cafe',
			'coffee',
			'kaffee',
			'bakery',
			'backerei',
			'takeaway',
			'takeout',
			'lieferando',
			'essen',
			'fruhstuck',
			'imbiss',
			'food',
			'meal',
			'snack',
			'eis',
			'ice cream'
		]
	],
	[
		'home',
		[
			'rent',
			'miete',
			'electricity',
			'strom',
			'utilities',
			'nebenkosten',
			'internet',
			'wifi',
			'wlan',
			'heating',
			'heizung',
			'water bill',
			'cleaning',
			'putzmittel',
			'furniture',
			'mobel',
			'ikea',
			'household',
			'haushalt',
			'toilet paper',
			'klopapier'
		]
	],
	[
		'fun',
		[
			'cinema',
			'kino',
			'movie',
			'film',
			'concert',
			'konzert',
			'museum',
			'theater',
			'theatre',
			'festival',
			'party',
			'tickets',
			'eintritt',
			'bowling',
			'skipass',
			'ski pass',
			'lift pass',
			'netflix',
			'spotify',
			'game',
			'spiel',
			'zoo'
		]
	],
	[
		'shopping',
		[
			'clothes',
			'kleidung',
			'shoes',
			'schuhe',
			'amazon',
			'zalando',
			'shopping',
			'mall',
			'electronics'
		]
	],
	[
		'gifts',
		[
			'gift',
			'present',
			'geschenk',
			'birthday',
			'geburtstag',
			'flowers',
			'blumen',
			'wedding',
			'hochzeit'
		]
	],
	[
		'health',
		[
			'pharmacy',
			'apotheke',
			'doctor',
			'arzt',
			'medicine',
			'medikament',
			'dentist',
			'zahnarzt',
			'hospital',
			'krankenhaus',
			'gym',
			'fitness',
			'sunscreen',
			'sonnencreme'
		]
	]
];

/** Keywords this long also match with one typo, e.g. "resturant". */
const TYPO_MIN_LENGTH = 5;

function matchesExactly(text: string, words: string[], keyword: string) {
	if (keyword.includes(' ')) return ` ${text} `.includes(` ${keyword} `);
	if (keyword.length <= 3) return words.includes(keyword);
	if (keyword.length === 4) return words.some((word) => word.startsWith(keyword));
	return text.includes(keyword);
}

/** A word, or its start (for plurals and compounds), is the keyword with one typo. */
function matchesWithTypo(words: string[], keyword: string) {
	if (keyword.length < TYPO_MIN_LENGTH || keyword.includes(' ')) return false;
	return words.some((word) =>
		[-1, 0, 1].some((delta) => withinOneEdit(word.slice(0, keyword.length + delta), keyword))
	);
}

function firstMatch(matches: (keyword: string) => boolean) {
	return KEYWORDS.find(([, keywords]) => keywords.some(matches))?.[0];
}

/** Exact matches win over typo matches; earlier categories win over later ones. */
export function categorize(title: string): ExpenseCategory {
	const text = normalizeTitle(title);
	const words = text.split(' ');
	return (
		firstMatch((keyword) => matchesExactly(text, words, keyword)) ??
		firstMatch((keyword) => matchesWithTypo(words, keyword)) ??
		'other'
	);
}
