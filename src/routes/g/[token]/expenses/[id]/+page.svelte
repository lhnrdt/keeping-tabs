<script lang="ts">
	import { resolve } from '$app/paths';
	import AppPage from '#lib/components/AppPage.svelte';
	import DeleteEntry from '#lib/components/group/DeleteEntry.svelte';
	import ExpenseComments from '#lib/components/expense/ExpenseComments.svelte';
	import ExpenseReceipts from '#lib/components/expense/ExpenseReceipts.svelte';
	import ExpenseForm from '#lib/components/expense/ExpenseForm.svelte';
	import { fuelInputValue, odometerInputValue } from '#lib/expense/driving.ts';
	import { amountInputValue } from '#lib/money.ts';
	import { ITEMS_MODE } from '#lib/split/items.ts';
	import { splitInputValues } from '#lib/split/inputs.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { SEVERAL_PAYERS } from '#lib/validation.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const values = $derived(
		(form && 'values' in form ? form.values : undefined) ?? {
			title: data.expense.title,
			notes: data.expense.notes ?? '',
			// Typed in another currency (#54): as typed, with its rate
			amount: data.expense.originalCurrency
				? amountInputValue(data.expense.originalAmountCents ?? 0, data.expense.originalCurrency)
				: amountInputValue(data.expense.amountCents, data.group.currency),
			currency: data.expense.originalCurrency ?? '',
			rate: data.expense.exchangeRate ?? '',
			odometer: odometerInputValue(data.expense.odometerM, data.units),
			litres: fuelInputValue(data.expense.fuelMl, data.units),
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
			// Split by receipt items (#53): as typed, in the amount's currency
			splitMode: data.expense.items ? ITEMS_MODE : data.expense.splitMode,
			items: JSON.stringify(
				(data.expense.items ?? []).map(({ name, cents, memberIds }) => ({
					name,
					price: amountInputValue(cents, data.expense.originalCurrency ?? data.group.currency),
					memberIds
				}))
			),
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
		error={form && 'error' in form ? form.error : undefined}
		submitLabel={m.save()}
		kind={data.group.kind}
	/>
	<ExpenseReceipts
		receipts={data.receipts}
		token={data.group.shareToken}
		expenseId={data.expense.id}
		canChange={data.members.some((member) => member.mine)}
	/>
	<ExpenseComments
		comments={data.comments}
		authors={[...data.members, ...data.formerMembers]}
		me={data.members.find((member) => member.mine)?.id ?? null}
		error={form && 'commentError' in form ? form.commentError : undefined}
		draft={form && 'comment' in form ? form.comment : undefined}
	/>
	<DeleteEntry label={m.delete_expense()} question={m.delete_expense_confirm()} />
</AppPage>
