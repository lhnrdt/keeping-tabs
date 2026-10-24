<script lang="ts">
	// The group's people as pills (you, joined, not here yet); tap one for its menu, or add
	// someone with the "+ Add" pill.
	import FormError from '#lib/components/FormError.svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import type { GroupMember } from '#lib/group/members.ts';
	import { transitionName } from '#lib/motion/in-place-transition.ts';
	import { m } from '#lib/paraglide/messages.js';
	import AddPersonPill from './AddPersonPill.svelte';
	import PersonActions from './PersonActions.svelte';
	import PersonPill from './PersonPill.svelte';

	type Props = {
		members: GroupMember[];
		balances: Record<string, number>;
		/** From the last add, rename or remove */
		errors: { add?: ErrorCode; rename?: ErrorCode; remove?: ErrorCode };
	};

	let { members, balances, errors }: Props = $props();

	let selected = $state<GroupMember | null>(null);
	const markOf = (member: GroupMember) =>
		member.mine ? ('you' as const) : member.claimed ? undefined : ('away' as const);
</script>

<div class="mx-4 mt-3 mb-6">
	<ul class="flex flex-wrap gap-2" aria-label={m.members_title()}>
		{#each members as member (member.id)}
			<li style={transitionName('member', member.id)}>
				<PersonPill
					name={member.name}
					avatarId={member.avatarId}
					avatar={member.avatar}
					mark={markOf(member)}
					hint={m.person_menu_hint()}
					onclick={() => (selected = member)}
				/>
			</li>
		{/each}
		<li><AddPersonPill /></li>
	</ul>
</div>
<FormError error={errors.add ?? errors.remove} />

<PersonActions
	person={selected}
	balance={selected ? (balances[selected.id] ?? 0) : 0}
	renameError={errors.rename}
	onClose={() => (selected = null)}
/>
