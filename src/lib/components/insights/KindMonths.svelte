<script lang="ts">
	// Month by month (#169): each month's spending stacked by kind of cost (LayerChart), fixed
	// at the bottom, then everyday, occasional and big one-offs; a legend names them and the
	// tooltip gives each part.
	import { BarChart, Tooltip } from 'layerchart';
	import { KINDS } from '#lib/insights/expense-kinds.ts';
	import type { KindMonth } from '#lib/insights/kind-months.ts';
	import { formatAmount, formatCompact } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { kindLabels } from './kind-texts';

	let { months, currency }: { months: KindMonth[]; currency: string } = $props();

	const used = $derived(KINDS.filter((kind) => months.some((month) => month[kind] > 0)));
	const colorOf = (i: number) => `var(--chart-${i + 1})`;
	const money = (amount: number) => formatAmount(amount, currency, getLocale());
	const monthName = (iso: string) =>
		new Intl.DateTimeFormat(getLocale(), {
			month: 'short',
			year: '2-digit',
			timeZone: 'UTC'
		}).format(new Date(`${iso}T00:00:00Z`));
	const ticks = $derived(
		[...new Set([0, Math.floor((months.length - 1) / 2), months.length - 1])].map(
			(i) => months[i].month
		)
	);
</script>

<figure class="mx-4 rounded-2xl bg-surface px-4 pt-3 pb-2 dark:bg-surface-night">
	<ul class="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted" aria-hidden="true">
		{#each used as kind (kind)}
			<li class="flex items-center gap-1.5">
				<span class="h-2.5 w-2.5 rounded-full" style:background-color={colorOf(KINDS.indexOf(kind))}
				></span>{kindLabels[kind]()}
			</li>
		{/each}
	</ul>
	<div class="h-44" role="img" aria-label={m.insights_kind_months()}>
		<BarChart
			data={months}
			x="month"
			series={used.map((kind) => ({
				key: kind,
				label: kindLabels[kind](),
				color: colorOf(KINDS.indexOf(kind))
			}))}
			seriesLayout="stack"
			bandPadding={0.3}
			grid={{ x: false }}
			props={{
				xAxis: { ticks, format: monthName },
				yAxis: { ticks: 3, format: (value: number) => formatCompact(value, currency, getLocale()) },
				bars: { strokeWidth: 0 }
			}}
			padding={{ left: 40, bottom: 20, top: 8 }}
		>
			{#snippet tooltip()}
				<Tooltip.Root>
					{#snippet children({ data })}
						<Tooltip.Header>{monthName(data.month)}</Tooltip.Header>
						<Tooltip.List>
							{#each used.filter((kind) => data[kind] > 0) as kind (kind)}
								<Tooltip.Item
									label={kindLabels[kind]()}
									value={money(data[kind])}
									color={colorOf(KINDS.indexOf(kind))}
								/>
							{/each}
						</Tooltip.List>
					{/snippet}
				</Tooltip.Root>
			{/snippet}
		</BarChart>
	</div>
	<table class="sr-only">
		<caption>{m.insights_kind_months()}</caption>
		<thead>
			<tr>
				<td></td>
				{#each used as kind (kind)}<th scope="col">{kindLabels[kind]()}</th>{/each}
			</tr>
		</thead>
		<tbody>
			{#each months as month (month.month)}
				<tr>
					<th scope="row">{monthName(month.month)}</th>
					{#each used as kind (kind)}<td>{money(month[kind])}</td>{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</figure>
