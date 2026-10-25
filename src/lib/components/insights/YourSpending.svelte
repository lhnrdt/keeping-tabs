<script lang="ts">
	// Your spending across all your groups (#164): your share in total, by month, by category,
	// by group and with whom, from the same building blocks as a group's insights.
	import { resolve } from '$app/paths';
	import { BlockTitle } from 'konsta/svelte';
	import Avatar from '#lib/components/Avatar.svelte';
	import GroupTile from '#lib/components/GroupTile.svelte';
	import { groupTabUrl } from '#lib/group/tabs.ts';
	import { formatAmount } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { Spending } from '#lib/insights/across.ts';
	import CategoryBars from './CategoryBars.svelte';
	import OverTimeChart from './OverTimeChart.svelte';

	let { spending }: { spending: Spending } = $props();

	const money = (amount: number) => formatAmount(amount, spending.currency, getLocale());
	const largestGroup = $derived(Math.max(...spending.byGroup.map((group) => group.amount)));
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

	{#if spending.byCategory.length}
		<BlockTitle class="!mb-2">{m.insights_by_category()}</BlockTitle>
		<CategoryBars rows={spending.byCategory} currency={spending.currency} />
	{/if}

	{#if spending.byGroup.length > 1}
		<BlockTitle class="!mb-2">{m.spending_by_group()}</BlockTitle>
		<ul
			class="mx-4 space-y-3 rounded-2xl bg-surface px-4 py-4 dark:bg-surface-night"
			aria-label={m.spending_by_group()}
		>
			{#each spending.byGroup as group (group.id)}
				<li>
					<!-- eslint-disable svelte/no-navigation-without-resolve -- resolve() plus ?tab= -->
					<a
						href={groupTabUrl(resolve('/g/[token]', { token: group.token }), 'insights')}
						class="flex items-center gap-3"
					>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
						<GroupTile kind={group.kind} tint={group.tint} />
						<span class="block min-w-0 flex-1">
							<span class="flex items-baseline justify-between gap-2 text-sm">
								<span class="truncate font-medium">{group.name}</span>
								<span class="shrink-0 tabular-nums">{money(group.amount)}</span>
							</span>
							<span
								class="mt-1.5 block h-2 rounded-r bg-accent dark:bg-accent-night"
								style:width="{Math.max(2, (group.amount / largestGroup) * 100)}%"
								aria-hidden="true"
							></span>
						</span>
					</a>
				</li>
			{/each}
		</ul>
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
