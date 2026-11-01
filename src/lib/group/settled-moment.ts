// The moment a group is settled up, for you: only the visit where that's new, not every one after.
// Remembers on this device whether something was open, and never how much.
const key = (groupId: string) => `kt-open:${groupId}`;

export function justSettled(groupId: string, balance: number) {
	try {
		const wasOpen = localStorage.getItem(key(groupId)) !== null;
		if (balance === 0) localStorage.removeItem(key(groupId));
		else localStorage.setItem(key(groupId), '1');
		return wasOpen && balance === 0;
	} catch {
		return false;
	}
}
