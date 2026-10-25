<script lang="ts">
	import { resolve } from '$app/paths';
	import AppPage from '#lib/components/AppPage.svelte';
	import DeleteEntry from '#lib/components/group/DeleteEntry.svelte';
	import ExpenseForm from '#lib/components/expense/ExpenseForm.svelte';
	import { amountInputValue } from '#lib/money.ts';
	import { splitInputValues } from '#lib/split/inputs.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const values = $derived(
		form?.values ?? {
			title: data.expense.title,
			notes: data.expense.notes ?? '',
			amount: amountInputValue(data.expense.amountCents, data.group.currency),
			date: data.expense.date,
			paidBy: data.expense.paidBy,
			participants: data.expense.splits.map((split) => split.memberId),
			category: data.expense.category ?? '',
			splitMode: data.expense.splitMode,
			inputs: splitInputValues(data.expense, data.group.currency)
		}
	);
</script>

<svelte:head>
	<title>{m.edit_expense()} – {data.group.name}</title>
</svelte:head>

<AppPage
	title={m.edit_expense()}
	back={{ href: resolve('/g/[token]', { token: data.group.shareToken }), label: data.group.name }}
>
	<ExpenseForm
		members={data.members}
		chosen={data.chosen}
		currency={data.group.currency}
		{values}
		error={form?.error}
		submitLabel={m.save()}
	/>
	<DeleteEntry label={m.delete_expense()} question={m.delete_expense_confirm()} />
</AppPage>
