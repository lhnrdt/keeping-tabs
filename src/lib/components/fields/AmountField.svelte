<script lang="ts">
	import Field from '#lib/components/Field.svelte';
	import { m } from '#lib/paraglide/messages.js';

	let { value = $bindable(), currency }: { value: string; currency: string } = $props();
</script>

<Field
	label={`${m.field_amount()} (${currency})`}
	name="amount"
	inputmode="decimal"
	autocomplete="off"
	required
	bind:value
/>
