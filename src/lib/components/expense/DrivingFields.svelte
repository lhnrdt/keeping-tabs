<script lang="ts">
	// The odometer reading and litres of fuel with an expense, in car groups. Both optional.
	import PlainField from '#lib/components/fields/PlainField.svelte';
	import { m } from '#lib/paraglide/messages.js';

	let { odometer, litres }: { odometer: string; litres: string } = $props();
</script>

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
			<span class="flex-none pe-3 text-sm text-muted" aria-hidden="true">km</span>
		{/snippet}
	</PlainField>
	<PlainField label={m.field_litres()}>
		{#snippet children(id)}
			<input
				{id}
				name="litres"
				inputmode="decimal"
				autocomplete="off"
				placeholder={m.field_optional()}
				value={litres}
			/>
			<span class="flex-none pe-3 text-sm text-muted" aria-hidden="true">l</span>
		{/snippet}
	</PlainField>
</div>
