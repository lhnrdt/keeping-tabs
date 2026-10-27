<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { BlockTitle, List, ListItem } from 'konsta/svelte';
	import { onMount } from 'svelte';
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
	import { currentTab } from '#lib/group/tabs.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const tab = $derived(currentTab(page.url));
	const errorFor = (action: string) => (form?.action === action ? form.error : undefined);

	// Fetch the insights' charts while idle, so the tab opens without waiting
	onMount(() => warmUp(loadGroupInsights));
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
		/>
	{/snippet}

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
			/>
		{/key}
		<FloatingLink
			href={resolve('/g/[token]/expenses/new', { token: data.group.shareToken })}
			icon="add"
			label={m.add_expense()}
		/>
	{:else if tab === 'balances'}
		<BetweenYou
			members={data.members}
			transfers={data.transfers}
			currency={data.group.currency}
			group={data.group}
		/>
		<BlockTitle>{m.balances_title()}</BlockTitle>
		<BalanceList currency={data.group.currency} members={data.members} balances={data.balances} />
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
				budgetError={errorFor('budget')}
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
		<GroupDetails group={data.group} members={data.members} error={errorFor('updateGroup')} />
		<RecurringList rules={data.recurring} currency={data.group.currency} />
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
				linkProps={{ download: '', 'data-sveltekit-reload': '' }}
			>
				{#snippet media()}
					<Icon name="export" />
				{/snippet}
			</ListItem>
		</List>
	{/if}

	{#if data.justDeleted}
		<!-- A new one for each deletion, so its timer starts again -->
		{#key data.justDeleted.id}
			<UndoToast entry={data.justDeleted} {tab} />
		{/key}
	{/if}
	<GroupTabs active={tab} />
</AppPage>
