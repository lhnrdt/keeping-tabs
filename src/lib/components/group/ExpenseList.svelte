<script lang="ts">
	import { resolve } from '$app/paths';
	import { List, ListItem } from 'konsta/svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import IconBadge from '#lib/components/IconBadge.svelte';
	import AnimatedAmount from '#lib/components/AnimatedAmount.svelte';
	import { whenVisible } from '#lib/actions/when-visible.ts';

	import { categoryIcons } from '#lib/expense/category-style.ts';
	import { EXPENSES_PER_PAGE } from '#lib/group/expense-pages.ts';
	import { namesById, type Member } from '#lib/group/members.ts';
	import { groupByMonth } from '#lib/group/months.ts';
	import { OlderEntries } from '#lib/group/older-entries.svelte.ts';
	import { uniqueById } from '#lib/unique.ts';
	import type { ListEntry } from '#lib/server/expense-entries.ts';
	import { transitionName } from '#lib/motion/in-place-transition.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { formatAmount } from '#lib/money.ts';

	type Entry = ListEntry;

	type Props = {
		token: string;
		currency: string;
		members: Member[];
		/** The newest entries, from the server */
		entries: Entry[];
		/** Whether there are older entries */
		hasMore: boolean;
	};

	let { token, currency, members, entries, hasMore }: Props = $props();

	// Older pages load while scrolling (seamless); the link is the fallback without JS
	const older = new OlderEntries(
		(offset) => `${resolve('/g/[token]/entries', { token })}?offset=${offset}`
	);
	const expenses = $derived(uniqueById([...entries, ...older.items]));
	const more = $derived(older.more ?? hasMore);
	const loadOlder = () => older.load(expenses.length);

	const names = $derived(namesById(members));

	// Within a month the day is enough ("Thu 23"); the month is the heading (SP-20)
	const utc = (date: string) => new Date(`${date}T00:00:00Z`);
	const dayFormat = new Intl.DateTimeFormat(getLocale(), {
		weekday: 'short',
		day: 'numeric',
		timeZone: 'UTC'
	});
	const monthFormat = new Intl.DateTimeFormat(getLocale(), { month: 'long', timeZone: 'UTC' });
	const monthYearFormat = new Intl.DateTimeFormat(getLocale(), {
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC'
	});
	const thisYear = new Date().getUTCFullYear();
	const formatDate = (date: string) => dayFormat.format(utc(date));
	const formatMonth = (month: string) => {
		const date = utc(`${month}-01`);
		return (date.getUTCFullYear() === thisYear ? monthFormat : monthYearFormat).format(date);
	};
	const months = $derived(groupByMonth(expenses));
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
	<section aria-label={m.expenses_title()}>
		{#each months as group (group.month)}
			<h3 class="mx-8 mt-6 mb-2 text-sm font-medium opacity-60 first:mt-2">
				{formatMonth(group.month)}
			</h3>
			<List strong inset class="!my-0">
				{#each group.entries as expense (expense.id)}
					<ListItem
						link
						href={hrefOf(expense)}
						title={titleOf(expense)}
						subtitle={subtitleOf(expense)}
						style={transitionName('expense', expense.id)}
						class={expense.type === 'payment' ? 'italic' : ''}
					>
						{#snippet media()}
							<IconBadge
								name={expense.type === 'payment'
									? 'payment'
									: categoryIcons[expense.category ?? 'other']}
							/>
						{/snippet}
						{#snippet after()}
							{#if expense.type === 'payment'}
								<AnimatedAmount amount={expense.amountCents} {currency} />
							{:else if expense.yourSide === null}
								<span class="text-sm opacity-60">{m.side_not_involved()}</span>
							{:else if expense.yourSide >= 0}
								<span class="text-sm font-medium tone-positive tabular-nums">
									<AnimatedAmount
										amount={expense.yourSide}
										{currency}
										label={(amount) => m.side_lent({ amount })}
									/>
								</span>
							{:else}
								<span class="text-sm font-medium tone-negative tabular-nums">
									<AnimatedAmount
										amount={-expense.yourSide}
										{currency}
										label={(amount) => m.side_borrowed({ amount })}
									/>
								</span>
							{/if}
						{/snippet}
					</ListItem>
				{/each}
			</List>
		{/each}
	</section>
	{#if more}
		<p
			class="-mt-4 mb-8 text-center text-sm"
			aria-live="polite"
			use:whenVisible={{ onVisible: loadOlder, key: expenses.length }}
		>
			{#if older.loading}
				<span class="opacity-60">{m.expenses_loading()}</span>
			{:else}
				<!-- A plain link without JS (?show= renders more on the server); the href is
				     resolve() plus a query string, which the lint rule can't see -->
				<!-- eslint-disable svelte/no-navigation-without-resolve -->
				<a
					href={`${resolve('/g/[token]', { token })}?show=${expenses.length + EXPENSES_PER_PAGE}`}
					class="inline-block rounded-full px-4 py-2 font-medium text-forest dark:text-forest-night"
					data-sveltekit-reset="false"
					data-sveltekit-replacestate
					onclick={(event) => {
						event.preventDefault();
						loadOlder();
					}}>{older.failed ? m.expenses_retry() : m.expenses_show_more()}</a
				>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			{/if}
		</p>
	{/if}
{:else}
	<EmptyState illustration="plant" text={m.expenses_empty()} />
{/if}
