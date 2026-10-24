<script lang="ts">
	// Across your groups: who owes you and whom you owe, each with the groups it comes from
	// (#117). Plain <details>, so it opens without JavaScript.
	import { resolve } from '$app/paths';
	import { BlockTitle, List } from 'konsta/svelte';
	import Avatar from '#lib/components/Avatar.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { groupTabUrl } from '#lib/group/tabs.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { PersonSummary } from '#lib/people-summary.ts';
	import PersonAmount from './PersonAmount.svelte';

	let { people }: { people: PersonSummary[] } = $props();
</script>

{#if people.length}
	<section aria-labelledby="people-summary">
		<BlockTitle id="people-summary">{m.people_title()}</BlockTitle>
		<List strong inset>
			{#each people as person (person.key)}
				<li>
					<details class="group">
						<summary
							class="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-2 [&::-webkit-details-marker]:hidden"
						>
							<Avatar id={person.avatarId} name={person.name} />
							<span class="min-w-0 flex-1 truncate font-medium">{person.name}</span>
							<span class="text-sm">
								<PersonAmount amount={person.net} currency={person.currency} />
							</span>
							<span
								class="text-muted transition-transform group-open:rotate-180"
								aria-hidden="true"
							>
								<Icon name="expand" size={18} />
							</span>
						</summary>
						<ul class="ps-[3.75rem] pe-4 pb-2" aria-label={m.people_groups({ name: person.name })}>
							{#each person.groups as group (group.id)}
								<li>
									<!-- eslint-disable svelte/no-navigation-without-resolve -- resolve() plus ?tab= -->
									<a
										href={groupTabUrl(resolve('/g/[token]', { token: group.token }), 'balances')}
										class="flex items-center justify-between gap-3 py-1.5 text-sm"
									>
										<!-- eslint-enable svelte/no-navigation-without-resolve -->
										<span class="truncate text-muted">{group.name}</span>
										<PersonAmount amount={group.amount} currency={person.currency} />
									</a>
								</li>
							{/each}
						</ul>
					</details>
				</li>
			{/each}
		</List>
	</section>
{/if}
