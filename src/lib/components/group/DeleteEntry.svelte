<script lang="ts">
	// Delete button with confirmation for an expense or payment (action "?/delete").
	import { Block, Button } from 'konsta/svelte';
	import Icon from '#lib/components/Icon.svelte';
	import FormDialog from './FormDialog.svelte';

	let { label, question }: { label: string; question: string } = $props();

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
	title={label}
	action="?/delete"
	submitLabel={label}
	destructive
	onClose={() => (confirming = false)}
>
	<p>{question}</p>
</FormDialog>
