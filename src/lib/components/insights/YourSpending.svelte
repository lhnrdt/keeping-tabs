<script lang="ts">
	// Your spending across all your groups (#164): your share in total, by month, by category,
	// by group and with whom, from the same building blocks as a group's insights.
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { BarChart } from 'layerchart';
	import { BlockTitle } from 'konsta/svelte';
	import Avatar from '#lib/components/Avatar.svelte';
	import { groupTabUrl } from '#lib/group/tabs.ts';
	import { formatAmount } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { Spending } from '#lib/insights/across.ts';
	import CategoryDonut from './CategoryDonut.svelte';
	import OverTimeChart from './OverTimeChart.svelte';

	let { spending }: { spending: Spending } = $props();

	const money = (amount: number) => formatAmount(amount, spending.currency, getLocale());
	/** Names fit the axis; the list for screen readers has them in full */
	const short = (name: string) => (name.length > 16 ? `${name.slice(0, 15)}…` : name);
	const openGroup = (token: string) =>
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- resolve() plus ?tab=
		goto(groupTabUrl(resolve('/g/[token]', { token }), 'insights'));
</script>

<section aria-labelledby="your-spending">
	<BlockTitle id="your-spending" class="!mb-2">{m.spending_title()}</BlockTitle>
	<div class="mx-4 rounded-2xl bg-surface px-4 py-3 dark:bg-surface-night">
		<p class="text-sm text-muted">{m.spending_total()}</p>
		<p class="mt-1 font-display text-2xl font-semibold">{money(spending.total)}</p>
		{#if spending.otherCurrencies.length}
			<p class="mt-1 text-xs text-muted">
				{m.spending_other_currencies({ currencies: spending.otherCurrencies.join(', ') })}
			</p>
		{/if}
	</div>

	{#if spending.months.length > 1}
		<BlockTitle class="!mb-2">{m.spending_by_month()}</BlockTitle>
		<OverTimeChart unit="month" buckets={spending.months} currency={spending.currency} />
	{/if}

	{#if spending.donut.slices.length}
		<BlockTitle class="!mb-2">{m.insights_by_category()}</BlockTitle>
		<CategoryDonut
			series={spending.donut.series}
			slices={spending.donut.slices}
			currency={spending.currency}
		/>
	{/if}

	{#if spending.byGroup.length > 1}
		<BlockTitle class="!mb-2">{m.spending_by_group()}</BlockTitle>
		<!-- Tap a group's bar for its insights -->
		<div class="mx-4 rounded-2xl bg-surface px-4 py-3 dark:bg-surface-night">
			<div
				style:height="{spending.byGroup.length * 40}px"
				role="img"
				aria-label={m.spending_by_group()}
			>
				<BarChart
					data={spending.byGroup.map((group) => ({
						...group,
						label: short(group.name),
						text: money(group.amount)
					}))}
					x="amount"
					y="label"
					orientation="horizontal"
					bandPadding={0.45}
					axis="y"
					grid={false}
					rule={false}
					tooltipContext={false}
					labels={{ value: 'text', class: 'fill-ink text-xs dark:fill-ink-night' }}
					props={{
						bars: { strokeWidth: 0, class: 'cursor-pointer' },
						yAxis: {
							tickMarks: false,
							tickLabelProps: { class: 'fill-ink text-sm font-medium dark:fill-ink-night' }
						}
					}}
					onBarClick={(_, { data }) => openGroup(data.token)}
					padding={{ left: 112, right: 72 }}
				/>
			</div>
			<ul class="sr-only">
				{#each spending.byGroup as group (group.id)}
					<li>
						<!-- eslint-disable svelte/no-navigation-without-resolve -- resolve() plus ?tab= -->
						<a href={groupTabUrl(resolve('/g/[token]', { token: group.token }), 'insights')}
							>{group.name}: {money(group.amount)}</a
						>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	{#if spending.sharedWith.length}
		<BlockTitle class="!mb-2">{m.spending_shared_with()}</BlockTitle>
		<ul
			class="mx-4 space-y-3 rounded-2xl bg-surface px-4 py-4 dark:bg-surface-night"
			aria-label={m.spending_shared_with()}
		>
			{#each spending.sharedWith as person (person.key)}
				<li class="flex items-center gap-3">
					<Avatar id={person.avatarId} name={person.name} avatar={person.avatar} size="sm" />
					<span class="min-w-0 flex-1 truncate text-sm font-medium">{person.name}</span>
					<span class="text-sm tabular-nums">{money(person.amount)}</span>
				</li>
			{/each}
		</ul>
		<p class="mx-4 mt-2 text-xs text-muted">{m.spending_shared_hint()}</p>
	{/if}
</section>
