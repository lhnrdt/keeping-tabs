<script lang="ts">
	// An amount also in the person's display currency (#238), today's rate: "≈ $225.40". Only a
	// help for reading: what's owed and paid stays in the group's currency. Without a rate, nothing.
	import { page } from '$app/state';
	import { convert } from '#lib/expense/exchange.ts';
	import { todaysRate } from '#lib/expense/todays-rate.ts';
	import { formatAmount } from '#lib/money.ts';
	import { getLocale } from '#lib/paraglide/runtime.js';

	let {
		amount,
		currency,
		class: className = ''
	}: { amount: number; currency: string; class?: string } = $props();

	const display = $derived(page.data.displayCurrency);
	let rate = $state<string | null>(null);
	$effect(() => {
		rate = null;
		if (!display || display === currency) return;
		const to = display;
		todaysRate(currency, to).then((answer) => {
			if (to === display) rate = answer;
		});
	});
	const shown = $derived(
		rate && display && display !== currency && amount !== 0
			? formatAmount(
					convert({ currency, amountCents: Math.abs(amount), rate }, display),
					display,
					getLocale()
				)
			: null
	);
</script>

{#if shown}
	<span class="whitespace-nowrap opacity-75 {className}" data-testid="approx">≈ {shown}</span>
{/if}
