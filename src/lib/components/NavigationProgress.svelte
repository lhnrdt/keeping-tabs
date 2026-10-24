<script lang="ts">
	// While the next page loads (#58): a thin bar in the theme's color at the top. Only after a
	// short wait, so quick taps don't flicker; still, not sliding, for reduced motion.
	import { navigating } from '$app/state';
	import { fade } from 'svelte/transition';
	import { m } from '#lib/paraglide/messages.js';

	const DELAY_MS = 200;

	let shown = $state(false);

	$effect(() => {
		if (!navigating.to) {
			shown = false;
			return;
		}
		const timer = setTimeout(() => (shown = true), DELAY_MS);
		return () => clearTimeout(timer);
	});
</script>

{#if shown}
	<div
		class="fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden"
		role="progressbar"
		aria-busy="true"
		aria-label={m.page_loading()}
		transition:fade={{ duration: 150 }}
	>
		<div class="loading-bar h-full w-1/3 rounded-full bg-accent dark:bg-accent-night"></div>
	</div>
{/if}

<style>
	.loading-bar {
		animation: slide 1.1s var(--ease-calm) infinite;
	}
	@keyframes slide {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(300%);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.loading-bar {
			width: 100%;
			animation: none;
			opacity: 0.6;
		}
	}
</style>
