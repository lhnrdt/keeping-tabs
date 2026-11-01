<script lang="ts">
	import { resolve } from '$app/paths';
	import AppPage from '#lib/components/AppPage.svelte';
	import Field from '#lib/components/Field.svelte';
	import GroupForm from '#lib/components/group/GroupForm.svelte';
	import { groupTabUrl } from '#lib/group/tabs.ts';
	import { amountInputValue, currencySymbol } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const hasPlan = $derived(data.group.budgetCents !== null || data.group.endsOn !== null);
	const title = $derived(hasPlan ? m.budget_edit() : m.budget_set());
</script>

<svelte:head>
	<title>{title} – {data.group.name}</title>
</svelte:head>

<AppPage
	{title}
	back={{
		href: groupTabUrl(resolve('/g/[token]', { token: data.group.shareToken }), 'insights'),
		label: data.group.name
	}}
>
	<GroupForm error={form?.error} submitLabel={m.save()}>
		<div class="page-sections">
			<div class="page-section">
				<p class="text-sm text-muted">{m.budget_hint()}</p>
				<Field
					label={`${m.field_budget()} (${currencySymbol(data.group.currency, getLocale())})`}
					name="amount"
					placeholder={amountInputValue(0, data.group.currency)}
					inputmode="decimal"
					autocomplete="off"
					value={data.group.budgetCents !== null
						? amountInputValue(data.group.budgetCents, data.group.currency)
						: ''}
				/>
				<Field
					label={m.field_ends_on()}
					name="endsOn"
					type="date"
					value={data.group.endsOn ?? ''}
				/>
			</div>
		</div>
	</GroupForm>
	{#if hasPlan}
		<form method="POST" action="?/remove" class="px-4">
			<button type="submit" class="min-h-11 text-sm font-medium tone-destructive"
				>{m.budget_remove()}</button
			>
		</form>
	{/if}
</AppPage>
