<script lang="ts">
	// A list row with its quick actions behind it (#323): swipe it to the left and they're there,
	// the same as pressing and holding it (#321) offers. The swipe is the browser's own scrolling,
	// snapping open or shut; a tap on the open row shuts it again.
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Icon from './Icon.svelte';
	import EntryActionForm from './EntryActionForm.svelte';
	import type { MenuItem } from './EntryMenu.svelte';

	type Props = HTMLAttributes<HTMLElement> & {
		/** Only those with an icon are behind the row */
		items: MenuItem[];
		/** A row in a list, by default */
		tag?: string;
		children: Snippet;
	};
	let { items, tag = 'li', children, ...rest }: Props = $props();

	const shown = $derived(items.filter((item) => item.icon));
	let track: HTMLElement | undefined = $state();

	const shut = () => track?.scrollTo({ left: 0 });
	// Open, a tap on the row only shuts it, so it doesn't open the entry as well
	const tapRow = (event: MouseEvent) => {
		if (!track || track.scrollLeft < 1) return;
		event.preventDefault();
		event.stopPropagation();
		shut();
	};
	const tone = (item: MenuItem) =>
		item.destructive
			? 'solid-destructive'
			: 'bg-accent text-white dark:bg-accent-night dark:text-canvas-night';
</script>

<svelte:element this={tag} {...rest}>
	{#if shown.length}
		<div bind:this={track} class="swipe-track flex snap-x snap-mandatory overflow-x-auto">
			<div class="w-full flex-none snap-start" onclickcapture={tapRow} role="none">
				{@render children()}
			</div>
			<!-- For fingers: the press-and-hold menu offers the same to keyboards and screen readers -->
			<div class="flex flex-none snap-end" aria-hidden="true">
				{#each shown as item (item.label)}
					{@const look = `flex w-18 flex-col items-center justify-center gap-1 text-xs font-medium ${tone(item)}`}
					{#if item.action}
						<EntryActionForm {item} onDone={shut} class="flex">
							<button type="submit" class="h-full {look}" title={item.label} tabindex={-1}>
								<Icon name={item.icon!} />
							</button>
						</EntryActionForm>
					{:else if item.href}
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- resolved by whoever built the item -->
						<a href={item.href} class={look} title={item.label} tabindex={-1} onclick={shut}>
							<Icon name={item.icon!} />
						</a>
					{:else}
						<button
							type="button"
							class={look}
							title={item.label}
							tabindex={-1}
							onclick={() => {
								shut();
								item.onclick?.();
							}}
						>
							<Icon name={item.icon!} />
						</button>
					{/if}
				{/each}
			</div>
		</div>
	{:else}
		{@render children()}
	{/if}
</svelte:element>

<style>
	/* Swiped, not scrolled: no scroll bar, and the page doesn't go back at the end */
	.swipe-track {
		scrollbar-width: none;
		overscroll-behavior-x: contain;
	}
	.swipe-track::-webkit-scrollbar {
		display: none;
	}
</style>
