<script lang="ts">
	// Welcome band on the home screen, in the same language as the group headers. Shows your
	// overall balance across groups, per currency (SP-5).
	import Topography from '#lib/components/illustrations/Topography.svelte';
	import YourBalance from '#lib/components/YourBalance.svelte';
	import { m } from '#lib/paraglide/messages.js';

	let { totals }: { totals: { currency: string; amount: number }[] } = $props();
</script>

<header
	class="relative mx-4 mt-2 overflow-hidden rounded-3xl bg-(--tint-bg) px-5 pt-6 pb-7 text-(--tint-fg) tint-sage"
>
	<Topography />
	<div class="relative">
		<h1 class="font-display text-4xl leading-tight font-semibold">{m.app_name()}</h1>
		{#if totals.length}
			<p class="mt-4 text-sm font-medium opacity-80">{m.home_overall()}</p>
			{#each totals as total (total.currency)}
				<p class="font-display text-2xl font-semibold" data-testid="overall-balance">
					<YourBalance amount={total.amount} currency={total.currency} />
				</p>
			{/each}
		{:else}
			<p class="mt-2 max-w-xs opacity-80">{m.home_tagline()}</p>
		{/if}
	</div>
</header>
