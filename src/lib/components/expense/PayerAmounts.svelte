<script lang="ts">
	// What each person paid, when several did (#39): an amount per member, and what's left of
	// the expense's amount, live. Empty means they didn't pay.
	import { BlockFooter, List } from 'konsta/svelte';
	import Field from '#lib/components/Field.svelte';
	import type { Member } from '#lib/group/members.ts';
	import { formatAmount, parseAmount } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';

	type Props = {
		members: Member[];
		currency: string;
		/** The expense's amount as typed */
		amount: string;
		/** What each member paid as typed, by member id */
		initial: Record<string, string>;
	};

	let { members, currency, amount, initial }: Props = $props();

	// Starts from what was saved; typing takes over from there
	const startWith = (): Record<string, string> => ({ ...initial });
	let typed = $state(startWith());
	const total = $derived(parseAmount(amount, currency) ?? 0);
	const paid = $derived(
		Object.values(typed).reduce((sum, text) => sum + (parseAmount(text, currency) ?? 0), 0)
	);
	const money = (cents: number) => formatAmount(cents, currency, getLocale());
</script>

<List strong inset role="group" aria-label={m.payers_title()}>
	{#each members as member (member.id)}
		<Field
			label={m.payer_paid({ name: member.name })}
			name={`paid.${member.id}`}
			inputmode="decimal"
			autocomplete="off"
			bind:value={typed[member.id]}
		/>
	{/each}
</List>
<BlockFooter class="!-mt-2" aria-live="polite" data-testid="payers-summary">
	{m.payers_progress({ paid: money(paid), total: money(total), left: money(total - paid) })}
</BlockFooter>
