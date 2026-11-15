// Whether a car group's numbers include its purchase (#366): remembered on this device for each
// group, as the person last set it. Without storage, it's included, as at first.
const key = (groupId: string) => `kt-without-purchase:${groupId}`;

export function withPurchaseFor(groupId: string) {
	try {
		return localStorage.getItem(key(groupId)) === null;
	} catch {
		return true;
	}
}

export function rememberWithPurchase(groupId: string, withPurchase: boolean) {
	try {
		if (withPurchase) localStorage.removeItem(key(groupId));
		else localStorage.setItem(key(groupId), '1');
	} catch {
		// Not remembered on this device
	}
}
