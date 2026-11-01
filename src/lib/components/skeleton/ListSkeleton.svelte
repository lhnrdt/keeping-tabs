<script lang="ts">
	// The start of a list while it's on its way: rows of the same height as the real ones.
	import { m } from '#lib/paraglide/messages.js';
	import SkeletonLine from './SkeletonLine.svelte';

	let { rows = 6, hero = true }: { rows?: number; hero?: boolean } = $props();
</script>

<div class="px-4 pt-2" role="status" aria-label={m.page_loading()}>
	{#if hero}
		<div class="flex flex-col gap-2 pb-6">
			<SkeletonLine class="h-7 w-1/2" />
			<SkeletonLine class="h-4 w-1/3" />
		</div>
	{/if}
	<ul class="flex flex-col gap-1">
		{#each Array.from({ length: rows }, (_row, i) => i) as i (i)}
			<li class="flex min-h-16 items-center gap-3">
				<span class="skeleton size-10 shrink-0 rounded-full" aria-hidden="true"></span>
				<span class="flex flex-1 flex-col gap-2">
					<SkeletonLine class="h-4 {i % 2 ? 'w-1/2' : 'w-2/3'}" />
					<SkeletonLine class="h-3 w-1/3" />
				</span>
				<SkeletonLine class="h-4 w-14" />
			</li>
		{/each}
	</ul>
</div>
