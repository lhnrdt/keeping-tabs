<script lang="ts">
	// Who pays (#185): per person how much more or less they paid than their share, as a bar
	// from a centre line (more to the right, less to the left) on one scale, the amount in
	// words beside it, and what they paid and their share below.
	import Avatar from '#lib/components/Avatar.svelte';
	import type { GroupMember } from '#lib/group/members.ts';
	import { formatAmount } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { MemberSpend } from '#lib/insights/insights.ts';

	type Props = { rows: MemberSpend[]; members: GroupMember[]; currency: string };

	let { rows, members, currency }: Props = $props();

	const byId = $derived(new Map(members.map((member) => [member.id, member])));
	const reach = $derived(Math.max(1, ...rows.map((row) => Math.abs(row.paid - row.share))));
	/** Half the track is the largest difference */
	const width = (gap: number) => `${(Math.abs(gap) / reach) * 50}%`;
	const money = (amount: number) => formatAmount(amount, currency, getLocale());
</script>

<ul
	class="mx-4 space-y-4 rounded-2xl bg-surface px-4 py-4 dark:bg-surface-night"
	aria-label={m.insights_who_pays()}
>
	{#each rows as row (row.memberId)}
		{@const member = byId.get(row.memberId)}
		{@const gap = row.paid - row.share}
		{#if member}
			<li>
				<div class="flex items-center gap-2">
					<Avatar id={member.avatarId} name={member.name} avatar={member.avatar} size="sm" />
					<span class="min-w-0 flex-1 truncate text-sm font-medium">{member.name}</span>
					<span
						class="text-sm {gap > 0 ? 'tone-positive' : gap < 0 ? 'tone-negative' : 'text-muted'}"
					>
						{gap > 0
							? m.insights_paid_more({ amount: money(gap) })
							: gap < 0
								? m.insights_paid_less({ amount: money(-gap) })
								: m.insights_paid_even()}
					</span>
				</div>
				<!-- The centre line is their share: right of it they paid more, left of it less -->
				<div class="relative mt-2 h-2.5" aria-hidden="true">
					<span class="absolute inset-y-0 w-full rounded-full bg-ink/5 dark:bg-ink-night/10"></span>
					<span
						class="absolute -inset-y-1 left-1/2 w-px -translate-x-1/2 bg-ink/30 dark:bg-ink-night/30"
					></span>
					{#if gap !== 0}
						<span
							class="absolute inset-y-0 {gap > 0
								? 'left-1/2 rounded-r-full bg-positive dark:bg-positive-night'
								: 'right-1/2 rounded-l-full bg-negative dark:bg-negative-night'}"
							style:width={width(gap)}
						></span>
					{/if}
				</div>
				<p class="mt-1.5 text-xs text-muted">
					{m.insights_paid()}
					{money(row.paid)} · {m.insights_share()}
					{money(row.share)}
				</p>
			</li>
		{/if}
	{/each}
</ul>
