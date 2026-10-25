<script lang="ts">
	import { resolve } from '$app/paths';
	import { BlockTitle, List, ListItem } from 'konsta/svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import Fold from '#lib/components/Fold.svelte';
	import GroupTile from '#lib/components/GroupTile.svelte';
	import YourBalance from '#lib/components/YourBalance.svelte';
	import { onMount } from 'svelte';
	import { todayInputValue } from '#lib/dates.ts';
	import { getRecentGroups } from '#lib/device.ts';
	import { isSettledAndQuiet } from '#lib/group/settled.ts';
	import { currentRecentGroups } from '#lib/group/recent-groups.ts';
	import { openLine } from '#lib/group/open-line.ts';
	import { mergeGroups, type GroupLink } from '#lib/group/your-groups.ts';
	import { m } from '#lib/paraglide/messages.js';

	/** Groups you're a member of, from the server */
	type MemberGroup = GroupLink & {
		currency: string;
		balance: number;
		/** What's open with each person there; positive: they owe you */
		open: { name: string; amount: number }[];
		/** The latest entry's date, for folding settled groups away (#46) */
		lastEntry: string | null;
	};

	const MAX_OPEN_LINES = 2;

	let { memberOf }: { memberOf: MemberGroup[] } = $props();

	// Server groups render right away; groups only opened in this browser join after mount
	let local = $state<ReturnType<typeof getRecentGroups>>([]);
	let mounted = $state(false);
	const groups = $derived(mergeGroups(memberOf, local));
	// Settled and quiet for a while: folded away below the others (#46)
	const today = todayInputValue();
	const isSettled = (group: (typeof groups)[number]) =>
		'balance' in group && isSettledAndQuiet(group, today);
	const active = $derived(groups.filter((group) => !isSettled(group)));
	const settled = $derived(groups.filter(isSettled));

	onMount(() => {
		local = getRecentGroups();
		mounted = true;
	});

	// Then as they are now, whenever the server's list is (re)loaded: renamed, or gone when
	// someone deleted them (#125)
	$effect(() => {
		void memberOf;
		currentRecentGroups().then((groups) => (local = groups));
	});
</script>

{#snippet row(group: (typeof groups)[number])}
	<ListItem link title={group.name} href={resolve('/g/[token]', { token: group.token })}>
		{#snippet media()}
			<GroupTile kind={group.kind} tint={group.tint} />
		{/snippet}
		{#snippet subtitle()}
			{#if 'balance' in group}
				<YourBalance amount={group.balance} currency={group.currency} />
				<!-- Per person, as in the group's header (#117) -->
				{#each group.open.slice(0, MAX_OPEN_LINES) as line (line.name)}
					<span class="block text-sm text-muted">
						{openLine(line.name, line.amount, group.currency)}
					</span>
				{/each}
				{#if group.open.length > MAX_OPEN_LINES}
					<span class="block text-sm text-muted">
						{m.group_open_more({ count: group.open.length - MAX_OPEN_LINES })}
					</span>
				{/if}
			{/if}
		{/snippet}
	</ListItem>
{/snippet}

{#if groups.length}
	<section aria-labelledby="your-groups">
		<BlockTitle id="your-groups">{m.home_your_groups()}</BlockTitle>
		{#if active.length}
			<List strong inset>
				{#each active as group (group.id)}
					{@render row(group)}
				{/each}
			</List>
		{/if}
		{#if settled.length}
			<Fold title={m.home_settled_groups({ count: settled.length })}>
				<List nested class="!my-0">
					{#each settled as group (group.id)}
						{@render row(group)}
					{/each}
				</List>
			</Fold>
		{/if}
	</section>
{:else if mounted}
	<!-- Only once this browser's own list is known, so returning visitors don't see a flash -->
	<EmptyState text={m.home_empty()} />
{/if}
