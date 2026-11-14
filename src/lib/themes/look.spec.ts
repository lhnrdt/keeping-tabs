import { describe, expect, it } from 'vitest';
import { dailyTheme, localDate, lookOn } from './look';
import { THEME_IDS } from './palettes';

const days = (from: string, count: number) =>
	Array.from({ length: count }, (_, i) =>
		new Date(Date.parse(`${from}T00:00:00Z`) + i * 86_400_000).toISOString().slice(0, 10)
	);

describe('a different scenery every day (#332)', () => {
	it('is the same all day', () => {
		expect(dailyTheme('2026-11-14')).toBe(dailyTheme('2026-11-14'));
	});

	it('never shows the same one two days running', () => {
		const shown = days('2026-01-01', 1000).map(dailyTheme);
		for (let i = 1; i < shown.length; i++) expect(shown[i]).not.toBe(shown[i - 1]);
	});

	it('shows every one within a run of days', () => {
		// Runs start on days divisible by the number of themes, counted from 1970
		const start = Math.ceil(Date.parse('2026-01-01') / 86_400_000 / 9) * 9;
		const from = new Date(start * 86_400_000).toISOString().slice(0, 10);
		expect(new Set(days(from, THEME_IDS.length).map(dailyTheme)).size).toBe(THEME_IDS.length);
	});
});

describe('the look', () => {
	it("takes the scenery's own colours unless others are chosen", () => {
		expect(lookOn('fjord', 'scenery', '2026-11-14')).toEqual({ scenery: 'fjord', colors: 'fjord' });
		expect(lookOn('fjord', 'autumn', '2026-11-14')).toEqual({ scenery: 'fjord', colors: 'autumn' });
	});

	it('puts your own main colour on the scenery’s palette (#330)', () => {
		expect(lookOn('fjord', '#e05aa0', '2026-11-14')).toEqual({
			scenery: 'fjord',
			colors: 'fjord',
			own: '#e05aa0'
		});
	});

	it("follows the day's scenery, colours too", () => {
		const today = dailyTheme('2026-11-14');
		expect(lookOn('daily', 'scenery', '2026-11-14')).toEqual({ scenery: today, colors: today });
		expect(lookOn('daily', 'birch', '2026-11-14').colors).toBe('birch');
	});

	it("dates by the person's own time zone", () => {
		const late = new Date('2026-11-14T23:30:00Z');
		expect(localDate(late, 'Europe/Berlin')).toBe('2026-11-15');
		expect(localDate(late, 'America/New_York')).toBe('2026-11-14');
		expect(localDate(late, 'Nowhere/Else')).toBe('2026-11-14');
	});
});
