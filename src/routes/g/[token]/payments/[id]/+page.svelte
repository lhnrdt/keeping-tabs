<script lang="ts">
	import { resolve } from '$app/paths';
	import AppPage from '#lib/components/AppPage.svelte';
	import DeleteEntry from '#lib/components/group/DeleteEntry.svelte';
	import PaymentForm from '#lib/components/payment/PaymentForm.svelte';
	import { amountInputValue } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const values = $derived(
		form?.values ?? {
			from: data.payment.paidBy,
			to: data.payment.splits[0]?.memberId ?? '',
			amount: amountInputValue(data.payment.amountCents, data.group.currency),
			date: data.payment.date
		}
	);
</script>

<svelte:head>
	<title>{m.edit_payment()} – {data.group.name}</title>
</svelte:head>

<AppPage
	title={m.edit_payment()}
	back={{ href: resolve('/g/[token]', { token: data.group.shareToken }), label: data.group.name }}
>
	<PaymentForm
		members={data.members}
		currency={data.group.currency}
		{values}
		error={form?.error}
		submitLabel={m.save()}
	/>
	<DeleteEntry label={m.delete_payment()} question={m.delete_payment_confirm()} />
</AppPage>
