import { describe, expect, it } from 'vitest';
import { defaultFormValues, defaultFrom, parseDefaultSplit } from './default-split';

describe('default split', () => {
	const shares = [
		{ memberId: 'anna', shareCents: 6000, input: 6000 },
		{ memberId: 'ben', shareCents: 4000, input: 4000 }
	];

	it('remembers percentages and parts, not amounts', () => {
		expect(defaultFrom('percent', shares)).toEqual({
			mode: 'percent',
			inputs: { anna: 6000, ben: 4000 }
		});
		expect(defaultFrom('shares', shares)?.mode).toBe('shares');
		expect(defaultFrom('exact', shares)).toBeNull();
		expect(defaultFrom('equal', shares)).toBeNull();
	});

	it('reads back only what makes sense', () => {
		expect(parseDefaultSplit({ mode: 'percent', inputs: { anna: 6000, ben: -1 } })).toEqual({
			mode: 'percent',
			inputs: { anna: 6000 }
		});
		expect(parseDefaultSplit({ mode: 'exact', inputs: {} })).toBeNull();
		expect(parseDefaultSplit(null)).toBeNull();
	});

	it('fills a new expense, with 0 for members added since', () => {
		expect(
			defaultFormValues(
				{ mode: 'percent', inputs: { anna: 6000, ben: 4000 } },
				['anna', 'ben', 'cara'],
				'EUR'
			)
		).toEqual({ splitMode: 'percent', inputs: { anna: '60', ben: '40', cara: '0' } });
	});
});
