<script lang="ts">
	import { Block, Button } from 'konsta/svelte';
	import Icon from '#lib/components/Icon.svelte';
	import FormDialog from '#lib/components/group/FormDialog.svelte';
	import { m } from '#lib/paraglide/messages.js';

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
		{m.delete_expense()}
	</Button>
</Block>

<FormDialog
	opened={confirming}
	title={m.delete_expense()}
	action="?/delete"
	submitLabel={m.delete_expense()}
	destructive
	onClose={() => (confirming = false)}
>
	<p>{m.delete_expense_confirm()}</p>
</FormDialog>
