// Asks the server to tell the group about an expense just added (#56, #256). A failure here
// doesn't matter to whoever is adding: the expense is saved.
import { resolve } from '$app/paths';

export function announceExpense(token: string, id: string) {
	return fetch(`${resolve('/g/[token]/expenses/[id]/notify', { token, id })}`, {
		method: 'POST',
		body: new FormData(),
		// Goes through even when the page moves on right away
		keepalive: true
	}).catch(() => {});
}
