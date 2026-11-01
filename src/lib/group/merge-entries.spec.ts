import { describe, expect, it } from 'vitest';
import { mergeEntries } from './merge-entries';

const row = (id: string, date: string, createdAt = 0) => ({ id, date, createdAt });

describe('mergeEntries', () => {
	const kept = [row('b', '2026-02-01'), row('a', '2026-01-01')];
	const answer = { asOf: 1, whole: false, rows: [], removed: [] };

	it('adds and sorts what is new, newest first', () => {
		const merged = mergeEntries(kept, { ...answer, rows: [row('c', '2026-01-15')] });
		expect(merged.map(({ id }) => id)).toEqual(['b', 'c', 'a']);
	});

	it('replaces what changed, without doubling', () => {
		const merged = mergeEntries(kept, { ...answer, rows: [row('a', '2026-03-01')] });
		expect(merged.map(({ id }) => id)).toEqual(['a', 'b']);
	});

	it('takes out what was removed', () => {
		expect(mergeEntries(kept, { ...answer, removed: ['b'] }).map(({ id }) => id)).toEqual(['a']);
	});

	it('starts over when given all of them', () => {
		const merged = mergeEntries(kept, { ...answer, whole: true, rows: [row('z', '2026-01-01')] });
		expect(merged.map(({ id }) => id)).toEqual(['z']);
	});

	it('orders the same day by when they were added', () => {
		const merged = mergeEntries([], {
			...answer,
			rows: [row('old', '2026-01-01', 1), row('new', '2026-01-01', 2)]
		});
		expect(merged.map(({ id }) => id)).toEqual(['new', 'old']);
	});
});
