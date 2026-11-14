<script lang="ts">
	// Expenses on this device that haven't reached the server yet (#55, #347): on top of the list,
	// marked as not synced, with what happens next (synced once online, or syncing now); one the
	// server refused says why and can be removed.
	import { List, ListItem, Preloader } from 'konsta/svelte';
	import { onMount } from 'svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { errorMessage } from '#lib/errors.ts';
	import { formatAmount, parseAmount } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { drop, onOutboxChange, pendingFor, type Pending } from '#lib/offline/outbox.ts';
	import { transitionName } from '#lib/motion/in-place-transition.ts';

	let { token, currency }: { token: string; currency: string } = $props();

	let items = $state<Pending[]>([]);
	let online = $state(true);
	onMount(() => {
		const refresh = () => (items = pendingFor(token));
		const connection = () => (online = navigator.onLine);
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

	/** As typed, shown like any amount */
	const amountOf = (item: Pending) => {
		const shownIn = item.currency || currency;
		const minor = parseAmount(item.amount, shownIn);
		return minor === null ? item.amount : formatAmount(minor, shownIn, getLocale());
	};
</script>

{#if items.length}
	<List strong inset class="!mt-0 !mb-4" role="region" aria-label={m.pending_title()}>
		{#each items as item (item.id)}
			<ListItem
				title={item.title}
				after={amountOf(item)}
				data-entry={item.id}
				style={transitionName('expense', item.id)}
			>
				{#snippet media()}
					{#if item.failed}
						<span
							class="grid h-10 w-10 place-items-center rounded-full tone-destructive"
							aria-hidden="true">!</span
						>
					{:else if online}
						<span class="grid h-10 w-10 place-items-center"><Preloader class="h-6 w-6" /></span>
					{:else}
						<!-- Not on the server yet -->
						<span
							class="grid h-10 w-10 place-items-center rounded-full bg-surface-muted text-muted dark:bg-surface-muted-night"
							aria-hidden="true"><Icon name="offline" size={20} /></span
						>
					{/if}
				{/snippet}
				{#snippet subtitle()}
					{#if item.failed}
						<span class="text-sm tone-destructive"
							>{m.pending_failed({ reason: errorMessage(item.failed) ?? '' })}</span
						>
						<button
							type="button"
							class="ms-2 text-sm font-medium tone-destructive underline"
							onclick={() => drop(item.id)}>{m.pending_remove()}</button
						>
					{:else}
						<span class="text-sm text-muted" aria-live="polite"
							>{online ? m.pending_syncing() : m.pending_waiting()}</span
						>
					{/if}
				{/snippet}
			</ListItem>
		{/each}
	</List>
{/if}
