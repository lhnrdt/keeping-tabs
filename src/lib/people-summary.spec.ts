import { describe, expect, it } from 'vitest';
import { summarizePeople, type GroupSettlement } from './people-summary';

const group = (overrides: Partial<GroupSettlement> & Pick<GroupSettlement, 'id'>) => ({
	name: overrides.id,
	token: `${overrides.id}-token`,
	currency: 'EUR',
	memberId: `${overrides.id}-me`,
	members: [],
	transfers: [],
	...overrides
});

describe('summarizePeople', () => {
	it('adds up the same person across groups, with the groups it comes from', () => {
		const trip = group({
			id: 'trip',
			members: [{ id: 'trip-anna', name: 'Anna', personId: 'p-anna' }],
			transfers: [{ from: 'trip-anna', to: 'trip-me', amountCents: 3000 }]
		});
		const flat = group({
			id: 'flat',
			members: [{ id: 'flat-anna', name: 'Anna B.', personId: 'p-anna' }],
			transfers: [{ from: 'flat-me', to: 'flat-anna', amountCents: 1800 }]
		});
		const [anna] = summarizePeople([trip, flat]);
		expect(anna).toMatchObject({ name: 'Anna', avatarId: 'p-anna', net: 1200 });
		expect(anna.groups.map(({ id, amount }) => [id, amount])).toEqual([
			['trip', 3000],
			['flat', -1800]
		]);
	});

	it('keeps spots nobody joined apart, even with the same name, and currencies apart', () => {
		const a = group({
			id: 'a',
			members: [{ id: 'a-ben', name: 'Ben', personId: null }],
			transfers: [{ from: 'a-ben', to: 'a-me', amountCents: 500 }]
		});
		const b = group({
			id: 'b',
			currency: 'NOK',
			members: [{ id: 'b-ben', name: 'Ben', personId: null }],
			transfers: [{ from: 'b-ben', to: 'b-me', amountCents: 700 }]
		});
		expect(summarizePeople([a, b]).map((p) => [p.name, p.currency, p.net])).toEqual([
			['Ben', 'NOK', 700],
			['Ben', 'EUR', 500]
		]);
	});

	it("leaves out payments between others and people you're even with", () => {
		const trip = group({
			id: 'trip',
			members: [
				{ id: 'trip-anna', name: 'Anna', personId: 'p-anna' },
				{ id: 'trip-cara', name: 'Cara', personId: null }
			],
			transfers: [
				{ from: 'trip-cara', to: 'trip-anna', amountCents: 900 },
				{ from: 'trip-anna', to: 'trip-me', amountCents: 400 }
			]
		});
		const flat = group({
			id: 'flat',
			members: [{ id: 'flat-anna', name: 'Anna', personId: 'p-anna' }],
			transfers: [{ from: 'flat-me', to: 'flat-anna', amountCents: 400 }]
		});
		expect(summarizePeople([trip, flat])).toEqual([]);
	});
});
