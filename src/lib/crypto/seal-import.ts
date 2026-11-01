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
	const entries = await Promise.all(
		parsed.value.rows.flatMap(planRow).map(async ({ title, category, ...entry }) => ({
			...entry,
			key: await privateKey(key, entry.key),
			title: title && (await sealText(key, title, textContext('title'))),
			category: null,
			sealedDetails:
				entry.type === 'expense'
					? await sealText(
							key,
							JSON.stringify({
								category,
								autoCategory: category ? null : categorize(title),
								odometerM: null,
								fuelMl: null
							}),
							textContext('details')
						)
					: null
		}))
	);
	const names = await Promise.all(
		parsed.value.people.map((name) => sealText(key, name, textContext('name')))
	);
	return { ok: true as const, value: { memberOf: memberOf.value, names, entries } };
}
