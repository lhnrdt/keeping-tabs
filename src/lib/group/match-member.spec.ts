import { describe, expect, it } from 'vitest';
import { matchMember } from './match-member';

const members = [
	{ id: 'b', name: 'Ben' },
	{ id: 'e', name: 'Elisabeth' }
];

describe('matchMember', () => {
	it('matches the same name or the same first name, ignoring case and spaces', () => {
		expect(matchMember(' ben ', members)?.id).toBe('b');
		expect(matchMember('Elisabeth Hecht', members)?.id).toBe('e');
	});

	it('finds nobody for other or empty names', () => {
		expect(matchMember('Benedikt', members)).toBeUndefined();
		expect(matchMember('', members)).toBeUndefined();
	});
});
