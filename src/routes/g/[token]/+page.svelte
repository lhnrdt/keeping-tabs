<script lang="ts">
	import { keepReady } from '#lib/offline/ready.ts';
	import { takeMoment } from '#lib/motion/moments.ts';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { BlockTitle, List, ListItem } from 'konsta/svelte';
	import { onMount } from 'svelte';
	import { showTip, startTour } from '#lib/onboarding/run.ts';
	import { loadGroupInsights, warmUp } from '#lib/components/insights/load.ts';
	import AppPage from '#lib/components/AppPage.svelte';
	import FloatingLink from '#lib/components/FloatingLink.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import BalanceList from '#lib/components/group/BalanceList.svelte';
	import BetweenYou from '#lib/components/group/BetweenYou.svelte';
	import ExpenseList from '#lib/components/group/ExpenseList.svelte';
	import ExpenseSearch from '#lib/components/group/ExpenseSearch.svelte';
	import PendingExpenses from '#lib/components/group/PendingExpenses.svelte';
	import DeleteGroup from '#lib/components/group/DeleteGroup.svelte';
	import GroupDetails from '#lib/components/group/GroupDetails.svelte';
	import GroupHero from '#lib/components/group/GroupHero.svelte';
	import GroupTabs from '#lib/components/group/GroupTabs.svelte';
	import IdentityButton from '#lib/components/group/IdentityButton.svelte';
	import SettleUp from '#lib/components/group/SettleUp.svelte';
	import RecurringList from '#lib/components/group/RecurringList.svelte';
	import ShareLink from '#lib/components/group/ShareLink.svelte';
	import UndoToast from '#lib/components/group/UndoToast.svelte';
	import PeoplePills from '#lib/components/people/PeoplePills.svelte';
	import { openedDownload } from '#lib/crypto/open-download.ts';
	import { followChanges } from '#lib/follow-changes.ts';
	import { currentTab } from '#lib/group/tabs.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	/** Once the page has come in, so the action is seen */
	const MOMENT_DELAY_MS = 350;

	const tab = $derived(currentTab(page.url));
	const errorFor = (action: string) => (form?.action === action ? form.error : undefined);

	// Just added, paid or created: the scene plays its action once the page is in, and the new
	// entry glows (#291)
	let play = $state(0);
	let fresh = $state<string | undefined>();
	/** It came as the form turning into it: no coming in again, only the glow */
	let morphed = $state(false);
	onMount(() => {
		const moment = takeMoment();
		if (!moment) return;
		fresh = moment.id;
		morphed = Boolean(moment.morphed);
		const later = setTimeout(() => play++, MOMENT_DELAY_MS);
		return () => clearTimeout(later);
	});

	// Without a connection later, an expense can still be added here, and the start screen opens
	onMount(() =>
		keepReady([resolve('/g/[token]/expenses/new', { token: data.group.shareToken }), resolve('/')])
	);

	// Fetch the insights' charts while idle, so the tab opens without waiting
	onMount(() => warmUp(loadGroupInsights));
	// The first time in a group: its tour (#331); after that, a tip on the first entry
	onMount(() => {
		if (page.data.showNote) return;
		void startTour('group').then((started) => {
			const entry = document.querySelector('[data-entry]');
			if (!started && entry) void showTip('swipe', entry, m.tip_swipe());
		});
	});
	onMount(() => followChanges(resolve('/g/[token]/changes', { token: data.group.shareToken })));
</script>

<svelte:head>
	<title>{data.group.name} – {m.app_name()}</title>
</svelte:head>

<AppPage title={data.group.name} back={{ href: resolve('/'), label: m.app_name() }}>
	{#snippet right()}
		<IdentityButton />
	{/snippet}
	{#snippet hero()}
		<GroupHero
			group={data.group}
			members={data.members}
			balances={data.balances}
			transfers={data.transfers}
			{play}
		/>
	{/snippet}

	<!-- A tab's content rises in when you switch to it -->
	{#key tab}
		<div class="rise-in">
			{#if tab === 'expenses'}
				{#if data.entries.length || data.query}
					<ExpenseSearch query={data.query} />
				{/if}
				<PendingExpenses token={data.group.shareToken} currency={data.group.currency} />
				<!-- A new search starts the list (and its older pages) afresh -->
				{#key data.query}
					<ExpenseList
						token={data.group.shareToken}
						currency={data.group.currency}
						members={[...data.members, ...data.formerMembers]}
						entries={data.entries}
						hasMore={data.hasMore}
						query={data.query}
						searchHere={Boolean(data.group.keyId || data.group.transitionKey)}
						{fresh}
						{morphed}
					/>
				{/key}
				<FloatingLink
					href={resolve('/g/[token]/expenses/new', { token: data.group.shareToken })}
					icon="add"
					label={m.add_expense()}
					tour="add-expense"
				/>
			{:else if tab === 'balances'}
				<BetweenYou
					members={data.members}
					transfers={data.transfers}
					currency={data.group.currency}
					group={data.group}
				/>
				<BlockTitle>{m.balances_title()}</BlockTitle>
				<BalanceList
					currency={data.group.currency}
					members={data.members}
					balances={data.balances}
				/>
				<BlockTitle>{m.settle_title()}</BlockTitle>
				<SettleUp
					token={data.group.shareToken}
					currency={data.group.currency}
					members={data.members}
					transfers={data.transfers}
				/>
			{:else if tab === 'insights' && data.insights}
				<!-- Loaded with the tab, fetched ahead while idle (load.ts) -->
				{#await loadGroupInsights() then { default: GroupInsights }}
					<GroupInsights
						insights={data.insights}
						today={data.today}
						group={data.group}
						members={data.members}
						everyone={[...data.members, ...data.formerMembers]}
					/>
				{/await}
			{:else}
				<BlockTitle>{m.members_title()}</BlockTitle>
				<PeoplePills
					members={data.members}
					balances={data.balances}
					errors={{
						add: errorFor('addMember'),
						rename: errorFor('renameMember'),
						remove: errorFor('removeMember')
					}}
				/>
				<BlockTitle>{m.group_details()}</BlockTitle>
				<GroupDetails group={data.group} members={data.members} hasPassword={data.hasPassword} />
				<RecurringList
					rules={data.recurring}
					currency={data.group.currency}
					token={data.group.shareToken}
				/>
				<BlockTitle>{m.share_title()}</BlockTitle>
				<ShareLink token={data.group.shareToken} groupName={data.group.name} />
				<DeleteGroup groupId={data.group.id} name={data.group.name} />
				<List strong inset>
					<ListItem
						link
						title={m.activity_title()}
						href={resolve('/g/[token]/activity', { token: data.group.shareToken })}
					>
						{#snippet media()}
							<Icon name="activity" />
						{/snippet}
					</ListItem>
					<ListItem
						link
						title={m.import_link()}
						href={resolve('/g/[token]/import', { token: data.group.shareToken })}
					>
						{#snippet media()}
							<Icon name="import" />
						{/snippet}
					</ListItem>
					<!-- A download: a plain link, not a client-side navigation -->
					<ListItem
						link
						title={m.export_link()}
						href={resolve('/g/[token]/export', { token: data.group.shareToken })}
						linkProps={{
							download: '',
							'data-sveltekit-reload': '',
							onclick: openedDownload(data.group, 'csv')
						}}
					>
						{#snippet media()}
							<Icon name="export" />
						{/snippet}
					</ListItem>
					<ListItem
						link
						title={m.backup_link()}
						href={resolve('/g/[token]/backup', { token: data.group.shareToken })}
						linkProps={{
							download: '',
							'data-sveltekit-reload': '',
							onclick: openedDownload(data.group, 'json')
						}}
					>
						{#snippet media()}
							<Icon name="export" />
						{/snippet}
					</ListItem>
				</List>
			{/if}
		</div>
	{/key}

	{#if data.justDeleted}
		<!-- A new one for each deletion, so its timer starts again -->
		{#key data.justDeleted.id}
			<UndoToast entry={data.justDeleted} {tab} />
		{/key}
	{/if}
	<GroupTabs active={tab} />
</AppPage>
