<script lang="ts">
	// Who paid how often (#161), and whose round it is next: whoever is most behind their
	// share. Bars in one hue; the counts are written out.
	import Avatar from '#lib/components/Avatar.svelte';
	import type { GroupMember } from '#lib/group/members.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { MemberSpend } from '#lib/insights/insights.ts';

	let { rows, members }: { rows: MemberSpend[]; members: GroupMember[] } = $props();

	const byId = $derived(new Map(members.map((member) => [member.id, member])));
	const most = $derived(Math.max(1, ...rows.map((row) => row.times)));
	const total = $derived(rows.reduce((sum, row) => sum + row.times, 0));
	const next = $derived(rows.toSorted((a, b) => b.share - b.paid - (a.share - a.paid))[0]);
	const nextName = $derived(next && next.share > next.paid ? byId.get(next.memberId)?.name : null);
</script>

<div class="mx-4 rounded-2xl bg-surface px-4 py-3 dark:bg-surface-night">
	<ul class="space-y-3" aria-label={m.insights_how_often()}>
		{#each rows.toSorted((a, b) => b.times - a.times) as row (row.memberId)}
			{@const member = byId.get(row.memberId)}
			{#if member}
				<li class="grid grid-cols-[1.75rem_6rem_1fr_auto] items-center gap-2">
					<Avatar id={member.avatarId} name={member.name} avatar={member.avatar} size="sm" />
					<span class="truncate text-sm font-medium">{member.name}</span>
					<span
						class="h-2 rounded-r bg-accent dark:bg-accent-night"
						style:width="{Math.max(2, (row.times / most) * 100)}%"
						aria-hidden="true"
					></span>
					<span class="text-sm text-muted tabular-nums"
						>{m.insights_times({ count: row.times, total })}</span
					>
				</li>
			{/if}
		{/each}
	</ul>
	{#if nextName}
		<p class="mt-3 text-sm">{m.insights_next_round({ name: nextName })}</p>
	{/if}
</div>
