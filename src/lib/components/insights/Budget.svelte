<script lang="ts">
	import { resolve } from '$app/paths';
	// Budget and pace for trips and events (#168): spent against the budget, where this pace
	// leads by the end, what's left per day. Without a budget, an invitation to set one.
	import Icon from '#lib/components/Icon.svelte';
	import { shownAmount } from '#lib/shown-money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { BudgetView } from '#lib/insights/budget.ts';
	import BudgetChart from './BudgetChart.svelte';

	type Props = {
		view: BudgetView | null;
		currency: string;
		token: string;
	};

	let { view, currency, token }: Props = $props();

	const money = (amount: number) => shownAmount(amount, currency);
	const overBy = $derived(view?.budget != null ? view.spent - view.budget : 0);
	const projectedOver = $derived(
		view?.budget != null && view.projected !== null && view.projected > view.budget
	);
</script>

<div class="mx-4 rounded-2xl bg-surface px-4 py-3 dark:bg-surface-night">
	{#if view}
		<p class="text-sm">
			<span class="font-display text-xl font-semibold">{money(view.spent)}</span>
			{#if view.budget !== null}
				<span class="text-muted">{m.budget_of({ amount: money(view.budget) })}</span>
			{/if}
		</p>
		<ul class="mt-1 mb-3 space-y-0.5 text-sm">
			{#if view.projected !== null}
				<li class={projectedOver ? 'tone-negative' : 'text-muted'}>
					{m.budget_at_pace({ amount: money(view.projected) })}
				</li>
			{/if}
			{#if overBy > 0}
				<li class="tone-negative">{m.budget_over({ amount: money(overBy) })}</li>
			{:else if view.leftPerDay !== null}
				<li class="text-muted">{m.budget_left_per_day({ amount: money(view.leftPerDay) })}</li>
			{:else if view.budget !== null}
				<li class="text-muted">{m.budget_left({ amount: money(-overBy) })}</li>
			{/if}
		</ul>
		<BudgetChart {view} {currency} />
	{:else}
		<p class="text-sm text-muted">{m.budget_hint()}</p>
	{/if}
	<a
		href={resolve('/g/[token]/budget', { token })}
		class="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-full bg-surface-muted px-4 text-sm font-medium text-accent active:opacity-70 dark:bg-surface-muted-night dark:text-accent-night"
	>
		<Icon name={view ? 'edit' : 'add'} size={16} />
		{view ? m.budget_edit() : m.budget_set()}
	</a>
</div>
