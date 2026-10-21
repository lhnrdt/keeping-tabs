<script lang="ts">
	import { Checkbox, List, ListItem } from 'konsta/svelte';
	import type { Member } from '#lib/group/members.ts';
	import { m } from '#lib/paraglide/messages.js';

	let { members, selected }: { members: Member[]; selected: string[] } = $props();
</script>

<List strong inset role="group" aria-label={m.field_split_between()}>
	{#each members as member (member.id)}
		<ListItem label title={member.name}>
			{#snippet media()}
				<!-- Konsta hides the input with display:none; keep it reachable for keyboards and screen readers (N-7) -->
				<Checkbox
					class="[&>input]:sr-only [&>input]:block [&>input:focus-visible+i]:ring-2 [&>input:focus-visible+i]:ring-offset-2"
					component="div"
					name="participants"
					value={member.id}
					checked={selected.includes(member.id)}
				/>
			{/snippet}
		</ListItem>
	{/each}
</List>
