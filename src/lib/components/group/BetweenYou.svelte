<script lang="ts">
	// In a group's balances: what's open between you and each other member (#117), from the
	// group's settle-up payments. Only for members of the group, and only when something is.
	import { BlockTitle, List, ListItem } from 'konsta/svelte';
	import Avatar from '#lib/components/Avatar.svelte';
	import PersonAmount from '#lib/components/PersonAmount.svelte';
	import type { GroupMember } from '#lib/group/members.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { betweenYou } from '#lib/people-summary.ts';
	import type { Transfer } from '#lib/settle.ts';

	type Props = { members: GroupMember[]; transfers: Transfer[]; currency: string };

	let { members, transfers, currency }: Props = $props();

	const you = $derived(members.find((member) => member.mine));
	const open = $derived(you ? betweenYou(transfers, you.id) : []);
	const byId = $derived(new Map(members.map((member) => [member.id, member])));
</script>

{#if open.length}
	<BlockTitle>{m.between_you_title()}</BlockTitle>
	<List strong inset role="region" aria-label={m.between_you_title()}>
		{#each open as { memberId, amount } (memberId)}
			{@const member = byId.get(memberId)}
			{#if member}
				<ListItem title={member.name}>
					{#snippet media()}
						<Avatar id={member.avatarId} name={member.name} avatar={member.avatar} />
					{/snippet}
					{#snippet after()}
						<PersonAmount {amount} {currency} stacked />
					{/snippet}
				</ListItem>
			{/if}
		{/each}
	</List>
{/if}
