<script lang="ts">
	// Your balance in words and tone: "You get back €20.00", "You owe €5.00", "settled up".
	import { formatAmount } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';

	let { amount, currency }: { amount: number; currency: string } = $props();

	const money = $derived(formatAmount(Math.abs(amount), currency, getLocale()));
</script>

{#if amount > 0}
	<span class="tone-positive tabular-nums">{m.you_get_back({ amount: money })}</span>
{:else if amount < 0}
	<span class="tone-negative tabular-nums">{m.you_owe({ amount: money })}</span>
{:else}
	<span class="text-muted">{m.balance_settled()}</span>
{/if}
