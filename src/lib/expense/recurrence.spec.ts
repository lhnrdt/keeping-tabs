import { describe, expect, it } from 'vitest';
import { dueTimes, occurrence } from './recurrence';

describe('recurrence (#45)', () => {
	it('steps by weeks, months and years', () => {
		expect(occurrence('2026-10-27', 'weekly', 1)).toBe('2026-11-03');
		expect(occurrence('2026-10-27', 'monthly', 3)).toBe('2027-01-27');
		expect(occurrence('2026-10-27', 'yearly', 2)).toBe('2028-10-27');
	});

	it('keeps the day of the month, clamped to shorter months, without drifting', () => {
		expect(occurrence('2026-01-31', 'monthly', 1)).toBe('2026-02-28');
		expect(occurrence('2026-01-31', 'monthly', 2)).toBe('2026-03-31');
		expect(occurrence('2028-02-29', 'yearly', 1)).toBe('2029-02-28');
	});

	it('lists what is due by today, catching up', () => {
		expect(dueTimes('2026-08-01', 'monthly', 1, '2026-10-27')).toEqual([1, 2]);
		expect(dueTimes('2026-08-01', 'monthly', 3, '2026-10-27')).toEqual([]);
	});
});
