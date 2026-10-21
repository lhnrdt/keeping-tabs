<script lang="ts">
	import { onMount } from 'svelte';
	import Field from '#lib/components/Field.svelte';
	import { todayInputValue } from '#lib/dates.ts';
	import { m } from '#lib/paraglide/messages.js';

	/** Empty value = today in the visitor's time zone (set after mount, not by the server). */
	let { value }: { value: string } = $props();

	let today = $state('');
	onMount(() => (today = todayInputValue()));
</script>

<Field label={m.field_date()} name="date" type="date" required value={value || today} />
