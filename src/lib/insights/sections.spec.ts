import { describe, expect, it } from 'vitest';
import { choiceToStore, LAYOUTS, parseSections, sectionsFor } from './sections';

describe('choosing insight sections (#174)', () => {
	it('shows the type’s suggestions until the group chooses', () => {
		expect(sectionsFor('partner', null)).toEqual(LAYOUTS.partner.sections);
		expect(sectionsFor('partner', 'fixedCosts,overTime')).toEqual(['fixedCosts', 'overTime']);
	});

	it('keeps the suggested order and adds the others after them', () => {
		const chosen = [
			...LAYOUTS.partner.sections.filter((s) => s !== 'biggest'),
			'fixedCosts'
		] as const;
		expect(choiceToStore('partner', chosen)).toBe(
			'myPosition,highlights,whoPays,overTime,categories,kinds,fixedCosts'
		);
	});

	it('stores nothing for just the suggestions, so a type change still applies', () => {
		expect(choiceToStore('home', LAYOUTS.home.sections)).toBeNull();
		expect(choiceToStore('home', [])).toBeNull();
	});

	it('ignores what it doesn’t know', () => {
		expect(parseSections('overTime,nonsense,overTime')).toEqual(['overTime']);
		expect(parseSections('nonsense')).toBeNull();
	});
});
