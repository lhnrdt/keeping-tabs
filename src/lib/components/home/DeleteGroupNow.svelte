<script lang="ts">
	// Removes a recently deleted group for good, without waiting (#118). Red, and asks first.
	import FormDialog from '#lib/components/group/FormDialog.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { m } from '#lib/paraglide/messages.js';

	let { groupId, name }: { groupId: string; name: string } = $props();

	let confirming = $state(false);
</script>

<button
	type="button"
	class="grid h-9 w-9 place-items-center rounded-full tone-destructive focus-visible:ring-2"
	aria-label={m.delete_now_label({ name })}
	onclick={() => (confirming = true)}
>
	<Icon name="delete" size={20} />
</button>

<FormDialog
	opened={confirming}
	title={m.delete_now_title({ name })}
	action="?/deleteGroupNow"
	submitLabel={m.delete_now_confirm()}
	destructive
	onClose={() => (confirming = false)}
>
	<input type="hidden" name="groupId" value={groupId} />
	<p class="text-sm">{m.delete_now_text()}</p>
</FormDialog>
