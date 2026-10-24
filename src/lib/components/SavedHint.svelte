<script lang="ts">
	// A quiet "Saved" after a setting was stored, for settings without a Save button.
	import { fade } from 'svelte/transition';
	import Icon from './Icon.svelte';
	import { m } from '#lib/paraglide/messages.js';

	let { shown }: { shown: boolean } = $props();
</script>

<p class="mx-4 h-5 text-sm" aria-live="polite">
	{#if shown}
		<span class="inline-flex items-center gap-1 text-muted" transition:fade={{ duration: 150 }}>
			<Icon name="check" size={16} />
			{m.saved()}
		</span>
	{/if}
</p>
