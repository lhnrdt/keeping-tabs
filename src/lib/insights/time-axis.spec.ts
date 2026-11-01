import { describe, expect, it } from 'vitest';
import { barTicks, fullDate, timeLabel, timeTicks } from './time-axis';

const day = (iso: string) => new Date(`${iso}T00:00:00Z`);
const isos = (dates: Date[]) => dates.map((date) => date.toISOString().slice(0, 10));

describe('timeTicks', () => {
	it('marks every year over a long time', () => {
		expect(isos(timeTicks(day('2023-08-10'), day('2026-11-01')))).toEqual([
			'2024-01-01',
			'2025-01-01',
			'2026-01-01'
		]);
	});

	it('marks months over some months, at most a few', () => {
		const ticks = timeTicks(day('2026-01-15'), day('2026-10-20'));
		expect(ticks.length).toBeLessThanOrEqual(5);
		expect(isos(ticks)[0]).toBe('2026-02-01');
	});

	it('marks first, middle and last day of a short time', () => {
		expect(isos(timeTicks(day('2026-08-01'), day('2026-08-21')))).toEqual([
			'2026-08-01',
			'2026-08-11',
			'2026-08-21'
		]);
	});
});

describe('timeLabel', () => {
	it('always says the year', () => {
		const long = timeLabel(day('2023-01-01'), day('2026-01-01'), 'en');
		expect(long(day('2024-01-01'))).toBe('2024');
		const some = timeLabel(day('2026-01-01'), day('2026-06-01'), 'en');
		expect(some(day('2026-03-01'))).toContain('2026');
		const short = timeLabel(day('2026-08-01'), day('2026-08-20'), 'en');
		expect(short(day('2026-08-10'))).toContain('2026');
		expect(fullDate(day('2026-11-01'), 'en')).toContain('2026');
	});
});

describe('barTicks', () => {
	it('marks the first bar of each year', () => {
		const starts = [
			'2024-11-01',
			'2024-12-01',
			'2025-01-01',
			'2025-06-01',
			'2026-02-01',
			'2026-06-01'
		];
		expect(barTicks(starts)).toEqual(['2025-01-01', '2026-02-01']);
	});
});
