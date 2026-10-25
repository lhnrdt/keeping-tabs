<script lang="ts">
	import { List, ListItem } from 'konsta/svelte';
	import Avatar from '#lib/components/Avatar.svelte';
	import MemberBalance from '#lib/components/MemberBalance.svelte';
	import type { GroupMember } from '#lib/group/members.ts';
	import { transitionName } from '#lib/motion/in-place-transition.ts';
	import { m } from '#lib/paraglide/messages.js';

	type Props = { currency: string; members: GroupMember[]; balances: Record<string, number> };

	let { currency, members, balances }: Props = $props();
</script>

<List strong inset role="region" aria-label={m.balances_title()}>
	{#each members as member (member.id)}
		{@const balance = balances[member.id] ?? 0}
		<ListItem title={member.name} style={transitionName('balance', member.id)}>
			{#snippet media()}
				<Avatar id={member.avatarId} name={member.name} avatar={member.avatar} />
			{/snippet}
			{#snippet after()}
				<MemberBalance {balance} {currency} />
			{/snippet}
		</ListItem>
	{/each}
</List>
