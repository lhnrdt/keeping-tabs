<script lang="ts">
	// A quiet "Saved" after a setting was stored, for settings without a Save button. It sits on
	// the setting's label line, so showing it moves nothing.
	import { calmPop } from '#lib/motion/calm.ts';
	import Icon from './Icon.svelte';
	import { m } from '#lib/paraglide/messages.js';

	let { shown }: { shown: boolean } = $props();
</script>

<span class="text-sm" aria-live="polite">
	{#if shown}
		<span class="inline-flex items-center gap-1 text-muted" transition:calmPop>
			<Icon name="check" size={16} />
			{m.saved()}
		</span>
	{/if}
</span>
