<script lang="ts">
	// What kind of costs (#167, #188): fixed, everyday, occasional, big one-offs, one bar each
	// (LayerChart) with the amount and share written beside it; what each kind means below.
	import { BarChart } from 'layerchart';
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
	const valueText = (row: KindShare) =>
		`${formatAmount(row.amount, currency, getLocale())} · ${percent.format(row.share)}`;
	const data = $derived(
		rows.map((row) => ({ ...row, label: labels[row.kind](), text: valueText(row) }))
	);
</script>

<div class="mx-4 rounded-2xl bg-surface px-4 py-3 dark:bg-surface-night">
	<div style:height="{data.length * 44}px" role="img" aria-label={m.insights_kinds()}>
		<BarChart
			{data}
			x="amount"
			y="label"
			orientation="horizontal"
			bandPadding={0.45}
			axis="y"
			grid={false}
			rule={false}
			tooltipContext={false}
			labels={{
				value: 'text',
				class: 'fill-ink text-xs dark:fill-ink-night'
			}}
			props={{
				bars: { strokeWidth: 0 },
				yAxis: {
					tickMarks: false,
					tickLabelProps: { class: 'fill-ink text-sm font-medium dark:fill-ink-night' }
				}
			}}
			padding={{ left: 92, right: 112 }}
		/>
	</div>
	<dl class="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
		{#each rows as row (row.kind)}
			<dt class="font-medium">{labels[row.kind]()}</dt>
			<dd class="text-muted">{hints[row.kind]()}</dd>
		{/each}
	</dl>
	<table class="sr-only">
		<caption>{m.insights_kinds()}</caption>
		<tbody>
			{#each rows as row (row.kind)}
				<tr><th scope="row">{labels[row.kind]()}</th><td>{valueText(row)}</td></tr>
			{/each}
		</tbody>
	</table>
</div>
