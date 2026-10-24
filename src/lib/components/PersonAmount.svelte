<script lang="ts">
	// What's open with someone, from your side: "owes you €12.00" or "you owe €8.00" (#117).
	import AnimatedAmount from '#lib/components/AnimatedAmount.svelte';
	import { m } from '#lib/paraglide/messages.js';

	/** Positive: they owe you; negative: you owe them */
	let { amount, currency }: { amount: number; currency: string } = $props();
</script>

{#if amount > 0}
	<span class="tone-positive tabular-nums">
		<AnimatedAmount {amount} {currency} label={(text) => m.person_owes_you({ amount: text })} />
	</span>
{:else}
	<span class="tone-negative tabular-nums">
		<AnimatedAmount
			amount={-amount}
			{currency}
			label={(text) => m.person_you_owe({ amount: text })}
		/>
	</span>
{/if}
