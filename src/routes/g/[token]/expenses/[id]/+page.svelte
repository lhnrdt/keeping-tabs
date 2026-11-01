<script lang="ts">
	import { resolve } from '$app/paths';
	import AppPage from '#lib/components/AppPage.svelte';
	import DeleteEntry from '#lib/components/group/DeleteEntry.svelte';
	import ExpenseComments from '#lib/components/expense/ExpenseComments.svelte';
	import ExpenseReceipts from '#lib/components/expense/ExpenseReceipts.svelte';
	import ExpenseForm from '#lib/components/expense/ExpenseForm.svelte';
	import { expenseFormValues } from '#lib/expense/form-initial.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const values = $derived(
		(form && 'values' in form ? form.values : undefined) ??
			expenseFormValues(data.expense, data.group.currency, data.units)
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
		expenseId={data.expense.id}
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
