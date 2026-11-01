<script lang="ts">
	// Every labelled input in the app, the way the expense form shows them (PlainField): a text
	// field, a date, a text area or (with `dropdown`) a select with its options as children.
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import PlainField from '#lib/components/fields/PlainField.svelte';

	type Props = Omit<HTMLInputAttributes, 'children'> & {
		label: string;
		value?: string | number | null;
		/** Draws the arrow of a select */
		dropdown?: boolean;
		/** A select's options */
		children?: Snippet;
	};

	let {
		label,
		value = $bindable(),
		type = 'text',
		dropdown = false,
		children: options,
		oninput,
		...rest
	}: Props = $props();

	const typed = (event: Event & { currentTarget: HTMLInputElement | HTMLTextAreaElement }) => {
		value = event.currentTarget.value;
		oninput?.(event as Parameters<NonNullable<typeof oninput>>[0]);
	};
	// Attributes are the same for all three; the types of what's accepted differ slightly
	const attributes = $derived(rest as Record<string, unknown>);
</script>

<PlainField {label} arrow={dropdown}>
	{#snippet children(id)}
		{#if type === 'select'}
			<select {id} {...attributes} {value}>{@render options?.()}</select>
		{:else if type === 'textarea'}
			<textarea {id} rows="3" {...attributes} {value} oninput={typed}></textarea>
		{:else}
			<input
				{id}
				{type}
				class={type === 'date' ? '[color-scheme:light] dark:[color-scheme:dark]' : undefined}
				{...attributes}
				{value}
				oninput={typed}
			/>
		{/if}
	{/snippet}
</PlainField>
