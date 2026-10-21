<script lang="ts">
	// Bottom tab bar, in thumb reach (N-9). Plain links, so it works without JS.
	import { Tabbar, TabbarLink } from 'konsta/svelte';
	import Icon from '#lib/components/Icon.svelte';
	import type { GroupTab } from '#lib/group/tabs.ts';
	import type { IconName } from '#lib/icons.ts';
	import { m } from '#lib/paraglide/messages.js';

	let { active }: { active: GroupTab } = $props();

	const tabs: { id: GroupTab; label: () => string; icon: IconName }[] = [
		{ id: 'expenses', label: m.tab_expenses, icon: 'expense' },
		{ id: 'balances', label: m.tab_balances, icon: 'balances' },
		{ id: 'group', label: m.tab_group, icon: 'group' }
	];
</script>

<Tabbar labels icons class="fixed bottom-0 left-0 z-20" aria-label={m.app_name()}>
	{#each tabs as tab (tab.id)}
		<TabbarLink
			active={tab.id === active}
			label={tab.label()}
			linkProps={{
				href: `?tab=${tab.id}`,
				'aria-current': tab.id === active ? 'page' : undefined,
				'data-sveltekit-replacestate': '',
				'data-sveltekit-noscroll': ''
			}}
		>
			{#snippet icon()}
				<Icon name={tab.icon} size={24} />
			{/snippet}
		</TabbarLink>
	{/each}
</Tabbar>
