<script lang="ts">
	// Spending by category (#161): largest first, each with its icon, a bar in the theme's
	// accent from one baseline, the amount and its share. Text, not color, carries the values.
	import Icon from '#lib/components/Icon.svelte';
	import { categoryIcons, categoryLabels } from '#lib/expense/category-style.ts';
	import { formatAmount } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { CategoryShare } from '#lib/insights/insights.ts';

	let { rows, currency }: { rows: CategoryShare[]; currency: string } = $props();

	const percent = new Intl.NumberFormat(getLocale(), {
		style: 'percent',
		maximumFractionDigits: 0
	});
	const largest = $derived(Math.max(...rows.map((row) => row.amount)));
	const labelOf = (row: CategoryShare) =>
		row.category === 'rest' ? m.insights_rest() : categoryLabels[row.category]();
</script>

<ul
	class="mx-4 space-y-3 rounded-2xl bg-surface px-4 py-4 dark:bg-surface-night"
	aria-label={m.insights_by_category()}
>
	{#each rows as row (row.category)}
		<li class="grid grid-cols-[1.5rem_1fr_auto] items-center gap-x-3 gap-y-1">
			<span class="text-muted" aria-hidden="true">
				<Icon name={row.category === 'rest' ? 'expense' : categoryIcons[row.category]} size={20} />
			</span>
			<span class="truncate text-sm font-medium">{labelOf(row)}</span>
			<span class="text-sm tabular-nums">
				{formatAmount(row.amount, currency, getLocale())}
				<span class="text-muted"> · {percent.format(row.share)}</span>
			</span>
			<span
				class="col-start-2 col-end-4 h-2 rounded-r bg-accent dark:bg-accent-night"
				style:width="{Math.max(2, (row.amount / largest) * 100)}%"
				aria-hidden="true"
			></span>
		</li>
	{/each}
</ul>
