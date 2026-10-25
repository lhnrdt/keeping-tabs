<script lang="ts">
	// Highlights (#162): a few friendly facts about the group, each with its icon (or the
	// person's avatar), in one card.
	import Avatar from '#lib/components/Avatar.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { categoryIcons, categoryLabels } from '#lib/expense/category-style.ts';
	import type { GroupMember } from '#lib/group/members.ts';
	import type { IconName } from '#lib/icons.ts';
	import { formatAmount } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { Highlight } from '#lib/insights/highlights.ts';

	type Props = {
		highlights: Highlight[];
		/** Current members, for avatars */
		members: GroupMember[];
		/** Current and former members' names, by id */
		names: ReadonlyMap<string, string>;
		currency: string;
	};

	let { highlights, members, names, currency }: Props = $props();

	const byId = $derived(new Map(members.map((member) => [member.id, member])));
	const money = (amount: number) => formatAmount(amount, currency, getLocale());
	const percent = (share: number) =>
		new Intl.NumberFormat(getLocale(), { style: 'percent', maximumFractionDigits: 0 }).format(
			share
		);
	const date = (iso: string) =>
		new Intl.DateTimeFormat(getLocale(), {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
			timeZone: 'UTC'
		}).format(new Date(`${iso}T00:00:00Z`));
	/** 0 = Monday: 2024-01-01 was one */
	const weekdayName = (weekday: number) =>
		new Intl.DateTimeFormat(getLocale(), { weekday: 'long', timeZone: 'UTC' }).format(
			new Date(Date.UTC(2024, 0, 1 + weekday))
		);

	function text(highlight: Highlight) {
		switch (highlight.kind) {
			case 'topCategory':
				return m.highlight_top_category({
					category: categoryLabels[highlight.category](),
					share: percent(highlight.share)
				});
			case 'busiestDay':
				return m.highlight_busiest_day({
					date: date(highlight.date),
					amount: money(highlight.amount)
				});
			case 'place':
				return m.highlight_place({
					title: highlight.title,
					count: highlight.times,
					amount: money(highlight.amount)
				});
			case 'mostOften':
				return m.highlight_most_often({
					name: names.get(highlight.memberId) ?? '?',
					times: highlight.times,
					count: highlight.count
				});
			case 'streak':
				return m.highlight_streak({ days: highlight.days, date: date(highlight.from) });
			case 'weekday':
				return m.highlight_weekday({
					weekday: weekdayName(highlight.weekday),
					share: percent(highlight.share)
				});
		}
	}

	const icons: Record<Exclude<Highlight['kind'], 'topCategory' | 'mostOften'>, IconName> = {
		busiestDay: 'day',
		place: 'place',
		streak: 'streak',
		weekday: 'day'
	};
</script>

<ul
	class="mx-4 space-y-3 rounded-2xl bg-surface px-4 py-4 dark:bg-surface-night"
	aria-label={m.insights_highlights()}
>
	{#each highlights as highlight (highlight.kind)}
		{@const member = highlight.kind === 'mostOften' ? byId.get(highlight.memberId) : undefined}
		<li class="flex items-center gap-3 text-sm">
			{#if member}
				<span class="grid w-8 shrink-0 place-items-center">
					<Avatar id={member.avatarId} name={member.name} avatar={member.avatar} size="sm" />
				</span>
			{:else}
				<span
					class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent/15 text-accent dark:bg-accent-night/20 dark:text-accent-night"
					aria-hidden="true"
				>
					<Icon
						name={highlight.kind === 'topCategory'
							? categoryIcons[highlight.category]
							: highlight.kind === 'mostOften'
								? 'member'
								: icons[highlight.kind]}
						size={18}
					/>
				</span>
			{/if}
			<span class="min-w-0">{text(highlight)}</span>
		</li>
	{/each}
</ul>
