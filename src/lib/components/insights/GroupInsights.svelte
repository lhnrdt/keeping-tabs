<script lang="ts">
	// A group's Insights tab (#161, #169): the sections that answer what this kind of group
	// wants to know, in its order (LAYOUTS), each a shared building block.
	import { BlockTitle } from 'konsta/svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import { namesById, type GroupMember, type Member } from '#lib/group/members.ts';
	import type { GroupKind } from '#lib/group/kinds.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { Insights } from '#lib/insights/insights.ts';
	import { LAYOUTS, sectionsFor, type Section } from '#lib/insights/sections.ts';
	import CustomizeInsights from './CustomizeInsights.svelte';
	import BiggestList from './BiggestList.svelte';
	import CategoryBars from './CategoryBars.svelte';
	import FixedCosts from './FixedCosts.svelte';
	import KindBars from './KindBars.svelte';
	import HowOften from './HowOften.svelte';
	import OverTimeChart from './OverTimeChart.svelte';
	import StatTiles from './StatTiles.svelte';
	import WhoPays from './WhoPays.svelte';

	type Props = {
		insights: Insights;
		group: {
			kind: GroupKind;
			currency: string;
			shareToken: string;
			insightSections: string | null;
		};
		/** Current members, for who pays */
		members: GroupMember[];
		/** Current and former members, for who paid an expense */
		everyone: Member[];
	};

	let { insights, group, members, everyone }: Props = $props();

	const layout = $derived(LAYOUTS[group.kind]);
	// The group's own choice, else what suits its type (#174)
	const chosen = $derived(sectionsFor(group.kind, group.insightSections));
	const names = $derived(namesById(everyone));
	const titles: Record<Section, () => string> = {
		overTime: m.insights_over_time,
		categories: m.insights_by_category,
		kinds: m.insights_kinds,
		fixedCosts: m.insights_fixed,
		biggest: m.insights_biggest,
		whoPays: m.insights_who_pays,
		howOften: m.insights_how_often
	};
	// Who-pays sections need at least two people to compare
	const shown = $derived(
		chosen.filter((section) =>
			section === 'whoPays' || section === 'howOften'
				? insights.byMember.length > 1
				: section === 'fixedCosts'
					? insights.fixed.length > 0
					: section === 'kinds'
						? insights.byKind.length > 1
						: true
		)
	);
</script>

{#if insights.count === 0}
	<EmptyState text={m.insights_empty()} />
{:else}
	<div class="pt-4"><StatTiles {insights} currency={group.currency} tiles={layout.tiles} /></div>
	{#each shown as section (section)}
		<BlockTitle class="!mb-2">{titles[section]()}</BlockTitle>
		{#if section === 'overTime'}
			<OverTimeChart
				unit={insights.overTime.unit}
				buckets={insights.overTime.buckets}
				withoutBig={insights.overTime.withoutBig}
				currency={group.currency}
			/>
		{:else if section === 'categories'}
			<CategoryBars rows={insights.byCategory} currency={group.currency} />
		{:else if section === 'kinds'}
			<KindBars rows={insights.byKind} currency={group.currency} />
		{:else if section === 'fixedCosts'}
			<FixedCosts rows={insights.fixed} currency={group.currency} />
		{:else if section === 'biggest'}
			<BiggestList
				rows={insights.biggest}
				currency={group.currency}
				token={group.shareToken}
				{names}
			/>
		{:else if section === 'whoPays'}
			<WhoPays rows={insights.byMember} {members} currency={group.currency} />
		{:else if section === 'howOften'}
			<HowOften rows={insights.byMember} {members} />
		{/if}
	{/each}
	<CustomizeInsights kind={group.kind} shown={chosen} />
	<div class="h-6"></div>
{/if}
