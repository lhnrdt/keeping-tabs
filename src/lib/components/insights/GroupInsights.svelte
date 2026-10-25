<script lang="ts">
	// A group's Insights tab (#161, #169): the sections that answer what this kind of group
	// wants to know, in its order (LAYOUTS), each a shared building block.
	import { BlockTitle } from 'konsta/svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import { namesById, type GroupMember, type Member } from '#lib/group/members.ts';
	import type { GroupKind } from '#lib/group/kinds.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { ErrorCode } from '#lib/errors.ts';
	import type { GroupInsights } from '#lib/insights/group.ts';
	import { LAYOUTS, sectionsFor, type Section } from '#lib/insights/sections.ts';
	import CustomizeInsights from './CustomizeInsights.svelte';
	import Budget from './Budget.svelte';
	import BiggestList from './BiggestList.svelte';
	import CategoryDonut from './CategoryDonut.svelte';
	import FixedCosts from './FixedCosts.svelte';
	import KindBars from './KindBars.svelte';
	import KindMonths from './KindMonths.svelte';
	import Highlights from './Highlights.svelte';
	import HowOften from './HowOften.svelte';
	import OverTimeChart from './OverTimeChart.svelte';
	import PeriodPicker from './PeriodPicker.svelte';
	import Places from './Places.svelte';
	import PositionChart from './PositionChart.svelte';
	import Recap from './Recap.svelte';
	import { sectionTitles } from './section-texts';
	import Settling from './Settling.svelte';
	import StatTiles from './StatTiles.svelte';
	import WhoPays from './WhoPays.svelte';

	type Props = {
		insights: GroupInsights;
		/** Today as YYYY-MM-DD, for moving between periods */
		today: string;
		/** The budget form's error, if it was just sent */
		budgetError: ErrorCode | undefined;
		group: {
			name: string;
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

	let { insights, today, budgetError, group, members, everyone }: Props = $props();

	const layout = $derived(LAYOUTS[group.kind]);
	// The group's own choice, else what suits its type (#174)
	const chosen = $derived(sectionsFor(group.kind, group.insightSections));
	const names = $derived(namesById(everyone));
	// Whether a section has something to show; who-pays ones need two people to compare
	const hasData: Record<Section, () => boolean> = {
		recap: () => insights.recap !== null,
		budget: () => true,
		highlights: () => insights.highlights.length > 0,
		overTime: () => insights.overTime.buckets.length > 1,
		categories: () => true,
		kinds: () => insights.byKind.length > 1,
		kindMonths: () => insights.kindMonths.length > 1,
		places: () => insights.places.length > 0,
		fixedCosts: () => insights.fixed.length > 0,
		biggest: () => true,
		whoPays: () => insights.byMember.length > 1,
		howOften: () => insights.byMember.length > 1,
		myPosition: () => (insights.position?.length ?? 0) > 1,
		settling: () =>
			insights.byMember.length > 1 && insights.settling.paidBack + insights.settling.open > 0
	};
	const shown = $derived(chosen.filter((section) => hasData[section]()));
</script>

{#if !insights.span}
	<EmptyState text={m.insights_empty()} />
{:else}
	<PeriodPicker period={insights.period} span={insights.span} {today} token={group.shareToken} />
{/if}
{#if insights.span && insights.count === 0}
	<EmptyState text={m.period_empty()} />
{:else if insights.span}
	<div class="pt-4"><StatTiles {insights} currency={group.currency} tiles={layout.tiles} /></div>
	{#each shown as section (section)}
		<BlockTitle class="!mb-2">{sectionTitles[section]()}</BlockTitle>
		{#if section === 'recap' && insights.recap}
			<Recap recap={insights.recap} name={group.name} currency={group.currency} />
		{:else if section === 'budget'}
			<Budget view={insights.budget} currency={group.currency} error={budgetError} />
		{:else if section === 'highlights'}
			<Highlights highlights={insights.highlights} {members} {names} currency={group.currency} />
		{:else if section === 'overTime'}
			<OverTimeChart
				unit={insights.overTime.unit}
				buckets={insights.overTime.buckets}
				withoutBig={insights.overTime.withoutBig}
				currency={group.currency}
			/>
		{:else if section === 'categories'}
			<CategoryDonut
				series={insights.donut.series}
				slices={insights.donut.slices}
				currency={group.currency}
			/>
		{:else if section === 'kindMonths'}
			<KindMonths months={insights.kindMonths} currency={group.currency} />
		{:else if section === 'places'}
			<Places places={insights.places} currency={group.currency} />
		{:else if section === 'kinds'}
			<KindBars rows={insights.byKind} currency={group.currency} />
		{:else if section === 'fixedCosts'}
			<FixedCosts rows={insights.fixed} currency={group.currency} />
		{:else if section === 'myPosition' && insights.position}
			<PositionChart points={insights.position} currency={group.currency} />
		{:else if section === 'settling'}
			<Settling settling={insights.settling} {members} currency={group.currency} />
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
{/if}
{#if insights.span}
	<!-- Also on a quiet period: choosing what to see doesn't depend on it -->
	<CustomizeInsights kind={group.kind} shown={chosen} />
	<div class="h-6"></div>
{/if}
