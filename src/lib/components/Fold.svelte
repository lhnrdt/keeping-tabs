<script lang="ts">
	// A card that opens to more (#151): a title, an optional status at its end, and what's
	// inside. A plain <details>, so it works without JavaScript.
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	type Props = {
		title: string;
		/** e.g. "Saved" or "Not set up" */
		status?: string;
		/** Status in the positive tone, e.g. once something is set up */
		done?: boolean;
		open?: boolean;
		children: Snippet;
	};

	let { title, status, done = false, open = false, children }: Props = $props();
</script>

<details
	class="group mx-4 mb-3 overflow-hidden rounded-2xl bg-surface dark:bg-surface-night"
	{open}
>
	<summary
		class="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 font-medium [&::-webkit-details-marker]:hidden"
	>
		<span class="flex-1">{title}</span>
		{#if status}
			<span class="text-sm {done ? 'tone-positive' : 'text-muted'}">{status}</span>
		{/if}
		<span class="text-muted transition-transform group-open:rotate-180" aria-hidden="true">
			<Icon name="expand" size={18} />
		</span>
	</summary>
	<div class="pb-3">{@render children()}</div>
</details>
