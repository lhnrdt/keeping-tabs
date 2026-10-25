<script lang="ts">
	// In a group's balances: what's open between you and each other member (#117), from the
	// group's settle-up payments. Only for members of the group, and only when something is.
	// Someone who owes you can be reminded (#48).
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { BlockTitle, List, ListItem } from 'konsta/svelte';
	import Avatar from '#lib/components/Avatar.svelte';
	import PersonAmount from '#lib/components/PersonAmount.svelte';
	import type { GroupMember } from '#lib/group/members.ts';
	import { formatAmount } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { shareText } from '#lib/share.ts';
	import { betweenYou } from '#lib/people-summary.ts';
	import type { Transfer } from '#lib/settle.ts';

	type Props = {
		members: GroupMember[];
		transfers: Transfer[];
		currency: string;
		/** For reminders (#48): the group's name and link */
		group: { name: string; shareToken: string };
	};

	let { members, transfers, currency, group }: Props = $props();

	let copied = $state<string | null>(null);

	/** A friendly "you owe me" through the share sheet (#48); copied where there's none */
	async function remind(name: string, memberId: string, amount: number) {
		const link = new URL(resolve('/g/[token]', { token: group.shareToken }), page.url.origin).href;
		const text = m.reminder_text({
			name,
			amount: formatAmount(amount, currency, getLocale()),
			group: group.name,
			link
		});
		const result = await shareText(text);
		if (result === 'failed') window.prompt(m.remind(), text);
		if (result !== 'copied') return;
		copied = memberId;
		setTimeout(() => (copied = null), 2000);
	}

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
					{#snippet subtitle()}
						{#if amount > 0}
							<button
								type="button"
								class="text-sm font-medium text-accent dark:text-accent-night"
								onclick={() => remind(member.name, memberId, amount)}
								><span aria-live="polite">{copied === memberId ? m.copied() : m.remind()}</span
								></button
							>
						{/if}
					{/snippet}
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
