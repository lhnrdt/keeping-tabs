<script lang="ts">
	// Choose an expense's category; "Automatic" follows the title and shows its current guess.
	import { EXPENSE_CATEGORIES } from '#lib/expense/categories.ts';
	import { categorize } from '#lib/expense/categorize.ts';
	import { categoryIcons, categoryLabels } from '#lib/expense/category-style.ts';
	import { m } from '#lib/paraglide/messages.js';
	import TilePicker from './TilePicker.svelte';

	/** value: the chosen category, empty for automatic; title: the expense's current title */
	let { value, title }: { value: string; title: string } = $props();

	const guess = $derived(categorize(title));
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
