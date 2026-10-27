<script lang="ts">
	import Field from '#lib/components/Field.svelte';
	import { amountInputValue, currencySymbol } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';

	let { value = $bindable(), currency }: { value: string; currency: string } = $props();
</script>

<Field
	label={`${m.field_amount()} (${currencySymbol(currency, getLocale())})`}
	name="amount"
	placeholder={amountInputValue(0, currency)}
	inputmode="decimal"
	autocomplete="off"
	required
	bind:value
/>
