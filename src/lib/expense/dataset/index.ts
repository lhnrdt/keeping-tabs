// Brands and place words from OpenStreetMap datasets (generated into keywords.json), matched
// as whole words or phrases: "Lidl", "Burger King", "Tankstelle".
import type { ExpenseCategory } from '../categories';

export type DatasetIndex = { phrases: ReadonlyMap<string, ExpenseCategory>; maxWords: number };

export function buildDatasetIndex(
	keywords: Partial<Record<ExpenseCategory, string[]>>
): DatasetIndex {
	const phrases = new Map<string, ExpenseCategory>();
	let maxWords = 1;
	for (const [category, list] of Object.entries(keywords) as [ExpenseCategory, string[]][]) {
		for (const phrase of list) {
			phrases.set(phrase, category);
			maxWords = Math.max(maxWords, phrase.split(' ').length);
		}
	}
	return { phrases, maxWords };
}

/** The category of the longest phrase in the title's words, leftmost first. */
export function matchDataset(words: string[], { phrases, maxWords }: DatasetIndex) {
	for (let length = Math.min(maxWords, words.length); length > 0; length--) {
		for (let start = 0; start + length <= words.length; start++) {
			const category = phrases.get(words.slice(start, start + length).join(' '));
			if (category) return category;
		}
	}
	return undefined;
}
