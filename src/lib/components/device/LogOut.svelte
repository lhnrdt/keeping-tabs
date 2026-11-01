<script lang="ts">
	// Log out on this device (#282), for a shared or borrowed one: your account and your other
	// devices stay as they are. If this is your only way back, it says so first.
	import { resolve } from '$app/paths';
	import ConfirmDelete from '#lib/components/group/ConfirmDelete.svelte';
	import { forgetKeys } from '#lib/crypto/keyring.ts';
	import { clearRecentGroups } from '#lib/device.ts';
	import { forgetEntries } from '#lib/group/sealed-entries.ts';
	import { clearOfflinePages } from '#lib/offline-pages.ts';
	import { m } from '#lib/paraglide/messages.js';

	let { onlyWayIn }: { onlyWayIn: boolean } = $props();

	/** No more notifications here: they're for whoever is logged in */
	async function stopNotifications() {
		const registration = await navigator.serviceWorker?.getRegistration();
		const subscription = await registration?.pushManager.getSubscription();
		await subscription?.unsubscribe();
	}
</script>

<ConfirmDelete
	label={m.log_out_button()}
	title={m.log_out_title()}
	confirmLabel={m.log_out_button()}
	action="?/logOut"
	onSubmit={() => {
		clearRecentGroups();
		clearOfflinePages();
		void Promise.all([forgetKeys(), forgetEntries(), stopNotifications()]).catch(() => {});
	}}
>
	<p class="text-sm">{m.log_out_explain()}</p>
	{#if onlyWayIn}
		<p class="mt-2 text-sm font-medium tone-destructive" role="alert">{m.log_out_only_way()}</p>
		<a
			href={resolve('/you/backup')}
			class="mt-2 block text-sm font-medium text-accent dark:text-accent-night"
			>{m.how_devices_link()}</a
		>
	{/if}
</ConfirmDelete>
