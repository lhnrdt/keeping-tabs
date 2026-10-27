<script lang="ts">
	// Expenses on this device that haven't reached the server yet (#55): on top of the list,
	// with a spinner while they wait for the connection; one the server refused says why and
	// can be removed.
	import { List, ListItem, Preloader } from 'konsta/svelte';
	import { onMount } from 'svelte';
	import { errorMessage } from '#lib/errors.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { drop, onOutboxChange, pendingFor, type Pending } from '#lib/offline/outbox.ts';

	let { token, currency }: { token: string; currency: string } = $props();

	let items = $state<Pending[]>([]);
	onMount(() => {
		const refresh = () => (items = pendingFor(token));
		refresh();
		return onOutboxChange(refresh);
	});
</script>

{#if items.length}
	<List strong inset class="!mt-0 !mb-4" role="region" aria-label={m.pending_title()}>
		{#each items as item (item.id)}
			<ListItem title={item.title} after={`${item.amount} ${currency}`}>
				{#snippet media()}
					{#if item.failed}
						<span
							class="grid h-10 w-10 place-items-center rounded-full tone-destructive"
							aria-hidden="true">!</span
						>
					{:else}
						<span class="grid h-10 w-10 place-items-center"><Preloader class="h-6 w-6" /></span>
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
						<span class="text-sm text-muted" aria-live="polite">{m.pending_waiting()}</span>
					{/if}
				{/snippet}
			</ListItem>
		{/each}
	</List>
{/if}
