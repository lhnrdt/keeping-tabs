<script lang="ts">
	// "Undo" right after deleting an expense or payment (#78). A form, so it works without
	// JavaScript; with it, the note goes away by itself after a few seconds.
	import { enhance } from '$app/forms';
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { Submission } from '#lib/forms/submission.svelte.ts';
	import { tabAction, UNDO_PARAM, type GroupTab } from '#lib/group/tabs.ts';
	import { m } from '#lib/paraglide/messages.js';

	type Entry = { id: string; type: 'expense' | 'payment'; title: string };

	let { entry, tab }: { entry: Entry; tab: GroupTab } = $props();

	const SHOWN_FOR_MS = 8000;
	let shown = $state(true);
	const submission = new Submission();

	onMount(() => {
		const timer = setTimeout(() => {
			shown = false;
			// Without the parameter, reloading the page doesn't offer it again
			const url = new URL(page.url.href);
			url.searchParams.delete(UNDO_PARAM);
			// eslint-disable-next-line svelte/no-navigation-without-resolve -- this page, one parameter less
			replaceState(url, page.state);
		}, SHOWN_FOR_MS);
		return () => clearTimeout(timer);
	});
</script>

{#if shown}
	<form
		method="POST"
		action={tabAction('restoreEntry', tab)}
		use:enhance={submission.enhance}
		role="status"
		transition:fly={{ y: -16 }}
		class="fixed inset-x-0 top-[calc(var(--k-safe-area-top,0px)+0.5rem)] z-50 mx-auto flex w-fit max-w-[calc(100%-2rem)] items-center gap-3 rounded-full bg-ink py-1.5 ps-4 pe-1.5 text-sm text-canvas shadow-lg dark:bg-ink-night dark:text-canvas-night"
	>
		<input type="hidden" name="entryId" value={entry.id} />
		<span class="truncate">
			{entry.type === 'payment'
				? m.undo_payment_deleted()
				: m.undo_expense_deleted({ title: entry.title })}
		</span>
		<button
			type="submit"
			disabled={submission.pending}
			class="shrink-0 rounded-full bg-canvas/15 px-3 py-1 font-semibold dark:bg-canvas-night/15"
		>
			{m.undo()}
		</button>
	</form>
{/if}
