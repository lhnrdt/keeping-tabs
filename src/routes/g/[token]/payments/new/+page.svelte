<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import AppPage from '#lib/components/AppPage.svelte';
	import PaymentForm from '#lib/components/payment/PaymentForm.svelte';
	import { amountInputValue } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	/** A suggested payment links here with ?from=&to=&amount= (amount in minor units). */
	const suggested = $derived({
		from: page.url.searchParams.get('from') ?? '',
		to: page.url.searchParams.get('to') ?? '',
		amount: Number(page.url.searchParams.get('amount')) || 0
	});

	const values = $derived(
		form?.values ?? {
			from: suggested.from,
			to: suggested.to,
			amount: suggested.amount ? amountInputValue(suggested.amount, data.group.currency) : '',
			date: ''
		}
	);
</script>

<svelte:head>
	<title>{m.record_payment()} – {data.group.name}</title>
</svelte:head>

<AppPage
	title={m.record_payment()}
	back={{ href: resolve('/g/[token]', { token: data.group.shareToken }), label: data.group.name }}
>
	<PaymentForm
		members={data.members}
		currency={data.group.currency}
		{values}
		error={form?.error}
		submitLabel={m.record_payment()}
	/>
</AppPage>
