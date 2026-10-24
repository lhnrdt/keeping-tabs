<script lang="ts">
	// A small icon on a soft round background, used as list-row media.
	import type { IconName } from '#lib/icons.ts';
	import Icon from './Icon.svelte';

	let { name }: { name: IconName } = $props();
</script>

<span
	class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-muted text-accent dark:bg-surface-muted-night dark:text-accent-night"
>
	<Icon {name} size={20} />
</span>
