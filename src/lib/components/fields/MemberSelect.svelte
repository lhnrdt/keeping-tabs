<script lang="ts">
	import Field from '#lib/components/Field.svelte';
	import type { Member } from '#lib/group/members.ts';

	type Props = {
		label: string;
		name: string;
		members: Member[];
		value: string | undefined;
		/** One more choice after the members, e.g. "Several people" (#39) */
		extra?: { value: string; label: string };
	};

	let { label, name, members, value, extra }: Props = $props();
</script>

<Field {label} {name} type="select" dropdown {value}>
	{#each members as member (member.id)}
		<option value={member.id} selected={member.id === value}>{member.name}</option>
	{/each}
	{#if extra}
		<option value={extra.value} selected={extra.value === value}>{extra.label}</option>
	{/if}
</Field>
