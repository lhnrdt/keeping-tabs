<script lang="ts">
	// What an export contains: how many expenses and payments, from when to when, and where
	// everyone stands afterwards.
	import { List, ListItem } from 'konsta/svelte';
	import MemberBalance from '#lib/components/MemberBalance.svelte';
	import type { SplitwiseExport } from '#lib/import/splitwise.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';

	let { export: data, currency }: { export: SplitwiseExport; currency: string } = $props();

	const payments = $derived(data.rows.filter((row) => row.isPayment).length);
	const dates = $derived(data.rows.map((row) => row.date).sort());
	const dateFormat = new Intl.DateTimeFormat(getLocale(), { dateStyle: 'medium', timeZone: 'UTC' });
	const format = (date: string | undefined) =>
		date ? dateFormat.format(new Date(`${date}T00:00:00Z`)) : '';
	const totals = $derived(
		data.people.map((_, person) => data.rows.reduce((sum, row) => sum + row.nets[person], 0))
	);
</script>

<List strong inset role="region" aria-label={m.import_title()}>
	<ListItem
		title={m.import_summary({
			expenses: data.rows.length - payments,
			payments,
			from: format(dates[0]),
			to: format(dates.at(-1))
		})}
		text={data.skipped.length ? m.import_skipped({ count: data.skipped.length }) : undefined}
	/>
	{#each data.people as name, person (name)}
		<ListItem title={name}>
			{#snippet after()}
				<MemberBalance balance={totals[person]} {currency} />
			{/snippet}
		</ListItem>
	{/each}
</List>
