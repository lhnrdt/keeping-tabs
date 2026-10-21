<script lang="ts">
	import { List, ListItem } from 'konsta/svelte';
	import IconBadge from '#lib/components/IconBadge.svelte';
	import Field from '#lib/components/Field.svelte';
	import FormDialog from './FormDialog.svelte';
	import FormError from '#lib/components/FormError.svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import { useIdentity } from '#lib/group/identity.svelte.ts';
	import type { Member } from '#lib/group/members.ts';
	import { transitionName } from '#lib/motion/in-place-transition.ts';
	import { tabAction } from '#lib/group/tabs.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { LIMITS } from '#lib/validation.ts';

	type Props = { members: Member[]; renameError?: ErrorCode };

	let { members, renameError }: Props = $props();

	const identity = useIdentity();
	let renaming = $state<Member | null>(null);
	// Keeps the dialog's content while it animates closed
	let lastRenamed = $state<Member | null>(null);
</script>

<List strong inset role="region" aria-label={m.members_title()}>
	{#each members as member (member.id)}
		<ListItem
			link
			linkComponent="button"
			class="[&>button]:w-full [&>button]:text-start"
			linkProps={{ type: 'button', 'aria-label': m.rename_member({ name: member.name }) }}
			title={member.name}
			after={member.id === identity.memberId ? m.member_you() : ''}
			style={transitionName('member', member.id)}
			onclick={() => (renaming = lastRenamed = member)}
		>
			{#snippet media()}
				<IconBadge name="member" />
			{/snippet}
		</ListItem>
	{/each}
</List>

<FormDialog
	opened={renaming !== null}
	title={m.rename_member({ name: lastRenamed?.name ?? '' })}
	action={tabAction('renameMember', 'group')}
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
		<FormError error={renameError} />
	{/if}
</FormDialog>
