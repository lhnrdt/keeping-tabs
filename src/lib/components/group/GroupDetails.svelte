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
	import type { Member } from '#lib/group/members.ts';
	import type { DefaultSplit } from '#lib/split/default-split.ts';
	import { formatSplitInput } from '#lib/split/inputs.ts';

	type Group = {
		name: string;
		description: string | null;
		currency: string;
		kind: GroupKind;
		tint: Tint | null;
		simplifyDebts: boolean;
		/** New expenses' split (#41), null = equal */
		defaultSplit: DefaultSplit | null;
	};

	type Props = { group: Group; members: Member[]; error?: ErrorCode };

	let { group, members, error }: Props = $props();

	/** "Anna 60 % · Ben 40 %" or "Anna 2 · Ben 1" */
	const splitText = $derived.by(() => {
		const split = group.defaultSplit;
		if (!split) return m.default_split_equal();
		return members
			.map((member) => {
				const value = formatSplitInput(split.mode, split.inputs[member.id] ?? 0, group.currency);
				return `${member.name} ${split.mode === 'percent' ? `${value} %` : value}`;
			})
			.join(' · ');
	});

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
	<ListItem title={m.field_default_split()} text={splitText}>
		{#snippet after()}
			{#if group.defaultSplit}
				<!-- Back to an equal split for new expenses (red, like every reset) -->
				<form method="POST" action={tabAction('clearDefaultSplit', 'group')}>
					<button type="submit" class="text-sm font-medium tone-destructive"
						>{m.default_split_reset()}</button
					>
				</form>
			{/if}
		{/snippet}
	</ListItem>
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
		<TintPicker value={group.tint ?? ''} />
	</div>
	<FormError {error} />
</FormDialog>
