// Checks an import sealed in the browser (#110). The text can't be read, but the numbers go into
// everyone's balances and the references into the database, so those are held to what the server's
// own import produces.
import { isSealed } from '#lib/crypto/seal.ts';
import { MAX_IMPORT_ROWS } from '#lib/import/limits.ts';
import type { ImportInput } from './import';

const isCents = (value: unknown) => Number.isSafeInteger(value) && (value as number) >= 0;
const isPerson = (value: unknown, people: number) =>
	Number.isInteger(value) && (value as number) >= 0 && (value as number) < people;

type Entry = ImportInput['entries'][number];

function isEntry(entry: Entry, people: number) {
	const expense = entry?.type === 'expense';
	if (!expense && entry?.type !== 'payment') return false;
	if (expense ? !isSealed(entry.title) : entry.title !== '') return false;
	if (expense ? !isSealed(entry.sealedDetails) : entry.sealedDetails !== null) return false;
	if (entry.category !== null) return false;
	if (!/^\d{4}-\d{2}-\d{2}$/.test(String(entry.date))) return false;
	if (entry.splitMode !== 'equal' && entry.splitMode !== 'exact') return false;
	if (typeof entry.key !== 'string' || entry.key.length > 100) return false;
	if (!isCents(entry.amountCents) || !isPerson(entry.paidBy, people)) return false;
	if (!Array.isArray(entry.shares) || entry.shares.length === 0) return false;
	const valid = entry.shares.every(
		(share) => isCents(share?.shareCents) && isPerson(share?.person, people)
	);
	const total = valid ? entry.shares.reduce((sum, share) => sum + share.shareCents, 0) : -1;
	return total === entry.amountCents;
}

export function parseSealedImport(body: unknown, memberIds: readonly string[]): ImportInput | null {
	const input = body as ImportInput | null;
	if (!Array.isArray(input?.memberOf) || !Array.isArray(input.names)) return null;
	if (!Array.isArray(input.entries) || input.entries.length > MAX_IMPORT_ROWS) return null;
	const people = input.memberOf.length;
	if (input.names.length !== people || people === 0) return null;
	const chosen = input.memberOf.filter((id) => id !== null);
	if (new Set(chosen).size !== chosen.length) return null;
	if (!chosen.every((id) => memberIds.includes(id))) return null;
	if (!input.names.every(isSealed)) return null;
	if (!input.entries.every((entry) => isEntry(entry, people))) return null;
	return { memberOf: input.memberOf, names: input.names, entries: input.entries };
}
