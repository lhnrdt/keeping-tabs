// Guesses an expense's category from its title, e.g. "Lidl" → groceries.
import { buildTypoIndex, findWithTypo } from '#lib/text/typo-index.ts';
import type { ExpenseCategory } from './categories';
import { matchDataset, type DatasetIndex } from './dataset/index';
import { KEYWORDS } from './keywords';
import { normalizeTitle } from './normalize';

/** Keywords this long also match with one typo, e.g. "resturant". */
const TYPO_MIN_LENGTH = 5;

/** Category order: earlier categories win when several match */
const rank = new Map(KEYWORDS.map(([category], i) => [category, i]));
const categoryOfKeyword = new Map(
	KEYWORDS.flatMap(([category, keywords]) =>
		keywords.map((keyword) => [keyword, category] as const)
	)
);
const typoIndex = buildTypoIndex(
	[...categoryOfKeyword.keys()].filter(
		(keyword) => keyword.length >= TYPO_MIN_LENGTH && !keyword.includes(' ')
	)
);

function matchesExactly(text: string, words: string[], keyword: string) {
	if (keyword.includes(' ')) return ` ${text} `.includes(` ${keyword} `);
	if (keyword.length <= 3) return words.includes(keyword);
	if (keyword.length === 4) return words.some((word) => word.startsWith(keyword));
	return text.includes(keyword);
}

function exactMatch(text: string, words: string[]) {
	return KEYWORDS.find(([, keywords]) =>
		keywords.some((keyword) => matchesExactly(text, words, keyword))
	)?.[0];
}

/** A word, or its start (for plurals and compounds), is a keyword with one typo. */
function typoMatch(words: string[]) {
	let best: Exclude<ExpenseCategory, 'other'> | undefined;
	for (const word of words) {
		const longest = Math.min(word.length, typoIndex.maxLength + 1);
		for (let length = TYPO_MIN_LENGTH - 1; length <= longest; length++) {
			for (const keyword of findWithTypo(typoIndex, word.slice(0, length))) {
				const category = categoryOfKeyword.get(keyword)!;
				if (!best || rank.get(category)! < rank.get(best)!) best = category;
			}
		}
	}
	return best;
}

function categorizeText(text: string, dataset?: DatasetIndex): ExpenseCategory {
	const words = text.split(' ');
	return (
		exactMatch(text, words) ??
		(dataset && matchDataset(words, dataset)) ??
		typoMatch(words) ??
		'other'
	);
}

// Titles repeat a lot ("Groceries", "Rent"), so results are remembered per dataset
const NO_DATASET = {};
const CACHE_LIMIT = 2000;
const caches = new WeakMap<object, Map<string, ExpenseCategory>>();

/**
 * Hand-written keywords first, then the dataset's brands and terms (when loaded), then
 * hand-written keywords with a typo.
 */
export function categorize(title: string, dataset?: DatasetIndex): ExpenseCategory {
	const key = dataset ?? NO_DATASET;
	const cache = caches.get(key) ?? new Map<string, ExpenseCategory>();
	caches.set(key, cache);
	const text = normalizeTitle(title);
	let category = cache.get(text);
	if (!category) {
		if (cache.size >= CACHE_LIMIT) cache.clear();
		category = categorizeText(text, dataset);
		cache.set(text, category);
	}
	return category;
}
