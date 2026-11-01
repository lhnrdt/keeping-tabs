<script lang="ts">
	// A way back up, once you've scrolled far down a long list (#262). Sits opposite the screen's
	// main action, at the same height.
	import { prefersReducedMotion } from 'svelte/motion';
	import { calmPop } from '#lib/motion/calm.ts';
	import { m } from '#lib/paraglide/messages.js';
	import Icon from './Icon.svelte';

	/** How far down it appears, in screen heights */
	const AFTER_SCREENS = 1.5;

	let anchor = $state<HTMLElement>();
	let shown = $state(false);

	const scroller = () => anchor?.closest('.k-page');

	$effect(() => {
		const page = scroller();
		if (!page) return;
		const follow = () => (shown = page.scrollTop > page.clientHeight * AFTER_SCREENS);
		follow();
		page.addEventListener('scroll', follow, { passive: true });
		return () => page.removeEventListener('scroll', follow);
	});

	const toTop = () =>
		scroller()?.scrollTo({ top: 0, behavior: prefersReducedMotion.current ? 'auto' : 'smooth' });
</script>

<span bind:this={anchor} hidden></span>
{#if shown}
	<button
		type="button"
		transition:calmPop
		aria-label={m.back_to_top()}
		onclick={toTop}
		class="fixed bottom-[calc(var(--k-safe-area-bottom,0px)+6rem)] left-[max(1rem,calc(50vw-var(--container-app)/2+1rem))] z-30 grid size-12 place-items-center rounded-full bg-surface text-ink shadow-[0_8px_20px_rgb(37_40_34/0.25)] transition-transform duration-150 active:scale-95 dark:bg-surface-muted-night dark:text-ink-night dark:shadow-[0_8px_20px_rgb(0_0_0/0.45)]"
	>
		<Icon name="toTop" size={22} />
	</button>
{/if}
