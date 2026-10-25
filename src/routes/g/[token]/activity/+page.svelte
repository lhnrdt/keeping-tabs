<script lang="ts">
	// The group's activity (#43, L-1 – L-3): who added, changed or deleted what, newest first;
	// deleted expenses and payments can be brought back from here.
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { List, ListItem } from 'konsta/svelte';
	import AppPage from '#lib/components/AppPage.svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import { activityText } from '#lib/group/activity-text.ts';
	import { formatAmount } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const relative = new Intl.RelativeTimeFormat(getLocale(), { numeric: 'auto' });
	const UNITS = [
		['day', 86_400_000],
		['hour', 3_600_000],
		['minute', 60_000]
	] as const;
	/** "2 hours ago", "yesterday"; older than a week as a date */
	function when(at: Date) {
		const ago = Date.now() - new Date(at).getTime();
		if (ago > 7 * 86_400_000)
			return new Intl.DateTimeFormat(getLocale(), { day: 'numeric', month: 'short' }).format(at);
		for (const [unit, ms] of UNITS) {
			if (ago >= ms) return relative.format(-Math.floor(ago / ms), unit);
		}
		return relative.format(0, 'minute');
	}
</script>

<svelte:head>
	<title>{m.activity_title()} – {data.group.name}</title>
</svelte:head>

<AppPage
	title={m.activity_title()}
	back={{ href: resolve('/g/[token]', { token: data.group.shareToken }), label: data.group.name }}
>
	{#if data.activity.length}
		<List strong inset role="region" aria-label={m.activity_title()}>
			{#each data.activity as item (item.id)}
				<ListItem
					title={activityText(item)}
					subtitle={item.entry
						? `${when(item.at)} · ${formatAmount(item.entry.amountCents, data.group.currency, getLocale())}`
						: when(item.at)}
				>
					{#snippet after()}
						{#if item.entry?.deleted && item.action.endsWith('.delete')}
							<form method="POST" action="?/restore" use:enhance>
								<input type="hidden" name="entryId" value={item.entry.id} />
								<button type="submit" class="text-sm font-medium text-accent dark:text-accent-night"
									>{m.activity_restore()}</button
								>
							</form>
						{/if}
					{/snippet}
				</ListItem>
			{/each}
		</List>
	{:else}
		<EmptyState text={m.activity_empty()} />
	{/if}
</AppPage>
