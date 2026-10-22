import { describe, expect, it } from 'vitest';
import { categoryOf, guessCategory, learnCategories } from './learned';

describe('learned categories', () => {
	const learned = learnCategories([
		{ title: 'Netto run', category: 'groceries' },
		{ title: 'netto  RUN!', category: 'drinks' },
		{ title: 'Taxi', category: null }
	]);

	it('remembers the newest hand-chosen category per title, ignoring case and punctuation', () => {
		expect(guessCategory('NETTO RUN', learned)).toBe('groceries');
	});

	it('falls back to the keyword guess', () => {
		expect(guessCategory('Taxi', learned)).toBe('transport');
	});

	it('keeps a hand-chosen category over anything learned', () => {
		expect(categoryOf({ title: 'Netto run', category: 'fun' }, learned)).toBe('fun');
		expect(categoryOf({ title: 'Netto run', category: null }, learned)).toBe('groceries');
	});
});
