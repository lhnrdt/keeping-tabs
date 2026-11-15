// What's waiting in the outbox for a component to show (#55, #347), kept current as it changes,
// and whether the device is online, which says if it's being sent now or waits.
import { onMount } from 'svelte';
import { onOutboxChange, pendingItems, type Pending } from './outbox';

/** Call while a component starts: `select` picks the changes it shows */
export function watchPending(select: (items: Pending[]) => Pending[]) {
	const state = $state({ items: [] as Pending[], online: true });
	onMount(() => {
		const refresh = () => (state.items = select(pendingItems()));
		const connection = () => (state.online = navigator.onLine);
		refresh();
		connection();
		window.addEventListener('online', connection);
		window.addEventListener('offline', connection);
		const stop = onOutboxChange(refresh);
		return () => {
			stop();
			window.removeEventListener('online', connection);
			window.removeEventListener('offline', connection);
		};
	});
	return state;
}
