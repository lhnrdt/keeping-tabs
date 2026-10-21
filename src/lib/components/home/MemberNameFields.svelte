<script lang="ts">
	import { ListButton } from 'konsta/svelte';
	import { slide } from 'svelte/transition';
	import Field from '#lib/components/Field.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { LIMITS } from '#lib/validation.ts';

	/** Names to pre-fill (after a failed submit); at least two empty rows otherwise. */
	let { names = [] }: { names?: string[] } = $props();

	let extraRows = $state(0);
	const rows = $derived(Math.max(2, names.length) + extraRows);
</script>

{#each { length: rows }, i (i)}
	<div transition:slide={{ duration: 150 }}>
		<Field
			label={`${m.field_member_name()} ${i + 1}`}
			name="member"
			maxlength={LIMITS.memberName}
			autocomplete="off"
			value={names[i] ?? ''}
		/>
	</div>
{/each}
<ListButton type="button" onclick={() => extraRows++}>{m.add_another()}</ListButton>
