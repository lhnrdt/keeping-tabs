// Asks the server to tell the group about an expense just added (#56, #256). A failure here
// doesn't matter to whoever is adding: the expense is saved. In an encrypted group the amount goes
// along sealed, for the others' devices to open (#110).
import { resolve } from '$app/paths';
import { sealText } from '#lib/crypto/seal.ts';
import { currentGroupKey } from '#lib/crypto/seal-form.ts';

export async function announceExpense(token: string, id: string, amount = '') {
	const body = new FormData();
	const key = await currentGroupKey().catch(() => null);
	if (key && amount) body.set('amount', await sealText(key, amount));
	return fetch(`${resolve('/g/[token]/expenses/[id]/notify', { token, id })}`, {
		method: 'POST',
		body,
		// Goes through even when the page moves on right away
		keepalive: true
	}).catch(() => {});
}
