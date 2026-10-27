<script lang="ts">
	// What the expense was for, with a note behind a small icon at its end (#123): the note
	// opens right under the title. Its text is kept (and sent) while folded away.
	import Icon from '#lib/components/Icon.svelte';
	import PlainField from '#lib/components/fields/PlainField.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { LIMITS } from '#lib/validation.ts';

	let { title = $bindable(), notes }: { title: string; notes: string } = $props();

	let note = $state((() => notes)());
	let noting = $state((() => notes !== '')());
</script>

<PlainField label={m.field_expense_title()} icon="title">
	{#snippet children(id)}
		<input
			{id}
			name="title"
			required
			maxlength={LIMITS.expenseTitle}
			placeholder={m.placeholder_expense_title()}
			autocomplete="off"
			bind:value={title}
		/>
		<button
			type="button"
			class="grid size-11 flex-none place-items-center {noting || note
				? 'text-accent dark:text-accent-night'
				: 'opacity-60'}"
			aria-expanded={noting}
			aria-label={m.note_add()}
			onclick={() => (noting = !noting)}
		>
			<Icon name="note" size={18} />
		</button>
	{/snippet}
</PlainField>
<div class="-mt-1" hidden={!noting}>
	<PlainField label={m.field_note()}>
		{#snippet children(id)}
			<textarea
				{id}
				name="notes"
				rows="2"
				maxlength={LIMITS.expenseNote}
				placeholder={m.placeholder_note()}
				bind:value={note}></textarea>
		{/snippet}
	</PlainField>
</div>
