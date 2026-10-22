import { describe, expect, it } from 'vitest';
import { uniqueById } from './unique';

describe('uniqueById', () => {
	it('keeps the first of each id, in order', () => {
		expect(uniqueById([{ id: 'a' }, { id: 'b' }, { id: 'a' }])).toEqual([{ id: 'a' }, { id: 'b' }]);
	});
});
