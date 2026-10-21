<script lang="ts">
	import { resolve } from '$app/paths';
	import ExpenseForm from '#lib/components/ExpenseForm.svelte';
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
			participants: data.members.map((member) => member.id)
		}
	);
</script>

<svelte:head>
	<title>{m.add_expense()} – {data.group.name}</title>
</svelte:head>

<main class="mx-auto max-w-md space-y-6 p-4">
	<header class="space-y-1">
		<a
			class="text-sm text-blue-700 underline"
			href={resolve('/g/[token]', { token: data.group.shareToken })}
		>
			{m.back_to_group({ name: data.group.name })}
		</a>
		<h1 class="text-2xl font-bold">{m.add_expense()}</h1>
	</header>

	<ExpenseForm
		groupId={data.group.id}
		members={data.members}
		currency={data.group.currency}
		{values}
		error={form?.error}
		submitLabel={m.add_expense()}
	/>
</main>
