<script lang="ts">
	// What kind of costs (#167): fixed, everyday, occasional, big one-offs, one bar each in the
	// theme's accent with the amount and share written out.
	import { formatAmount } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { Kind } from '#lib/insights/expense-kinds.ts';
	import type { KindShare } from '#lib/insights/insights.ts';

	let { rows, currency }: { rows: KindShare[]; currency: string } = $props();

	const labels: Record<Kind, () => string> = {
		fixed: m.kind_fixed,
		everyday: m.kind_everyday,
		occasional: m.kind_occasional,
		big: m.kind_big
	};
	const hints: Record<Kind, () => string> = {
		fixed: m.kind_fixed_hint,
		everyday: m.kind_everyday_hint,
		occasional: m.kind_occasional_hint,
		big: m.kind_big_hint
	};
	const percent = new Intl.NumberFormat(getLocale(), {
		style: 'percent',
		maximumFractionDigits: 0
	});
	const largest = $derived(Math.max(...rows.map((row) => row.amount)));
</script>

<ul
	class="mx-4 space-y-3 rounded-2xl bg-surface px-4 py-4 dark:bg-surface-night"
	aria-label={m.insights_kinds()}
>
	{#each rows as row (row.kind)}
		<li class="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1">
			<span class="min-w-0">
				<span class="block text-sm font-medium">{labels[row.kind]()}</span>
				<span class="block truncate text-xs text-muted">{hints[row.kind]()}</span>
			</span>
			<span class="text-sm tabular-nums">
				{formatAmount(row.amount, currency, getLocale())}
				<span class="text-muted"> · {percent.format(row.share)}</span>
			</span>
			<span
				class="col-span-2 h-2 rounded-r bg-accent dark:bg-accent-night"
				style:width="{Math.max(2, (row.amount / largest) * 100)}%"
				aria-hidden="true"
			></span>
		</li>
	{/each}
</ul>
