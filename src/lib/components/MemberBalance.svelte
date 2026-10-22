<script lang="ts">
	// A member's balance in words and tone: "gets back €20.00", "owes €5.00", "settled up".
	import AnimatedAmount from './AnimatedAmount.svelte';
	import { m } from '#lib/paraglide/messages.js';

	let { balance, currency }: { balance: number; currency: string } = $props();
</script>

{#if balance > 0}
	<span class="tone-positive tabular-nums">
		<AnimatedAmount amount={balance} {currency} label={(amount) => m.balance_owed({ amount })} />
	</span>
{:else if balance < 0}
	<span class="tone-negative tabular-nums">
		<AnimatedAmount amount={-balance} {currency} label={(amount) => m.balance_owes({ amount })} />
	</span>
{:else}
	<span class="opacity-60">{m.balance_settled()}</span>
{/if}
