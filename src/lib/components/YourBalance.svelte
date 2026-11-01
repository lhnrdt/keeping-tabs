<script lang="ts">
	// Your balance in words and tone: "You get back €20.00", "You owe €5.00", "settled up".
	import { shownAmount } from '#lib/shown-money.ts';
	import { m } from '#lib/paraglide/messages.js';

	let { amount, currency }: { amount: number; currency: string } = $props();

	const money = $derived(shownAmount(Math.abs(amount), currency));
</script>

{#if amount > 0}
	<span class="tone-positive tabular-nums">{m.you_get_back({ amount: money })}</span>
{:else if amount < 0}
	<span class="tone-negative tabular-nums">{m.you_owe({ amount: money })}</span>
{:else}
	<span class="text-muted">{m.balance_settled()}</span>
{/if}
