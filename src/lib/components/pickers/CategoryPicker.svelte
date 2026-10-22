<script lang="ts">
	// Choose an expense's category; "Automatic" follows the title (and what the group chose
	// before for it) and shows its current guess.
	import { onMount } from 'svelte';
	import { EXPENSE_CATEGORIES } from '#lib/expense/categories.ts';
	import type { DatasetIndex } from '#lib/expense/dataset/index.ts';
	import { loadDataset } from '#lib/expense/dataset/load.ts';
	import { guessCategory, type Learned } from '#lib/expense/learned.ts';
	import { categoryIcons, categoryLabels } from '#lib/expense/category-style.ts';
	import { m } from '#lib/paraglide/messages.js';
	import TilePicker from './TilePicker.svelte';

	/** value: the chosen category, empty for automatic; title: the expense's current title */
	let { value, title, learned }: { value: string; title: string; learned: Learned } = $props();

	// Brands and place words join the guess once loaded
	let dataset = $state<DatasetIndex>();
	onMount(() => {
		loadDataset().then((loaded) => (dataset = loaded));
	});

	const guess = $derived(guessCategory(title, learned, dataset));
	const options = $derived([
		{
			value: '',
			label: m.category_auto(),
			icon: categoryIcons[guess],
			hint: categoryLabels[guess]()
		},
		...EXPENSE_CATEGORIES.map((category) => ({
			value: category,
			label: categoryLabels[category](),
			icon: categoryIcons[category]
		}))
	]);
</script>

<TilePicker name="category" legend={m.field_category()} {value} {options} />
