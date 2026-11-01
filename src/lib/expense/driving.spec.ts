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
			expect(parseKm(text)).toEqual({ ok: false, error: 'odometer_invalid' });
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
	const reading = (date: string, km: number, amountCents = 0, litres?: number) => ({
		date,
		amountCents,
		odometerM: km * 1000,
		fuelMl: litres ? litres * 1000 : null
	});

	it('is nothing without readings or litres', () => {
		expect(drivingOf([{ date: '2026-10-01', amountCents: 500 }])).toBeNull();
	});

	it('shows a single reading, with nothing driven yet', () => {
		expect(drivingOf([reading('2026-10-01', 12_000)])).toEqual({
			odometerM: 12_000_000,
			drivenM: 0,
			centsPerKm: null,
			litresPer100Km: null,
			centsPerLitre: null
		});
	});

	it('works out the km from the readings, and consumption from the fuel after the first', () => {
		const driving = drivingOf([
			reading('2026-10-20', 13_000, 8_000, 50),
			{ date: '2026-10-10', amountCents: 2_000 },
			reading('2026-10-01', 12_000, 7_000, 40)
		]);
		expect(driving).toEqual({
			odometerM: 13_000_000,
			drivenM: 1_000_000,
			centsPerKm: 10,
			litresPer100Km: 5,
			centsPerLitre: 167
		});
	});

	it('counts a period from the reading before it', () => {
		const driving = drivingOf(
			[
				reading('2026-09-20', 12_000, 7_000, 40),
				reading('2026-10-15', 12_500, 4_000, 25),
				reading('2026-11-05', 13_000, 4_000, 25)
			],
			{ from: '2026-10-01', to: '2026-10-31' }
		);
		expect(driving?.odometerM).toBe(12_500_000);
		expect(driving?.drivenM).toBe(500_000);
		expect(driving?.litresPer100Km).toBe(5);
	});

	it('does not go negative on a mistyped reading', () => {
		const driving = drivingOf([reading('2026-09-20', 12_000), reading('2026-10-15', 1_200)], {
			from: '2026-10-01',
			to: '2026-10-31'
		});
		expect(driving?.drivenM).toBe(0);
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
