<script lang="ts">
	import Field from '#lib/components/Field.svelte';
	import { m } from '#lib/paraglide/messages.js';

	let { value, currency }: { value: string; currency: string } = $props();
</script>

<Field
	label={`${m.field_amount()} (${currency})`}
	name="amount"
	inputmode="decimal"
	autocomplete="off"
	required
	{value}
/>
