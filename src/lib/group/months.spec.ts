import { describe, expect, it } from 'vitest';
import { groupByMonth } from './months';

describe('groupByMonth', () => {
	it('groups consecutive entries of the same month, in order', () => {
		const entries = [{ date: '2026-10-23' }, { date: '2026-10-01' }, { date: '2026-09-30' }];
		expect(groupByMonth(entries)).toEqual([
			{ month: '2026-10', entries: [{ date: '2026-10-23' }, { date: '2026-10-01' }] },
			{ month: '2026-09', entries: [{ date: '2026-09-30' }] }
		]);
	});

	it('handles an empty list', () => {
		expect(groupByMonth([])).toEqual([]);
	});
});
