<script lang="ts">
	// A link that looks like Konsta's large primary button. Konsta's Button always sets
	// role="button" (even as <a>), which hides navigation from screen readers.
	import type { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';

	/** href must come from resolve(), checked by its type */
	let { href, children }: { href: ReturnType<typeof resolve>; children: Snippet } = $props();
</script>

<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- href is typed as resolve() output -->
<a
	{href}
	class="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 font-semibold text-white transition-opacity duration-150 active:opacity-80"
>
	{@render children()}
</a>
