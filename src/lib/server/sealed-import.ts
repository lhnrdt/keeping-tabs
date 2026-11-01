// Checks an import sealed in the browser (#110). Nothing in it can be read, so only that it's sealed
// and in the right shape, for what goes into the database.
import { isSealed } from '#lib/crypto/seal.ts';
import { MAX_IMPORT_ROWS } from '#lib/import/limits.ts';
import { isClientId } from '#lib/validation.ts';

export type SealedImport = {
	newMembers: { id: string; name: string }[];
	entries: {
		type: 'expense' | 'payment';
		title: string;
		date: string;
		key: string;
		sealedDetails: string;
	}[];
};

const isEntry = (entry: SealedImport['entries'][number]) =>
	(entry?.type === 'expense'
		? isSealed(entry.title)
		: entry?.type === 'payment' && entry.title === '') &&
	isSealed(entry.sealedDetails) &&
	/^\d{4}-\d{2}-\d{2}$/.test(String(entry.date)) &&
	typeof entry.key === 'string' &&
	entry.key.length <= 100;

export function parseSealedImport(body: unknown): SealedImport | null {
	const input = body as SealedImport | null;
	if (!Array.isArray(input?.newMembers) || !Array.isArray(input.entries)) return null;
	if (input.entries.length > MAX_IMPORT_ROWS || input.newMembers.length > 500) return null;
	if (!input.newMembers.every((member) => isClientId(member?.id) && isSealed(member.name)))
		return null;
	if (!input.entries.every(isEntry)) return null;
	return { newMembers: input.newMembers, entries: input.entries };
}
