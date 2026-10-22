<script lang="ts">
	// Tells people when they're offline: saved pages can be viewed, changes need a connection.
	import { online } from 'svelte/reactivity/window';
	import { fly } from 'svelte/transition';
	import { m } from '#lib/paraglide/messages.js';
</script>

{#if online.current === false}
	<p
		role="status"
		transition:fly={{ y: -16 }}
		class="fixed inset-x-0 top-[calc(var(--k-safe-area-top,0px)+0.5rem)] z-50 mx-auto w-fit max-w-[calc(100%-2rem)] rounded-full bg-ink px-4 py-2 text-center text-xs text-canvas shadow-lg dark:bg-ink-night dark:text-canvas-night"
	>
		{m.offline_banner()}
	</p>
{/if}
