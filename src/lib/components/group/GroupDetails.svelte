<script lang="ts">
	import { List, ListButton, ListItem } from 'konsta/svelte';
	import Field from '#lib/components/Field.svelte';
	import FormDialog from './FormDialog.svelte';
	import FormError from '#lib/components/FormError.svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import { tabAction } from '#lib/group/tabs.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { LIMITS } from '#lib/validation.ts';

	type Group = { name: string; description: string | null; currency: string };

	let { group, error }: { group: Group; error?: ErrorCode } = $props();

	let editing = $state(false);
</script>

<List strong inset role="region" aria-label={m.group_details()}>
	<ListItem title={m.field_group_name()} after={group.name} />
	{#if group.description}
		<ListItem title={m.field_description()} text={group.description} />
	{/if}
	<ListItem title={m.field_currency()} after={group.currency} />
	<ListButton type="button" onclick={() => (editing = true)}>{m.edit_group()}</ListButton>
</List>

<FormDialog
	opened={editing}
	title={m.edit_group()}
	action={tabAction('updateGroup', 'group')}
	submitLabel={m.save()}
	onClose={() => (editing = false)}
>
	<List nested class="-mx-4 my-0">
		<Field
			label={m.field_group_name()}
			name="name"
			required
			maxlength={LIMITS.groupName}
			value={group.name}
		/>
		<Field
			label={m.field_description()}
			name="description"
			type="textarea"
			maxlength={LIMITS.description}
			value={group.description ?? ''}
		/>
	</List>
	<FormError {error} />
</FormDialog>
