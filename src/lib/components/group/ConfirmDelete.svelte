<script lang="ts">
	// A red delete button that asks first (a FormDialog whose form runs `action`). The content
	// of the dialog is what explains the consequences.
	import { Block, Button } from 'konsta/svelte';
	import type { Snippet } from 'svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import FormDialog from './FormDialog.svelte';

	type Props = {
		/** The button's text, also the dialog's title unless `title` is given */
		label: string;
		title?: string;
		/** Form action URL, e.g. "?/delete" or tabAction() */
		action: string;
		confirmLabel?: string;
		/** Runs when the form is submitted, before the server answers */
		onSubmit?: () => void;
		children: Snippet;
	};

	let { label, title, action, confirmLabel, onSubmit, children }: Props = $props();

	let confirming = $state(false);
</script>

<Block>
	<Button
		large
		rounded
		clear
		type="button"
		class="gap-2 tone-destructive"
		onclick={() => (confirming = true)}
	>
		<Icon name="delete" />
		{label}
	</Button>
</Block>

<FormDialog
	opened={confirming}
	title={title ?? label}
	{action}
	submitLabel={confirmLabel ?? m.delete_confirm()}
	destructive
	{onSubmit}
	onClose={() => (confirming = false)}
>
	{@render children()}
</FormDialog>
