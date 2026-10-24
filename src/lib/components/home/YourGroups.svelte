<script lang="ts">
	import { resolve } from '$app/paths';
	import { BlockTitle, List, ListItem } from 'konsta/svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import GroupTile from '#lib/components/GroupTile.svelte';
	import YourBalance from '#lib/components/YourBalance.svelte';
	import { onMount } from 'svelte';
	import { getRecentGroups } from '#lib/device.ts';
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
	};

	const MAX_OPEN_LINES = 2;

	let { memberOf }: { memberOf: MemberGroup[] } = $props();

	// Server groups render right away; groups only opened in this browser join after mount
	let local = $state<ReturnType<typeof getRecentGroups>>([]);
	let mounted = $state(false);
	const groups = $derived(mergeGroups(memberOf, local));

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

{#if groups.length}
	<section aria-labelledby="your-groups">
		<BlockTitle id="your-groups">{m.home_your_groups()}</BlockTitle>
		<List strong inset>
			{#each groups as group (group.id)}
				<ListItem link title={group.name} href={resolve('/g/[token]', { token: group.token })}>
					{#snippet media()}
						<GroupTile id={group.id} kind={group.kind} tint={group.tint} />
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
			{/each}
		</List>
	</section>
{:else if mounted}
	<!-- Only once this browser's own list is known, so returning visitors don't see a flash -->
	<EmptyState illustration="plant" text={m.home_empty()} />
{/if}
