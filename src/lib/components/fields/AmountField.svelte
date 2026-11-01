<script lang="ts">
	import PlainField from '#lib/components/fields/PlainField.svelte';
	import { amountInputValue, currencySymbol } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';

	let { value = $bindable(), currency }: { value: string; currency: string } = $props();
</script>

<PlainField label={`${m.field_amount()} (${currencySymbol(currency, getLocale())})`}>
	{#snippet children(id)}
		<input
			{id}
			name="amount"
			inputmode="decimal"
			autocomplete="off"
			required
			placeholder={amountInputValue(0, currency)}
			class="tabular-nums"
			bind:value
		/>
	{/snippet}
</PlainField>
