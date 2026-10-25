<script lang="ts">
	// Who pays (#185, #188): per person how much more or less they paid than their share, as
	// bars from zero (LayerChart): more to the right in the positive tone, less to the left in
	// the negative one, the difference written beside each. Tap for paid and share.
	import { BarChart, Tooltip } from 'layerchart';
	import type { GroupMember } from '#lib/group/members.ts';
	import { formatAmount } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { MemberSpend } from '#lib/insights/insights.ts';

	type Props = { rows: MemberSpend[]; members: GroupMember[]; currency: string };

	let { rows, members, currency }: Props = $props();

	const names = $derived(new Map(members.map((member) => [member.id, member.name])));
	const data = $derived(
		rows
			.filter((row) => names.has(row.memberId))
			.map((row) => {
				const gap = row.paid - row.share;
				return {
					...row,
					name: names.get(row.memberId)!,
					gap,
					tone: gap > 0 ? 'more' : gap < 0 ? 'less' : 'even'
				};
			})
	);
	const reach = $derived(Math.max(1, ...data.map((row) => Math.abs(row.gap))));
	const money = (amount: number) => formatAmount(amount, currency, getLocale());
	const describe = (gap: number) =>
		gap > 0
			? m.insights_paid_more({ amount: money(gap) })
			: gap < 0
				? m.insights_paid_less({ amount: money(-gap) })
				: m.insights_paid_even();
</script>

<div class="mx-4 rounded-2xl bg-surface px-4 py-3 dark:bg-surface-night">
	<div style:height="{data.length * 44 + 8}px" role="img" aria-label={m.insights_who_pays()}>
		<BarChart
			{data}
			x="gap"
			y="name"
			orientation="horizontal"
			xDomain={[-reach, reach]}
			c="tone"
			cDomain={['more', 'less', 'even']}
			cRange={['var(--color-success)', 'var(--color-danger)', 'var(--color-surface-content)']}
			bandPadding={0.45}
			axis="y"
			grid={false}
			props={{
				bars: { strokeWidth: 0 },
				yAxis: {
					tickMarks: false,
					tickLabelProps: { class: 'fill-ink text-sm font-medium dark:fill-ink-night' }
				}
			}}
			padding={{ left: 64, right: 4 }}
		>
			{#snippet tooltip()}
				<Tooltip.Root>
					{#snippet children({ data: row })}
						<Tooltip.Header>{row.name}</Tooltip.Header>
						<Tooltip.List>
							<Tooltip.Item label={m.insights_paid()} value={money(row.paid)} />
							<Tooltip.Item label={m.insights_share()} value={money(row.share)} />
						</Tooltip.List>
					{/snippet}
				</Tooltip.Root>
			{/snippet}
		</BarChart>
	</div>
	<ul class="mt-2 space-y-0.5 text-sm" aria-label={m.insights_who_pays()}>
		{#each data as row (row.memberId)}
			<li class="flex justify-between gap-3">
				<span class="truncate">{row.name}</span>
				<span class={row.gap > 0 ? 'tone-positive' : row.gap < 0 ? 'tone-negative' : 'text-muted'}
					>{describe(row.gap)}</span
				>
			</li>
		{/each}
	</ul>
</div>
