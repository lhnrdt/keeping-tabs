<script lang="ts">
	// Action sheet to claim your member (A-4); opens by itself until you have one. Members
	// someone else claimed are shown as taken (A-5).
	import { enhance } from '$app/forms';
	import { Actions, ActionsButton, ActionsGroup, ActionsLabel } from 'konsta/svelte';
	import Avatar from '#lib/components/Avatar.svelte';
	import FormError from '#lib/components/FormError.svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import { Submission } from '#lib/forms/submission.svelte.ts';
	import { useIdentity } from '#lib/group/identity.svelte.ts';
	import type { GroupMember } from '#lib/group/members.ts';
	import { tabAction, type GroupTab } from '#lib/group/tabs.ts';
	import { m } from '#lib/paraglide/messages.js';

	type Props = { members: GroupMember[]; tab: GroupTab; error?: ErrorCode };

	let { members, tab, error }: Props = $props();

	const identity = useIdentity();
	const opened = $derived(identity.switching || !identity.me);
	const submission = new Submission((result) => {
		if (result.type === 'success') identity.switching = false;
	});
</script>

<Actions
	{opened}
	onBackdropClick={() => (identity.switching = false)}
	role="dialog"
	aria-modal="true"
	aria-label={m.who_are_you()}
>
	<form method="POST" action={tabAction('claimMember', tab)} use:enhance={submission.enhance}>
		<ActionsGroup>
			<ActionsLabel>{m.who_are_you()} {m.who_are_you_hint()}</ActionsLabel>
			{#each members as member (member.id)}
				{@const taken = member.claimed && !member.mine}
				<ActionsButton
					type="submit"
					name="memberId"
					value={member.id}
					bold={member.mine}
					disabled={taken || submission.pending}
					class={taken ? 'opacity-40' : ''}
				>
					<span class="flex items-center justify-center gap-3">
						<Avatar id={member.avatarId} name={member.name} size="sm" />
						{taken ? m.member_taken_label({ name: member.name }) : member.name}
					</span>
				</ActionsButton>
			{/each}
		</ActionsGroup>
		<FormError {error} />
	</form>
</Actions>
