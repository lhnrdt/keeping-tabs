<script lang="ts">
	import { List, ListButton, ListItem } from 'konsta/svelte';
	import Icon from '#lib/components/Icon.svelte';
	import Field from '#lib/components/Field.svelte';
	import KindPicker from '#lib/components/pickers/KindPicker.svelte';
	import TintPicker from '#lib/components/pickers/TintPicker.svelte';
	import FormDialog from './FormDialog.svelte';
	import SimplifyDebtsField from './SimplifyDebtsField.svelte';
	import FormError from '#lib/components/FormError.svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import { kindIcons, kindLabels } from '#lib/group/kind-style.ts';
	import type { GroupKind } from '#lib/group/kinds.ts';
	import { tabAction } from '#lib/group/tabs.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { LIMITS } from '#lib/validation.ts';

	import type { Tint } from '#lib/tints.ts';

	type Group = {
		id: string;
		name: string;
		description: string | null;
		currency: string;
		kind: GroupKind;
		tint: Tint | null;
		simplifyDebts: boolean;
	};

	let { group, error }: { group: Group; error?: ErrorCode } = $props();

	let editing = $state(false);
</script>

<List strong inset role="region" aria-label={m.group_details()}>
	<ListItem title={m.field_group_name()} after={group.name} />
	{#if group.description}
		<ListItem title={m.field_description()} text={group.description} />
	{/if}
	<ListItem title={m.field_group_kind()} after={kindLabels[group.kind]()}>
		{#snippet media()}
			<Icon name={kindIcons[group.kind]} />
		{/snippet}
	</ListItem>
	<ListItem title={m.field_currency()} after={group.currency} />
	<ListItem title={m.field_simplify_debts()} after={group.simplifyDebts ? m.on() : m.off()} />
	<ListButton type="button" onclick={() => (editing = true)}>
		<Icon name="edit" />
		{m.edit_group()}
	</ListButton>
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
		<SimplifyDebtsField checked={group.simplifyDebts} />
	</List>
	<div class="-mx-4">
		<KindPicker value={group.kind} />
		<TintPicker value={group.tint ?? ''} id={group.id} />
	</div>
	<FormError {error} />
</FormDialog>
