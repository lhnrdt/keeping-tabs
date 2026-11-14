// What of the onboarding (#331) has been seen: the welcome, each tour, each tip. Once per person:
// kept with them on the server (so their other devices know), and in this browser for a device
// that isn't anyone's yet, which tells the server once it is. If it's lost, the tour comes again.
const SEEN_KEY = 'kt-onboarding';
/** Asked for again (How it works): on, even where it would otherwise stay quiet */
const AGAIN_KEY = 'kt-onboarding-again';
/** Declined at the welcome: none of it */
const NONE = 'none';

function read(): string[] {
	try {
		return JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]');
	} catch {
		return [];
	}
}

function write(seen: string[]) {
	try {
		localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
	} catch {
		// Not kept: it shows again next time
	}
}

export const hasSeen = (name: string) => {
	const seen = read();
	return seen.includes(NONE) || seen.includes(name);
};

/** Tells the server; a device that isn't anyone's yet keeps it to itself */
function share(body: { seen: string[] } | { again: true }) {
	void fetch('/you/onboarding', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body)
	}).catch(() => {
		// Offline: it's kept here, and sent with the next part seen
	});
}

export const markSeen = (name: string) => {
	const seen = read();
	if (!seen.includes(name)) write([...seen, name]);
	share({ seen: [...new Set([...seen, name])] });
};

/** What the person's other devices have seen too; what only this one has goes to the server */
export function adopt(known: readonly string[]) {
	const seen = read();
	write([...new Set([...seen, ...known])]);
	if (seen.some((part) => !known.includes(part))) share({ seen });
}

/** "Not now" at the welcome */
export const declineAll = () => markSeen(NONE);

/** From the start, as if new here */
export function startAgain() {
	write([]);
	share({ again: true });
	try {
		sessionStorage.setItem(AGAIN_KEY, '1');
	} catch {
		// Fine without
	}
}

/** Not for automated browsers (the tests), unless asked for again */
export function mayShow() {
	try {
		if (sessionStorage.getItem(AGAIN_KEY)) return true;
	} catch {
		// Fine without
	}
	return !navigator.webdriver;
}
