<script lang="ts">
	// Going to another screen that takes a moment: its outline comes up at once, instead of the old
	// screen just staying. A quick one never shows this, so nothing flickers. Nor the way back after
	// something was just saved: the form waits, its button busy, and turns into the new row (#291).
	import { navigating, page } from '$app/state';
	import { peekMoment } from '#lib/motion/moments.ts';
	import ListSkeleton from './ListSkeleton.svelte';

	const AFTER_MS = 180;

	const elsewhere = $derived(
		navigating.to && navigating.to.url.pathname !== page.url.pathname ? navigating.to.url : null
	);
	let slow = $state(false);
	$effect(() => {
		if (!elsewhere || peekMoment()) {
			slow = false;
			return;
		}
		const timer = setTimeout(() => (slow = true), AFTER_MS);
		return () => clearTimeout(timer);
	});
</script>

{#if slow}
	<div class="fixed inset-0 z-50 overflow-hidden bg-canvas pt-16 dark:bg-canvas-night">
		<div class="mx-auto w-full max-w-app">
			<ListSkeleton />
		</div>
	</div>
{/if}
