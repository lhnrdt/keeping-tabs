<script lang="ts">
	import { resolve } from '$app/paths';
	import { List, ListItem } from 'konsta/svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import IconBadge from '#lib/components/IconBadge.svelte';
	import AnimatedAmount from '#lib/components/AnimatedAmount.svelte';
	import { namesById, type Member } from '#lib/group/members.ts';
	import { transitionName } from '#lib/motion/in-place-transition.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { formatAmount } from '#lib/money.ts';

	type Entry = {
		id: string;
		type: 'expense' | 'payment';
		title: string;
		amountCents: number;
		paidBy: string;
		date: string;
		recipient?: string;
	};

	type Props = { token: string; currency: string; members: Member[]; expenses: Entry[] };

	let { token, currency, members, expenses }: Props = $props();

	const names = $derived(namesById(members));
	const dateFormat = new Intl.DateTimeFormat(getLocale(), { dateStyle: 'medium', timeZone: 'UTC' });
	const formatDate = (date: string) => dateFormat.format(new Date(`${date}T00:00:00Z`));
	const nameOf = (id: string | undefined) => (id && names.get(id)) || '?';

	// Payments (B-4) read "Ben paid Anna" and link to their own screen
	const titleOf = (entry: Entry) =>
		entry.type === 'payment'
			? m.payment_title({ from: nameOf(entry.paidBy), to: nameOf(entry.recipient) })
			: entry.title;
	const subtitleOf = (entry: Entry) =>
		entry.type === 'payment'
			? formatDate(entry.date)
			: `${formatDate(entry.date)} · ${m.expense_paid_by({
					name: nameOf(entry.paidBy),
					amount: formatAmount(entry.amountCents, currency, getLocale())
				})}`;
	const hrefOf = (entry: Entry) =>
		entry.type === 'payment'
			? resolve('/g/[token]/payments/[id]', { token, id: entry.id })
			: resolve('/g/[token]/expenses/[id]', { token, id: entry.id });
</script>

{#if expenses.length}
	<List strong inset role="region" aria-label={m.expenses_title()}>
		{#each expenses as expense (expense.id)}
			<ListItem
				link
				href={hrefOf(expense)}
				title={titleOf(expense)}
				subtitle={subtitleOf(expense)}
				style={transitionName('expense', expense.id)}
				class={expense.type === 'payment' ? 'italic' : ''}
			>
				{#snippet media()}
					<IconBadge name={expense.type === 'payment' ? 'payment' : 'expense'} />
				{/snippet}
				{#snippet after()}
					<AnimatedAmount amount={expense.amountCents} {currency} />
				{/snippet}
			</ListItem>
		{/each}
	</List>
{:else}
	<EmptyState illustration="plant" text={m.expenses_empty()} />
{/if}
