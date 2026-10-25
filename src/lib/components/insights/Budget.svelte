<script lang="ts">
	// Budget and pace for trips and events (#168): spent against the budget, where this pace
	// leads by the end, what's left per day. Without a budget, an invitation to set one.
	import { Button, List } from 'konsta/svelte';
	import Field from '#lib/components/Field.svelte';
	import FormError from '#lib/components/FormError.svelte';
	import FormDialog from '#lib/components/group/FormDialog.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import { tabAction } from '#lib/group/tabs.ts';
	import { amountInputValue, formatAmount } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { BudgetView } from '#lib/insights/budget.ts';
	import BudgetChart from './BudgetChart.svelte';

	type Props = {
		view: BudgetView | null;
		currency: string;
		error: ErrorCode | undefined;
	};

	let { view, currency, error }: Props = $props();

	let editing = $state(false);
	const money = (amount: number) => formatAmount(amount, currency, getLocale());
	const action = tabAction('budget', 'insights');
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
	<Button rounded tonal small type="button" class="mt-3 gap-1.5" onclick={() => (editing = true)}>
		<Icon name={view ? 'edit' : 'add'} size={16} />
		{view ? m.budget_edit() : m.budget_set()}
	</Button>
</div>

<FormDialog
	opened={editing}
	title={view ? m.budget_edit() : m.budget_set()}
	{action}
	submitLabel={m.save()}
	secondary={view ? { label: m.budget_remove(), action: `${action}&remove` } : undefined}
	onClose={() => (editing = false)}
>
	<p class="mb-2 text-sm text-muted">{m.budget_hint()}</p>
	<!-- Fresh on each opening: from what's saved, not what was typed and left -->
	{#key editing}
		<List strong inset class="!mx-0">
			<Field
				label={`${m.field_budget()} (${currency})`}
				name="amount"
				inputmode="decimal"
				autocomplete="off"
				value={view?.budget != null ? amountInputValue(view.budget, currency) : ''}
			/>
			<Field label={m.field_ends_on()} name="endsOn" type="date" value={view?.endsOn ?? ''} />
		</List>
	{/key}
	<FormError {error} />
</FormDialog>
