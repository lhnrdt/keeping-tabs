<script lang="ts">
	// What's open with someone, from your side (#117): "owes you €12.00" / "you owe €8.00" in a
	// line, or stacked: the words small above the amount, right-aligned, as in a list's end.
	import AnimatedAmount from '#lib/components/AnimatedAmount.svelte';
	import { m } from '#lib/paraglide/messages.js';

	type Props = {
		/** Positive: they owe you; negative: you owe them */
		amount: number;
		currency: string;
		stacked?: boolean;
	};

	let { amount, currency, stacked = false }: Props = $props();

	const owesYou = $derived(amount > 0);
	const tone = $derived(owesYou ? 'tone-positive' : 'tone-negative');
</script>

{#if stacked}
	<span class="flex flex-col items-end leading-tight {tone}">
		<span class="text-xs">{owesYou ? m.person_owes_you_label() : m.person_you_owe_label()}</span
		>{' '}
		<span class="tabular-nums"><AnimatedAmount amount={Math.abs(amount)} {currency} /></span>
	</span>
{:else}
	<span class="tabular-nums {tone}">
		<AnimatedAmount
			amount={Math.abs(amount)}
			{currency}
			label={(text) =>
				owesYou ? m.person_owes_you({ amount: text }) : m.person_you_owe({ amount: text })}
		/>
	</span>
{/if}
