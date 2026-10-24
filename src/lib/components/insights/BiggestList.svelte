<script lang="ts">
	// The biggest expenses (#161): a ranked list, each with a thin bar for its size next to
	// the biggest. Opens the expense.
	import { resolve } from '$app/paths';
	import { formatAmount } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { BigExpense } from '#lib/insights/insights.ts';

	type Props = {
		rows: BigExpense[];
		currency: string;
		token: string;
		names: ReadonlyMap<string, string>;
	};

	let { rows, currency, token, names }: Props = $props();

	const date = new Intl.DateTimeFormat(getLocale(), {
		day: 'numeric',
		month: 'short',
		timeZone: 'UTC'
	});
	const largest = $derived(rows[0]?.amount ?? 1);
</script>

<ol
	class="mx-4 rounded-2xl bg-surface px-4 py-2 dark:bg-surface-night"
	aria-label={m.insights_biggest()}
>
	{#each rows as row (row.id)}
		<li class="border-b border-ink/5 py-2 last:border-0 dark:border-ink-night/10">
			<a
				href={resolve('/g/[token]/expenses/[id]', { token, id: row.id })}
				class="grid grid-cols-[1fr_auto] gap-x-3"
			>
				<span class="truncate font-medium">{row.title}</span>
				<span class="font-medium tabular-nums"
					>{formatAmount(row.amount, currency, getLocale())}</span
				>
				<span class="text-sm text-muted">
					{date.format(new Date(`${row.date}T00:00:00Z`))} · {m.insights_paid_by({
						name: names.get(row.paidBy) ?? '?'
					})}
				</span>
				<span
					class="mt-2 h-1 self-center rounded-r bg-accent dark:bg-accent-night"
					style:width="{Math.max(4, (row.amount / largest) * 100)}%"
					aria-hidden="true"
				></span>
			</a>
		</li>
	{/each}
</ol>
