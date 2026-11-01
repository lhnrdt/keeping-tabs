<script lang="ts">
	import PlainField from '#lib/components/fields/PlainField.svelte';
	import type { IconName } from '#lib/icons.ts';
	import type { Member } from '#lib/group/members.ts';

	type Props = {
		label: string;
		name: string;
		members: Member[];
		value: string | undefined;
		icon?: IconName;
	};

	let { label, name, members, value, icon }: Props = $props();
</script>

<PlainField {label} {icon} arrow>
	{#snippet children(id)}
		<select {id} {name} {value}>
			{#each members as member (member.id)}
				<option value={member.id} selected={member.id === value}>{member.name}</option>
			{/each}
		</select>
	{/snippet}
</PlainField>
