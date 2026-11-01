// Sends one receipt photo to an expense's page (#52).
import { deserialize } from '$app/forms';
import type { ErrorCode } from '#lib/errors.ts';

/** The refusal's reason, or null when it's in. `page`: the expense's page; here if left out */
export async function sendReceipt(photo: Blob, page = ''): Promise<ErrorCode | null> {
	const body = new FormData();
	body.set('photo', photo, 'receipt.jpg');
	const response = await fetch(`${page}?/addReceipt`, {
		method: 'POST',
		headers: { 'x-sveltekit-action': 'true' },
		body
	});
	const result = deserialize(await response.text());
	if (result.type === 'failure') return result.data?.receiptError as ErrorCode;
	return result.type === 'error' ? 'receipt_invalid' : null;
}
