// Asks the server to tell the group about something just done (#267): a form marks what it's
// about with `data-announce`, and `sealing` asks for it once the form is through. A failure here
// doesn't matter: what was done is saved.
import { resolve } from '$app/paths';
import { page } from '$app/state';

/** For this page's group, or the one with `token` (a change sent later from the outbox) */
export function announceEvent(
	event: string,
	token: string | undefined = page.data.group?.shareToken
) {
	if (!token) return;
	const body = new FormData();
	body.set('event', event);
	void fetch(resolve('/g/[token]/notify', { token }), {
		method: 'POST',
		body,
		// Goes through even when the page moves on right away
		keepalive: true
	}).catch(() => {});
}
