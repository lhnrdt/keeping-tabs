// Everyday moments (#291): something just done (an expense added, a payment made, a group
// created) is answered where it lands, once: the header's scene plays its action and the new row
// glows. Noted in this tab on the way, as the page it lands on is a new one.
const KEY = 'kt-moment';

export type MomentKind = 'added' | 'paid' | 'created';
export type Moment = { kind: MomentKind; /** The new row, where there is one */ id?: string };

/** Just done: for the page that comes next */
export function cueMoment(moment: Moment) {
	try {
		sessionStorage.setItem(KEY, JSON.stringify(moment));
	} catch {
		// No moment then: nothing else is lost
	}
}

/** What was just done, without taking it: for the way there */
export function peekMoment(): Moment | null {
	try {
		const cued = sessionStorage.getItem(KEY);
		return cued ? (JSON.parse(cued) as Moment) : null;
	} catch {
		return null;
	}
}

/** What was just done, if anything, and only once */
export function takeMoment(): Moment | null {
	try {
		const cued = sessionStorage.getItem(KEY);
		sessionStorage.removeItem(KEY);
		return cued ? (JSON.parse(cued) as Moment) : null;
	} catch {
		return null;
	}
}
