// What encrypting a group needs (#110): its text to seal, and the sealed batches coming back.
import { error, json } from '@sveltejs/kit';
import { isSealed } from '#lib/crypto/seal.ts';
import { MAX_RECEIPT_BYTES } from '#lib/expense/receipt-image.ts';
import { requireGroup } from '#lib/server/context.ts';
import {
	finishEncrypting,
	storeSealed,
	storeSealedReceipt,
	textOf,
	type SealedBatch
} from '#lib/server/encrypt-group.ts';
import { memberOf } from '#lib/server/groups.ts';
import { findPerson } from '#lib/server/people.ts';
import type { RequestHandler } from './$types';

const KEY_ID = /^[\w-]{8}$/;

/** Someone in the group, and it isn't encrypted yet */
async function context(locals: App.Locals, token: string) {
	const group = await requireGroup(locals.db, token);
	const person = await findPerson(locals.db, locals.deviceKey);
	const actorId = await memberOf(locals.db, group.id, person?.id);
	if (!actorId) error(403);
	if (group.keyId) error(409);
	return { group, actorId };
}

export const GET: RequestHandler = async ({ locals, params }) => {
	const { group } = await context(locals, params.token);
	return json(await textOf(locals.db, group.id));
};

const allSealed = (batch: SealedBatch) =>
	[
		batch.group?.name,
		...(batch.members ?? []).map((row) => row.name),
		...(batch.expenses ?? []).map((row) => row.title),
		...(batch.comments ?? []).map((row) => row.body)
	].every((text) => text === undefined || isSealed(text) || text === '');

export const POST: RequestHandler = async ({ locals, params, request }) => {
	const { group, actorId } = await context(locals, params.token);
	const body = (await request.json().catch(() => null)) as {
		batch?: SealedBatch;
		receipt?: { id: string; image: string };
		finish?: string;
	} | null;
	if (!body) error(400);
	if (body.batch) {
		if (!allSealed(body.batch)) error(400);
		await storeSealed(locals.db, group.id, body.batch);
	}
	if (body.receipt) {
		// Base64 of a photo at most the usual size, plus what sealing adds
		if (body.receipt.image.length > ((MAX_RECEIPT_BYTES + 64) * 4) / 3 + 4) error(413);
		await storeSealedReceipt(locals.db, group.id, body.receipt.id, body.receipt.image);
	}
	if (body.finish !== undefined) {
		if (!KEY_ID.test(body.finish)) error(400);
		await finishEncrypting(locals.db, group.id, actorId, body.finish);
	}
	return json({ ok: true });
};
