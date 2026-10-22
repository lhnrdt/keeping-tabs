// What the generated category keywords are made of. Change this, then run
// `pnpm keywords:generate` to rebuild src/lib/expense/dataset/keywords.json.
import type { ExpenseCategory } from '../../src/lib/expense/categories.ts';

/** Pinned dataset versions, so a rebuild is reproducible and updates are reviewed */
export const SOURCES = {
	nsi: {
		name: 'name-suggestion-index',
		version: '8.0.20260918',
		license: 'BSD-3-Clause',
		url: 'https://github.com/osmlab/name-suggestion-index'
	},
	presets: {
		name: '@openstreetmap/id-tagging-schema',
		version: '7.3.0',
		license: 'ISC',
		url: 'https://github.com/openstreetmap/id-tagging-schema'
	}
} as const;

/**
 * OpenStreetMap place types and the category their brands and search terms stand for.
 * Order matters: a name found under several types keeps the first one's category.
 */
export const PLACE_TYPES: [string, Exclude<ExpenseCategory, 'other'>][] = [
	['shop/supermarket', 'groceries'],
	['shop/convenience', 'groceries'],
	['shop/greengrocer', 'groceries'],
	['shop/butcher', 'groceries'],
	['amenity/marketplace', 'groceries'],
	['amenity/restaurant', 'dining'],
	['amenity/fast_food', 'dining'],
	['amenity/cafe', 'dining'],
	['amenity/ice_cream', 'dining'],
	['shop/bakery', 'dining'],
	['shop/pastry', 'dining'],
	['amenity/bar', 'drinks'],
	['amenity/pub', 'drinks'],
	['amenity/biergarten', 'drinks'],
	['shop/alcohol', 'drinks'],
	['shop/beverages', 'drinks'],
	['amenity/fuel', 'transport'],
	['amenity/charging_station', 'transport'],
	['amenity/car_rental', 'transport'],
	['amenity/parking', 'transport'],
	['amenity/taxi', 'transport'],
	['amenity/ferry_terminal', 'transport'],
	['tourism/hotel', 'lodging'],
	['tourism/hostel', 'lodging'],
	['tourism/motel', 'lodging'],
	['tourism/guest_house', 'lodging'],
	['tourism/camp_site', 'lodging'],
	['tourism/apartment', 'lodging'],
	['shop/furniture', 'home'],
	['shop/doityourself', 'home'],
	['shop/hardware', 'home'],
	['shop/houseware', 'home'],
	['amenity/cinema', 'fun'],
	['amenity/theatre', 'fun'],
	['amenity/nightclub', 'fun'],
	['tourism/museum', 'fun'],
	['tourism/theme_park', 'fun'],
	['tourism/zoo', 'fun'],
	['leisure/bowling_alley', 'fun'],
	['shop/clothes', 'shopping'],
	['shop/shoes', 'shopping'],
	['shop/electronics', 'shopping'],
	['shop/department_store', 'shopping'],
	['shop/books', 'shopping'],
	['shop/sports', 'shopping'],
	['shop/gift', 'gifts'],
	['shop/florist', 'gifts'],
	['shop/toys', 'gifts'],
	['amenity/pharmacy', 'health'],
	['shop/chemist', 'health'],
	['amenity/doctors', 'health'],
	['amenity/dentist', 'health'],
	['amenity/hospital', 'health'],
	['leisure/fitness_centre', 'health'],
	['shop/optician', 'health']
];

/** Search terms in these languages (Latin-script European languages plus English) */
export const LOCALES = [
	'en',
	'de',
	'fr',
	'es',
	'it',
	'nl',
	'pt',
	'pl',
	'sv',
	'da',
	'nb',
	'fi',
	'cs',
	'sk',
	'sl',
	'hr',
	'hu',
	'ro',
	'et',
	'lv',
	'lt',
	'ca'
];

/** Brands valid worldwide (001), in Europe (150) or in one of these countries */
export const REGIONS = [
	'001',
	'150',
	'ad',
	'al',
	'at',
	'ba',
	'be',
	'bg',
	'ch',
	'cy',
	'cz',
	'de',
	'dk',
	'ee',
	'es',
	'fi',
	'fr',
	'gb',
	'gr',
	'hr',
	'hu',
	'ie',
	'is',
	'it',
	'li',
	'lt',
	'lu',
	'lv',
	'mc',
	'me',
	'mk',
	'mt',
	'nl',
	'no',
	'pl',
	'pt',
	'ro',
	'rs',
	'se',
	'si',
	'sk',
	'sm',
	'ua',
	'xk'
];

/** Names with fewer letters are too ambiguous ("bp", "365", "ada") */
export const MIN_LETTERS = 4;

/** Everyday words that are also brand names or overly generic search terms */
export const IGNORED = [
	'shop',
	'store',
	'market',
	'mart',
	'drink',
	'drinks',
	'food',
	'dive',
	'house',
	'home',
	'next',
	'real',
	'total',
	'target',
	'best',
	'more',
	'plus',
	'one',
	'day',
	'the',
	'and',
	'center',
	'centre',
	'city',
	'express',
	'local',
	'super',
	'magasin',
	'geschaft',
	'laden'
];
