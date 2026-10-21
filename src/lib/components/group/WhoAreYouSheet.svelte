<script lang="ts">
	// Action sheet to pick your member; opens by itself until you've picked one (A-4).
	import { Actions, ActionsButton, ActionsGroup, ActionsLabel } from 'konsta/svelte';
	import { useIdentity } from '#lib/group/identity.svelte.ts';
	import type { Member } from '#lib/group/members.ts';
	import { m } from '#lib/paraglide/messages.js';

	let { members }: { members: Member[] } = $props();

	const identity = useIdentity();
	const known = $derived(members.some((member) => member.id === identity.memberId));
	const opened = $derived(identity.ready && (identity.switching || !known));
</script>

<Actions {opened} onBackdropClick={() => (identity.switching = false)} aria-label={m.who_are_you()}>
	<ActionsGroup>
		<ActionsLabel>{m.who_are_you()} {m.who_are_you_hint()}</ActionsLabel>
		{#each members as member (member.id)}
			<ActionsButton
				bold={member.id === identity.memberId}
				onclick={() => identity.choose(member.id)}
			>
				{member.name}
			</ActionsButton>
		{/each}
	</ActionsGroup>
</Actions>
