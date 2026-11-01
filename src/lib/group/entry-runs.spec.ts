import { describe, expect, it } from 'vitest';
import { entryRuns } from './entry-runs';

const expense = { type: 'expense' };
const payment = { type: 'payment' };

describe('entryRuns', () => {
	it('keeps expenses together, and every payment on its own', () => {
		expect(
			entryRuns([expense, expense, payment, payment, expense]).map((run) => run.length)
		).toEqual([2, 1, 1, 1]);
	});

	it('has nothing to do for no entries', () => {
		expect(entryRuns([])).toEqual([]);
	});
});
