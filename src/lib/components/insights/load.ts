// The charts are the app's largest code (#188): the components that draw them load on
// demand, once, and can be fetched ahead in idle time so they're there when wanted.

export const loadGroupInsights = () => import('./GroupInsights.svelte');
export const loadYourSpending = () => import('./YourSpending.svelte');

/** Fetches a loader's code when the browser is idle, without showing anything */
export function warmUp(load: () => Promise<unknown>) {
	const idle = window.requestIdleCallback ?? ((run: () => void) => setTimeout(run, 1500));
	idle(() => void load().catch(() => {}));
}
