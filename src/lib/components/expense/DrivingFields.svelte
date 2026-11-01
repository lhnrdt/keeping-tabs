<script lang="ts">
	// The odometer reading and fuel with an expense, in car groups, in the person's units (#238).
	// Both optional. The units go along, so the server reads the numbers the way they were meant.
	import { page } from '$app/state';
	import PlainField from '#lib/components/fields/PlainField.svelte';
	import { distanceUnit, fuelUnit } from '#lib/expense/driving.ts';
	import { m } from '#lib/paraglide/messages.js';

	let { odometer, litres }: { odometer: string; litres: string } = $props();

	const units = $derived(page.data.units);
</script>

<input type="hidden" name="units" value={units} />
<div class="grid grid-cols-2 gap-2.5">
	<PlainField label={m.field_odometer()}>
		{#snippet children(id)}
			<input
				{id}
				name="odometer"
				inputmode="decimal"
				autocomplete="off"
				placeholder={m.field_optional()}
				value={odometer}
			/>
			<span class="flex-none pe-3 text-sm text-muted" aria-hidden="true">{distanceUnit(units)}</span
			>
		{/snippet}
	</PlainField>
	<PlainField label={units === 'imperial' ? m.field_gallons() : m.field_litres()}>
		{#snippet children(id)}
			<input
				{id}
				name="litres"
				inputmode="decimal"
				autocomplete="off"
				placeholder={m.field_optional()}
				value={litres}
			/>
			<span class="flex-none pe-3 text-sm text-muted" aria-hidden="true">{fuelUnit(units)}</span>
		{/snippet}
	</PlainField>
</div>
