<script lang="ts">
	// What you can do with a person: rename, let them join again after they lost access, or
	// remove them while they're settled up (M-6).
	import { enhance } from '$app/forms';
	import { Actions, ActionsButton, ActionsGroup, ActionsLabel, List } from 'konsta/svelte';
	import Field from '#lib/components/Field.svelte';
	import FormError from '#lib/components/FormError.svelte';
	import FormDialog from '#lib/components/group/FormDialog.svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import { Submission } from '#lib/forms/submission.svelte.ts';
	import type { GroupMember } from '#lib/group/members.ts';
	import { tabAction } from '#lib/group/tabs.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { LIMITS } from '#lib/validation.ts';

	type Props = {
		/** The person whose menu is open; null when closed */
		person: GroupMember | null;
		balance: number;
		renameError?: ErrorCode;
		onClose: () => void;
	};

	let { person, balance, renameError, onClose }: Props = $props();

	// Keeps the content while the sheet or dialog animates closed
	let shown = $state<GroupMember | null>(null);
	let renaming = $state(false);
	$effect(() => {
		if (person) shown = person;
	});

	const submission = new Submission((result) => {
		if (result.type === 'success') onClose();
	});
	const canRemove = $derived(!!shown && !shown.mine && balance === 0);
</script>

<Actions
	opened={person !== null}
	onBackdropClick={onClose}
	role="dialog"
	aria-modal="true"
	aria-label={shown?.name ?? ''}
>
	{#if shown}
		<form method="POST" use:enhance={submission.enhance}>
			<input type="hidden" name="memberId" value={shown.id} />
			<ActionsGroup>
				<ActionsLabel>{shown.name}</ActionsLabel>
				<ActionsButton
					type="button"
					onclick={() => {
						renaming = true;
						onClose();
					}}
				>
					{m.rename()}
				</ActionsButton>
				{#if shown.claimed && !shown.mine}
					<ActionsButton
						type="submit"
						formaction={tabAction('letJoinAgain', 'group')}
						disabled={submission.pending}
					>
						{m.person_lost_access({ name: shown.name })}
					</ActionsButton>
				{/if}
				{#if !shown.mine}
					<ActionsButton
						type="submit"
						formaction={tabAction('removeMember', 'group')}
						disabled={!canRemove || submission.pending}
						class={canRemove ? 'tone-destructive' : 'opacity-50'}
					>
						{canRemove ? m.person_remove() : m.person_remove_not_settled({ name: shown.name })}
					</ActionsButton>
				{/if}
			</ActionsGroup>
			<ActionsGroup>
				<ActionsButton type="button" bold onclick={onClose}>{m.cancel()}</ActionsButton>
			</ActionsGroup>
		</form>
	{/if}
</Actions>

<FormDialog
	opened={renaming}
	title={m.rename_member({ name: shown?.name ?? '' })}
	action={tabAction('renameMember', 'group')}
	submitLabel={m.save()}
	onClose={() => (renaming = false)}
>
	{#if shown}
		<input type="hidden" name="memberId" value={shown.id} />
		<List nested class="-mx-4 my-0">
			<Field
				label={m.field_member_name()}
				name="name"
				required
				maxlength={LIMITS.memberName}
				value={shown.name}
			/>
		</List>
		<FormError error={renameError} />
	{/if}
</FormDialog>
