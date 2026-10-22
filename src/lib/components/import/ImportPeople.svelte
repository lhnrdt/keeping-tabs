<script lang="ts">
	// Who is who: a member (or "new member") for each person in the export.
	import { BlockFooter, BlockTitle, List } from 'konsta/svelte';
	import Field from '#lib/components/Field.svelte';
	import type { Member } from '#lib/group/members.ts';
	import { NEW_MEMBER, personField, suggestMember } from '#lib/import/people.ts';
	import { m } from '#lib/paraglide/messages.js';

	let { people, members }: { people: string[]; members: Member[] } = $props();
</script>

<BlockTitle>{m.import_people()}</BlockTitle>
<List strong inset>
	{#each people as name, i (name)}
		{@const suggested = suggestMember(name, members)}
		<Field label={name} name={personField(i)} type="select" dropdown value={suggested}>
			{#each members as member (member.id)}
				<option value={member.id} selected={member.id === suggested}>{member.name}</option>
			{/each}
			<option value={NEW_MEMBER} selected={suggested === NEW_MEMBER}>{m.import_new_member()}</option
			>
		</Field>
	{/each}
</List>
<BlockFooter>{m.import_people_hint()}</BlockFooter>
