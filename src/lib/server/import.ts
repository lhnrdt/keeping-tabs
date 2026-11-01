// Saves imported expenses and payments (I-1 – I-3) in a fixed handful of queries, however
// many rows there are: D1's free plan allows 50 queries per request and 100 bound values
// per query, so the rows go in as a few JSON values and SQLite unpacks them (json_each).
import { and, eq, isNotNull } from 'drizzle-orm';
import type { PlannedEntry } from '#lib/import/plan.ts';
import { log } from './activity';
import type { Db } from './db';
import { SEALED_AMOUNT } from '#lib/expense/sealed-details.ts';
import { expenses, members } from './db/schema';
import type { SealedImport } from './sealed-import';

export type ImportInput = {
	/** Member id per person (column) of the export; null = add them as a new member */
	memberOf: (string | null)[];
	/** The export's names, for people added as new members */
	names: string[];
	entries: PlannedEntry[];
};

const ROWS_PER_STATEMENT = 1_000;

/** All rows of a JSON array, unpacked by SQLite: ?1 group, ?2/?3 timestamps, ?4 rows */
const INSERT_EXPENSES = `
	insert into expenses (id, group_id, type, split_mode, title, amount_cents, paid_by, date,
		category, sealed_details, import_key, created_at, updated_at)
	select json_extract(value, '$.id'), ?1, json_extract(value, '$.type'),
		json_extract(value, '$.splitMode'),
		json_extract(value, '$.title'), json_extract(value, '$.amount'),
		json_extract(value, '$.paidBy'), json_extract(value, '$.date'),
		json_extract(value, '$.category'), json_extract(value, '$.sealedDetails'),
		json_extract(value, '$.key'), ?2, ?3
	from json_each(?4)`;

/** Exact splits keep each share as what was "entered", so they can be edited; equal ones need none */
const INSERT_SPLITS = `
	insert into expense_splits (expense_id, member_id, share_cents, input)
	select json_extract(value, '$.expenseId'), json_extract(value, '$.memberId'),
		json_extract(value, '$.share'), json_extract(value, '$.input')
	from json_each(?1)`;

/** Import keys the group already has: those rows were imported before. */
async function importedKeys(db: Db, groupId: string) {
	const rows = await db
		.select({ key: expenses.importKey })
		.from(expenses)
		.where(and(eq(expenses.groupId, groupId), isNotNull(expenses.importKey)));
	return new Set(rows.map((row) => row.key));
}

export async function importEntries(
	db: Db,
	groupId: string,
	actorId: string | null,
	input: ImportInput
) {
	const known = await importedKeys(db, groupId);
	const entries = input.entries.filter((entry) => !known.has(entry.key));

	// Everyone in the export gets a member id: their existing one or a new member's
	const memberIds = input.memberOf.map((memberId) => memberId ?? crypto.randomUUID());
	const newMembers = input.memberOf.flatMap((memberId, person) =>
		memberId ? [] : [{ id: memberIds[person], groupId, name: input.names[person] }]
	);

	const now = Date.now();
	const rows = entries.map((entry) => ({ ...entry, id: crypto.randomUUID() }));
	const expenseRows = (piece: typeof rows) =>
		JSON.stringify(
			piece.map((row) => ({
				id: row.id,
				type: row.type,
				splitMode: row.splitMode,
				title: row.title,
				amount: row.amountCents,
				paidBy: memberIds[row.paidBy],
				date: row.date,
				category: row.category,
				key: row.key
			}))
		);
	const splitRows = (piece: typeof rows) =>
		JSON.stringify(
			piece.flatMap((row) =>
				row.shares.map((share) => ({
					expenseId: row.id,
					memberId: memberIds[share.person],
					share: share.shareCents,
					input: row.splitMode === 'exact' ? share.shareCents : null
				}))
			)
		);

	const skipped = input.entries.length - entries.length;
	const record = log(db, groupId, actorId, 'group.import', {
		source: 'splitwise',
		imported: entries.length,
		skipped,
		newMembers: newMembers.map((member) => member.name)
	});

	// In pieces: sealed text is longer, and one JSON value can only be so long
	const pieces = Array.from({ length: Math.ceil(rows.length / ROWS_PER_STATEMENT) }, (_, i) =>
		rows.slice(i * ROWS_PER_STATEMENT, (i + 1) * ROWS_PER_STATEMENT)
	);

	// Batched on the D1 client: drizzle (0.45) can't batch raw SQL that has parameters.
	// One transaction; members before the expenses that refer to them.
	const d1 = db.$client;
	const prepare = ({ sql, params }: { sql: string; params: unknown[] }) =>
		d1.prepare(sql).bind(...params);
	await d1.batch([
		prepare(record.toSQL()),
		...(newMembers.length ? [prepare(db.insert(members).values(newMembers).toSQL())] : []),
		...pieces.flatMap((piece) => [
			d1.prepare(INSERT_EXPENSES).bind(groupId, now, now, expenseRows(piece)),
			d1.prepare(INSERT_SPLITS).bind(splitRows(piece))
		])
	]);

	return { imported: entries.length, skipped };
}

/** An import sealed in the browser (#110): rows with nothing to read, in the same few queries */
export async function importSealedEntries(
	db: Db,
	groupId: string,
	actorId: string,
	input: SealedImport
) {
	const known = await importedKeys(db, groupId);
	const entries = input.entries.filter((entry) => !known.has(entry.key));
	const now = Date.now();
	const rows = entries.map((entry) => ({
		id: crypto.randomUUID(),
		type: entry.type,
		splitMode: 'equal',
		title: entry.title,
		amount: SEALED_AMOUNT,
		paidBy: actorId,
		date: entry.date,
		category: null,
		sealedDetails: entry.sealedDetails,
		key: entry.key
	}));
	const newMembers = input.newMembers.map((member) => ({ ...member, groupId }));
	const pieces = Array.from({ length: Math.ceil(rows.length / ROWS_PER_STATEMENT) }, (_, i) =>
		rows.slice(i * ROWS_PER_STATEMENT, (i + 1) * ROWS_PER_STATEMENT)
	);
	const record = log(db, groupId, actorId, 'group.import', {
		source: 'splitwise',
		imported: entries.length
	});
	const d1 = db.$client;
	const prepare = ({ sql, params }: { sql: string; params: unknown[] }) =>
		d1.prepare(sql).bind(...params);
	await d1.batch([
		prepare(record.toSQL()),
		...(newMembers.length ? [prepare(db.insert(members).values(newMembers).toSQL())] : []),
		...pieces.map((piece) =>
			d1.prepare(INSERT_EXPENSES).bind(groupId, now, now, JSON.stringify(piece))
		)
	]);
	return { imported: entries.length, skipped: input.entries.length - entries.length };
}
