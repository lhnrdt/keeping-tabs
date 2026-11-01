<script lang="ts">
	import { onMount } from 'svelte';
	import PlainField from '#lib/components/fields/PlainField.svelte';
	import { todayInputValue } from '#lib/dates.ts';
	import { m } from '#lib/paraglide/messages.js';

	/** Empty value = today in the visitor's time zone (set after mount, not by the server). */
	let { value }: { value: string } = $props();

	let today = $state('');
	onMount(() => (today = todayInputValue()));
</script>

<PlainField label={m.field_date()} icon="date">
	{#snippet children(id)}
		<input
			{id}
			name="date"
			type="date"
			required
			class="[color-scheme:light] dark:[color-scheme:dark]"
			value={value || today}
		/>
	{/snippet}
</PlainField>
