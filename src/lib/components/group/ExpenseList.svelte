<script lang="ts">
	import { resolve } from '$app/paths';
	import { Block, List, ListItem } from 'konsta/svelte';
	import AnimatedAmount from '#lib/components/AnimatedAmount.svelte';
	import { namesById, type Member } from '#lib/group/members.ts';
	import { transitionName } from '#lib/motion/in-place-transition.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { formatAmount } from '#lib/money.ts';

	type Expense = { id: string; title: string; amountCents: number; paidBy: string; date: string };

	type Props = { token: string; currency: string; members: Member[]; expenses: Expense[] };

	let { token, currency, members, expenses }: Props = $props();

	const names = $derived(namesById(members));
	const dateFormat = new Intl.DateTimeFormat(getLocale(), { dateStyle: 'medium', timeZone: 'UTC' });
	const formatDate = (date: string) => dateFormat.format(new Date(`${date}T00:00:00Z`));
</script>

{#if expenses.length}
	<List strong inset role="region" aria-label={m.expenses_title()}>
		{#each expenses as expense (expense.id)}
			<ListItem
				link
				href={resolve('/g/[token]/expenses/[id]', { token, id: expense.id })}
				title={expense.title}
				subtitle={`${formatDate(expense.date)} · ${m.expense_paid_by({
					name: names.get(expense.paidBy) ?? '?',
					amount: formatAmount(expense.amountCents, currency, getLocale())
				})}`}
				style={transitionName('expense', expense.id)}
			>
				{#snippet after()}
					<AnimatedAmount amount={expense.amountCents} {currency} />
				{/snippet}
			</ListItem>
		{/each}
	</List>
{:else}
	<Block class="text-center opacity-60">{m.expenses_empty()}</Block>
{/if}
