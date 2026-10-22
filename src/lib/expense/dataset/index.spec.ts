import { describe, expect, it } from 'vitest';
import { buildDatasetIndex, matchDataset } from './index';

const index = buildDatasetIndex({
	dining: ['burger king', 'king'],
	groceries: ['lidl']
});

describe('matchDataset', () => {
	it('matches whole words and phrases', () => {
		expect(matchDataset(['lunch', 'at', 'lidl'], index)).toBe('groceries');
		expect(matchDataset(['lidlx'], index)).toBeUndefined();
	});

	it('prefers the longest phrase', () => {
		expect(matchDataset(['burger', 'king', 'lidl'], index)).toBe('dining');
	});
});
