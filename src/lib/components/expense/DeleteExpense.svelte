<script lang="ts">
	import { Block, Button } from 'konsta/svelte';
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
		class="tone-destructive"
		onclick={() => (confirming = true)}
	>
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
