// A Splitwise import into an encrypted group (#110): the file is read here, and only what's sealed
// goes to the server. Same parser and plan as a plain group's import on the server.
import { categorize } from '#lib/expense/categorize.ts';
import { resolvePeople } from '#lib/import/people.ts';
import { planRow } from '#lib/import/plan.ts';
import { parseSplitwise } from '#lib/import/splitwise.ts';
import { toBase64Url, sealText, textContext } from './seal';

/** The same row keeps its key on every import, without saying anything about what's in it */
async function privateKey(groupKey: string, rowKey: string) {
	const hash = await crypto.subtle.digest(
		'SHA-256',
		new TextEncoder().encode(`${groupKey}:import:${rowKey}`)
	);
	return `sealed:${toBase64Url(new Uint8Array(hash))}`;
}

/** What to send; or why it can't be imported */
export async function sealImport(
	text: string,
	currency: string,
	key: string,
	choices: readonly (string | undefined)[],
	members: readonly { id: string; name: string }[]
) {
	const parsed = parseSplitwise(text, currency);
	if (!parsed.ok) return parsed;
	const memberOf = resolvePeople(choices, parsed.value.people, members);
	if (!memberOf.ok) return memberOf;
	// New members get their id here: their shares are sealed with it
	const memberIds = memberOf.value.map((id) => id ?? crypto.randomUUID());
	const newMembers = await Promise.all(
		memberOf.value.flatMap((id, person) =>
			id
				? []
				: [
						sealText(key, parsed.value.people[person], textContext('name')).then((name) => ({
							id: memberIds[person],
							name
						}))
					]
		)
	);
	const entries = await Promise.all(
		parsed.value.rows.flatMap(planRow).map(async (entry) => {
			const shares = entry.shares.map(({ person, shareCents }) => ({
				memberId: memberIds[person],
				shareCents,
				input: entry.splitMode === 'exact' ? shareCents : null
			}));
			const details = {
				amountCents: entry.amountCents,
				paidBy: memberIds[entry.paidBy],
				splitMode: entry.splitMode,
				splits: shares,
				category: entry.category,
				autoCategory: entry.category || entry.type === 'payment' ? null : categorize(entry.title)
			};
			return {
				type: entry.type,
				date: entry.date,
				key: await privateKey(key, entry.key),
				title: entry.title && (await sealText(key, entry.title, textContext('title'))),
				sealedDetails: await sealText(key, JSON.stringify(details), textContext('details'))
			};
		})
	);
	return { ok: true as const, value: { newMembers, entries } };
}
