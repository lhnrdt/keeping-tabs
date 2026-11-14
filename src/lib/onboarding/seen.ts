// What of the onboarding (#331) this device has been through: the welcome, each tour, each tip.
// A convenience kept in this browser: if it's lost, the tour comes again, nothing worse.
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

export const markSeen = (name: string) => {
	const seen = read();
	if (!seen.includes(name)) write([...seen, name]);
};

/** "Not now" at the welcome */
export const declineAll = () => markSeen(NONE);

/** From the start, as if new here */
export function startAgain() {
	write([]);
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
