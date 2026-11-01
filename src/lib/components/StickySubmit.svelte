<script lang="ts">
	// A form's main button, always in reach: it stays at the bottom of the screen while the form
	// scrolls. The same on every form.
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div
	class="sticky bottom-0 z-10 bg-canvas/95 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm dark:bg-canvas-night/95"
>
	{@render children()}
</div>
