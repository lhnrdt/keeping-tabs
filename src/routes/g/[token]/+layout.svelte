<script lang="ts">
	import GroupScope from '#lib/components/group/GroupScope.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

{#key data.group.id}
	<GroupScope group={data.group} members={data.members}>
		{@render children()}
	</GroupScope>
{/key}
