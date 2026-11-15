<script lang="ts">
	// What kind of costs (#167, #188): fixed, everyday, occasional, big one-offs, one bar each
	// as a bar under its name, with the amount and share; what each kind means below.
	import { shownAmount } from '#lib/shown-money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { KindShare } from '#lib/insights/insights.ts';
	import { kindHints, kindLabels } from './kind-texts';
	import { KIND_ICONS } from '#lib/insights/insight-icons.ts';
	import Icon from '#lib/components/Icon.svelte';

	let { rows, currency }: { rows: KindShare[]; currency: string } = $props();

	const percent = new Intl.NumberFormat(getLocale(), {
		style: 'percent',
		maximumFractionDigits: 0
	});
	const valueText = (row: KindShare) =>
		`${shownAmount(row.amount, currency)} · ${percent.format(row.share)}`;
	const data = $derived(
		rows.map((row) => ({ ...row, label: kindLabels[row.kind](), text: valueText(row) }))
	);
</script>

<div class="mx-4 rounded-2xl bg-surface px-4 py-3 dark:bg-surface-night">
	<!-- Each kind's name and what it came to, its share as a bar below: fits any language's names -->
	<ul class="flex flex-col gap-3 py-1" aria-hidden="true">
		{#each data as row (row.kind)}
			<li class="flex flex-col gap-1.5">
				<span class="flex items-baseline justify-between gap-3 text-sm">
					<span class="font-medium">{row.label}</span>
					<span class="text-xs tabular-nums">{row.text}</span>
				</span>
				<span class="h-2 rounded-full bg-current/10">
					<span
						class="block h-full rounded-full bg-accent dark:bg-accent-night"
						style:width="{Math.max(1.5, row.share * 100)}%"
					></span>
				</span>
			</li>
		{/each}
	</ul>
	<dl class="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
		{#each rows as row (row.kind)}
			<dt class="flex items-center gap-1.5 font-medium">
				<Icon name={KIND_ICONS[row.kind]} size={14} class="opacity-70" />{kindLabels[row.kind]()}
			</dt>
			<dd class="text-muted">{kindHints[row.kind]()}</dd>
		{/each}
	</dl>
	<!-- Around the table: a table's caption stays visible when the table itself is hidden this way -->
	<div class="sr-only">
		<table>
			<caption>{m.insights_kinds()}</caption>
			<tbody>
				{#each rows as row (row.kind)}
					<tr><th scope="row">{kindLabels[row.kind]()}</th><td>{valueText(row)}</td></tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
