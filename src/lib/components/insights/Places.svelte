<script lang="ts">
	// Favourite places (#169): where the group goes again and again, most often first, with
	// how often and what it came to.
	import Icon from '#lib/components/Icon.svelte';
	import type { Place } from '#lib/insights/places.ts';
	import { formatAmount } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';

	let { places, currency }: { places: Place[]; currency: string } = $props();
</script>

<ul
	class="mx-4 space-y-3 rounded-2xl bg-surface px-4 py-4 dark:bg-surface-night"
	aria-label={m.insights_places()}
>
	{#each places as place (place.title)}
		<li class="flex items-center gap-3 text-sm">
			<span
				class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent/15 text-accent dark:bg-accent-night/20 dark:text-accent-night"
				aria-hidden="true"
			>
				<Icon name="place" size={18} />
			</span>
			<span class="min-w-0 flex-1">
				<span class="block truncate font-medium">{place.title}</span>
				<span class="block text-xs text-muted">{m.places_times({ count: place.times })}</span>
			</span>
			<span class="tabular-nums">{formatAmount(place.amount, currency, getLocale())}</span>
		</li>
	{/each}
</ul>
