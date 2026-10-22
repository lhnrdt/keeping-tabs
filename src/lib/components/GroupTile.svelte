<script lang="ts">
	// A group's tile in its tint, used as list media.
	import { tintClass } from '#lib/tints.ts';
	import Icon from './Icon.svelte';

	let { id }: { id: string } = $props();
</script>

<span
	class="{tintClass(
		id
	)} grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-(--tint-bg) text-(--tint-fg)"
>
	<Icon name="group" size={22} />
</span>
