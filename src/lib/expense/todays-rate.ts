// Today's rate between two currencies (#238), asked once per pair while the app is open.
const rates = new Map<string, Promise<string | null>>();

export function todaysRate(from: string, to: string) {
	const key = `${from}|${to}`;
	let rate = rates.get(key);
	if (!rate) {
		rate = fetch(`/fx?${new URLSearchParams({ from, to })}`)
			.then((response) => response.json() as Promise<{ rate: string | null }>)
			.then((answer) => answer.rate)
			.catch(() => null);
		rates.set(key, rate);
	}
	return rate;
}
