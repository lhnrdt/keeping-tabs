<script lang="ts">
	// The recurring costs (#167): each with its monthly average, a sparkline of its months on
	// its own scale, and how the latest compares to the one before (arrow, percent and words).
	import { formatAmount } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { FixedCost } from '#lib/insights/expense-kinds.ts';

	let { rows, currency }: { rows: FixedCost[]; currency: string } = $props();

	const money = (amount: number) => formatAmount(amount, currency, getLocale());
	const percent = new Intl.NumberFormat(getLocale(), {
		style: 'percent',
		maximumFractionDigits: 0,
		signDisplay: 'exceptZero'
	});
	const W = 72;
	const H = 24;

	/** The months as a 2px line, from the lowest to the highest month of this cost */
	function line(months: FixedCost['months']) {
		const values = months.map((month) => month.amount);
		const max = Math.max(...values);
		const min = Math.min(...values);
		const range = max - min || 1;
		const step = values.length > 1 ? W / (values.length - 1) : 0;
		return values
			.map(
				(value, i) =>
					`${i ? 'L' : 'M'}${(i * step).toFixed(1)} ${(H - 3 - ((value - min) / range) * (H - 6)).toFixed(1)}`
			)
			.join('');
	}

	function change(cost: FixedCost) {
		if (cost.previous === null || cost.previous === 0) return null;
		const ratio = (cost.latest - cost.previous) / cost.previous;
		if (Math.abs(ratio) < 0.005) return { text: m.kind_unchanged(), ratio: 0 };
		return { text: `${ratio > 0 ? '↑' : '↓'} ${percent.format(ratio)}`, ratio };
	}
</script>

<ul
	class="mx-4 rounded-2xl bg-surface px-4 py-1 dark:bg-surface-night"
	aria-label={m.insights_fixed()}
>
	{#each rows as cost (cost.title)}
		{@const delta = change(cost)}
		<li
			class="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-ink/5 py-3 last:border-0 dark:border-ink-night/10"
		>
			<span class="min-w-0">
				<span class="block truncate font-medium">{cost.title}</span>
				<span class="block text-sm text-muted"
					>{m.kind_per_month({ amount: money(cost.average) })}</span
				>
			</span>
			<svg viewBox="0 0 {W} {H}" class="h-6 w-18 overflow-visible" aria-hidden="true">
				<path
					d={line(cost.months)}
					fill="none"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="stroke-accent dark:stroke-accent-night"
				/>
			</svg>
			<span class="w-20 text-end text-sm">
				<span class="block font-medium tabular-nums">{money(cost.latest)}</span>
				{#if delta}
					<span
						class="block text-xs {delta.ratio > 0
							? 'tone-negative'
							: delta.ratio < 0
								? 'tone-positive'
								: 'text-muted'}">{delta.text}</span
					>
				{/if}
			</span>
		</li>
	{/each}
</ul>
