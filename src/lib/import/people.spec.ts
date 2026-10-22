import { describe, expect, it } from 'vitest';
import { NEW_MEMBER, resolvePeople, suggestMember } from './people';

const members = [
	{ id: 'j', name: 'Johannes' },
	{ id: 'e', name: 'Elisabeth' }
];

describe('suggestMember', () => {
	it('matches by name, then by first name', () => {
		expect(suggestMember('johannes', members)).toBe('j');
		expect(suggestMember('Elisabeth Hecht', members)).toBe('e');
		expect(suggestMember('Cara', members)).toBe(NEW_MEMBER);
	});
});

describe('resolvePeople', () => {
	const people = ['Johannes', 'Elisabeth Hecht', 'Cara'];

	it('uses the suggestions for missing choices', () => {
		expect(resolvePeople([], people, members)).toEqual({ ok: true, value: ['j', 'e', null] });
	});

	it('rejects unknown members and choosing someone twice', () => {
		expect(resolvePeople(['x'], people, members)).toEqual({
			ok: false,
			error: 'import_people_invalid'
		});
		expect(resolvePeople(['j', 'j'], people, members)).toEqual({
			ok: false,
			error: 'import_people_invalid'
		});
	});

	it('needs a free name for new members', () => {
		expect(resolvePeople(['j', NEW_MEMBER], ['Johannes', 'elisabeth'], members)).toEqual({
			ok: false,
			error: 'member_name_taken'
		});
	});
});
