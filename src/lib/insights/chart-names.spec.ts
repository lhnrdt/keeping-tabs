import { describe, expect, it } from 'vitest';
import { chartName, chartNamesWidth } from './chart-names';

describe('chartName', () => {
	it('keeps a name that fits', () => {
		expect(chartName('Nora')).toBe('Nora');
	});

	it('takes the first name of one that does not', () => {
		expect(chartName('Francine EICHHOLZER')).toBe('Francine');
	});

	it('cuts a single long name', () => {
		expect(chartName('Maximilianopolis')).toBe('Maximiliano…');
	});
});

describe('chartNamesWidth', () => {
	it('makes room for the longest name shown', () => {
		expect(chartNamesWidth(['Nora', 'Francine EICHHOLZER'])).toBe(68);
	});
});
