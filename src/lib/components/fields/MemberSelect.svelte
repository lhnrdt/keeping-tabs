<script lang="ts">
	import Field from '#lib/components/Field.svelte';
	import type { Member } from '#lib/group/members.ts';

	type Props = { label: string; name: string; members: Member[]; value: string | undefined };

	let { label, name, members, value }: Props = $props();
</script>

<Field {label} {name} type="select" dropdown {value}>
	{#each members as member (member.id)}
		<option value={member.id} selected={member.id === value}>{member.name}</option>
	{/each}
</Field>
