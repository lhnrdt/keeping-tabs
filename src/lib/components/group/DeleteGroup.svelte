<script lang="ts">
	// Delete the group for everyone; it can be restored for a while (G-3). Asks first.
	import { forgetGroup } from '#lib/device.ts';
	import { DELETED_GROUP_DAYS } from '#lib/group/retention.ts';
	import { tabAction } from '#lib/group/tabs.ts';
	import { m } from '#lib/paraglide/messages.js';
	import ConfirmDelete from './ConfirmDelete.svelte';

	let { groupId, name }: { groupId: string; name: string } = $props();
</script>

<ConfirmDelete
	label={m.delete_group_button()}
	title={m.delete_group_title({ name })}
	action={tabAction('deleteGroup', 'group')}
	onSubmit={() => forgetGroup(groupId)}
>
	<p class="text-sm">{m.delete_group_explain({ days: DELETED_GROUP_DAYS })}</p>
</ConfirmDelete>
