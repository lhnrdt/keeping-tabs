<script lang="ts">
	// A group's tile: its kind's icon in its tint, used as list media.
	import { kindIcons } from '#lib/group/kind-style.ts';
	import { DEFAULT_GROUP_KIND, type GroupKind } from '#lib/group/kinds.ts';
	import { tintClass, type Tint } from '#lib/tints.ts';
	import Icon from './Icon.svelte';

	type Props = { id: string; kind?: GroupKind; tint?: Tint | null };

	let { id, kind = DEFAULT_GROUP_KIND, tint }: Props = $props();
</script>

<span
	class="{tintClass(
		id,
		tint
	)} grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-(--tint-bg) text-(--tint-fg)"
>
	<Icon name={kindIcons[kind]} size={22} />
</span>
