<script lang="ts">
	// The group's repeating expenses (#45): what, how much, how often and when next, each with
	// a red Stop. What they added before stays.
	import { enhance } from '$app/forms';
	import { BlockTitle, List, ListItem } from 'konsta/svelte';
	import type { Frequency } from '#lib/expense/recurrence.ts';
	import { tabAction } from '#lib/group/tabs.ts';
	import { formatAmount } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';

	type Rule = {
		id: string;
		title: string;
		amountCents: number;
		frequency: Frequency;
		nextOn: string;
	};

	let { rules, currency }: { rules: Rule[]; currency: string } = $props();

	const every: Record<Frequency, () => string> = {
		weekly: m.repeats_weekly,
		monthly: m.repeats_monthly,
		yearly: m.repeats_yearly
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
	<List strong inset role="region" aria-label={m.recurring_title()}>
		{#each rules as rule (rule.id)}
			<ListItem
				title={rule.title}
				subtitle={`${formatAmount(rule.amountCents, currency, getLocale())} · ${every[rule.frequency]()} · ${m.recurring_next({ date: date(rule.nextOn) })}`}
			>
				{#snippet after()}
					<form method="POST" action={tabAction('stopRecurring', 'group')} use:enhance>
						<input type="hidden" name="recurringId" value={rule.id} />
						<button type="submit" class="text-sm font-medium tone-destructive"
							>{m.recurring_stop()}</button
						>
					</form>
				{/snippet}
			</ListItem>
		{/each}
	</List>
{/if}
