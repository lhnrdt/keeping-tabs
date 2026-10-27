<script lang="ts">
	// An expense's category as small tiles. Until one is chosen it's picked from the title
	// (and what the group chose before for it): that tile wears an "Auto" badge. Once chosen
	// by hand, "Back to automatic" lets the title decide again.
	import { onMount } from 'svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { EXPENSE_CATEGORIES } from '#lib/expense/categories.ts';
	import type { DatasetIndex } from '#lib/expense/dataset/index.ts';
	import { loadDataset } from '#lib/expense/dataset/load.ts';
	import { guessCategory, type Learned } from '#lib/expense/learned.ts';
	import { categoryIcons, categoryLabels } from '#lib/expense/category-style.ts';
	import { m } from '#lib/paraglide/messages.js';

	/** value: the chosen category, empty for automatic; title: the expense's current title */
	let { value, title, learned }: { value: string; title: string; learned: Learned } = $props();

	let chosen = $state((() => value)());

	// Brands and place words join the guess once loaded
	let dataset = $state<DatasetIndex>();
	onMount(() => {
		loadDataset().then((loaded) => (dataset = loaded));
	});

	const guess = $derived(guessCategory(title, learned, dataset));
	const shown = $derived(chosen || guess);
	// "Other" last: it's the fallback
	const categories = [...EXPENSE_CATEGORIES.filter((each) => each !== 'other'), 'other' as const];
	const headingId = $props.id();
</script>

<fieldset class="flex flex-col gap-2" aria-labelledby={headingId}>
	<div class="flex min-h-8 items-center justify-between gap-2">
		<span id={headingId} class="field-label">{m.field_category()}</span>
		{#if chosen}
			<button
				type="button"
				class="choice-pill is-chosen !min-h-8 !px-3 !text-[0.8125rem]"
				onclick={() => (chosen = '')}
			>
				<Icon name="sparkles" size={14} />
				{m.category_back_to_auto()}
			</button>
		{:else}
			<span class="flex items-center gap-1 text-xs text-accent dark:text-accent-night">
				<Icon name="sparkles" size={14} />
				{m.category_from_title()}
			</span>
		{/if}
	</div>
	<input
		class="sr-only"
		type="radio"
		name="category"
		value=""
		aria-label={m.category_auto()}
		bind:group={chosen}
	/>
	<div class="grid grid-cols-4 gap-1.5">
		{#each categories as category (category)}
			<label
				class="relative flex min-h-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-[1.5px] px-0.5 py-2 text-xs has-focus-visible:ring-2 {shown ===
				category
					? 'border-accent bg-accent-soft/45 text-ink dark:border-accent-night dark:bg-accent-soft-night dark:text-ink-night'
					: 'border-transparent bg-current/[0.07] text-muted'}"
			>
				<input class="sr-only" type="radio" name="category" value={category} bind:group={chosen} />
				{#if !chosen && guess === category}
					<span
						class="absolute end-1 -top-2 rounded-full bg-accent px-1.5 text-[0.625rem] leading-4 font-semibold text-white dark:bg-accent-night dark:text-canvas-night"
						>{m.category_auto_badge()}</span
					>
				{/if}
				<Icon name={categoryIcons[category]} size={20} />
				<span class="line-clamp-1 text-center">{categoryLabels[category]()}</span>
			</label>
		{/each}
	</div>
</fieldset>
