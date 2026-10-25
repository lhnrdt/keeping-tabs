<script lang="ts">
	// Who paid how often (#161, #188), and whose round it is next: whoever is most behind
	// their share. One bar per person (LayerChart), most often first, the counts written out.
	import { BarChart } from 'layerchart';
	import type { GroupMember } from '#lib/group/members.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { MemberSpend } from '#lib/insights/insights.ts';

	let { rows, members }: { rows: MemberSpend[]; members: GroupMember[] } = $props();

	const names = $derived(new Map(members.map((member) => [member.id, member.name])));
	const total = $derived(rows.reduce((sum, row) => sum + row.times, 0));
	const data = $derived(
		rows
			.filter((row) => names.has(row.memberId))
			.toSorted((a, b) => b.times - a.times)
			.map((row) => ({
				...row,
				name: names.get(row.memberId)!,
				text: m.insights_times({ count: row.times, total })
			}))
	);
	const next = $derived(rows.toSorted((a, b) => b.share - b.paid - (a.share - a.paid))[0]);
	const nextName = $derived(next && next.share > next.paid ? names.get(next.memberId) : null);
</script>

<div class="mx-4 rounded-2xl bg-surface px-4 py-3 dark:bg-surface-night">
	<div style:height="{data.length * 40}px" role="img" aria-label={m.insights_how_often()}>
		<BarChart
			{data}
			x="times"
			y="name"
			orientation="horizontal"
			bandPadding={0.45}
			axis="y"
			grid={false}
			rule={false}
			tooltipContext={false}
			labels={{ value: 'text', class: 'fill-ink-muted text-xs dark:fill-ink-muted-night' }}
			props={{
				bars: { strokeWidth: 0 },
				yAxis: {
					tickMarks: false,
					tickLabelProps: { class: 'fill-ink text-sm font-medium dark:fill-ink-night' }
				}
			}}
			padding={{ left: 64, right: 64 }}
		/>
	</div>
	<table class="sr-only">
		<caption>{m.insights_how_often()}</caption>
		<tbody>
			{#each data as row (row.memberId)}
				<tr><th scope="row">{row.name}</th><td>{row.text}</td></tr>
			{/each}
		</tbody>
	</table>
	{#if nextName}
		<p class="mt-2 text-sm">{m.insights_next_round({ name: nextName })}</p>
	{/if}
</div>
