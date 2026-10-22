<script lang="ts">
	import { List, ListItem } from 'konsta/svelte';
	import Avatar from '#lib/components/Avatar.svelte';
	import Field from '#lib/components/Field.svelte';
	import FormDialog from './FormDialog.svelte';
	import FormError from '#lib/components/FormError.svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import type { GroupMember } from '#lib/group/members.ts';
	import { transitionName } from '#lib/motion/in-place-transition.ts';
	import { tabAction } from '#lib/group/tabs.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { LIMITS } from '#lib/validation.ts';

	type Props = { members: GroupMember[]; renameError?: ErrorCode };

	let { members, renameError }: Props = $props();

	let renaming = $state<GroupMember | null>(null);
	// Keeps the dialog's content while it animates closed
	let lastRenamed = $state<GroupMember | null>(null);

	const statusOf = (member: GroupMember) =>
		member.mine ? m.member_you() : member.claimed ? m.member_joined() : '';
</script>

<List strong inset role="region" aria-label={m.members_title()}>
	{#each members as member (member.id)}
		<ListItem
			link
			linkComponent="button"
			class="[&>button]:w-full [&>button]:text-start"
			linkProps={{ type: 'button', 'aria-label': m.rename_member({ name: member.name }) }}
			title={member.name}
			after={statusOf(member)}
			style={transitionName('member', member.id)}
			onclick={() => (renaming = lastRenamed = member)}
		>
			{#snippet media()}
				<Avatar id={member.avatarId} name={member.name} />
			{/snippet}
		</ListItem>
	{/each}
</List>

<FormDialog
	opened={renaming !== null}
	title={m.rename_member({ name: lastRenamed?.name ?? '' })}
	action={tabAction('renameMember', 'group')}
	secondary={lastRenamed?.claimed && !lastRenamed.mine
		? { label: m.release_member(), action: tabAction('releaseMember', 'group') }
		: undefined}
	submitLabel={m.save()}
	onClose={() => (renaming = null)}
>
	{#if lastRenamed}
		<input type="hidden" name="memberId" value={lastRenamed.id} />
		<List nested class="-mx-4 my-0">
			<Field
				label={m.field_member_name()}
				name="name"
				required
				maxlength={LIMITS.memberName}
				value={lastRenamed.name}
			/>
		</List>
		{#if lastRenamed.claimed && !lastRenamed.mine}
			<p class="mt-3 text-sm opacity-70">{m.release_member_hint({ name: lastRenamed.name })}</p>
		{/if}
		<FormError error={renameError} />
	{/if}
</FormDialog>
