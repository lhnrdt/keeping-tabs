// An expense form's data, opened: with everyone's balances, so the form shows and saves an odd
// cent with whoever owes the least. An encrypted group's are worked out here, as on its page (#110).
import { resolve } from '$app/paths';
import { browser, openedGroupLoad } from '#lib/crypto/open-data.ts';
import { balances } from '#lib/money.ts';
import { sealedEntries } from './sealed-entries';
import type { SealedEntry } from './sealed-money';

type Parent = { group: { id: string; shareToken: string }; members: { id: string }[] };

export async function expenseFormLoad<T extends { balances: Record<string, number> | null }>(
	data: T,
	parent: () => Promise<Parent>,
	fetch: typeof globalThis.fetch
) {
	const opened = await openedGroupLoad(data, parent);
	if (opened.balances || !browser) return opened;
	const { group, members } = await parent();
	const entries = await sealedEntries<SealedEntry>(
		fetch,
		resolve('/g/[token]', { token: group.shareToken }),
		group.id
	);
	const memberIds = members.map((member) => member.id);
	return { ...opened, balances: Object.fromEntries(balances(memberIds, entries)) };
}
