// Finds known words within one typo of a text without comparing it to every word: each word
// is indexed under itself and its single-letter deletions (the SymSpell idea), so a lookup
// costs about as many map reads as the text has letters.
import { withinOneEdit } from './typo';

export type TypoIndex = {
	byKey: ReadonlyMap<string, string[]>;
	minLength: number;
	maxLength: number;
};

const deletions = (word: string) =>
	Array.from(word, (_, i) => word.slice(0, i) + word.slice(i + 1));

export function buildTypoIndex(words: readonly string[]): TypoIndex {
	const byKey = new Map<string, string[]>();
	for (const word of words) {
		for (const key of new Set([word, ...deletions(word)])) {
			byKey.set(key, [...(byKey.get(key) ?? []), word]);
		}
	}
	const lengths = words.map((word) => word.length);
	return { byKey, minLength: Math.min(...lengths), maxLength: Math.max(...lengths) };
}

/** Known words within one typo of `text` (any changed, missing, extra or swapped letter). */
export function findWithTypo({ byKey, minLength, maxLength }: TypoIndex, text: string) {
	if (text.length < minLength - 1 || text.length > maxLength + 1) return [];
	const found = new Set<string>();
	for (const key of [text, ...deletions(text)]) {
		for (const word of byKey.get(key) ?? []) {
			if (withinOneEdit(text, word)) found.add(word);
		}
	}
	return [...found];
}
