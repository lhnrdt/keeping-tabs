<script lang="ts">
	// Search the expense list by title or note (#68). A plain GET form, so it works without
	// JavaScript; with it, the list follows the typing (in the address, replacing the entry).
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Icon from '#lib/components/Icon.svelte';
	import { MAX_QUERY } from '#lib/group/search.ts';
	import { m } from '#lib/paraglide/messages.js';

	let { query }: { query: string } = $props();

	let timer: ReturnType<typeof setTimeout> | undefined;

	function follow(value: string) {
		clearTimeout(timer);
		timer = setTimeout(() => {
			const url = new URL(page.url.href);
			url.searchParams.delete('show');
			if (value.trim()) url.searchParams.set('q', value.trim());
			else url.searchParams.delete('q');
			// eslint-disable-next-line svelte/no-navigation-without-resolve -- the current page, other parameters
			goto(url, { replace: true, reset: false });
		}, 250);
	}
</script>

<form
	method="GET"
	role="search"
	class="mx-4 mt-5 mb-2"
	onsubmit={(event) => event.preventDefault()}
>
	<input type="hidden" name="tab" value="expenses" />
	<label
		class="flex items-center gap-2 rounded-full bg-surface px-4 py-2.5 focus-within:ring-2 focus-within:ring-accent dark:bg-surface-night dark:focus-within:ring-accent-night"
	>
		<span class="text-muted" aria-hidden="true"><Icon name="search" size={18} /></span>
		<span class="sr-only">{m.search_label()}</span>
		<input
			type="search"
			name="q"
			value={query}
			maxlength={MAX_QUERY}
			placeholder={m.search_placeholder()}
			autocomplete="off"
			enterkeyhint="search"
			class="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
			oninput={(event) => follow(event.currentTarget.value)}
		/>
	</label>
</form>
