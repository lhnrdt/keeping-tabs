<script lang="ts">
	import { List, ListItem } from 'konsta/svelte';
	import IconBadge from '#lib/components/IconBadge.svelte';
	import AnimatedAmount from '#lib/components/AnimatedAmount.svelte';
	import type { Member } from '#lib/group/members.ts';
	import { transitionName } from '#lib/motion/in-place-transition.ts';
	import { m } from '#lib/paraglide/messages.js';

	type Props = { currency: string; members: Member[]; balances: Record<string, number> };

	let { currency, members, balances }: Props = $props();
</script>

<List strong inset role="region" aria-label={m.balances_title()}>
	{#each members as member (member.id)}
		{@const balance = balances[member.id] ?? 0}
		<ListItem title={member.name} style={transitionName('balance', member.id)}>
			{#snippet media()}
				<IconBadge name="member" />
			{/snippet}
			{#snippet after()}
				{#if balance > 0}
					<span class="tone-positive tabular-nums">
						<AnimatedAmount
							amount={balance}
							{currency}
							label={(amount) => m.balance_owed({ amount })}
						/>
					</span>
				{:else if balance < 0}
					<span class="tone-negative tabular-nums">
						<AnimatedAmount
							amount={-balance}
							{currency}
							label={(amount) => m.balance_owes({ amount })}
						/>
					</span>
				{:else}
					<span class="opacity-60">{m.balance_settled()}</span>
				{/if}
			{/snippet}
		</ListItem>
	{/each}
</List>
