import { describe, expect, it } from 'vitest';
import { isSettledAndQuiet } from './settled';

const today = '2026-10-25';
const settled = { balance: 0, open: [], lastEntry: '2026-09-01' };

describe('isSettledAndQuiet', () => {
	it('folds a group settled and quiet for over a month', () => {
		expect(isSettledAndQuiet(settled, today)).toBe(true);
	});

	it('keeps groups with something open, recent entries, or none yet', () => {
		expect(isSettledAndQuiet({ ...settled, balance: 1200 }, today)).toBe(false);
		expect(isSettledAndQuiet({ ...settled, open: [{}] }, today)).toBe(false);
		expect(isSettledAndQuiet({ ...settled, lastEntry: '2026-10-10' }, today)).toBe(false);
		expect(isSettledAndQuiet({ ...settled, lastEntry: null }, today)).toBe(false);
	});
});
