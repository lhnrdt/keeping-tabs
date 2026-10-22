import { describe, expect, it } from 'vitest';
import { mergeGroups } from './your-groups';

const group = (id: string, name = id, token = `t-${id}`) => ({ id, name, token });

describe('mergeGroups', () => {
	it('includes groups from both, without duplicates', () => {
		expect(mergeGroups([group('a'), group('b')], [{ ...group('c'), openedAt: 1 }])).toHaveLength(3);
	});

	it('prefers the server name and link', () => {
		const merged = mergeGroups(
			[group('a', 'Renamed', 'new-token')],
			[{ ...group('a', 'Old', 'old-token'), openedAt: 5 }]
		);
		expect(merged).toEqual([group('a', 'Renamed', 'new-token')]);
	});

	it('puts recently opened groups first, then the server order', () => {
		const merged = mergeGroups(
			[group('a'), group('b'), group('c')],
			[
				{ ...group('c'), openedAt: 9 },
				{ ...group('d'), openedAt: 3 }
			]
		);
		expect(merged.map((g) => g.id)).toEqual(['c', 'd', 'a', 'b']);
	});
});
