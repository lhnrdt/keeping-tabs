<script lang="ts">
	import type { SubmitFunction } from '$app/forms';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import ExpenseForm from '#lib/components/ExpenseForm.svelte';
	import { getMe } from '#lib/device.ts';
	import { amountInputValue } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let meId = $state<string | null>(null);
	onMount(() => {
		meId = getMe(data.group.id);
	});

	const values = $derived(
		form?.values ?? {
			title: data.expense.title,
			amount: amountInputValue(data.expense.amountCents, data.group.currency),
			date: data.expense.date,
			paidBy: data.expense.paidBy,
			participants: data.expense.splits.map((split) => split.memberId)
		}
	);

	const confirmDelete: SubmitFunction = ({ cancel }) => {
		if (!confirm(m.delete_expense_confirm())) cancel();
	};
</script>

<svelte:head>
	<title>{m.edit_expense()} – {data.group.name}</title>
</svelte:head>

<main class="mx-auto max-w-md space-y-6 p-4">
	<header class="space-y-1">
		<a
			class="text-sm text-blue-700 underline"
			href={resolve('/g/[token]', { token: data.group.shareToken })}
		>
			{m.back_to_group({ name: data.group.name })}
		</a>
		<h1 class="text-2xl font-bold">{m.edit_expense()}</h1>
	</header>

	<ExpenseForm
		groupId={data.group.id}
		members={data.members}
		currency={data.group.currency}
		{values}
		error={form?.error}
		submitLabel={m.save()}
	/>

	<form method="POST" action="?/delete" use:enhance={confirmDelete}>
		<input type="hidden" name="actor" value={meId ?? ''} />
		<button class="text-sm text-red-700 underline">{m.delete_expense()}</button>
	</form>
</main>
