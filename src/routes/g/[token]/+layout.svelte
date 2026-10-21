<script lang="ts">
	import GroupScope from '#lib/components/group/GroupScope.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

{#key data.group.id}
	<GroupScope group={data.group} creatorId={data.creatorId}>
		{@render children()}
	</GroupScope>
{/key}
