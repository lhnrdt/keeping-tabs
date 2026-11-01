import { describe, expect, it } from 'vitest';
import {
	drivingOf,
	formatKm,
	needleAngle,
	odometerDigits,
	parseKm,
	parseLitres,
	quantityInputValue
} from './driving';

describe('parsing', () => {
	it('takes km and litres with a point or comma; empty is none', () => {
		expect(parseKm('120,5')).toEqual({ ok: true, value: 120_500 });
		expect(parseKm(' ')).toEqual({ ok: true, value: null });
		expect(parseLitres('41.27')).toEqual({ ok: true, value: 41_270 });
	});

	it('refuses what is not a sensible quantity', () => {
		for (const text of ['0', '-5', 'abc', '1.25', '2000000']) {
			expect(parseKm(text)).toEqual({ ok: false, error: 'km_invalid' });
		}
		expect(parseLitres('1.234')).toEqual({ ok: false, error: 'litres_invalid' });
	});

	it('goes back to what was typed', () => {
		expect(quantityInputValue(120_500)).toBe('120.5');
		expect(quantityInputValue(null)).toBe('');
		expect(formatKm(1_234_500, 'en')).toBe('1,234.5 km');
	});
});

describe('drivingOf', () => {
	it('is nothing without km or litres', () => {
		expect(drivingOf([{ amountCents: 500 }])).toBeNull();
	});

	it('sums up cost per km, consumption and price per litre', () => {
		const driving = drivingOf([
			{ amountCents: 8_000, fuelMl: 50_000 },
			{ amountCents: 2_000, distanceM: 500_000 },
			{ amountCents: 10_000, distanceM: 500_000 }
		]);
		expect(driving).toEqual({
			metres: 1_000_000,
			centsPerKm: 20,
			litresPer100Km: 5,
			centsPerLitre: 160
		});
	});

	it('leaves out what it cannot tell', () => {
		expect(drivingOf([{ amountCents: 1_000, distanceM: 10_000 }])).toEqual({
			metres: 10_000,
			centsPerKm: 100,
			litresPer100Km: null,
			centsPerLitre: null
		});
	});
});

describe('the dashboard', () => {
	it('shows six km digits and the tenth, more when needed', () => {
		expect(odometerDigits(1_234_560)).toEqual({ whole: [...'001234'], tenth: '5' });
		expect(odometerDigits(1_234_567_000)).toEqual({ whole: [...'1234567'], tenth: '0' });
	});

	it('points the needle along the scale and rests at its end', () => {
		expect(needleAngle(0)).toBe(-90);
		expect(needleAngle(7.5)).toBe(0);
		expect(needleAngle(40)).toBe(90);
	});
});
