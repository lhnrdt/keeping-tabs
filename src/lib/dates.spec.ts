import { describe, expect, it } from 'vitest';
import { dayInputValue, todayInputValue } from './dates';

describe('dayInputValue', () => {
	const now = new Date(2026, 2, 1, 12);

	it('is today without days back', () => {
		expect(todayInputValue(now)).toBe('2026-03-01');
	});

	it('goes back across a month', () => {
		expect(dayInputValue(1, now)).toBe('2026-02-28');
	});
});
