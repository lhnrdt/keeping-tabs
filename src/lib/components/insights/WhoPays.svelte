<script lang="ts">
	// Who pays (#161): per person a dumbbell on one scale, what they paid (filled dot) and
	// their share (ring), the gap between them labelled: who paid more than their share.
	import Avatar from '#lib/components/Avatar.svelte';
	import type { GroupMember } from '#lib/group/members.ts';
	import { formatAmount } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { MemberSpend } from '#lib/insights/insights.ts';

	type Props = { rows: MemberSpend[]; members: GroupMember[]; currency: string };

	let { rows, members, currency }: Props = $props();

	const byId = $derived(new Map(members.map((member) => [member.id, member])));
	const scale = $derived(Math.max(1, ...rows.flatMap((row) => [row.paid, row.share])));
	const at = (amount: number) => `${(amount / scale) * 100}%`;
	const money = (amount: number) => formatAmount(amount, currency, getLocale());
</script>

<div class="mx-4 rounded-2xl bg-surface px-4 py-3 dark:bg-surface-night">
	<!-- The legend: which dot is which -->
	<p class="mb-3 flex gap-4 text-xs text-muted">
		<span class="flex items-center gap-1.5"
			><span class="h-2.5 w-2.5 rounded-full bg-accent dark:bg-accent-night"
			></span>{m.insights_paid()}</span
		>
		<span class="flex items-center gap-1.5"
			><span class="h-2.5 w-2.5 rounded-full border-2 border-accent dark:border-accent-night"
			></span>{m.insights_share()}</span
		>
	</p>
	<ul class="space-y-4" aria-label={m.insights_who_pays()}>
		{#each rows as row (row.memberId)}
			{@const member = byId.get(row.memberId)}
			{@const gap = row.paid - row.share}
			{#if member}
				<li>
					<div class="mb-1.5 flex items-center gap-2">
						<Avatar id={member.avatarId} name={member.name} avatar={member.avatar} size="sm" />
						<span class="flex-1 truncate text-sm font-medium">{member.name}</span>
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
					<div class="relative h-4" aria-hidden="true">
						<span class="absolute top-1/2 h-px w-full bg-ink/10 dark:bg-ink-night/15"></span>
						<span
							class="absolute top-1/2 h-0.5 -translate-y-1/2 bg-accent/50 dark:bg-accent-night/50"
							style:left={at(Math.min(row.paid, row.share))}
							style:width={at(Math.abs(gap))}
						></span>
						<span
							class="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-surface dark:border-accent-night dark:bg-surface-night"
							style:left={at(row.share)}
						></span>
						<span
							class="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent ring-2 ring-surface dark:bg-accent-night dark:ring-surface-night"
							style:left={at(row.paid)}
						></span>
					</div>
					<p class="sr-only">
						{m.insights_paid()}
						{money(row.paid)}, {m.insights_share()}
						{money(row.share)}
					</p>
				</li>
			{/if}
		{/each}
	</ul>
</div>
