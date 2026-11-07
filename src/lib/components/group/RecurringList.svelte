<script lang="ts">
	import { frequencyLabels } from '#lib/expense/frequency-labels.ts';
	import { entryOf, longPress } from '#lib/actions/long-press.ts';
	import EntryMenu from '#lib/components/EntryMenu.svelte';
	// The group's repeating expenses (#45): what, how much, how often and when next, each with
	// a red Stop. What they added before stays.
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { BlockTitle, List, ListItem } from 'konsta/svelte';
	import type { Frequency } from '#lib/expense/recurrence.ts';
	import { tabAction } from '#lib/group/tabs.ts';
	import { shownAmount } from '#lib/shown-money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';

	type Rule = {
		id: string;
		title: string;
		amountCents: number;
		frequency: Frequency;
		nextOn: string;
	};

	let { rules, currency, token }: { rules: Rule[]; currency: string; token: string } = $props();

	const every = frequencyLabels;
	let held = $state<Rule | null>(null);
	const hold = (target: Element) => {
		const id = entryOf(target);
		held = rules.find((rule) => rule.id === id) ?? null;
	};

	const date = (iso: string) =>
		new Intl.DateTimeFormat(getLocale(), {
			day: 'numeric',
			month: 'short',
			timeZone: 'UTC'
		}).format(new Date(`${iso}T00:00:00Z`));
</script>

{#if rules.length}
	<BlockTitle>{m.recurring_title()}</BlockTitle>
	<!-- Press and hold one: the same as its buttons, in a sheet -->
	<div use:longPress={hold}>
		<List strong inset role="region" aria-label={m.recurring_title()}>
			{#each rules as rule (rule.id)}
				<ListItem
					data-entry={rule.id}
					title={rule.title}
					subtitle={`${shownAmount(rule.amountCents, currency)} · ${every[rule.frequency]()} · ${m.recurring_next({ date: date(rule.nextOn) })}`}
				>
					{#snippet after()}
						<div class="flex items-center gap-4">
							<a
								href={resolve('/g/[token]/recurring/[id]', { token, id: rule.id })}
								class="text-sm font-medium text-accent dark:text-accent-night"
								aria-label={m.recurring_edit_label({ title: rule.title })}>{m.recurring_edit()}</a
							>
							<form method="POST" action={tabAction('stopRecurring', 'group')} use:enhance>
								<input type="hidden" name="recurringId" value={rule.id} />
								<button type="submit" class="text-sm font-medium tone-destructive"
									>{m.recurring_stop()}</button
								>
							</form>
						</div>
					{/snippet}
				</ListItem>
			{/each}
		</List>
	</div>
	<EntryMenu
		title={held?.title ?? null}
		items={held
			? [
					{
						label: m.recurring_edit(),
						href: resolve('/g/[token]/recurring/[id]', { token, id: held.id })
					},
					{
						label: m.recurring_stop(),
						action: tabAction('stopRecurring', 'group'),
						fields: { recurringId: held.id },
						destructive: true
					}
				]
			: []}
		onClose={() => (held = null)}
	/>
{/if}
