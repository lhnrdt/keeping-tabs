// Guesses an expense's category from its title (English and German), e.g. "Lidl" → groceries.
import type { ExpenseCategory } from './categories';

/**
 * Keywords per category, lowercase without accents. Earlier categories win when several
 * match. Up to 3 letters must be the whole word ("bar", not "barbecue"), 4 letters start a
 * word ("rent" in "rental"), longer ones may appear anywhere ("einkauf" in "Wocheneinkauf").
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

/** Lowercase words without accents ("Frühstück" → "fruhstuck"). */
const normalize = (text: string) =>
	text
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase()
		.replace(/[^\p{L}\p{N}]+/gu, ' ')
		.trim();

function matches(text: string, words: string[], keyword: string) {
	if (keyword.includes(' ')) return ` ${text} `.includes(` ${keyword} `);
	if (keyword.length <= 3) return words.includes(keyword);
	if (keyword.length === 4) return words.some((word) => word.startsWith(keyword));
	return text.includes(keyword);
}

export function categorize(title: string): ExpenseCategory {
	const text = normalize(title);
	const words = text.split(' ');
	const found = KEYWORDS.find(([, keywords]) =>
		keywords.some((keyword) => matches(text, words, keyword))
	);
	return found?.[0] ?? 'other';
}

/** The chosen category, else the one guessed from the title. */
export const categoryOf = (expense: { category: ExpenseCategory | null; title: string }) =>
	expense.category ?? categorize(expense.title);
