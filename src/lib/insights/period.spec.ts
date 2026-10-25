import { describe, expect, it } from 'vitest';
import {
	canStep,
	defaultPeriod,
	inRange,
	parsePeriod,
	periodParams,
	periodRange,
	stepPeriod,
	switchKind
} from './period';

const params = (query: string) => new URLSearchParams(query);
const all = { kind: 'all' } as const;

describe('parsePeriod', () => {
	it('reads a year, month or day from the address', () => {
		expect(parsePeriod(params('period=year&at=2026'), all)).toEqual({ kind: 'year', at: '2026' });
		expect(parsePeriod(params('period=month&at=2026-10'), all)).toEqual({
			kind: 'month',
			at: '2026-10'
		});
		expect(parsePeriod(params('period=day&at=2026-10-24'), all)).toEqual({
			kind: 'day',
			at: '2026-10-24'
		});
		expect(parsePeriod(params('period=all'), { kind: 'month', at: '2026-10' })).toEqual(all);
	});

	it('falls back on nonsense', () => {
		const fallback = { kind: 'month', at: '2026-10' } as const;
		expect(parsePeriod(params(''), fallback)).toBe(fallback);
		expect(parsePeriod(params('period=week&at=2026-10'), fallback)).toBe(fallback);
		expect(parsePeriod(params('period=month&at=2026'), fallback)).toBe(fallback);
		expect(parsePeriod(params('period=month&at=2026-13'), fallback)).toBe(fallback);
	});
});

describe('periodRange', () => {
	it('covers the whole year, month or day', () => {
		expect(periodRange({ kind: 'year', at: '2026' })).toEqual({
			from: '2026-01-01',
			to: '2026-12-31'
		});
		expect(periodRange({ kind: 'month', at: '2026-02' })).toEqual({
			from: '2026-02-01',
			to: '2026-02-28'
		});
		expect(periodRange({ kind: 'day', at: '2026-10-24' })).toEqual({
			from: '2026-10-24',
			to: '2026-10-24'
		});
		expect(periodRange(all)).toBeNull();
	});

	it('tells what falls in it', () => {
		const october = periodRange({ kind: 'month', at: '2026-10' });
		expect(inRange('2026-10-31', october)).toBe(true);
		expect(inRange('2026-11-01', october)).toBe(false);
		expect(inRange('1999-01-01', null)).toBe(true);
	});
});

describe('stepping', () => {
	it('goes to the year, month or day before and after', () => {
		expect(stepPeriod({ kind: 'month', at: '2026-01' }, -1)).toEqual({
			kind: 'month',
			at: '2025-12'
		});
		expect(stepPeriod({ kind: 'day', at: '2026-02-28' }, 1)).toEqual({
			kind: 'day',
			at: '2026-03-01'
		});
		expect(stepPeriod({ kind: 'year', at: '2026' }, 1)).toEqual({ kind: 'year', at: '2027' });
	});

	it('stays within the group’s expenses', () => {
		const span = { from: '2026-08-01', to: '2026-10-24' };
		expect(canStep({ kind: 'month', at: '2026-08' }, span, -1)).toBe(false);
		expect(canStep({ kind: 'month', at: '2026-08' }, span, 1)).toBe(true);
		expect(canStep({ kind: 'month', at: '2026-10' }, span, 1)).toBe(false);
		expect(canStep(all, span, 1)).toBe(false);
	});
});

describe('switchKind', () => {
	it('keeps to the period shown', () => {
		const october = { kind: 'month', at: '2026-10' } as const;
		expect(switchKind(october, 'year', '2026-10-25', null)).toEqual({ kind: 'year', at: '2026' });
		expect(switchKind(october, 'day', '2026-10-25', null)).toEqual({
			kind: 'day',
			at: '2026-10-25'
		});
		expect(switchKind({ kind: 'month', at: '2026-08' }, 'day', '2026-10-25', null)).toEqual({
			kind: 'day',
			at: '2026-08-31'
		});
	});

	it('from all of it, goes to the last expense', () => {
		expect(switchKind(all, 'month', '2026-10-25', '2026-08-05')).toEqual({
			kind: 'month',
			at: '2026-08'
		});
	});
});

it('starts monthly groups on this month, the others on all of it', () => {
	expect(defaultPeriod('home', '2026-10-25')).toEqual({ kind: 'month', at: '2026-10' });
	expect(defaultPeriod('trip', '2026-10-25')).toEqual(all);
});

it('writes the period into the address', () => {
	expect(periodParams({ kind: 'month', at: '2026-10' })).toBe('period=month&at=2026-10');
	expect(periodParams(all)).toBe('period=all');
});
