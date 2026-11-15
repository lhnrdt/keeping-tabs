import { describe, expect, it } from 'vitest';
import { carViews, costPerKmOverTime, monthlyCost, type CarEntry } from './car-costs';

const entry = (
	date: string,
	amountCents: number,
	category: CarEntry['category'] = 'fuel',
	km?: number
): CarEntry => ({ date, amountCents, category, odometerM: km ? km * 1000 : null });

/** Bought for €12,000 in January, then fuel and a repair, 1,000 km a month */
const car = [
	entry('2026-01-05', 1_200_000, 'purchase', 50_000),
	entry('2026-02-01', 6_000, 'fuel', 51_000),
	entry('2026-03-01', 6_000, 'fuel', 52_000),
	entry('2026-03-20', 40_000, 'repairs'),
	entry('2026-04-01', 6_000, 'fuel', 53_000)
];

describe('cost per km over time (#366)', () => {
	it('gets cheaper as the purchase spreads over more km', () => {
		const points = costPerKmOverTime(car);
		expect(points.map((point) => point.month)).toEqual(['2026-02', '2026-03', '2026-04']);
		expect(points[0].centsPerKm).toBe(1_206);
		expect(points.at(-1)!.centsPerKm).toBeLessThan(points[0].centsPerKm);
		// All of it by April over 3,000 km
		expect(points.at(-1)!.centsPerKm).toBe(Math.round((1_258_000 * 1000) / 3_000_000));
	});

	it('is nothing without two readings', () => {
		expect(costPerKmOverTime([entry('2026-01-05', 5_000, 'fuel', 50_000)])).toEqual([]);
	});
});

describe('average monthly cost (#366)', () => {
	it('is everything per month since the first expense', () => {
		expect(monthlyCost(car, '2026-04-30')).toBe(Math.round(1_258_000 / 4));
	});

	it('counts the months up to today, also quiet ones', () => {
		expect(monthlyCost([entry('2026-01-10', 12_000)], '2026-06-15')).toBe(2_000);
	});
});

describe('with or without the purchase', () => {
	it('leaves the purchase out of every number, keeping its reading', () => {
		const { withPurchase, withoutPurchase } = carViews(car, null, '2026-04-30');
		expect(withPurchase.monthly).toBe(Math.round(1_258_000 / 4));
		expect(withoutPurchase!.monthly).toBe(Math.round(58_000 / 4));
		// 3,000 km from the purchase's reading on
		expect(withoutPurchase!.driving!.drivenM).toBe(3_000_000);
		expect(withoutPurchase!.driving!.centsPerKm).toBe(Math.round((58_000 * 1000) / 3_000_000));
		expect(withoutPurchase!.perKm.at(-1)!.centsPerKm).toBe(Math.round((58_000 * 1000) / 3_000_000));
	});

	it('has nothing to leave out without a purchase', () => {
		expect(carViews(car.slice(1), null, '2026-04-30').withoutPurchase).toBeNull();
	});
});
