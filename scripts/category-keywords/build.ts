// Turns the datasets into keywords per category (pure; generate.ts does the I/O).
import type { ExpenseCategory } from '../../src/lib/expense/categories.ts';
import { normalizeTitle } from '../../src/lib/expense/normalize.ts';

type Category = Exclude<ExpenseCategory, 'other'>;
export type Keywords = Partial<Record<Category, string[]>>;

type NsiItem = {
	displayName: string;
	matchNames?: string[];
	locationSet?: { include?: unknown[] };
};
type Nsi = Record<string, { items: NsiItem[] } | undefined>;
type Presets = Record<string, { name?: string; terms?: string[] } | undefined>;

export type Options = {
	placeTypes: [string, Category][];
	regions: string[];
	minLetters: number;
	ignored: string[];
};

const LATIN = /^[\p{Script=Latin}\p{N} ]+$/u;
const letterCount = (text: string) => text.match(/\p{L}/gu)?.length ?? 0;

/** "7 eleven australia" is redundant when "7 eleven" is a keyword: titles match by phrase. */
function hasShorterKeyword(keyword: string, keywords: Map<string, Category>) {
	const words = keyword.split(' ');
	for (let length = 1; length < words.length; length++) {
		for (let start = 0; start + length <= words.length; start++) {
			if (keywords.has(words.slice(start, start + length).join(' '))) return true;
		}
	}
	return false;
}

/** Collects names into the first category that claims them; skips ambiguous ones. */
function collector(options: Options) {
	const ignored = new Set(options.ignored);
	const seen = new Map<string, Category>();
	return {
		add(category: Category, name: string) {
			const keyword = normalizeTitle(name);
			if (seen.has(keyword) || ignored.has(keyword) || !LATIN.test(keyword)) return;
			if (letterCount(keyword) < options.minLetters) return;
			seen.set(keyword, category);
		},
		/** Sorted per category, so regenerating gives small, readable diffs */
		result(): Keywords {
			const keywords: Keywords = {};
			for (const [, category] of options.placeTypes) keywords[category] = [];
			for (const [keyword, category] of seen) {
				if (!hasShorterKeyword(keyword, seen)) keywords[category]!.push(keyword);
			}
			for (const list of Object.values(keywords)) list.sort();
			return keywords;
		}
	};
}

const inRegions = (item: NsiItem, regions: Set<string>) =>
	(item.locationSet?.include ?? []).some((region) => regions.has(String(region).toLowerCase()));

export function buildKeywords(nsi: Nsi, presetsByLocale: Presets[], options: Options): Keywords {
	const keywords = collector(options);
	const regions = new Set(options.regions);
	for (const [placeType, category] of options.placeTypes) {
		// Generic words first ("supermarkt"), then brands ("Lidl")
		for (const presets of presetsByLocale) {
			const preset = presets[placeType];
			for (const term of [preset?.name ?? '', ...(preset?.terms ?? [])])
				keywords.add(category, term);
		}
		for (const item of nsi[`brands/${placeType}`]?.items ?? []) {
			if (!inRegions(item, regions)) continue;
			for (const name of [item.displayName, ...(item.matchNames ?? [])])
				keywords.add(category, name);
		}
	}
	return keywords.result();
}
