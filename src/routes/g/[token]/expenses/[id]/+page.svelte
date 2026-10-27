<script lang="ts">
	import { resolve } from '$app/paths';
	import AppPage from '#lib/components/AppPage.svelte';
	import DeleteEntry from '#lib/components/group/DeleteEntry.svelte';
	import ExpenseForm from '#lib/components/expense/ExpenseForm.svelte';
	import { amountInputValue } from '#lib/money.ts';
	import { splitInputValues } from '#lib/split/inputs.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { SEVERAL_PAYERS } from '#lib/validation.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const values = $derived(
		form?.values ?? {
			title: data.expense.title,
			notes: data.expense.notes ?? '',
			// Typed in another currency (#54): as typed, with its rate
			amount: data.expense.originalCurrency
				? amountInputValue(data.expense.originalAmountCents ?? 0, data.expense.originalCurrency)
				: amountInputValue(data.expense.amountCents, data.group.currency),
			currency: data.expense.originalCurrency ?? '',
			rate: data.expense.exchangeRate ?? '',
			date: data.expense.date,
			// Several payers (#39): each with what they paid
			paidBy: data.expense.payers ? SEVERAL_PAYERS : data.expense.paidBy,
			payers: Object.fromEntries(
				(data.expense.payers ?? []).map((payer) => [
					payer.memberId,
					amountInputValue(payer.amountCents, data.group.currency)
				])
			),
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
