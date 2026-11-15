import { describe, expect, it } from 'vitest';
import { costPerKmOverTime, monthlyCost, type CarEntry } from './car-costs';

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
	it('is everything per month since the first expense, and without the purchase too', () => {
		expect(monthlyCost(car, '2026-04-30')).toEqual({
			all: Math.round(1_258_000 / 4),
			running: Math.round(58_000 / 4),
			purchase: true
		});
	});

	it('counts the months up to today, also quiet ones', () => {
		expect(monthlyCost([entry('2026-01-10', 12_000)], '2026-06-15')).toEqual({
			all: 2_000,
			running: 2_000,
			purchase: false
		});
	});
});
