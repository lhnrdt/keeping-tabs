<script lang="ts">
	import { resolve } from '$app/paths';
	import AppPage from '#lib/components/AppPage.svelte';
	import ExpenseForm from '#lib/components/expense/ExpenseForm.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const values = $derived(
		form?.values ?? {
			title: '',
			amount: '',
			date: '',
			paidBy: '',
			// E-4: everyone takes part by default
			participants: data.members.map((member) => member.id),
			category: ''
		}
	);
</script>

<svelte:head>
	<title>{m.add_expense()} – {data.group.name}</title>
</svelte:head>

<AppPage
	title={m.add_expense()}
	back={{ href: resolve('/g/[token]', { token: data.group.shareToken }), label: data.group.name }}
>
	<ExpenseForm
		members={data.members}
		currency={data.group.currency}
		{values}
		error={form?.error}
		submitLabel={m.add_expense()}
	/>
</AppPage>
