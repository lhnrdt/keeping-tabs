import { describe, expect, it } from 'vitest';
import { SCENES } from './scenes';
import { GROUP_SETTLED } from './group-subjects';
import { atNight, hasSun, isNight, moonForSun } from './time-of-day';

describe('the header’s scene at night (#291)', () => {
	it('is from nine in the evening to six in the morning', () => {
		expect([20, 21, 23, 0, 5, 6].map(isNight)).toEqual([false, true, true, true, true, false]);
	});

	it('has the moon in the sun’s place, with stars', () => {
		const night = atNight(SCENES.meadow);
		expect(night.shapes.some((shape) => shape.sun)).toBe(false);
		expect(night.shapes.length).toBe(SCENES.meadow.shapes.length + 1);
		expect(night.dots!.length).toBeGreaterThan(SCENES.meadow.dots!.length);
	});

	it('brings a moon up where there’s no sun, and leaves a night sky as it is', () => {
		expect(atNight(SCENES.forest).shapes.length).toBe(SCENES.forest.shapes.length + 2);
		expect(atNight(SCENES.aurora)).toBe(SCENES.aurora);
	});

	it('has a settled group’s sun go down too, without a second moon behind it', () => {
		const settled = moonForSun(GROUP_SETTLED.car);
		expect(hasSun(settled)).toBe(false);
		expect(settled.lines).toEqual([]);
		const behind = atNight(SCENES.forest, { ownMoon: false });
		expect(behind.shapes.length).toBe(SCENES.forest.shapes.length);
	});
});
