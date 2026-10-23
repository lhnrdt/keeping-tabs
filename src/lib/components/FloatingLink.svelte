<script lang="ts">
	// The main action of a screen as a solid floating pill, e.g. "Add expense". Not Konsta's
	// Fab: its iOS "liquid glass" lets the list show through and it sets role="button".
	import type { resolve } from '$app/paths';
	import type { IconName } from '#lib/icons.ts';
	import Icon from './Icon.svelte';

	type Props = { href: ReturnType<typeof resolve>; icon: IconName; label: string };

	let { href, icon, label }: Props = $props();
</script>

<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- href is typed as resolve() output -->
<a
	{href}
	class="fixed right-[max(1rem,calc(50vw-var(--container-app)/2+1rem))] bottom-[calc(var(--k-safe-area-bottom,0px)+6rem)] z-30 flex h-12 items-center gap-2 rounded-full bg-forest ps-4 pe-5 font-semibold text-white shadow-[0_8px_20px_rgb(37_40_34/0.25)] transition-transform duration-150 active:scale-95 dark:bg-forest-night dark:text-canvas-night dark:shadow-[0_8px_20px_rgb(0_0_0/0.45)]"
>
	<Icon name={icon} size={22} />
	{label}
</a>
