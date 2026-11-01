<script lang="ts">
	import { resolve } from '$app/paths';
	import AppPage from '#lib/components/AppPage.svelte';
	import ExpenseForm from '#lib/components/expense/ExpenseForm.svelte';
	import { expenseFormValues } from '#lib/expense/form-initial.ts';
	import { groupTabUrl } from '#lib/group/tabs.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const saved = $derived(expenseFormValues(data.rule.expense, data.group.currency, data.units));
	const values = $derived(((form && 'values' in form && form.values) || saved) as typeof saved);
</script>

<svelte:head>
	<title>{m.recurring_edit_title()} – {data.group.name}</title>
</svelte:head>

<AppPage
	title={m.recurring_edit_title()}
	back={{
		href: groupTabUrl(resolve('/g/[token]', { token: data.group.shareToken }), 'group'),
		label: data.group.name
	}}
>
	<ExpenseForm
		members={data.members}
		chosen={data.chosen}
		currency={data.group.currency}
		{values}
		error={form && 'error' in form ? form.error : undefined}
		submitLabel={m.save()}
		kind={data.group.kind}
		repeats={data.rule.frequency}
	/>
</AppPage>
