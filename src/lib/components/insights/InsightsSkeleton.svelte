<script lang="ts">
	// While another period's insights are worked out: their outline (four tiles, then sections),
	// where they'll be, instead of the old period's numbers lingering.
	import SkeletonLine from '#lib/components/skeleton/SkeletonLine.svelte';
	import { m } from '#lib/paraglide/messages.js';
</script>

<div class="flex flex-col gap-4 pt-4" role="status" aria-label={m.page_loading()}>
	<div class="mx-4 grid grid-cols-2 gap-3">
		{#each { length: 4 }, i (i)}
			<div class="flex flex-col gap-2 rounded-2xl bg-surface p-4 dark:bg-surface-night">
				<SkeletonLine class="h-3 w-16" />
				<SkeletonLine class="h-6 w-24" />
			</div>
		{/each}
	</div>
	{#each ['h-44', 'h-32', 'h-24'] as height (height)}
		<div class="flex flex-col gap-2">
			<SkeletonLine class="mx-8 h-4 w-32" />
			<div class="mx-4 flex flex-col gap-3 rounded-2xl bg-surface p-4 dark:bg-surface-night">
				<SkeletonLine class="{height} w-full" />
				<SkeletonLine class="h-3 w-2/3" />
			</div>
		</div>
	{/each}
</div>
