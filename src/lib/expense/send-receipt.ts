// Sends one receipt photo to an expense's page (#52).
import { deserialize } from '$app/forms';
import { sealBytes, textContext } from '#lib/crypto/seal.ts';
import { currentGroupKey } from '#lib/crypto/seal-form.ts';
import type { ErrorCode } from '#lib/errors.ts';

/** A photo's seal says which expense it's for */
const photoContext = (page: string) =>
	textContext('photo', /\/expenses\/([^/?]+)/.exec(page || location.pathname)?.[1]);

/** The refusal's reason, or null when it's in. `page`: the expense's page; here if left out */
export async function sendReceipt(photo: Blob, page = ''): Promise<ErrorCode | null> {
	const body = new FormData();
	// Sealed in an encrypted group (#110)
	const key = await currentGroupKey();
	if (key === undefined) return 'receipt_invalid';
	const bytes = new Uint8Array(await photo.arrayBuffer());
	body.set(
		'photo',
		new Blob([(key ? await sealBytes(key, bytes, photoContext(page)) : bytes) as BlobPart]),
		'receipt.jpg'
	);
	const response = await fetch(`${page}?/addReceipt`, {
		method: 'POST',
		headers: { 'x-sveltekit-action': 'true' },
		body
	});
	const result = deserialize(await response.text());
	if (result.type === 'failure') return result.data?.receiptError as ErrorCode;
	return result.type === 'error' ? 'receipt_invalid' : null;
}
