<script lang="ts">
	import { resolve } from '$app/paths';
	import { BlockTitle, List, ListItem } from 'konsta/svelte';
	import IconBadge from '#lib/components/IconBadge.svelte';
	import { onMount } from 'svelte';
	import { getRecentGroups, type RecentGroup } from '#lib/device.ts';
	import { m } from '#lib/paraglide/messages.js';

	let groups = $state<RecentGroup[]>([]);

	onMount(() => {
		groups = getRecentGroups();
	});
</script>

{#if groups.length}
	<section aria-labelledby="your-groups">
		<BlockTitle id="your-groups">{m.home_your_groups()}</BlockTitle>
		<List strong inset>
			{#each groups as group (group.id)}
				<ListItem link title={group.name} href={resolve('/g/[token]', { token: group.token })}>
					{#snippet media()}
						<IconBadge name="group" />
					{/snippet}
				</ListItem>
			{/each}
		</List>
	</section>
{/if}
