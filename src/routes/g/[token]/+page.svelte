<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { BlockTitle, Fab } from 'konsta/svelte';
	import AppPage from '#lib/components/AppPage.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import AddMemberForm from '#lib/components/group/AddMemberForm.svelte';
	import BalanceList from '#lib/components/group/BalanceList.svelte';
	import ExpenseList from '#lib/components/group/ExpenseList.svelte';
	import GroupDetails from '#lib/components/group/GroupDetails.svelte';
	import GroupHero from '#lib/components/group/GroupHero.svelte';
	import GroupTabs from '#lib/components/group/GroupTabs.svelte';
	import IdentityButton from '#lib/components/group/IdentityButton.svelte';
	import MemberList from '#lib/components/group/MemberList.svelte';
	import SettleUp from '#lib/components/group/SettleUp.svelte';
	import ShareLink from '#lib/components/group/ShareLink.svelte';
	import WhoAreYouSheet from '#lib/components/group/WhoAreYouSheet.svelte';
	import { currentTab } from '#lib/group/tabs.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const tab = $derived(currentTab(page.url));
	const errorFor = (action: string) => (form?.action === action ? form.error : undefined);
</script>

<svelte:head>
	<title>{data.group.name} – {m.app_name()}</title>
</svelte:head>

<AppPage title={data.group.name} back={{ href: resolve('/'), label: m.app_name() }}>
	{#snippet right()}
		<IdentityButton members={data.members} />
	{/snippet}
	{#snippet hero()}
		<GroupHero group={data.group} members={data.members} balances={data.balances} />
	{/snippet}

	{#if tab === 'expenses'}
		<BlockTitle>{m.expenses_title()}</BlockTitle>
		<ExpenseList
			token={data.group.shareToken}
			currency={data.group.currency}
			members={data.members}
			expenses={data.expenses}
		/>
		<!-- Konsta sets role="button" on its Fab even when it's a link -->
		<Fab
			class="fixed right-4 bottom-[calc(var(--k-safe-area-bottom,0px)+6rem)] z-20"
			href={resolve('/g/[token]/expenses/new', { token: data.group.shareToken })}
			text={m.add_expense()}
			role="link"
		>
			{#snippet icon()}
				<Icon name="add" size={24} />
			{/snippet}
		</Fab>
	{:else if tab === 'balances'}
		<BlockTitle>{m.balances_title()}</BlockTitle>
		<BalanceList currency={data.group.currency} members={data.members} balances={data.balances} />
		<BlockTitle>{m.settle_title()}</BlockTitle>
		<SettleUp
			token={data.group.shareToken}
			currency={data.group.currency}
			members={data.members}
			balances={data.balances}
		/>
	{:else}
		<BlockTitle>{m.members_title()}</BlockTitle>
		<MemberList members={data.members} renameError={errorFor('renameMember')} />
		<AddMemberForm error={errorFor('addMember')} />
		<BlockTitle>{m.group_details()}</BlockTitle>
		<GroupDetails group={data.group} error={errorFor('updateGroup')} />
		<BlockTitle>{m.share_title()}</BlockTitle>
		<ShareLink token={data.group.shareToken} groupName={data.group.name} />
	{/if}

	<GroupTabs active={tab} />
	<WhoAreYouSheet members={data.members} />
</AppPage>
