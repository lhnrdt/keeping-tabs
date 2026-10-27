<script lang="ts">
	// When it was: Today and Yesterday as one tap, any other day in the date field next to
	// them, which is what's sent. Empty until mounted, then today in the visitor's time zone.
	import { onMount } from 'svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { dayInputValue } from '#lib/dates.ts';
	import { m } from '#lib/paraglide/messages.js';

	let { date = $bindable() }: { date: string } = $props();

	let today = $state('');
	let yesterday = $state('');
	onMount(() => {
		today = dayInputValue(0);
		yesterday = dayInputValue(1);
		if (!date) date = today;
	});
	const id = $props.id();
	const other = $derived(Boolean(date) && date !== today && date !== yesterday);
</script>

<div class="flex flex-col gap-1.5">
	<label for={id} class="field-label">{m.field_date()}</label>
	<div class="flex flex-wrap items-center gap-2">
		<span class="opacity-65" aria-hidden="true"><Icon name="date" size={18} /></span>
		<button
			type="button"
			class="choice-pill"
			aria-pressed={date === today}
			onclick={() => (date = today)}>{m.date_today()}</button
		>
		<button
			type="button"
			class="choice-pill"
			aria-pressed={date === yesterday}
			onclick={() => (date = yesterday)}>{m.date_yesterday()}</button
		>
		<span class="choice-pill !px-2 {other ? 'is-chosen' : ''}">
			<input
				{id}
				type="date"
				name="date"
				required
				class="min-h-9 border-0 bg-transparent text-sm [color-scheme:light] outline-none dark:[color-scheme:dark]"
				bind:value={date}
			/>
		</span>
	</div>
</div>
