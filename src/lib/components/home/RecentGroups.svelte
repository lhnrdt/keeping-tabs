<script lang="ts">
	import { resolve } from '$app/paths';
	import { BlockTitle, List, ListItem } from 'konsta/svelte';
	import GroupTile from '#lib/components/GroupTile.svelte';
	import { onMount } from 'svelte';
	import { getRecentGroups } from '#lib/device.ts';
	import { mergeGroups, type GroupLink } from '#lib/group/your-groups.ts';
	import { m } from '#lib/paraglide/messages.js';

	/** Groups you're a member of, from the server */
	let { memberOf }: { memberOf: GroupLink[] } = $props();

	// Server groups render right away; groups only opened in this browser join after mount
	let local = $state<ReturnType<typeof getRecentGroups>>([]);
	const groups = $derived(mergeGroups(memberOf, local));

	onMount(() => {
		local = getRecentGroups();
	});
</script>

{#if groups.length}
	<section aria-labelledby="your-groups">
		<BlockTitle id="your-groups">{m.home_your_groups()}</BlockTitle>
		<List strong inset>
			{#each groups as group (group.id)}
				<ListItem link title={group.name} href={resolve('/g/[token]', { token: group.token })}>
					{#snippet media()}
						<GroupTile id={group.id} />
					{/snippet}
				</ListItem>
			{/each}
		</List>
	</section>
{/if}
